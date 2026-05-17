// apps/api/src/app/api/v1/catalog/[slug]/ficha-tecnica/route.ts
//
// Gera e retorna a Ficha Técnica em PDF para um produto publicado.
// Requer sessão autenticada (distribuidor) via cookie ou Bearer token.

// Playwright requer o runtime Node.js (não Edge)
export const runtime = 'nodejs';
// PDF via Chromium serverless — cold start (extrair binário + launch) pode
// passar de 10s; 60s cobre cold start + render com folga.
export const maxDuration = 60;

//
// GET /api/v1/catalog/:slug/ficha-tecnica
//   → 200  application/pdf — PDF da ficha técnica
//   → 404  produto não encontrado ou não publicado
//   → 503  Chromium não disponível no ambiente (dev sem Docker)

import { createServerClient, requireAuth } from '@colheita/auth';
import type { FichaTecnicaData, PackagingUnit, ProductApplication } from '@colheita/generator';
import { generateFichaTecnica } from '@colheita/generator';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const cookieStore = await cookies();

  // Requer autenticação — fichas técnicas são para distribuidores autenticados
  await requireAuth(cookieStore);

  const supabase = createServerClient(cookieStore);

  // Busca produto com nome do tenant (para o cabeçalho da ficha)
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
    return NextResponse.json(
      { error: 'Produto não encontrado.' },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  const tenantName =
    (Array.isArray(product.tenant)
      ? (product.tenant[0] as { name?: string } | undefined)?.name
      : (product.tenant as { name?: string } | null)?.name) ?? 'Argho Agrosciences';

  // Monta FichaTecnicaData a partir dos campos JSONB do produto
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

  // Gera o PDF via Playwright — requer Chromium instalado
  try {
    const { pdf } = await generateFichaTecnica(data);

    const filename = `ficha-tecnica-${slug}.pdf`;

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdf.length),
        'Cache-Control': 'private, max-age=3600',
        ...CORS_HEADERS,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar PDF.';
    const isChromiumMissing =
      message.includes('Executable') || message.includes('chromium') || message.includes('browser');

    return NextResponse.json(
      {
        error: isChromiumMissing
          ? 'PDF generation service not available. Chromium not installed.'
          : 'Erro ao gerar ficha técnica.',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 503, headers: CORS_HEADERS },
    );
  }
}

export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
