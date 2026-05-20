// apps/admin/src/app/(dashboard)/compliance/dossie/route.ts
//
// Camada 9 (Compliance & Regulatorio) — Dossie consolidado em PDF.
//
// GET /compliance/dossie
//   → 200  application/pdf — dossie completo do tenant
//   → 401  nao autenticado
//   → 503  Chromium indisponivel
//
// Reusa @colheita/generator (Dossie.tsx) e o helper recordGeneratedMaterial
// pra registrar em generated_materials (auditoria de quem exportou quando).

// Playwright + react-dom/server requerem Node.js runtime
export const runtime = 'nodejs';
// PDF via Chromium serverless — cold start (extrair binário + launch) pode
// passar de 10s; 60s cobre cold start + render com folga.
export const maxDuration = 60;

import { createServerClient, requireAuth } from '@colheita/auth';
import type { DossieData, DossieRegistration } from '@colheita/generator';
import { generateDossie } from '@colheita/generator';
import { captureError } from '@colheita/observability';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { recordGeneratedMaterial } from '@/lib/materiais';
import { buildRateLimiter, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Limite defensivo. Tenant Argho hoje tem ~12 registros. Cap em 500 evita
// PDF gigante caso seed cresca ou multi-tenant entre.
const MAX_REGISTROS = 500;

// Rate limit: 3 dossies/min/user. Cada dossie eh PDF Chromium de varias paginas,
// custa RAM/CPU significativos. Auditor B2B nao precisa gerar 30 dossies em
// sequencia — 3/min cobre uso legitimo + protege custos.
const dossieRateLimiter = buildRateLimiter({
  prefix: '@colheita/admin/dossie',
  limit: 3,
  window: '1 m',
});

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();

  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth(cookieStore);
  } catch {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const rate = await checkRateLimit(dossieRateLimiter, `dossie:${user.id}`);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'Muitas gerações de dossiê em sequência. Aguarde um minuto.' },
      { status: 429, headers: rateLimitHeaders(rate) },
    );
  }

  const supabase = createServerClient(cookieStore);

  // Busca todos os registros + categoria do produto. RLS filtra por tenant.
  const [{ data: registrations, error: regsError }, { data: tenant }] = await Promise.all([
    supabase
      .from('regulatory_registrations')
      .select(
        `id, registration_no, authority, status, issued_at, expires_at, document_url, notes,
         product:products(id, slug, name, category:product_categories(name))`,
      )
      .order('authority')
      .order('expires_at', { ascending: true, nullsFirst: false })
      .limit(MAX_REGISTROS),
    supabase.from('tenants').select('name, logo_url').limit(1).single(),
  ]);

  if (regsError) {
    captureError(regsError, { context: 'admin.dossie.fetchRegistrations' });
    return NextResponse.json({ error: 'Erro ao carregar registros.' }, { status: 503 });
  }

  if (!registrations || registrations.length === 0) {
    return NextResponse.json(
      { error: 'Nenhum registro regulatório encontrado para gerar o dossiê.' },
      { status: 404 },
    );
  }

  // Mapeia rows do banco pro DTO do template. jsonb / nested selects vem
  // como unknown — aplicamos type assertion defensiva e fallback a 'OTHER'
  // / status 'pending' caso valores estranhos cheguem.
  const dossieRegistrations: DossieRegistration[] = registrations.map((r) => {
    const product = Array.isArray(r.product) ? r.product[0] : r.product;
    const productTyped = product as { name?: string; slug?: string; category?: unknown } | null;
    const category = productTyped?.category;
    const categoryFirst = Array.isArray(category) ? category[0] : category;
    const categoryName = (categoryFirst as { name?: string } | null)?.name;

    return {
      productName: productTyped?.name ?? 'Produto removido',
      productSlug: productTyped?.slug,
      productCategory: categoryName,
      authority: (r.authority as DossieRegistration['authority']) ?? 'OTHER',
      registrationNo: r.registration_no as string,
      issuedAt: (r.issued_at as string | null) ?? undefined,
      expiresAt: (r.expires_at as string | null) ?? undefined,
      status: (r.status as DossieRegistration['status']) ?? 'pending',
      documentUrl: (r.document_url as string | null) ?? undefined,
      notes: (r.notes as string | null) ?? undefined,
    };
  });

  // Stats agregadas pra capa
  const now = Date.now();
  const stats = {
    total: dossieRegistrations.length,
    active: 0,
    expired: 0,
    pending: 0,
    expiringIn30d: 0,
  };
  for (const reg of dossieRegistrations) {
    if (reg.status === 'active') stats.active++;
    else if (reg.status === 'expired') stats.expired++;
    else if (reg.status === 'pending') stats.pending++;

    if (reg.status === 'active' && reg.expiresAt) {
      const daysLeft = Math.ceil((new Date(reg.expiresAt).getTime() - now) / (1000 * 60 * 60 * 24));
      if (daysLeft >= 0 && daysLeft <= 30) stats.expiringIn30d++;
    }
  }

  const tenantName = tenant?.name ?? 'Argho AgriSciences';
  const tenantLogoUrl = tenant?.logo_url ?? undefined;

  const data: DossieData = {
    tenantName,
    tenantLogoUrl,
    registrations: dossieRegistrations,
    generatedAtLabel: new Date().toLocaleDateString('pt-BR'),
    stats,
  };

  try {
    const startedAt = Date.now();
    const { pdf } = await generateDossie(data);
    const durationMs = Date.now() - startedAt;

    // Persistencia. Snapshot inclui stats + lista pra audit ("qual era o estado
    // regulatorio quando o dossie foi exportado em 08/05/2026?"). Falha NAO
    // bloqueia o download.
    await recordGeneratedMaterial({
      supabase,
      templateSlug: 'dossie-compliance',
      inputData: data as unknown as Record<string, unknown>,
      productIds: [],
      durationMs,
      // 1 capa + N páginas (1 por autoridade ativa). Estimativa razoável.
      pages: 1 + new Set(dossieRegistrations.map((r) => r.authority)).size,
      generatedBy: user.id,
    });

    const slugTenant = tenantName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const yyyymmdd = new Date().toISOString().slice(0, 10);
    const filename = `dossie-${slugTenant}-${yyyymmdd}.pdf`;

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdf.length),
        // Não cachear: dossiê é audit-grade; cada export deve ser fresh.
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido.';
    const isChromiumMissing =
      message.includes('Executable') || message.includes('chromium') || message.includes('browser');

    captureError(err, {
      context: 'admin.dossie.generate',
      registrationCount: dossieRegistrations.length,
      chromiumMissing: isChromiumMissing,
    });

    return NextResponse.json(
      {
        error: isChromiumMissing
          ? 'Geração de PDF indisponível (Chromium não instalado neste ambiente).'
          : 'Erro ao gerar o dossiê.',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 503 },
    );
  }
}
