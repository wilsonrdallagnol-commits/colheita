// apps/admin/src/lib/actions/produtos.ts
'use server';

import { createServerClient, requireAuth } from '@colheita/auth';
import { embedProdutoJob } from '@colheita/jobs';
import { captureError } from '@colheita/observability';
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
      | 'applications'
      | 'safra_codigo',
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
  const user = await requireAuth(cookieStore);
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

  const applicationsRaw = String(formData.get('applications') ?? '[]').trim() || '[]';
  let applications: unknown[] = [];
  try {
    const parsed = JSON.parse(applicationsRaw);
    if (Array.isArray(parsed)) applications = parsed as unknown[];
  } catch {
    // ignore parse error on create — defaults to []
  }

  // Resolve tenant_id da sessao — RLS check (`tenant_id = app_tenant_id()`)
  // E o NOT NULL da coluna exigem que esteja preenchido. Sem isso, o insert
  // sempre falha. Mesma logica usada em createCategoria e createLead.
  const { data: userRow } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle();
  const tenantId = userRow?.tenant_id as string | undefined;
  if (!tenantId) {
    return { error: 'Tenant não resolvido na sessão. Refaça login.' };
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      tenant_id: tenantId,
      slug,
      name,
      tagline,
      description,
      category_id: categoryId,
      status: 'draft',
      composition: {},
      technical_specs: {},
      packaging: [],
      applications,
    })
    .select('id, slug, tenant_id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return { fieldErrors: { name: 'Já existe um produto com esse nome. Escolha outro.' } };
    }
    captureError(error, { context: 'admin.produtos.create', slug });
    return { error: 'Erro ao criar produto. Tente novamente.' };
  }

  // Dispara re-indexação do embedding em background (fire-and-forget)
  if (process.env.TRIGGER_SECRET_KEY && data.id && data.tenant_id) {
    embedProdutoJob
      .trigger({ productId: data.id as string, tenantId: data.tenant_id as string })
      .catch(() => {
        // Falha silenciosa — embedding será reindexado na próxima atualização
      });
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
  const safraCodigo = String(formData.get('safra_codigo') ?? '').trim() || null;
  const compositionRaw = String(formData.get('composition') ?? '{}').trim() || '{}';
  const technicalSpecsRaw = String(formData.get('technical_specs') ?? '{}').trim() || '{}';
  const packagingRaw = String(formData.get('packaging') ?? '[]').trim() || '[]';
  const applicationsRaw = String(formData.get('applications') ?? '[]').trim() || '[]';

  // hero/packshot asset_ids (Camada 4 DAM). Opcional. Validacao: tem que ser
  // UUID ou string vazia (caso user limpou). String vazia vira NULL.
  const heroAssetIdRaw = String(formData.get('hero_asset_id') ?? '').trim();
  const packshotAssetIdRaw = String(formData.get('packshot_asset_id') ?? '').trim();
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const heroAssetId =
    heroAssetIdRaw === '' ? null : UUID_REGEX.test(heroAssetIdRaw) ? heroAssetIdRaw : undefined;
  const packshotAssetId =
    packshotAssetIdRaw === ''
      ? null
      : UUID_REGEX.test(packshotAssetIdRaw)
        ? packshotAssetIdRaw
        : undefined;
  if (heroAssetId === undefined || packshotAssetId === undefined) {
    return { error: 'ID de asset inválido. Selecione novamente pela galeria.' };
  }

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

  const { data: updated, error } = await supabase
    .from('products')
    .update({
      name,
      tagline,
      description,
      category_id: categoryId,
      safra_codigo: safraCodigo,
      composition,
      technical_specs: technicalSpecs,
      packaging,
      applications,
      hero_asset_id: heroAssetId,
      packshot_asset_id: packshotAssetId,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', slug)
    .is('deleted_at', null)
    .select('id, tenant_id')
    .single();

  if (error) {
    return { error: 'Erro ao salvar produto. Tente novamente.' };
  }

  // Dispara re-indexação do embedding em background (fire-and-forget)
  if (process.env.TRIGGER_SECRET_KEY && updated?.id && updated?.tenant_id) {
    embedProdutoJob
      .trigger({ productId: updated.id as string, tenantId: updated.tenant_id as string })
      .catch(() => {
        // Falha silenciosa — embedding será reindexado na próxima chamada
      });
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

// ── attachProductAsset ────────────────────────────────────────────────────────
//
// Anexa um asset existente (ja na biblioteca DAM) a um produto via
// product_assets. Usado pelo uploader inline em /produtos/[slug] pra
// adicionar MSDS, certificados, documentos regulatorios.
//
// Upload do arquivo eh feito antes via POST /api/midias/upload (que cria a row
// em assets). Esta action recebe o asset_id ja criado + product slug + role.

const VALID_PRODUCT_ASSET_ROLES = [
  'msds',
  'certificate',
  'spec_sheet',
  'datasheet',
  'gallery',
  'photo',
  'video',
  'document',
] as const;
export type ProductAssetRole = (typeof VALID_PRODUCT_ASSET_ROLES)[number];

export async function attachProductAsset(
  productSlug: string,
  assetId: string,
  role: ProductAssetRole,
): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Valida role
  if (!(VALID_PRODUCT_ASSET_ROLES as readonly string[]).includes(role)) {
    return { error: 'Tipo de documento inválido.' };
  }

  // Resolve tenant_id da sessao (RLS + NOT NULL precisam)
  const { data: userRow } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle();
  const tenantId = userRow?.tenant_id as string | undefined;
  if (!tenantId) {
    return { error: 'Tenant não resolvido na sessão. Refaça login.' };
  }

  // Busca o produto pra obter o id
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('slug', productSlug)
    .is('deleted_at', null)
    .maybeSingle();
  if (!product?.id) {
    return { error: 'Produto não encontrado.' };
  }

  // Confirma que o asset existe e pertence ao tenant
  const { data: asset } = await supabase
    .from('assets')
    .select('id')
    .eq('id', assetId)
    .is('deleted_at', null)
    .maybeSingle();
  if (!asset?.id) {
    return { error: 'Asset não encontrado ou foi removido.' };
  }

  // Insert com sort_order = max + 1 pra novo asset ficar no fim
  const { data: maxRow } = await supabase
    .from('product_assets')
    .select('sort_order')
    .eq('product_id', product.id)
    .eq('role', role)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = ((maxRow?.sort_order as number | null) ?? -1) + 1;

  const { error } = await supabase.from('product_assets').insert({
    tenant_id: tenantId,
    product_id: product.id,
    asset_id: assetId,
    role,
    sort_order: sortOrder,
  });

  if (error) {
    // 23505 = unique violation. PK eh (product_id, asset_id, role) — mesmo
    // asset ja foi anexado com o mesmo role.
    if (error.code === '23505') {
      return { error: 'Esse documento já está anexado a este produto neste papel.' };
    }
    captureError(error, { context: 'admin.produtos.attachAsset', productSlug, role });
    return { error: 'Erro ao anexar documento. Tente novamente.' };
  }

  revalidatePath(`/produtos/${productSlug}`);
  revalidatePath(`/produtos/${productSlug}/editar`);
  return {};
}

// ── detachProductAsset ────────────────────────────────────────────────────────
//
// Remove a associacao asset<->produto (NAO deleta o asset em si, so a row
// em product_assets). Asset continua disponivel na biblioteca DAM.

export async function detachProductAsset(
  productSlug: string,
  assetId: string,
  role: ProductAssetRole,
): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('slug', productSlug)
    .is('deleted_at', null)
    .maybeSingle();
  if (!product?.id) {
    return { error: 'Produto não encontrado.' };
  }

  const { error } = await supabase
    .from('product_assets')
    .delete()
    .eq('product_id', product.id)
    .eq('asset_id', assetId)
    .eq('role', role);

  if (error) {
    captureError(error, { context: 'admin.produtos.detachAsset', productSlug, role });
    return { error: 'Erro ao remover documento.' };
  }

  revalidatePath(`/produtos/${productSlug}`);
  revalidatePath(`/produtos/${productSlug}/editar`);
  return {};
}
