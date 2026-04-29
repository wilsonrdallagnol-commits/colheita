// packages/observability/src/sentry.ts
/**
 * Helpers Sentry para captura de erros com contexto de tenant.
 *
 * Usa @sentry/nextjs diretamente — thin wrappers que adicionam contexto
 * padrão (tenant_id, service) antes de despachar para o Sentry.
 */
import * as Sentry from '@sentry/nextjs';

type ExtraContext = Record<string, unknown>;

// ── Captura de erros ──────────────────────────────────────────────────────────

/**
 * Captura uma exceção com contexto extra opcional.
 * Equivalente a Sentry.captureException mas com tipagem consistente.
 */
export function captureError(error: Error | string | unknown, extra?: ExtraContext): void {
  Sentry.captureException(error, extra ? { extra } : {});
}

/**
 * Registra um warning no Sentry (não é exceção, mas merece atenção).
 */
export function captureWarning(message: string, extra?: ExtraContext): void {
  Sentry.captureMessage(message, {
    level: 'warning',
    ...(extra ? { extra } : {}),
  });
}

// ── Contexto de usuário ───────────────────────────────────────────────────────

export interface SentryUser {
  id: string;
  tenant_id: string;
  email?: string;
}

/**
 * Define o usuário atual no Sentry para correlação de erros.
 * Passar null limpa o usuário (ex: após logout).
 */
export function setSentryUser(user: SentryUser | null): void {
  Sentry.setUser(user);
}

// ── Re-exports convenientes ───────────────────────────────────────────────────
export { Sentry };
