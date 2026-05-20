// apps/admin/src/app/(dashboard)/distribuidores/actions.ts
'use server';

import { createAdminClient, createServerClient, requireAuth } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { logAuditEvent } from '@/lib/audit';

// ── Convidar distribuidor ─────────────────────────────────────────────────────

export async function inviteDistribuidorAction(
  _prevState: { error: string | null; success: boolean },
  formData: FormData,
): Promise<{ error: string | null; success: boolean }> {
  const cookieStore = await cookies();
  const caller = await requireAuth(cookieStore);

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

  await logAuditEvent({
    cookieStore,
    user: caller,
    action: 'invite.user',
    resource: 'user',
    resource_id: data.user?.id ?? null,
    payload: { email },
  });

  revalidatePath('/distribuidores');
  return { error: null, success: true };
}

// ── Suspender / Reativar distribuidor ────────────────────────────────────────

export async function suspendDistribuidorAction(id: string): Promise<{ error: string | null }> {
  const cookieStore = await cookies();
  const caller = await requireAuth(cookieStore);

  const supabase = createServerClient(cookieStore);
  const { error } = await supabase
    .from('users')
    .update({ status: 'suspended', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };

  await logAuditEvent({
    cookieStore,
    user: caller,
    action: 'suspend.user',
    resource: 'user',
    resource_id: id,
  });

  revalidatePath(`/distribuidores/${id}`);
  revalidatePath('/distribuidores');
  return { error: null };
}

export async function reactivateDistribuidorAction(id: string): Promise<{ error: string | null }> {
  const cookieStore = await cookies();
  const caller = await requireAuth(cookieStore);

  const supabase = createServerClient(cookieStore);
  const { error } = await supabase
    .from('users')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };

  await logAuditEvent({
    cookieStore,
    user: caller,
    action: 'reactivate.user',
    resource: 'user',
    resource_id: id,
  });

  revalidatePath(`/distribuidores/${id}`);
  revalidatePath('/distribuidores');
  return { error: null };
}

// ── Gerenciamento de roles ────────────────────────────────────────────────────
//
// Antes desta UI: pra atribuir role a user novo, era preciso SQL direto na
// public.user_roles. Cliente B2B com equipe nao consegue gerenciar permissoes.
//
// Esta action recebe um array de role slugs e sincroniza o estado:
//   - Roles novos na lista que o user nao tem: insert
//   - Roles que o user tem mas nao estao na lista: delete
//   - Operacao atomica (transaction-like via 2 statements em sequencia)
//
// Usa admin client (service role) pra bypassar RLS de user_roles. Defesa:
// requireAuth + verifica que o caller tem role 'admin' ou 'tenant_owner'.

const ALL_ROLES = [
  'tenant_owner',
  'admin',
  'product_manager',
  'asset_manager',
  'design_admin',
  'academy_admin',
  'sales',
] as const;
type RoleSlug = (typeof ALL_ROLES)[number];

export async function setUserRoles(
  userId: string,
  newRoles: string[],
): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  const caller = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);
  const admin = createAdminClient();

  // Validacao do input
  const validRoles = newRoles.filter((r): r is RoleSlug =>
    (ALL_ROLES as readonly string[]).includes(r),
  );
  if (validRoles.length !== newRoles.length) {
    return { error: 'Role inválido detectado.' };
  }

  // Defesa: caller precisa ser admin ou tenant_owner pra modificar permissoes
  // de outros usuarios. Lemos via JWT claims (mais barato que JOIN).
  const { data: callerData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', caller.id)
    .maybeSingle();
  const tenantId = callerData?.tenant_id as string | undefined;
  if (!tenantId) return { error: 'Tenant não resolvido.' };

  const { data: callerRoles } = await admin
    .from('user_roles')
    .select('role:roles(slug)')
    .eq('user_id', caller.id);

  const callerSlugs = (callerRoles ?? [])
    .map((ur) => {
      const r = Array.isArray(ur.role) ? ur.role[0] : ur.role;
      return (r as { slug?: string } | null)?.slug;
    })
    .filter((s): s is string => typeof s === 'string');

  const isPrivilegedCaller = callerSlugs.includes('admin') || callerSlugs.includes('tenant_owner');
  if (!isPrivilegedCaller) {
    return { error: 'Apenas admins podem gerenciar permissões.' };
  }

  // Defesa: target user precisa estar no mesmo tenant
  const { data: targetUser } = await admin
    .from('users')
    .select('tenant_id')
    .eq('id', userId)
    .maybeSingle();
  if (!targetUser || targetUser.tenant_id !== tenantId) {
    return { error: 'Usuário não pertence ao seu tenant.' };
  }

  // Resolve ids dos roles solicitados
  const { data: rolesRows } = await admin
    .from('roles')
    .select('id, slug')
    .eq('tenant_id', tenantId)
    .in('slug', validRoles);
  const wantedIds = new Set((rolesRows ?? []).map((r) => r.id as string));

  // State atual: roles que o target tem
  const { data: currentRows } = await admin
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId);
  const currentIds = new Set((currentRows ?? []).map((r) => r.role_id as string));

  // Diff: roles a adicionar e a remover
  const toAdd = [...wantedIds].filter((id) => !currentIds.has(id));
  const toRemove = [...currentIds].filter((id) => !wantedIds.has(id));

  // Aplica diffs (paralelos, ambos via admin client)
  const errs: string[] = [];

  if (toAdd.length > 0) {
    const { error } = await admin
      .from('user_roles')
      .insert(toAdd.map((roleId) => ({ user_id: userId, role_id: roleId, tenant_id: tenantId })));
    if (error) errs.push(`insert: ${error.message}`);
  }

  if (toRemove.length > 0) {
    const { error } = await admin
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .in('role_id', toRemove);
    if (error) errs.push(`delete: ${error.message}`);
  }

  if (errs.length > 0) {
    captureError(new Error(errs.join('; ')), {
      context: 'admin.distribuidores.setUserRoles',
      userId,
      newRoles: validRoles,
    });
    return { error: 'Erro ao atualizar permissões. Tente novamente.' };
  }

  await logAuditEvent({
    cookieStore,
    user: caller,
    action: 'set.user_roles',
    resource: 'user_roles',
    resource_id: userId,
    payload: { newRoles: validRoles, added: toAdd.length, removed: toRemove.length },
  });

  revalidatePath(`/distribuidores/${userId}`);
  revalidatePath('/distribuidores');

  // Nota: target user precisa fazer logout/login pra novo JWT carregar
  // com claim atualizado de roles (hook 0032 le user_roles no token issuance).
  return {};
}
