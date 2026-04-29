// apps/admin/src/app/(dashboard)/midias/colecoes/nova/actions.ts
'use server';

import { createServerClient, requireAuth } from '@colheita/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-');
}

export async function createColecao(
  _state: { error: string } | undefined,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const name = (formData.get('name') as string | null)?.trim() ?? '';
  const description = (formData.get('description') as string | null)?.trim() ?? '';

  if (!name || name.length < 2) {
    return { error: 'Nome precisa ter pelo menos 2 caracteres.' };
  }

  const slug = slugify(name);

  const { error } = await supabase
    .from('asset_collections')
    .insert({ name, slug, description: description || null });

  if (error) {
    if (error.code === '23505') {
      return { error: 'Já existe uma coleção com esse nome (slug duplicado).' };
    }
    return { error: `Erro ao criar coleção: ${error.message}` };
  }

  redirect('/midias/colecoes');
}
