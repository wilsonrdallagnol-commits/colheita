// packages/jobs/src/jobs/regulatorio-vencimentos-cron.ts
//
// Camada 9 (Compliance) — alerta diário automatizado de vencimentos regulatórios.
//
// Roda todo dia às 11:00 UTC (= 08:00 BRT). Pra cada tenant ativo:
//   1. Busca registros regulatórios em risco (expired OU vencimento <= 30 dias)
//   2. Se HOUVER pelo menos 1 registro em risco:
//      a. Busca admins do tenant (users com role 'admin' ou 'compliance_admin')
//      b. Envia 1 email agregado (não 1 por registro — evita spam)
//   3. Se não houver: silêncio total (não envia email vazio)
//
// Filosofia: sem barulho. Email só quando há ação a tomar.
//
// VARIÁVEIS DE AMBIENTE necessárias:
//   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (bypass RLS pra varrer todos os tenants)
//   - RESEND_API_KEY + RESEND_FROM_EMAIL
//   - ADMIN_BASE_URL (ex: https://admin.colheita.arghoagrosciences.com)

import { type RegulatorioVencimentoItem, sendRegulatorioVencimentos } from '@colheita/email';
import { logger, schedules } from '@trigger.dev/sdk/v3';
import { buildSupabaseAdmin } from '../lib/supabase-admin.js';

// Janela de 30 dias inclui buckets críticos (≤15) e warning (≤30).
// Expirados também entram (daysLeft < 0).
const WINDOW_DAYS = 30;

// Limite defensivo de itens listados no email — usuário clica "Abrir compliance"
// pra ver lista completa. 10 cobre os mais urgentes; mais que isso vira ruído visual.
const MAX_ITEMS_PER_EMAIL = 10;

// Limite de admins por tenant. Resend aceita até 50 destinatários. 25 é margem.
const MAX_ADMINS_PER_TENANT = 25;

// Roles autorizadas a receber alerta. 'compliance_admin' é o role
// específico; 'admin' (genérico) também recebe pra cobrir tenants que
// ainda não estruturaram roles granulares.
const ALERT_ROLES = ['admin', 'compliance_admin'] as const;

interface RegRow {
  id: string;
  registration_no: string;
  authority: 'MAPA' | 'ANVISA' | 'IBAMA' | 'STATE' | 'OTHER';
  expires_at: string | null;
  product: { name: string } | { name: string }[] | null;
}

interface TenantRow {
  id: string;
  name: string;
  slug: string;
}

interface StatsCounts {
  expired: number;
  critical15d: number;
  warning30d: number;
}

function bucketize(daysLeft: number): keyof StatsCounts | null {
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 15) return 'critical15d';
  if (daysLeft <= 30) return 'warning30d';
  return null;
}

function productNameOf(product: RegRow['product']): string {
  if (!product) return 'Produto removido';
  if (Array.isArray(product)) return product[0]?.name ?? 'Produto removido';
  return product.name;
}

interface TenantAlertResult {
  tenantSlug: string;
  itemsInRisk: number;
  emailSent: boolean;
  emailId?: string;
  recipientCount?: number;
  reasonSkipped?: string;
}

/**
 * Processa um único tenant — busca registros em risco, agrega, envia email
 * se necessário. Falhas em 1 tenant NÃO interrompem o loop principal.
 */
async function processTenant(
  tenant: TenantRow,
  supabase: ReturnType<typeof buildSupabaseAdmin>,
  adminBaseUrl: string,
): Promise<TenantAlertResult> {
  const tenantId = tenant.id;
  const tenantName = tenant.name;
  const slug = tenant.slug;

  // Janela: busca registros active com vencimento em <=30d, OU já expired
  // (ambos são buckets do alerta).
  const windowDate = new Date(Date.now() + WINDOW_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const { data: rawRegs, error: regsError } = await supabase
    .from('regulatory_registrations')
    .select(
      `id, registration_no, authority, expires_at,
       product:products!inner(name)`,
    )
    .eq('tenant_id', tenantId)
    .or(`status.eq.expired,and(status.eq.active,expires_at.lte.${windowDate})`)
    .order('expires_at', { ascending: true, nullsFirst: false })
    .limit(200);

  if (regsError) {
    return {
      tenantSlug: slug,
      itemsInRisk: 0,
      emailSent: false,
      reasonSkipped: `query error: ${regsError.message}`,
    };
  }

  const regs = (rawRegs ?? []) as RegRow[];
  if (regs.length === 0) {
    return { tenantSlug: slug, itemsInRisk: 0, emailSent: false, reasonSkipped: 'no items' };
  }

  // Agrega contagens por bucket
  const now = Date.now();
  const counts: StatsCounts = { expired: 0, critical15d: 0, warning30d: 0 };
  const items: RegulatorioVencimentoItem[] = [];

  for (const reg of regs) {
    if (!reg.expires_at && reg.authority) {
      // Sem expires_at + status pode ser expired direto. Pula no bucketing.
      continue;
    }
    const expiresAt = reg.expires_at;
    const daysLeft = expiresAt
      ? Math.ceil((new Date(expiresAt).getTime() - now) / (1000 * 60 * 60 * 24))
      : -1;

    const bucket = bucketize(daysLeft);
    if (!bucket) continue;
    counts[bucket]++;

    if (items.length < MAX_ITEMS_PER_EMAIL) {
      items.push({
        productName: productNameOf(reg.product),
        authority: reg.authority,
        registrationNo: reg.registration_no,
        expiresAt: expiresAt ?? undefined,
        daysLeft,
      });
    }
  }

  const totalUrgent = counts.expired + counts.critical15d + counts.warning30d;
  if (totalUrgent === 0) {
    return {
      tenantSlug: slug,
      itemsInRisk: 0,
      emailSent: false,
      reasonSkipped: 'no items in buckets',
    };
  }

  // M4 fix 2026-05-09: PostgREST nested filter (.in('user_roles.roles.slug',...))
  // pode falhar silenciosamente. Refactor: trazemos roles aninhadas e filtramos
  // em JS apos hidratacao — mais previsivel e ja temos cap MAX_ADMINS_PER_TENANT.
  const { data: rawAdmins, error: adminsError } = await supabase
    .from('users')
    .select(
      `email,
       user_roles!inner(roles!inner(slug))`,
    )
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .limit(MAX_ADMINS_PER_TENANT * 2); // headroom — filtro de role aplica abaixo

  if (adminsError) {
    return {
      tenantSlug: slug,
      itemsInRisk: totalUrgent,
      emailSent: false,
      reasonSkipped: `admins query error: ${adminsError.message}`,
    };
  }

  const allowedRoles = new Set(ALERT_ROLES as unknown as string[]);
  // Dedup por email + filtro de role server-side em JS (em vez de PostgREST nested .in)
  const recipientEmails = Array.from(
    new Set(
      (rawAdmins ?? [])
        .filter((u) => {
          const ur =
            (u as { user_roles?: Array<{ roles?: { slug?: string } | null }> }).user_roles ?? [];
          return ur.some((r) => r?.roles?.slug && allowedRoles.has(r.roles.slug));
        })
        .map((u) => (typeof u.email === 'string' ? u.email.trim() : ''))
        .filter((e) => e.length > 0 && e.includes('@')),
    ),
  ).slice(0, MAX_ADMINS_PER_TENANT);

  if (recipientEmails.length === 0) {
    return {
      tenantSlug: slug,
      itemsInRisk: totalUrgent,
      emailSent: false,
      reasonSkipped: 'no admin recipients',
    };
  }

  const generatedAtLabel = new Date().toLocaleDateString('pt-BR');
  const adminUrl = `${adminBaseUrl.replace(/\/$/, '')}/compliance`;

  const { id } = await sendRegulatorioVencimentos({
    to: recipientEmails,
    tenantName,
    generatedAtLabel,
    counts,
    items,
    adminUrl,
  });

  return {
    tenantSlug: slug,
    itemsInRisk: totalUrgent,
    emailSent: true,
    emailId: id,
    recipientCount: recipientEmails.length,
  };
}

// ── Trigger.dev scheduled task ───────────────────────────────────────────────

export const regulatorioVencimentosCronJob = schedules.task({
  id: 'regulatorio-vencimentos-cron',

  // 11:00 UTC = 08:00 BRT (UTC-3, sem horário de verão no Brasil desde 2019).
  // Cron format: "min hour day month weekday" — daily.
  cron: '0 11 * * *',

  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 5_000,
    maxTimeoutInMs: 30_000,
    factor: 2,
    randomize: true,
  },

  run: async (): Promise<{
    tenantsProcessed: number;
    emailsSent: number;
    results: TenantAlertResult[];
  }> => {
    const adminBaseUrl =
      process.env.ADMIN_BASE_URL ?? 'https://admin.colheita.arghoagrosciences.com';

    const supabase = buildSupabaseAdmin();

    // Itera todos os tenants ativos. Service role bypassa RLS.
    const { data: rawTenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name, slug')
      .eq('status', 'active')
      .limit(200);

    if (tenantsError) {
      throw new Error(`[regulatorio-cron] failed to query tenants: ${tenantsError.message}`);
    }

    const tenants = (rawTenants ?? []) as TenantRow[];
    logger.info(`[regulatorio-cron] processing ${tenants.length} active tenants`);

    const results: TenantAlertResult[] = [];
    let emailsSent = 0;

    for (const tenant of tenants) {
      try {
        const result = await processTenant(tenant, supabase, adminBaseUrl);
        results.push(result);
        if (result.emailSent) emailsSent++;
        logger.info(
          `[regulatorio-cron] tenant=${result.tenantSlug} risk=${result.itemsInRisk} sent=${result.emailSent}`,
          { ...result },
        );
      } catch (err) {
        // Falha em 1 tenant NÃO derruba o cron — log + continue.
        const message = err instanceof Error ? err.message : 'unknown error';
        logger.error(`[regulatorio-cron] tenant=${tenant.slug} failed: ${message}`);
        results.push({
          tenantSlug: tenant.slug,
          itemsInRisk: 0,
          emailSent: false,
          reasonSkipped: `exception: ${message}`,
        });
      }
    }

    return {
      tenantsProcessed: tenants.length,
      emailsSent,
      results,
    };
  },
});
