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

  const { error } = await supabase.from('learning_progress').upsert(
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

  if (error) {
    return { error: 'Erro ao salvar progresso.' };
  }

  return {};
}
