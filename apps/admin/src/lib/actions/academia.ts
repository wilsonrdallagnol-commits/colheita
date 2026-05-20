// apps/admin/src/lib/actions/academia.ts
'use server';

import { createServerClient, requireAuth } from '@colheita/auth';
import { embedLicaoJob } from '@colheita/jobs';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type TrilhaFormState = {
  error?: string;
  fieldErrors?: Partial<
    Record<'title' | 'slug' | 'subtitle' | 'description' | 'level' | 'status', string>
  >;
} | null;

export type ModuloFormState = {
  error?: string;
  fieldErrors?: Partial<Record<'title' | 'slug' | 'description' | 'sort_order', string>>;
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

async function getTenantId(supabase: ReturnType<typeof createServerClient>) {
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) return null;
  // maybeSingle: row pode nao existir (user logado mas sem registro em
  // public.users — handle_new_auth_user falhou). single() loga erro noisy.
  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', userAuth.user.id)
    .maybeSingle();
  return (userData?.tenant_id as string | null) ?? null;
}

// ── createTrilha ──────────────────────────────────────────────────────────────

export async function createTrilha(
  _prevState: TrilhaFormState,
  formData: FormData,
): Promise<TrilhaFormState> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const title = String(formData.get('title') ?? '').trim();
  const subtitle = String(formData.get('subtitle') ?? '').trim() || null;
  const description = String(formData.get('description') ?? '').trim() || null;
  const level = String(formData.get('level') ?? 'beginner').trim();
  const status = String(formData.get('status') ?? 'draft').trim();
  const audienceRaw = String(formData.get('audience') ?? '').trim();
  const audience = audienceRaw
    ? audienceRaw
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean)
    : [];
  const grantsCertification = formData.get('grants_certification') === 'true';
  const validityRaw = String(formData.get('certification_validity_days') ?? '').trim();
  const certificationValidityDays =
    grantsCertification && validityRaw !== '' ? Number.parseInt(validityRaw, 10) || null : null;

  if (!title) {
    return { fieldErrors: { title: 'Título é obrigatório.' } };
  }

  const slug = slugify(title);
  if (!slug) {
    return { fieldErrors: { title: 'Título inválido — não gerou um slug válido.' } };
  }

  const tenantId = await getTenantId(supabase);
  if (!tenantId) return { error: 'Tenant não encontrado.' };

  const { error } = await supabase.from('learning_tracks').insert({
    slug,
    title,
    subtitle,
    description,
    level,
    status,
    audience,
    grants_certification: grantsCertification,
    certification_validity_days: certificationValidityDays,
    tenant_id: tenantId,
    sort_order: 0,
  });

  if (error) {
    if (error.code === '23505') {
      return { fieldErrors: { title: 'Já existe uma trilha com esse título.' } };
    }
    return { error: 'Erro ao criar trilha. Tente novamente.' };
  }

  revalidatePath('/academia');
  redirect('/academia');
}

// ── updateTrilha ──────────────────────────────────────────────────────────────

export async function updateTrilha(
  id: string,
  _prevState: TrilhaFormState,
  formData: FormData,
): Promise<TrilhaFormState> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const title = String(formData.get('title') ?? '').trim();
  const subtitle = String(formData.get('subtitle') ?? '').trim() || null;
  const description = String(formData.get('description') ?? '').trim() || null;
  const level = String(formData.get('level') ?? 'beginner').trim();
  const status = String(formData.get('status') ?? 'draft').trim();
  const audienceRaw = String(formData.get('audience') ?? '').trim();
  const audience = audienceRaw
    ? audienceRaw
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean)
    : [];
  const grantsCertification = formData.get('grants_certification') === 'true';
  const validityRaw = String(formData.get('certification_validity_days') ?? '').trim();
  const certificationValidityDays =
    grantsCertification && validityRaw !== '' ? Number.parseInt(validityRaw, 10) || null : null;

  if (!title) {
    return { fieldErrors: { title: 'Título é obrigatório.' } };
  }

  const { error } = await supabase
    .from('learning_tracks')
    .update({
      title,
      subtitle,
      description,
      level,
      status,
      audience,
      grants_certification: grantsCertification,
      certification_validity_days: certificationValidityDays,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return { error: 'Erro ao salvar trilha.' };
  }

  revalidatePath('/academia');
  redirect('/academia');
}

// ── publishTrilha / archiveTrilha ─────────────────────────────────────────────

export async function publishTrilha(id: string): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase
    .from('learning_tracks')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: 'Erro ao publicar trilha.' };

  revalidatePath('/academia');
  return {};
}

export async function archiveTrilha(id: string): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase
    .from('learning_tracks')
    .update({ status: 'archived' })
    .eq('id', id);

  if (error) return { error: 'Erro ao arquivar trilha.' };

  revalidatePath('/academia');
  return {};
}

// ── createModulo ──────────────────────────────────────────────────────────────

export async function createModulo(
  trackId: string,
  _prevState: ModuloFormState,
  formData: FormData,
): Promise<ModuloFormState> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  const sortOrderRaw = String(formData.get('sort_order') ?? '0').trim();
  const sortOrder = Number.isNaN(Number(sortOrderRaw)) ? 0 : Number(sortOrderRaw);

  if (!title) {
    return { fieldErrors: { title: 'Título é obrigatório.' } };
  }

  const slug = slugify(title);
  if (!slug) {
    return { fieldErrors: { title: 'Título inválido — não gerou um slug válido.' } };
  }

  const tenantId = await getTenantId(supabase);
  if (!tenantId) return { error: 'Tenant não encontrado.' };

  const { error } = await supabase.from('learning_modules').insert({
    slug,
    title,
    description,
    sort_order: sortOrder,
    track_id: trackId,
    tenant_id: tenantId,
  });

  if (error) {
    if (error.code === '23505') {
      return { fieldErrors: { title: 'Já existe um módulo com esse título nessa trilha.' } };
    }
    return { error: 'Erro ao criar módulo.' };
  }

  revalidatePath('/academia');
  return null;
}

// ── updateModulo ──────────────────────────────────────────────────────────────

export async function updateModulo(
  id: string,
  _prevState: ModuloFormState,
  formData: FormData,
): Promise<ModuloFormState> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;

  if (!title) {
    return { fieldErrors: { title: 'Título é obrigatório.' } };
  }

  const { error } = await supabase
    .from('learning_modules')
    .update({
      title,
      description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return { error: 'Erro ao salvar módulo.' };
  }

  revalidatePath('/academia');
  return null;
}

// ── deleteModulo ──────────────────────────────────────────────────────────────

export async function deleteModulo(id: string): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase.from('learning_modules').delete().eq('id', id);
  if (error) return { error: 'Erro ao excluir módulo.' };

  revalidatePath('/academia');
  return {};
}

// ── LicaoFormState ────────────────────────────────────────────────────────────

export type LicaoFormState = {
  error?: string;
  fieldErrors?: Partial<
    Record<'title' | 'type' | 'estimated_minutes' | 'content_markdown' | 'content_url', string>
  >;
} | null;

// ── createLicao ───────────────────────────────────────────────────────────────

export async function createLicao(
  moduleId: string,
  _prevState: LicaoFormState,
  formData: FormData,
): Promise<LicaoFormState> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const title = String(formData.get('title') ?? '').trim();
  const type = String(formData.get('type') ?? 'article').trim();
  const estimatedMinutesRaw = String(formData.get('estimated_minutes') ?? '').trim();
  const estimatedMinutes = estimatedMinutesRaw ? Number(estimatedMinutesRaw) : null;
  const isRequired = formData.get('is_required') === 'true';
  const sortOrderRaw = String(formData.get('sort_order') ?? '0').trim();
  const sortOrder = Number.isNaN(Number(sortOrderRaw)) ? 0 : Number(sortOrderRaw);

  if (!title) {
    return { fieldErrors: { title: 'Título é obrigatório.' } };
  }

  const slug = slugify(title);
  if (!slug) {
    return { fieldErrors: { title: 'Título inválido — não gerou um slug válido.' } };
  }

  // Build content JSONB based on type
  let content: Record<string, unknown> = {};
  if (type === 'article') {
    const markdown = String(formData.get('content_markdown') ?? '').trim();
    content = { markdown };
  } else if (type === 'video') {
    const url = String(formData.get('content_url') ?? '').trim();
    content = { url };
  }

  const tenantId = await getTenantId(supabase);
  if (!tenantId) return { error: 'Tenant não encontrado.' };

  const { data: created, error } = await supabase
    .from('learning_lessons')
    .insert({
      slug,
      title,
      type,
      content,
      estimated_minutes: estimatedMinutes,
      is_required: isRequired,
      sort_order: sortOrder,
      module_id: moduleId,
      tenant_id: tenantId,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return { fieldErrors: { title: 'Já existe uma lição com esse título neste módulo.' } };
    }
    return { error: 'Erro ao criar lição.' };
  }

  // Dispara re-indexação do embedding em background (fire-and-forget)
  if (process.env.TRIGGER_SECRET_KEY && created?.id) {
    embedLicaoJob.trigger({ lessonId: created.id as string, tenantId }).catch(() => {
      // Falha silenciosa — embedding será reindexado na próxima atualização
    });
  }

  revalidatePath('/academia');
  return null;
}

// ── updateLicao ───────────────────────────────────────────────────────────────

export async function updateLicao(
  id: string,
  _prevState: LicaoFormState,
  formData: FormData,
): Promise<LicaoFormState> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const title = String(formData.get('title') ?? '').trim();
  const type = String(formData.get('type') ?? 'article').trim();
  const estimatedMinutesRaw = String(formData.get('estimated_minutes') ?? '').trim();
  const estimatedMinutes = estimatedMinutesRaw ? Number(estimatedMinutesRaw) : null;
  const isRequired = formData.get('is_required') === 'true';

  if (!title) {
    return { fieldErrors: { title: 'Título é obrigatório.' } };
  }

  // Build content JSONB based on type
  let content: Record<string, unknown> = {};
  if (type === 'article') {
    const markdown = String(formData.get('content_markdown') ?? '').trim();
    content = { markdown };
  } else if (type === 'video') {
    const url = String(formData.get('content_url') ?? '').trim();
    content = { url };
  }

  const { data: updated, error } = await supabase
    .from('learning_lessons')
    .update({
      title,
      type,
      content,
      estimated_minutes: estimatedMinutes,
      is_required: isRequired,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('tenant_id')
    .single();

  if (error) {
    return { error: 'Erro ao salvar lição.' };
  }

  // Dispara re-indexação do embedding em background (fire-and-forget)
  if (process.env.TRIGGER_SECRET_KEY && updated?.tenant_id) {
    embedLicaoJob.trigger({ lessonId: id, tenantId: updated.tenant_id as string }).catch(() => {
      // Falha silenciosa — embedding será reindexado na próxima atualização
    });
  }

  revalidatePath('/academia');
  return null;
}

// ── deleteLicao ───────────────────────────────────────────────────────────────

export async function deleteLicao(id: string): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase.from('learning_lessons').delete().eq('id', id);
  if (error) return { error: 'Erro ao excluir lição.' };

  revalidatePath('/academia');
  return {};
}
