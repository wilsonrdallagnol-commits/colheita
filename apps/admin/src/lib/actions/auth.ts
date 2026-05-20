// apps/admin/src/lib/actions/auth.ts
'use server';

import { createServerClient, requireAuth } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signOut(): Promise<never> {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  await supabase.auth.signOut();
  redirect('/login');
}

// ── changePassword ─────────────────────────────────────────────────────────────
//
// Permite usuario logado trocar a propria senha. Diferente do fluxo "esqueci
// senha" (resetPasswordForEmail) que exige email + link de uso unico, este eh
// auth-gated e direto.
//
// Supabase nao exige confirmar a senha atual em supabase.auth.updateUser(),
// mas validamos por defesa: passamos a senha atual em signInWithPassword antes
// pra confirmar a posse do credentials. Isso bloqueia ataque de hijack via
// session fixation onde alguem tem o cookie mas nao a senha.

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

  // Confirma posse da senha atual (defesa contra session hijack)
  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (verifyErr) {
    return { fieldErrors: { current: 'Senha atual incorreta.' } };
  }

  // Atualiza pra nova senha
  const { error: updateErr } = await supabase.auth.updateUser({
    password: next,
  });

  if (updateErr) {
    captureError(updateErr, { context: 'admin.auth.changePassword' });
    return { error: 'Erro ao atualizar senha. Tente novamente.' };
  }

  return { success: true };
}
