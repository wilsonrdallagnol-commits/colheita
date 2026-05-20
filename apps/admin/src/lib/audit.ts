// apps/admin/src/lib/audit.ts
//
// Helper centralizado pra escrever em public.audit_events.
//
// Por que centralizado:
//   - Pre-0032, varios actions escreviam direto + outros nao escreviam nada
//   - Auditor que olha o log via tinha buracos
//   - Helper UNICO + chamada explicita em cada mutacao garante consistencia
//
// Padrao: chamar APOS o insert/update bem sucedido, antes do revalidate.
// Falha silenciosa por design — audit log nunca deve bloquear UX.
//
// Implementacao:
//   - Usa admin client (service role) — bypassa RLS de audit_events
//   - RLS de audit_events permite SELECT pra app_has_role('admin'),
//     INSERT eh via service_role apenas (sem policy publica)
//   - Tenant_id resolvido implicitamente via lookup em public.users

import { createAdminClient, createServerClient, type requireAuth } from '@colheita/auth';
import { captureWarning } from '@colheita/observability';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export type AuditAction =
  | 'create.product'
  | 'update.product'
  | 'publish.product'
  | 'archive.product'
  | 'draft.product'
  | 'attach.product_asset'
  | 'detach.product_asset'
  | 'create.category'
  | 'update.category'
  | 'delete.category'
  | 'create.lead'
  | 'update.lead'
  | 'status.lead'
  | 'delete.lead'
  | 'create.lead_activity'
  | 'create.asset_collection'
  | 'create.learning_track'
  | 'update.learning_track'
  | 'publish.learning_track'
  | 'archive.learning_track'
  | 'create.learning_module'
  | 'update.learning_module'
  | 'delete.learning_module'
  | 'create.learning_lesson'
  | 'update.learning_lesson'
  | 'create.regulatory'
  | 'update.regulatory'
  | 'status.regulatory'
  | 'invite.user'
  | 'suspend.user'
  | 'reactivate.user'
  | 'set.user_roles'
  | 'generate.material';

export type AuditResource =
  | 'product'
  | 'product_asset'
  | 'category'
  | 'lead'
  | 'lead_activity'
  | 'asset_collection'
  | 'learning_track'
  | 'learning_module'
  | 'learning_lesson'
  | 'regulatory_registration'
  | 'user'
  | 'user_roles'
  | 'material';

interface LogAuditEventArgs {
  cookieStore: ReadonlyRequestCookies;
  /** Usado pra extrair actor_id + tenant_id */
  user: Awaited<ReturnType<typeof requireAuth>>;
  action: AuditAction;
  resource: AuditResource;
  /** ID do recurso afetado (uuid). Aceita null pra actions sem id especifico. */
  resource_id?: string | null;
  /** JSON arbitrario com diffs/dados relevantes. Limite informal 4KB. */
  payload?: Record<string, unknown>;
}

/**
 * Registra um evento de auditoria. Falha silenciosa — nao bloqueia UX.
 *
 * @example
 *   await logAuditEvent({
 *     cookieStore, user,
 *     action: 'create.product',
 *     resource: 'product',
 *     resource_id: created.id,
 *     payload: { slug, name }
 *   });
 */
export async function logAuditEvent(args: LogAuditEventArgs): Promise<void> {
  try {
    const supabase = createServerClient(args.cookieStore);
    const admin = createAdminClient();

    // Tenant_id via lookup (mesma logica usada nas actions)
    const { data: userRow } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', args.user.id)
      .maybeSingle();
    const tenantId = userRow?.tenant_id as string | undefined;
    if (!tenantId) {
      captureWarning('audit.logEvent: tenant_id ausente', {
        action: args.action,
        actor: args.user.id,
      });
      return;
    }

    const { error } = await admin.from('audit_events').insert({
      tenant_id: tenantId,
      actor_id: args.user.id,
      action: args.action,
      resource: args.resource,
      resource_id: args.resource_id ?? null,
      payload: args.payload ?? {},
    });

    if (error) {
      captureWarning(`audit.logEvent failed: ${error.message}`, {
        action: args.action,
        resource: args.resource,
      });
    }
  } catch (err) {
    captureWarning('audit.logEvent threw', {
      action: args.action,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
