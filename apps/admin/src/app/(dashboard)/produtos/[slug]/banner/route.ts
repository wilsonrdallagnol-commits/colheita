// apps/admin/src/app/(dashboard)/produtos/[slug]/banner/route.ts
//
// Camada 3 (Geracao de Materiais) — movimento 4: Banner Social PNG.
//
// GET /produtos/[slug]/banner
//   → 200  image/png — banner Argho 1200x630 (retina 2400x1260)
//   → 401  nao autenticado
//   → 404  produto nao encontrado
//   → 503  Chromium indisponivel
//
// Reusa @colheita/generator (BannerSocial.tsx) e o helper recordGeneratedMaterial
// pra registrar geracao em generated_materials (consistente com ficha-tecnica
// e catalogo).

// Playwright + react-dom/server requerem Node.js runtime
export const runtime = 'nodejs';

import { createServerClient, requireAuth } from '@colheita/auth';
import type { ProductComposition } from '@colheita/db';
import type { BannerSocialData } from '@colheita/generator';
import { generateBannerSocial } from '@colheita/generator';
import { captureError } from '@colheita/observability';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { recordGeneratedMaterial } from '@/lib/materiais';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * Constroi o "10-00-06" a partir do composition.macros do produto.
 * Convenção NPK: N - P2O5 - K2O. Se algum estiver ausente, vira 00.
 * Se nenhum dos três existir, retorna undefined (template renderiza fallback).
 */
function npkLabelFrom(composition: ProductComposition): string | undefined {
  const macros = composition.macros ?? {};
  const n = macros.N;
  const p = macros.P2O5;
  const k = macros.K2O;
  if (n == null && p == null && k == null) return undefined;
  const fmt = (v: number | undefined): string => {
    if (v == null) return '00';
    // 10 -> "10", 10.5 -> "10.5"
    return Number.isInteger(v) ? String(v).padStart(2, '0') : String(v);
  };
  return `${fmt(n)}-${fmt(p)}-${fmt(k)}`;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const cookieStore = await cookies();

  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth(cookieStore);
  } catch {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const supabase = createServerClient(cookieStore);

  // Busca produto + tenant + categoria + registro MAPA em paralelo
  const [{ data: product }, { data: tenant }] = await Promise.all([
    supabase
      .from('products')
      .select(
        `id, name, tagline, composition,
         category:product_categories(name),
         registrations:regulatory_registrations(registration_no)`,
      )
      .eq('slug', slug)
      .is('deleted_at', null)
      .single(),
    supabase.from('tenants').select('name, logo_url').single(),
  ]);

  if (!product) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  }

  const composition = (product.composition ?? {}) as ProductComposition;
  const category = Array.isArray(product.category) ? product.category[0] : product.category;
  const registrations = Array.isArray(product.registrations) ? product.registrations : [];
  const firstReg = registrations[0] as { registration_no?: string } | undefined;

  const bannerInput: BannerSocialData = {
    productName: product.name,
    tagline: product.tagline ?? undefined,
    // Categoria em CAPS já é convenção do template (eyebrow textTransform: uppercase),
    // mas mandamos lowercase pra consistência com o resto do schema.
    categoryName: (category as { name?: string } | null)?.name ?? undefined,
    npkLabel: npkLabelFrom(composition),
    mapaRegistration: firstReg?.registration_no,
    tenantName: tenant?.name ?? 'Argho AgriSciences',
    tenantLogoUrl: tenant?.logo_url ?? undefined,
  };

  try {
    const startedAt = Date.now();
    const { png } = await generateBannerSocial(bannerInput);
    const durationMs = Date.now() - startedAt;

    // Persistencia. Falha NAO bloqueia o download.
    await recordGeneratedMaterial({
      supabase,
      templateSlug: 'banner-social',
      inputData: bannerInput as unknown as Record<string, unknown>,
      productIds: [product.id as string],
      durationMs,
      pages: 1,
      generatedBy: user.id,
    });

    return new NextResponse(png, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="banner-${slug}.png"`,
        'Content-Length': String(png.length),
        // Cache curto por usuario — banner muda quando produto editar (categoria/MAPA/composição).
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido.';
    const isChromiumMissing =
      message.includes('Executable') || message.includes('chromium') || message.includes('browser');

    captureError(err, {
      context: 'admin.banner.generate',
      slug,
      chromiumMissing: isChromiumMissing,
    });

    return NextResponse.json(
      {
        error: isChromiumMissing
          ? 'Geração de banner indisponível (Chromium não instalado neste ambiente).'
          : 'Erro ao gerar o banner social.',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 503 },
    );
  }
}
