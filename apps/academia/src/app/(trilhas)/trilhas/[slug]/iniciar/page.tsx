// apps/academia/src/app/(trilhas)/trilhas/[slug]/iniciar/page.tsx
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * /trilhas/[slug]/iniciar — redireciona para a primeira lição da trilha.
 *
 * Fluxo:
 * 1. Busca o primeiro módulo (sort_order ASC) da trilha publicada.
 * 2. Busca a primeira lição (sort_order ASC) desse módulo.
 * 3. Redireciona para /trilhas/[slug]/[modulo]/[licao].
 * 4. Se a trilha não tiver lições, volta para /trilhas/[slug].
 */
export default async function IniciarTrilhaPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // Busca a trilha para confirmar que existe e está publicada
  const { data: trilha } = await supabase
    .from('learning_tracks')
    .select('id')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!trilha) {
    redirect('/');
  }

  // Busca a primeira lição da trilha (via join track → module → lesson)
  const { data: firstLesson } = await supabase
    .from('learning_lessons')
    .select(`slug, learning_modules!inner(slug, sort_order, learning_tracks!inner(slug, id))`)
    .eq('learning_modules.learning_tracks.id', trilha.id)
    .order('sort_order', { ascending: true })
    .order('sort_order', { referencedTable: 'learning_modules', ascending: true })
    .limit(1)
    .single();

  if (!firstLesson) {
    // Trilha sem lições — volta para a página da trilha
    redirect(`/trilhas/${slug}`);
  }

  const modulo = Array.isArray(firstLesson.learning_modules)
    ? firstLesson.learning_modules[0]
    : firstLesson.learning_modules;

  if (!modulo) {
    redirect(`/trilhas/${slug}`);
  }

  redirect(`/trilhas/${slug}/${modulo.slug}/${firstLesson.slug}`);
}
