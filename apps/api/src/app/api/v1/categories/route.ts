// apps/api/src/app/api/v1/categories/route.ts
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export const revalidate = 600; // ISR: 10 minutos

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('product_categories')
    .select('id, slug, name, description, parent_id')
    .order('name');

  if (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar categorias.' },
      { status: 500, headers: CORS_HEADERS },
    );
  }

  return NextResponse.json(
    {
      data: data ?? [],
      total: (data ?? []).length,
      meta: { fetchedAt: new Date().toISOString() },
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        ...CORS_HEADERS,
      },
    },
  );
}

export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
