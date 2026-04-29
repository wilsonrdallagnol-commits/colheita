// apps/academia/src/app/(trilhas)/trilhas/[slug]/iniciar/route.ts
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const origin = new URL(request.url).origin;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: track } = await supabase
    .from('learning_tracks')
    .select(
      `id,
       learning_modules(
         slug, sort_order,
         learning_lessons(slug, sort_order)
       )`,
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!track) {
    return NextResponse.redirect(new URL('/', origin));
  }

  const modules = Array.isArray(track.learning_modules) ? track.learning_modules : [];
  const sorted = [...modules].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const firstModule = sorted[0];

  if (!firstModule) {
    return NextResponse.redirect(new URL(`/trilhas/${slug}`, origin));
  }

  const lessons = Array.isArray(firstModule.learning_lessons) ? firstModule.learning_lessons : [];
  const sortedLessons = [...lessons].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const firstLesson = sortedLessons[0];

  if (!firstLesson) {
    return NextResponse.redirect(new URL(`/trilhas/${slug}`, origin));
  }

  return NextResponse.redirect(
    new URL(`/trilhas/${slug}/${firstModule.slug}/${firstLesson.slug}`, origin),
  );
}
