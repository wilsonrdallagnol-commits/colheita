// apps/admin/src/lib/notifications.ts
//
// Agrega notificacoes "operacionais" pra inbox do admin. Sem inserts em
// tabela dedicada — queries on-demand a cada page load do componente
// (pode ser memoizado quando a inbox virar feature pesada).
//
// Categorias:
//   - compliance: registros vencidos ou vencendo em <= 15 dias
//   - leads: leads ativos sem activity nos ultimos 14 dias
//   - materials: geracoes com status='failed' nas ultimas 24h
//
// Retorna no maximo MAX_PER_KIND de cada categoria, ordenado por urgencia.

import type { createServerClient } from '@colheita/auth';

const MAX_PER_KIND = 5;

export type NotificationKind = 'compliance' | 'lead' | 'material' | 'personal';
export type NotificationUrgency = 'critical' | 'warning' | 'info';

export interface Notification {
  id: string;
  kind: NotificationKind;
  urgency: NotificationUrgency;
  title: string;
  description: string;
  href: string;
  timestamp: string; // ISO 8601
}

export async function getNotifications(
  supabase: ReturnType<typeof createServerClient>,
  userId?: string,
): Promise<Notification[]> {
  const notifications: Notification[] = [];
  const now = Date.now();

  // ── 0. Personal: notif do DB (support.user_reply, etc) ─────────────────────
  // Lê direto via cookieStore (RLS filtra). Não cacheamos AQUI porque
  // queremos as 5 notif mais recentes (não só count) — o cache do badge
  // bell vive em lib/unread-notifs.ts (apenas count, TTL 30s).
  if (userId) {
    try {
      const { data: personal } = await supabase
        .from('notifications')
        .select('id, type, title, body, link, read_at, created_at')
        .eq('user_id', userId)
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(MAX_PER_KIND);

      for (const n of personal ?? []) {
        notifications.push({
          id: `personal-${n.id}`,
          kind: 'personal',
          urgency: 'info',
          title: n.title as string,
          description: (n.body as string | null) ?? '',
          href: (n.link as string | null) ?? '/notificacoes',
          timestamp: n.created_at as string,
        });
      }
    } catch {
      // ignora — RLS ou tabela ainda nao migrada
    }
  }

  // ── 1. Compliance: vencidos + vencendo em <=15d ────────────────────────────
  try {
    const fifteenDaysFromNow = new Date(now + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: compliance } = await supabase
      .from('regulatory_registrations')
      .select(
        `id, registration_no, authority, expires_at, status,
         product:products(name, slug)`,
      )
      .in('status', ['active', 'expired'])
      .not('expires_at', 'is', null)
      .lte('expires_at', fifteenDaysFromNow)
      .order('expires_at', { ascending: true, nullsFirst: false })
      .limit(MAX_PER_KIND);

    for (const reg of compliance ?? []) {
      if (!reg.expires_at) continue;
      const expiresAt = new Date(reg.expires_at as string).getTime();
      const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
      const product = Array.isArray(reg.product) ? reg.product[0] : reg.product;
      const productName = (product as { name?: string } | null)?.name ?? 'Produto removido';

      const urgency: NotificationUrgency =
        daysLeft < 0 || reg.status === 'expired' ? 'critical' : 'warning';
      const label =
        daysLeft < 0
          ? `expirou há ${Math.abs(daysLeft)} dia${Math.abs(daysLeft) === 1 ? '' : 's'}`
          : daysLeft === 0
            ? 'expira hoje'
            : `expira em ${daysLeft} dia${daysLeft === 1 ? '' : 's'}`;

      notifications.push({
        id: `compliance-${reg.id}`,
        kind: 'compliance',
        urgency,
        title: `${reg.authority} ${reg.registration_no}`,
        description: `${productName} — ${label}`,
        href: `/compliance/${reg.id}/editar`,
        timestamp: reg.expires_at as string,
      });
    }
  } catch {
    // RLS pode bloquear; ignora silenciosamente (notificacao opcional, nao critica)
  }

  // ── 2. Leads: status ativo + sem activity nos ultimos 14d ──────────────────
  try {
    const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: leads } = await supabase
      .from('leads')
      .select('id, name, company, updated_at, next_followup_at, status')
      .in('status', ['novo', 'qualificado', 'proposta'])
      .is('deleted_at', null)
      .lte('updated_at', fourteenDaysAgo)
      .order('updated_at', { ascending: true })
      .limit(MAX_PER_KIND);

    for (const lead of leads ?? []) {
      const updatedAt = new Date(lead.updated_at as string).getTime();
      const daysStuck = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));

      // Se tem followup vencido, eh mais urgente
      const followupOverdue =
        lead.next_followup_at && new Date(lead.next_followup_at as string).getTime() < now;
      const urgency: NotificationUrgency = followupOverdue || daysStuck > 30 ? 'warning' : 'info';

      notifications.push({
        id: `lead-${lead.id}`,
        kind: 'lead',
        urgency,
        title: lead.name as string,
        description: `${lead.company ?? 'Sem empresa'} — parado há ${daysStuck} dias`,
        href: `/leads/${lead.id}`,
        timestamp: lead.updated_at as string,
      });
    }
  } catch {
    // ignora
  }

  // ── 3. Materiais: geracoes failed nas ultimas 24h ──────────────────────────
  try {
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const { data: failed } = await supabase
      .from('generated_materials')
      .select(
        `id, generated_at, status,
         template:material_templates(name, slug)`,
      )
      .eq('status', 'failed')
      .gte('generated_at', oneDayAgo)
      .order('generated_at', { ascending: false })
      .limit(MAX_PER_KIND);

    for (const mat of failed ?? []) {
      const template = Array.isArray(mat.template) ? mat.template[0] : mat.template;
      const templateName = (template as { name?: string } | null)?.name ?? 'Material';

      notifications.push({
        id: `material-${mat.id}`,
        kind: 'material',
        urgency: 'warning',
        title: `Geração falhou: ${templateName}`,
        description: `Verifique o histórico pra detalhes`,
        href: '/materiais/historico',
        timestamp: mat.generated_at as string,
      });
    }
  } catch {
    // ignora
  }

  // Ordena por urgencia (critical > warning > info), depois por timestamp asc
  const urgencyRank: Record<NotificationUrgency, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  notifications.sort((a, b) => {
    const u = urgencyRank[a.urgency] - urgencyRank[b.urgency];
    if (u !== 0) return u;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return notifications;
}
