// apps/api/src/app/api/v1/catalog/[slug]/route.ts
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export const revalidate = 300;

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('products')
    .select(
      'id, slug, name, tagline, description, composition, technical_specs, packaging, applications, status, published_at, category:product_categories(id, slug, name)',
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Produto não encontrado.', slug },
      {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }

  const product = {
    ...data,
    category: Array.isArray(data.category) ? (data.category[0] ?? null) : (data.category ?? null),
  };

  return NextResponse.json(
    { data: product },
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
