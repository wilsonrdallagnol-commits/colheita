// apps/admin/src/app/(dashboard)/produtos/catalogo/route.ts
//
// Gera o catálogo consolidado em PDF — todos os produtos publicados do tenant
// em 1 documento (capa + sumário + 1 página por produto).
//
// Reusa @colheita/generator (Camada 3 — Geração de Materiais sob demanda).
//
// GET /produtos/catalogo
//   → 200  application/pdf
//   → 401  não autenticado
//   → 503  Chromium indisponível ou geração falhou

// Playwright + react-dom/server requerem Node.js runtime
export const runtime = 'nodejs';
// PDF via Chromium serverless — cold start (extrair binário + launch) pode
// passar de 10s; 60s cobre cold start + render do catálogo completo.
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
import { recordGeneratedMaterial } from '@/lib/materiais';

export const dynamic = 'force-dynamic';

// Limite de produtos por catálogo. 200 produtos = ~205 páginas A4 = ~30s de render.
// Argho hoje tem 18; este limite é pra evitar OOM se o seed crescer.
const MAX_PRODUTOS_POR_CATALOGO = 200;

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();

  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth(cookieStore);
  } catch {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const supabase = createServerClient(cookieStore);

  // Busca produtos publicados + tenant em paralelo
  const [{ data: produtos, error: produtosError }, { data: tenant }] = await Promise.all([
    supabase
      .from('products')
      .select(
        `id, slug, name, tagline, description,
         composition, packaging, applications,
         category:product_categories(name),
         registrations:regulatory_registrations(registration_no)`,
      )
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('name')
      .limit(MAX_PRODUTOS_POR_CATALOGO),

    supabase.from('tenants').select('name, logo_url').limit(1).single(),
  ]);

  if (produtosError) {
    captureError(produtosError, { context: 'admin.catalogo.fetchProdutos' });
    return NextResponse.json({ error: 'Erro ao carregar produtos.' }, { status: 503 });
  }

  if (!produtos || produtos.length === 0) {
    return NextResponse.json(
      { error: 'Nenhum produto publicado encontrado para gerar o catálogo.' },
      { status: 404 },
    );
  }

  const tenantName = tenant?.name ?? 'Argho AgriSciences';
  const tenantLogoUrl = tenant?.logo_url ?? undefined;

  // Mapeia cada produto pra estrutura aceita pelo template Catalogo.
  // Defensivo com type assertion + fallback porque jsonb do banco vem unknown.
  const produtosCatalogo: CatalogoProduto[] = produtos.map((p) => {
    const category = Array.isArray(p.category) ? p.category[0] : p.category;
    const registrations = Array.isArray(p.registrations) ? p.registrations : [];
    const firstReg = registrations[0] as { registration_no?: string } | undefined;

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline ?? undefined,
      description: p.description ?? undefined,
      categoryName: (category as { name?: string } | null)?.name ?? undefined,
      composition: (p.composition as ProductComposition) ?? {},
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
    tenantLogoUrl,
    year: new Date().getFullYear(),
    subtitle: `Linha completa Safra ${new Date().getFullYear()}`,
    produtos: produtosCatalogo,
  };

  try {
    const startedAt = Date.now();
    const { pdf } = await generateCatalogo(data);
    const durationMs = Date.now() - startedAt;

    // Persistencia: snapshot completo dos produtos no momento da geracao + lista
    // de product_ids pra rastreio reverso ("quais materiais incluiram Xcensis?").
    // Falha NAO bloqueia o download (recordGeneratedMaterial captura via Sentry).
    await recordGeneratedMaterial({
      supabase,
      templateSlug: 'catalogo-consolidado',
      inputData: data as unknown as Record<string, unknown>,
      productIds: produtosCatalogo.map((p) => p.id),
      durationMs,
      // 1 capa + 1 sumario + N produtos. Estimativa razoavel.
      pages: 2 + produtosCatalogo.length,
      generatedBy: user.id,
    });

    // Filename inclui ano + tenant slug pra facilitar arquivamento manual.
    // Espaços do tenantName viram hífen pra evitar Content-Disposition headache.
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
        // Cache curto: 1h no browser. Catálogo muda quando produto é publicado/editado;
        // 1h é trade-off entre evitar regeração desnecessária e evitar PDF stale.
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido.';
    const isChromiumMissing =
      message.includes('Executable') || message.includes('chromium') || message.includes('browser');

    captureError(err, {
      context: 'admin.catalogo.generate',
      produtoCount: produtosCatalogo.length,
      chromiumMissing: isChromiumMissing,
    });

    return NextResponse.json(
      {
        error: isChromiumMissing
          ? 'Geração de PDF indisponível (Chromium não instalado neste ambiente).'
          : 'Erro ao gerar o catálogo.',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 503 },
    );
  }
}
