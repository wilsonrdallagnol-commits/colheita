// apps/portal/src/lib/tenant.ts
//
// Helper pra resolver tenant_id do user via RPC app_tenant_id().
// Usado em server actions que precisam inserir registros com
// tenant_id explicito (createSupportTicket, requestAccountDeletion).
//
// Encapsula o pattern repetido de:
//   - chamar supabase.rpc('app_tenant_id')
//   - tratar error/null
//   - logar via captureError com context
// Retorna string | null pra caller decidir se segue ou retorna erro.

import type { createServerClient } from '@colheita/auth';
import { captureError } from '@colheita/observability';

/**
 * Retorna o tenant_id do user autenticado (vem do JWT claim
 * tenant_id, injetado pelo hook app_custom_access_token_hook).
 *
 * Retorna null se:
 *   - RPC error (Supabase indisponível ou função removida)
 *   - JWT sem tenant_id claim (user nao bootstrappado em public.users)
 *
 * @param supabase Cliente do cookieStore (auth-bound — RLS aplica)
 * @param context String pra captureError no Sentry (ex: 'portal.suporte.create')
 */
export async function resolveTenantId(
  supabase: ReturnType<typeof createServerClient>,
  context: string,
): Promise<string | null> {
  const { data, error } = await supabase.rpc('app_tenant_id');
  if (error || !data) {
    captureError(error ?? new Error('app_tenant_id retornou null'), { context });
    return null;
  }
  return String(data);
}
