// apps/admin/src/lib/actions/categorias.ts
'use server';

import { createServerClient, requireAuth } from '@colheita/auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type CategoriaFormState = {
  error?: string;
  fieldErrors?: Partial<Record<'name' | 'slug' | 'description', string>>;
} | null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[àáâãä]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── createCategoria ───────────────────────────────────────────────────────────

export async function createCategoria(
  _prevState: CategoriaFormState,
  formData: FormData,
): Promise<CategoriaFormState> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;

  if (!name) {
    return { fieldErrors: { name: 'Nome é obrigatório.' } };
  }

  const slug = slugify(name);
  if (!slug) {
    return { fieldErrors: { name: 'Nome inválido — não gerou um slug válido.' } };
  }

  // Busca o tenant (assumindo tenant único por sessão — o tenant_id vem do JWT)
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Sessão inválida.' };

  // Busca o tenant_id do usuário na tabela users (maybeSingle: row pode nao
  // existir se handle_new_auth_user nao rodou; single() loga erro noisy).
  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.user.id)
    .maybeSingle();

  if (!userData?.tenant_id) return { error: 'Tenant não encontrado. Refaça login.' };

  const { error } = await supabase.from('product_categories').insert({
    slug,
    name,
    description,
    tenant_id: userData.tenant_id,
    sort_order: 0,
  });

  if (error) {
    if (error.code === '23505') {
      return { fieldErrors: { name: 'Já existe uma categoria com esse nome.' } };
    }
    return { error: 'Erro ao criar categoria. Tente novamente.' };
  }

  revalidatePath('/categorias');
  revalidatePath('/produtos');
  redirect('/categorias');
}

// ── updateCategoria ───────────────────────────────────────────────────────────

export async function updateCategoria(
  id: string,
  _prevState: CategoriaFormState,
  formData: FormData,
): Promise<CategoriaFormState> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;

  if (!name) {
    return { fieldErrors: { name: 'Nome é obrigatório.' } };
  }

  const { error } = await supabase
    .from('product_categories')
    .update({ name, description, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { error: 'Erro ao salvar categoria.' };
  }

  revalidatePath('/categorias');
  revalidatePath('/produtos');
  redirect('/categorias');
}

// ── deleteCategoria ───────────────────────────────────────────────────────────

export async function deleteCategoria(id: string): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Verifica se tem produtos vinculados
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)
    .is('deleted_at', null);

  if (count && count > 0) {
    return { error: `Não é possível excluir: há ${count} produto(s) nessa categoria.` };
  }

  const { error } = await supabase.from('product_categories').delete().eq('id', id);

  if (error) return { error: 'Erro ao excluir categoria.' };

  revalidatePath('/categorias');
  revalidatePath('/produtos');
  return {};
}
