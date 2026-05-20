// apps/admin/src/app/(dashboard)/midias/colecoes/nova/actions.ts
'use server';

import { createServerClient, requireAuth } from '@colheita/auth';
import { captureError } from '@colheita/observability';
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
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const name = (formData.get('name') as string | null)?.trim() ?? '';
  const description = (formData.get('description') as string | null)?.trim() ?? '';

  if (!name || name.length < 2) {
    return { error: 'Nome precisa ter pelo menos 2 caracteres.' };
  }

  const slug = slugify(name);

  // Resolve tenant_id da sessao — RLS + NOT NULL exigem que esteja preenchido.
  // Sem isso o insert sempre falha (mesmo bug que createProduto tinha).
  const { data: userRow } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle();
  const tenantId = userRow?.tenant_id as string | undefined;
  if (!tenantId) {
    return { error: 'Tenant não resolvido na sessão. Refaça login.' };
  }

  const { error } = await supabase
    .from('asset_collections')
    .insert({ tenant_id: tenantId, name, slug, description: description || null });

  if (error) {
    if (error.code === '23505') {
      return { error: 'Já existe uma coleção com esse nome (slug duplicado).' };
    }
    captureError(error, { context: 'admin.midias.colecoes.create', slug });
    return { error: `Erro ao criar coleção: ${error.message}` };
  }

  redirect('/midias/colecoes');
}
