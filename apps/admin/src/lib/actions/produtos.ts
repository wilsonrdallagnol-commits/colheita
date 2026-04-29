// apps/admin/src/lib/actions/produtos.ts
'use server';

import { createServerClient, requireAuth } from '@colheita/auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type ProdutoFormState = {
  error?: string;
  fieldErrors?: Partial<
    Record<
      | 'name'
      | 'tagline'
      | 'description'
      | 'category_id'
      | 'composition'
      | 'technical_specs'
      | 'packaging'
      | 'applications',
      string
    >
  >;
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

// ── createProduto ─────────────────────────────────────────────────────────────

export async function createProduto(
  _prevState: ProdutoFormState,
  formData: FormData,
): Promise<ProdutoFormState> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const name = String(formData.get('name') ?? '').trim();
  const tagline = String(formData.get('tagline') ?? '').trim() || null;
  const description = String(formData.get('description') ?? '').trim() || null;
  const categoryId = String(formData.get('category_id') ?? '').trim() || null;

  if (!name) {
    return { fieldErrors: { name: 'Nome é obrigatório.' } };
  }

  const slug = slugify(name);
  if (!slug) {
    return { fieldErrors: { name: 'Nome inválido — não gerou um slug válido.' } };
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      slug,
      name,
      tagline,
      description,
      category_id: categoryId,
      status: 'draft',
      composition: {},
      technical_specs: {},
      packaging: [],
      applications: [],
    })
    .select('slug')
    .single();

  if (error) {
    if (error.code === '23505') {
      return { fieldErrors: { name: 'Já existe um produto com esse nome. Escolha outro.' } };
    }
    return { error: 'Erro ao criar produto. Tente novamente.' };
  }

  revalidatePath('/produtos');
  redirect(`/produtos/${data.slug}/editar?created=1`);
}

// ── updateProduto ─────────────────────────────────────────────────────────────

export async function updateProduto(
  slug: string,
  _prevState: ProdutoFormState,
  formData: FormData,
): Promise<ProdutoFormState> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const name = String(formData.get('name') ?? '').trim();
  const tagline = String(formData.get('tagline') ?? '').trim() || null;
  const description = String(formData.get('description') ?? '').trim() || null;
  const categoryId = String(formData.get('category_id') ?? '').trim() || null;
  const compositionRaw = String(formData.get('composition') ?? '{}').trim() || '{}';
  const technicalSpecsRaw = String(formData.get('technical_specs') ?? '{}').trim() || '{}';
  const packagingRaw = String(formData.get('packaging') ?? '[]').trim() || '[]';
  const applicationsRaw = String(formData.get('applications') ?? '[]').trim() || '[]';

  if (!name) {
    return { fieldErrors: { name: 'Nome é obrigatório.' } };
  }

  // Valida e parseia JSON dos campos avançados
  let composition: Record<string, unknown>;
  let technicalSpecs: Record<string, unknown>;
  let packaging: unknown[];
  let applications: unknown[];
  try {
    composition = JSON.parse(compositionRaw) as Record<string, unknown>;
  } catch {
    return { fieldErrors: { composition: 'JSON inválido. Verifique a formatação.' } };
  }
  try {
    technicalSpecs = JSON.parse(technicalSpecsRaw) as Record<string, unknown>;
  } catch {
    return { fieldErrors: { technical_specs: 'JSON inválido. Verifique a formatação.' } };
  }
  try {
    const parsed = JSON.parse(packagingRaw);
    if (!Array.isArray(parsed)) throw new Error('not an array');
    packaging = parsed as unknown[];
  } catch {
    return {
      fieldErrors: { packaging: 'JSON inválido. Esperado array: [{"type":"frasco","volumeL":1}]' },
    };
  }
  try {
    const parsed = JSON.parse(applicationsRaw);
    if (!Array.isArray(parsed)) throw new Error('not an array');
    applications = parsed as unknown[];
  } catch {
    return { fieldErrors: { applications: 'Erro ao processar indicações. Tente novamente.' } };
  }

  const { error } = await supabase
    .from('products')
    .update({
      name,
      tagline,
      description,
      category_id: categoryId,
      composition,
      technical_specs: technicalSpecs,
      packaging,
      applications,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', slug)
    .is('deleted_at', null);

  if (error) {
    return { error: 'Erro ao salvar produto. Tente novamente.' };
  }

  revalidatePath('/produtos');
  revalidatePath(`/produtos/${slug}`);
  redirect(`/produtos/${slug}`);
}

// ── publishProduto ────────────────────────────────────────────────────────────

export async function publishProduto(slug: string): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase
    .from('products')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('slug', slug)
    .is('deleted_at', null);

  if (error) return { error: 'Erro ao publicar produto.' };

  revalidatePath('/produtos');
  revalidatePath(`/produtos/${slug}`);
  return {};
}

// ── archiveProduto ────────────────────────────────────────────────────────────

export async function archiveProduto(slug: string): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase
    .from('products')
    .update({ status: 'archived' })
    .eq('slug', slug)
    .is('deleted_at', null);

  if (error) return { error: 'Erro ao arquivar produto.' };

  revalidatePath('/produtos');
  revalidatePath(`/produtos/${slug}`);
  return {};
}

// ── draftProduto ──────────────────────────────────────────────────────────────

export async function draftProduto(slug: string): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase
    .from('products')
    .update({ status: 'draft' })
    .eq('slug', slug)
    .is('deleted_at', null);

  if (error) return { error: 'Erro ao reverter para rascunho.' };

  revalidatePath('/produtos');
  revalidatePath(`/produtos/${slug}`);
  return {};
}
