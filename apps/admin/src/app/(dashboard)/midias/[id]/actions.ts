'use server';

// apps/admin/src/app/(dashboard)/midias/[id]/actions.ts

import { createAdminClient, requireAuth } from '@colheita/auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

interface ActionState {
  success?: boolean;
  error?: string;
}

export async function updateAsset(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const cookieStore = await cookies();
  try {
    await requireAuth(cookieStore);
  } catch {
    return { error: 'Não autorizado.' };
  }

  const id = formData.get('id');
  const title = formData.get('title');
  const altText = formData.get('alt_text');

  if (!id || typeof id !== 'string') {
    return { error: 'ID inválido.' };
  }

  const updatePayload: Record<string, string | null> = {};
  if (typeof title === 'string') updatePayload.title = title.trim() || null;
  if (typeof altText === 'string') updatePayload.alt_text = altText.trim() || null;

  // Usa adminClient para bypassar RLS (admin já autenticado via requireAuth acima)
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('assets')
    .update({ ...updatePayload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null);

  if (error) {
    return { error: 'Erro ao salvar alterações.' };
  }

  revalidatePath(`/midias/${id}`);
  revalidatePath('/midias');

  return { success: true };
}
