// apps/portal/src/lib/actions/conta.ts
//
// Server actions do PORTAL pra distribuidor gerenciar conta:
//   - changePassword: trocar senha (verifica posse via signInWithPassword)
//   - updateProfile: editar full_name, phone, company
//
// Espelha apps/admin/src/lib/actions/auth.ts (changePassword) e adiciona
// updateProfile pro caso de uso distribuidor (admin não edita perfil próprio
// porque é interno Argho).

'use server';

import { createServerClient, requireAuth } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { buildRateLimiter, checkRateLimit } from '@/lib/rate-limit';

/**
 * Cria cliente Supabase ISOLADO do cookie store atual.
 * Usado pra verificar posse da senha via signInWithPassword sem
 * sobrescrever o JWT/refresh_token da sessão ativa do user (defesa
 * contra race em multi-tab — auditoria hm-engineer 2026-05-23 fix #2).
 */
function createIsolatedClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

// Rate limiters (fail-open quando Redis nao configurado em dev).
// Singletons por modulo — instancia uma vez por cold start.
const changePasswordLimiter = buildRateLimiter({
  prefix: '@colheita/portal/changePassword',
  limit: 5,
  window: '1 h',
});

const updateProfileLimiter = buildRateLimiter({
  prefix: '@colheita/portal/updateProfile',
  limit: 20,
  window: '1 h',
});

// ── changePassword ───────────────────────────────────────────────────────────

export type ChangePasswordState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Partial<Record<'current' | 'next' | 'confirm', string>>;
} | null;

export async function changePassword(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Rate limit: 5/h por user (proteção contra brute force da senha atual)
  const rl = await checkRateLimit(changePasswordLimiter, `user:${user.id}`);
  if (!rl.ok) {
    return { error: 'Muitas tentativas. Tente novamente em alguns minutos.' };
  }

  const current = String(formData.get('current') ?? '');
  const next = String(formData.get('next') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (!current) return { fieldErrors: { current: 'Informe a senha atual.' } };
  if (next.length < 8)
    return { fieldErrors: { next: 'A nova senha precisa ter pelo menos 8 caracteres.' } };
  if (next.length > 100) return { fieldErrors: { next: 'Senha muito longa (máx 100).' } };
  if (!user.email) return { error: 'Sessão sem email — refaça login.' };
  if (next !== confirm)
    return { fieldErrors: { confirm: 'Confirmação não bate com a nova senha.' } };
  if (next === current) return { fieldErrors: { next: 'Use uma senha diferente da atual.' } };

  // Confirma posse da senha atual via cliente ISOLADO (não escreve
  // cookies — preserva a sessão atual do user no cookieStore).
  const isolatedClient = createIsolatedClient();
  const { error: verifyErr } = await isolatedClient.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (verifyErr) {
    return { fieldErrors: { current: 'Senha atual incorreta.' } };
  }

  // Atualiza pra nova senha — usa supabase do cookieStore (autenticado
  // como o user atual via JWT/refresh_token preservados).
  const { error: updateErr } = await supabase.auth.updateUser({ password: next });
  if (updateErr) {
    captureError(updateErr, { context: 'portal.conta.changePassword' });
    return { error: 'Erro ao atualizar senha. Tente novamente.' };
  }

  return { success: true };
}

// ── updateProfile ────────────────────────────────────────────────────────────

export type UpdateProfileState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Partial<Record<'full_name' | 'phone' | 'company', string>>;
} | null;

export async function updateProfile(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Rate limit: 20/h por user
  const rl = await checkRateLimit(updateProfileLimiter, `user:${user.id}`);
  if (!rl.ok) {
    return { error: 'Muitas atualizações de perfil. Tente novamente em alguns minutos.' };
  }

  const fullName = String(formData.get('full_name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const company = String(formData.get('company') ?? '').trim();

  // Validações simples
  if (fullName && fullName.length > 200)
    return { fieldErrors: { full_name: 'Nome muito longo (máx 200).' } };
  if (phone && phone.length > 30) return { fieldErrors: { phone: 'Telefone inválido (máx 30).' } };
  if (company && company.length > 200)
    return { fieldErrors: { company: 'Empresa muito longa (máx 200).' } };

  // Schema users tem só full_name direto. phone + company vivem em
  // preferences jsonb (extensível sem migration).
  // Primeiro busca preferences atual pra fazer merge sem perder outras keys.
  const { data: current, error: fetchErr } = await supabase
    .from('users')
    .select('preferences')
    .eq('id', user.id)
    .maybeSingle();
  if (fetchErr) {
    captureError(fetchErr, { context: 'portal.conta.updateProfile.fetch' });
    return { error: 'Erro ao ler perfil atual.' };
  }

  const currentPrefs = (current?.preferences ?? {}) as Record<string, unknown>;
  const mergedPrefs = {
    ...currentPrefs,
    phone: phone || null,
    company: company || null,
  };

  const { error } = await supabase
    .from('users')
    .update({
      full_name: fullName || null,
      preferences: mergedPrefs,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    captureError(error, { context: 'portal.conta.updateProfile' });
    return { error: 'Erro ao salvar perfil. Tente novamente.' };
  }

  revalidatePath('/conta/perfil');
  revalidatePath('/conta');
  return { success: true };
}
