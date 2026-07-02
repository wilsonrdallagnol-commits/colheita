// apps/portal/src/app/(conta)/conta/materiais/catalogo/route.ts
//
// Camada 5 — distribuidor autenticado baixa catalogo consolidado.
// Equivalente a /admin/produtos/catalogo (mesma logica) mas com auth via
// portal e rate limit 5/min/user (consistente com ficha-tecnica do portal).

export const runtime = 'nodejs';
// PDF via Chromium serverless — cold start (extrair binário + launch) pode
// passar de 10s; 60s cobre cold start + render com folga.
export const maxDuration = 60;

import { createServerClient, requireAuth } from '@colheita/auth';
import type {
  CatalogoData,
  CatalogoProduto,
  PackagingUnit,
  ProductApplication,
  ProductComposition,
} from '@colheita/generator';
import { generateCatalogo } from '@colheita/generator';
import { captureError } from '@colheita/observability';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { buildRateLimiter, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const MAX_PRODUTOS = 200;
const PDF_TIMEOUT_MS = 35_000; // catalogo eh maior, da margem

const catalogRateLimiter = buildRateLimiter({
  prefix: '@colheita/portal/catalogo',
  limit: 3, // gerar 3 catalogos/min/user e plenty
  window: '1 m',
});

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();

  const user = await requireAuth(cookieStore);

  // Rate limit por user
  const rate = await checkRateLimit(catalogRateLimiter, `catalogo:${user.id}`);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'Limite de gerações de catálogo excedido. Tente em alguns minutos.' },
      { status: 429, headers: rateLimitHeaders(rate) },
    );
  }

  const supabase = createServerClient(cookieStore);

  const [{ data: produtos, error: prodErr }, { data: tenant }] = await Promise.all([
    supabase
      .from('products')
      .select(
        `id, slug, name, tagline, description,
         composition, technical_specs, packaging, applications,
         category:product_categories(name),
         registrations:regulatory_registrations(registration_no)`,
      )
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('name')
      .limit(MAX_PRODUTOS),
    supabase.from('tenants').select('name, logo_url').limit(1).single(),
  ]);

  if (prodErr) {
    captureError(prodErr, { context: 'portal.catalogo.fetchProdutos', userId: user.id });
    return NextResponse.json({ error: 'Erro ao carregar produtos.' }, { status: 503 });
  }

  if (!produtos || produtos.length === 0) {
    return NextResponse.json({ error: 'Nenhum produto publicado disponível.' }, { status: 404 });
  }

  const tenantName = tenant?.name ?? 'Argho AgriSciences';

  const produtosCatalogo: CatalogoProduto[] = produtos.map((p) => {
    const category = Array.isArray(p.category) ? p.category[0] : p.category;
    const registrations = Array.isArray(p.registrations) ? p.registrations : [];
    const firstReg = registrations[0] as { registration_no?: string } | undefined;

    return {
      id: p.id as string,
      slug: p.slug as string,
      name: p.name as string,
      tagline: (p.tagline as string | null) ?? undefined,
      description: (p.description as string | null) ?? undefined,
      categoryName: (category as { name?: string } | null)?.name ?? undefined,
      composition: (p.composition as ProductComposition) ?? {},
      technicalSpecs: (p.technical_specs as Record<string, unknown> | null) ?? undefined,
      packaging: ((p.packaging as PackagingUnit[]) ?? []).map((pkg) => ({
        type: pkg.type,
        weightKg: pkg.weightKg,
        volumeL: pkg.volumeL,
        sku: pkg.sku,
      })),
      applications: (p.applications as ProductApplication[]) ?? [],
      mapaRegistration: firstReg?.registration_no,
    };
  });

  const data: CatalogoData = {
    tenantName,
    tenantLogoUrl: tenant?.logo_url ?? undefined,
    year: new Date().getFullYear(),
    subtitle: `Linha completa Safra ${new Date().getFullYear()}`,
    produtos: produtosCatalogo,
  };

  try {
    const { pdf } = await withTimeout(generateCatalogo(data), PDF_TIMEOUT_MS, 'generateCatalogo');
    const slugTenant = tenantName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const filename = `catalogo-${slugTenant}-${data.year}.pdf`;

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdf.length),
        'Cache-Control': 'private, max-age=3600',
        ...rateLimitHeaders(rate),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'erro desconhecido';
    const isTimeout = message.includes('timeout');
    const isChromiumMissing =
      !isTimeout &&
      (message.includes('Executable') ||
        message.includes('chromium') ||
        message.includes('browser'));

    captureError(err, {
      context: 'portal.catalogo.generate',
      userId: user.id,
      timeout: isTimeout,
      chromiumMissing: isChromiumMissing,
    });

    return NextResponse.json(
      {
        error: isTimeout
          ? 'Geração demorou demais. Tente novamente.'
          : isChromiumMissing
            ? 'Geração de PDF indisponível neste ambiente.'
            : 'Erro ao gerar o catálogo.',
      },
      { status: 503 },
    );
  }
}
