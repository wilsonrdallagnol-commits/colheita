// apps/admin/src/app/(dashboard)/produtos/[slug]/ficha-tecnica/route.ts
import { createServerClient, requireAuth } from '@colheita/auth';
import type { ProductComposition, ProductPackaging } from '@colheita/db';
import type { ProductApplication } from '@colheita/generator';
import { generateFichaTecnica } from '@colheita/generator';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const cookieStore = await cookies();

  try {
    await requireAuth(cookieStore);
  } catch {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const supabase = createServerClient(cookieStore);

  // Busca o produto e dados do tenant em paralelo
  const [{ data: product }, { data: tenant }] = await Promise.all([
    supabase
      .from('products')
      .select(
        `name, tagline, description, composition, technical_specs, packaging, applications,
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

  const { pdf } = await generateFichaTecnica({
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
