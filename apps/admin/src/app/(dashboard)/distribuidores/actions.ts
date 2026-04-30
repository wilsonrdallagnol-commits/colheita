// apps/admin/src/app/(dashboard)/distribuidores/actions.ts
'use server';

import { createAdminClient, createServerClient, requireAuth } from '@colheita/auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// ── Convidar distribuidor ─────────────────────────────────────────────────────

export async function inviteDistribuidorAction(
  _prevState: { error: string | null; success: boolean },
  formData: FormData,
): Promise<{ error: string | null; success: boolean }> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);

  const email = formData.get('email')?.toString().trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return { error: 'E-mail inválido.', success: false };
  }

  const adminClient = createAdminClient();

  // Convida via Supabase Auth (envia magic link de primeiro acesso).
  // O trigger on_auth_user_created cria o registro em public.users automaticamente.
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_PORTAL_URL ?? 'http://localhost:3001'}/auth/callback`,
  });

  if (error) {
    // Usuário já cadastrado: erro silencioso pois o magic link foi enviado
    if (error.message.includes('already been registered')) {
      return { error: 'Este e-mail já está cadastrado.', success: false };
    }
    return { error: `Erro ao convidar: ${error.message}`, success: false };
  }

  // Garante que public.users.status = 'invited'.
  // O trigger cria como 'active' — corrigimos aqui com service role.
  if (data.user) {
    await adminClient
      .from('users')
      .update({ status: 'invited', updated_at: new Date().toISOString() })
      .eq('id', data.user.id);
  }

  revalidatePath('/distribuidores');
  return { error: null, success: true };
}

// ── Suspender / Reativar distribuidor ────────────────────────────────────────

export async function suspendDistribuidorAction(id: string): Promise<{ error: string | null }> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);

  const supabase = createServerClient(cookieStore);
  const { error } = await supabase
    .from('users')
    .update({ status: 'suspended', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath(`/distribuidores/${id}`);
  revalidatePath('/distribuidores');
  return { error: null };
}

export async function reactivateDistribuidorAction(id: string): Promise<{ error: string | null }> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);

  const supabase = createServerClient(cookieStore);
  const { error } = await supabase
    .from('users')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath(`/distribuidores/${id}`);
  revalidatePath('/distribuidores');
  return { error: null };
}
