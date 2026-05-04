// apps/portal/src/app/(public)/produtos/[slug]/ficha-tecnica/route.ts
//
// Gera e retorna a Ficha Técnica em PDF para um produto publicado.
// Requer sessão autenticada (distribuidor logado no portal).
//
// GET /produtos/:slug/ficha-tecnica
//   → 200  application/pdf — PDF da ficha técnica
//   → 302  redirect para /entrar se não autenticado
//   → 404  produto não encontrado ou não publicado
//   → 503  Chromium não disponível (dev sem Docker)

// Playwright + react-dom/server requerem o runtime Node.js (não Edge)
export const runtime = 'nodejs';

import { createServerClient, requireAuth } from '@colheita/auth';
import type { FichaTecnicaData, PackagingUnit, ProductApplication } from '@colheita/generator';
import { generateFichaTecnica } from '@colheita/generator';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const cookieStore = await cookies();

  // Requer distribuidor autenticado — redireciona para /entrar se não autenticado
  await requireAuth(cookieStore);

  const supabase = createServerClient(cookieStore);

  const { data: product, error } = await supabase
    .from('products')
    .select(
      `name, tagline, description, composition, technical_specs, packaging, applications,
       tenant:tenants!inner(name)`,
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single();

  if (error || !product) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  }

  const tenantName =
    (Array.isArray(product.tenant)
      ? (product.tenant[0] as { name?: string } | undefined)?.name
      : (product.tenant as { name?: string } | null)?.name) ?? 'Argho Agrosciences';

  const data: FichaTecnicaData = {
    productName: product.name,
    tagline: product.tagline ?? undefined,
    description: product.description ?? undefined,
    composition: (product.composition as FichaTecnicaData['composition']) ?? {},
    technicalSpecs: (product.technical_specs as Record<string, unknown>) ?? {},
    packaging: (product.packaging as PackagingUnit[]) ?? [],
    applications: (product.applications as ProductApplication[]) ?? [],
    tenantName,
    year: new Date().getFullYear(),
  };

  try {
    const { pdf } = await generateFichaTecnica(data);

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ficha-tecnica-${slug}.pdf"`,
        'Content-Length': String(pdf.length),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido.';
    const isChromiumMissing =
      message.includes('Executable') || message.includes('chromium') || message.includes('browser');

    return NextResponse.json(
      {
        error: isChromiumMissing
          ? 'Geração de PDF indisponível. Chromium não instalado neste ambiente.'
          : 'Erro ao gerar ficha técnica.',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 503 },
    );
  }
}
