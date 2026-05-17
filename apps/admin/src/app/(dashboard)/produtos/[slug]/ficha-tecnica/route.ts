// apps/admin/src/app/(dashboard)/produtos/[slug]/ficha-tecnica/route.ts
// Playwright + react-dom/server requerem o runtime Node.js (não Edge)
export const runtime = 'nodejs';
// PDF via Chromium serverless — cold start (extrair binário + launch) pode
// passar de 10s; 60s cobre cold start + render com folga.
export const maxDuration = 60;

import { createServerClient, requireAuth } from '@colheita/auth';
import type { ProductComposition, ProductPackaging } from '@colheita/db';
import type { ProductApplication } from '@colheita/generator';
import { generateFichaTecnica } from '@colheita/generator';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { recordGeneratedMaterial } from '@/lib/materiais';

interface RouteContext {
  params: Promise<{ slug: string }>;
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

  // Busca o produto + tenant em paralelo. Inclui id do produto para
  // alimentar product_ids[] em generated_materials (rastreio reverso).
  const [{ data: product }, { data: tenant }] = await Promise.all([
    supabase
      .from('products')
      .select(
        `id, name, tagline, description, composition, technical_specs, packaging, applications,
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

  const registration = Array.isArray(product.registrations)
    ? (product.registrations[0] ?? null)
    : product.registrations;

  const composition = (product.composition ?? {}) as ProductComposition;
  const technicalSpecs = (product.technical_specs ?? {}) as Record<string, unknown>;
  const packaging = (product.packaging ?? []) as ProductPackaging;
  const applications = (product.applications ?? []) as ProductApplication[];

  // Snapshot do input — se gravado em generated_materials.input_data, permite
  // re-gerar PDF identico no futuro mesmo que o produto seja editado depois.
  const fichaInput = {
    productName: product.name,
    tagline: product.tagline ?? undefined,
    description: product.description ?? undefined,
    composition: {
      macros: composition.macros,
      micros: composition.micros,
      others: composition.others,
    },
    technicalSpecs,
    packaging: packaging.map((p) => ({
      type: p.type,
      weightKg: p.weightKg,
      volumeL: p.volumeL,
      sku: p.sku,
    })),
    applications,
    tenantName: tenant?.name ?? 'Argho AgriSciences',
    tenantLogoUrl: tenant?.logo_url ?? undefined,
    mapaRegistration: registration?.registration_no ?? undefined,
    year: new Date().getFullYear(),
  };

  const startedAt = Date.now();
  const { pdf } = await generateFichaTecnica(fichaInput);
  const durationMs = Date.now() - startedAt;

  // Persistencia em generated_materials. Falha aqui NAO bloqueia o download.
  // recordGeneratedMaterial captura erros via Sentry e retorna { materialId: null }.
  await recordGeneratedMaterial({
    supabase,
    templateSlug: 'ficha-tecnica',
    inputData: fichaInput as Record<string, unknown>,
    productIds: [product.id as string],
    durationMs,
    pages: 1,
    generatedBy: user.id,
  });

  const filename = `ficha-tecnica-${slug}.pdf`;

  return new NextResponse(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdf.length),
    },
  });
}
