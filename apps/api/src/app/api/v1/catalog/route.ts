// apps/api/src/app/api/v1/catalog/route.ts
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export const revalidate = 300; // ISR: 5 minutos

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('products')
    .select(
      'id, slug, name, tagline, status, composition, technical_specs, packaging, category:product_categories(id, slug, name)',
    )
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('name');

  if (error) {
    return NextResponse.json({ error: 'Erro ao buscar produtos.' }, { status: 500 });
  }

  const products = (data ?? []).map((p) => ({
    ...p,
    category: Array.isArray(p.category) ? (p.category[0] ?? null) : (p.category ?? null),
  }));

  return NextResponse.json(
    {
      data: products,
      total: products.length,
      meta: { fetchedAt: new Date().toISOString() },
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },
  );
}

export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
