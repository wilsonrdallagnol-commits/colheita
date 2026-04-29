// apps/academia/src/app/(trilhas)/trilhas/[slug]/[modulo]/[licao]/actions.ts
'use server';

import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';

export async function markLessonComplete(lessonId: string): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Autenticação necessária.' };
  }

  // Fetch tenant_id for the user
  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!userData) {
    return { error: 'Usuário não encontrado.' };
  }

  const now = new Date().toISOString();

  // 1. Salva progresso da lição
  const { error: progressError } = await supabase.from('learning_progress').upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      tenant_id: userData.tenant_id,
      status: 'completed',
      completed_at: now,
    },
    {
      onConflict: 'user_id,lesson_id',
      ignoreDuplicates: false,
    },
  );

  if (progressError) {
    return { error: 'Erro ao salvar progresso.' };
  }

  // 2. Detecta conclusão da trilha e emite certificação se aplicável
  try {
    await maybeIssueCertification({
      supabase,
      lessonId,
      userId: user.id,
      tenantId: userData.tenant_id,
    });
  } catch {
    // Falha silenciosa — não impede o salvamento do progresso
  }

  return {};
}

// ── Lógica de emissão de certificação ────────────────────────────────────────

interface IssueCertParams {
  // biome-ignore lint/suspicious/noExplicitAny: Supabase client type
  supabase: any;
  lessonId: string;
  userId: string;
  tenantId: string;
}

async function maybeIssueCertification({
  supabase,
  lessonId,
  userId,
  tenantId,
}: IssueCertParams): Promise<void> {
  // Busca a trilha da lição (via módulo)
  const { data: lesson } = await supabase
    .from('learning_lessons')
    .select(
      `id, is_required,
       learning_modules!inner(
         learning_tracks!inner(
           id, grants_certification, certification_validity_days, status
         )
       )`,
    )
    .eq('id', lessonId)
    .single();

  if (!lesson) return;

  const modules = Array.isArray(lesson.learning_modules)
    ? lesson.learning_modules
    : [lesson.learning_modules];
  const trackData = modules[0]?.learning_tracks;
  const track = Array.isArray(trackData) ? trackData[0] : trackData;

  // Só emite certificação se a trilha tiver grants_certification = true e estiver publicada
  if (!track || !track.grants_certification || track.status !== 'published') return;

  const trackId = track.id as string;

  // Verifica se o usuário já tem certificação ativa para esta trilha
  const { data: existing } = await supabase
    .from('certifications')
    .select('id')
    .eq('user_id', userId)
    .eq('track_id', trackId)
    .eq('status', 'active')
    .maybeSingle();

  if (existing) return; // Já certificado

  // Conta lições obrigatórias da trilha
  const { count: totalRequired } = await supabase
    .from('learning_lessons')
    .select('id', { count: 'exact', head: true })
    .eq('is_required', true)
    .in('module_id', supabase.from('learning_modules').select('id').eq('track_id', trackId));

  if (!totalRequired || totalRequired === 0) return;

  // Conta lições obrigatórias completadas pelo usuário nesta trilha
  const { count: completedRequired } = await supabase
    .from('learning_progress')
    .select('lesson_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')
    .in(
      'lesson_id',
      supabase
        .from('learning_lessons')
        .select('id')
        .eq('is_required', true)
        .in('module_id', supabase.from('learning_modules').select('id').eq('track_id', trackId)),
    );

  if ((completedRequired ?? 0) < totalRequired) return; // Trilha não concluída ainda

  // Emite certificação
  const year = new Date().getFullYear();
  const randomHex = Math.random().toString(16).slice(2, 10).toUpperCase();
  const certificateNo = `ARGHO-${year}-${randomHex}`;

  const expiresAt =
    track.certification_validity_days != null
      ? new Date(Date.now() + track.certification_validity_days * 86_400_000).toISOString()
      : null;

  await supabase.from('certifications').insert({
    tenant_id: tenantId,
    user_id: userId,
    track_id: trackId,
    certificate_no: certificateNo,
    status: 'active',
    issued_at: new Date().toISOString(),
    expires_at: expiresAt,
  });
}
