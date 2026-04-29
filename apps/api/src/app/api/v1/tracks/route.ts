// apps/api/src/app/api/v1/tracks/route.ts
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export const revalidate = 300; // ISR: 5 minutos

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('learning_tracks')
    .select(
      `id, slug, title, subtitle, level, estimated_minutes,
       grants_certification, certification_validity_days,
       audience, sort_order,
       modules_count:learning_modules(count)`,
    )
    .eq('status', 'published')
    .order('sort_order')
    .order('title');

  if (error) {
    return NextResponse.json({ error: 'Erro ao buscar trilhas.' }, { status: 500 });
  }

  const tracks = (data ?? []).map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    subtitle: t.subtitle,
    level: t.level,
    estimatedMinutes: t.estimated_minutes,
    grantsCertification: t.grants_certification,
    certificationValidityDays: t.certification_validity_days,
    audience: t.audience,
    sortOrder: t.sort_order,
    modulesCount: Array.isArray(t.modules_count)
      ? ((t.modules_count[0] as { count?: number } | undefined)?.count ?? 0)
      : 0,
  }));

  return NextResponse.json(
    {
      data: tracks,
      total: tracks.length,
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
