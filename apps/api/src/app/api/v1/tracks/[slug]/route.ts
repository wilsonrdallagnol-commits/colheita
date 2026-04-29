// apps/api/src/app/api/v1/tracks/[slug]/route.ts
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export const revalidate = 300; // ISR: 5 minutos

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
  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('learning_tracks')
    .select(
      `id, slug, title, subtitle, description, level, estimated_minutes,
       grants_certification, certification_validity_days, audience,
       learning_modules(
         id, slug, title, description, sort_order,
         learning_lessons(id, slug, title, type, estimated_minutes, is_required, sort_order)
       )`,
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Trilha não encontrada.' }, { status: 404 });
  }

  // Sort modules and lessons by sort_order
  const modules = [...(data.learning_modules ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  for (const mod of modules) {
    if (Array.isArray(mod.learning_lessons)) {
      mod.learning_lessons = [...mod.learning_lessons].sort((a, b) => a.sort_order - b.sort_order);
    }
  }

  return NextResponse.json(
    {
      data: { ...data, learning_modules: modules },
      meta: { fetchedAt: new Date().toISOString() },
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        ...CORS_HEADERS,
      },
    },
  );
}

export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
