// apps/portal/src/lib/rate-limit.ts
// Helper de rate limiting para endpoints pesados do portal.
//
// Padrão fail-open: sem UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// configurados, nenhum limite é aplicado (dev/CI/preview sem Redis).
// Em produção, ambas as envs DEVEM estar set — sem isso o portal fica
// exposto a DoS em endpoints como /produtos/:slug/ficha-tecnica. Por isso
// emitimos warning explícito no Sentry quando o limiter sai null em prod
// (defesa em profundidade contra rotação errada de credenciais ou
// remoção acidental da integração Vercel-Upstash).
//
// Espelha o padrão já usado em apps/api/src/app/api/v1/agent/route.ts
// para manter UMA implementação por monorepo.

import { captureWarning } from '@colheita/observability';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Memo por instância do processo: evita spam no Sentry quando múltiplos
// limiters são construídos na mesma cold start. 1 warning por prefix por
// instância já é suficiente pra acionar alarme.
const warnedPrefixes = new Set<string>();

function isProductionRuntime(): boolean {
  // VERCEL_ENV='production' só aparece em builds da branch main do projeto
  // colheita-portal. Preview deploys têm VERCEL_ENV='preview' e ficam
  // legitimamente sem rate limit (intencional).
  return process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production';
}

type WindowDuration = `${number} ${'s' | 'm' | 'h' | 'd'}`;

interface BuildLimiterArgs {
  /** Prefixo único do limiter (ex: '@colheita/portal/pdf'). */
  prefix: string;
  /** Quantidade de requests permitidos por janela. */
  limit: number;
  /** Janela em formato Upstash (ex: '1 m', '1 h'). */
  window: WindowDuration;
}

/**
 * Constroi um Ratelimit do Upstash quando as env vars estão presentes;
 * retorna null caso contrário (caller deve tratar fail-open).
 *
 * Aceita duas convenções de naming:
 *  - UPSTASH_REDIS_REST_URL / _TOKEN (convenção do @upstash/redis e usado em apps/api)
 *  - KV_REST_API_URL / _TOKEN (auto-injetado pela integração Vercel ↔ Upstash)
 *
 * Vercel Marketplace cria automaticamente KV_REST_API_*; manter UPSTASH_*
 * como fallback evita exigir aliasing manual de env vars no dashboard.
 */
export function buildRateLimiter(args: BuildLimiterArgs): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    // Em produção, ausência de Upstash regride a proteção do CRITICO C2 da
    // auditoria 2026-05-07. Acende alarme imediato no Sentry pra cobrir
    // rotação errada de credenciais ou desinstalação da integração.
    if (isProductionRuntime() && !warnedPrefixes.has(args.prefix)) {
      warnedPrefixes.add(args.prefix);
      captureWarning(`[rate-limit] disabled in production: ${args.prefix}`, {
        prefix: args.prefix,
        limit: args.limit,
        window: args.window,
        hasUrl: Boolean(url),
        hasToken: Boolean(token),
      });
    }
    return null;
  }

  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(args.limit, args.window),
    analytics: false,
    prefix: args.prefix,
  });
}

interface CheckResult {
  /** True quando a request pode prosseguir. */
  ok: boolean;
  /** Quando a janela atual reseta (epoch ms). Útil pro header Retry-After. */
  resetAt?: number;
  /** Quantos pedidos restam na janela atual. */
  remaining?: number;
  /** Limite total da janela. */
  limit?: number;
}

/**
 * Checa o rate limit. Quando o limiter é null (sem Upstash), retorna ok=true
 * (fail-open por design — preview deploys e dev local não exigem Redis).
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<CheckResult> {
  if (!limiter) return { ok: true };
  const result = await limiter.limit(identifier);
  return {
    ok: result.success,
    resetAt: result.reset,
    remaining: result.remaining,
    limit: result.limit,
  };
}

/**
 * Constroi os headers padrão de rate limit para incluir nas responses.
 * Convenção draft-ietf-httpapi-ratelimit-headers + Retry-After (RFC 6585).
 */
export function rateLimitHeaders(result: CheckResult): Record<string, string> {
  const headers: Record<string, string> = {};
  if (result.limit !== undefined) headers['X-RateLimit-Limit'] = String(result.limit);
  if (result.remaining !== undefined) {
    headers['X-RateLimit-Remaining'] = String(Math.max(0, result.remaining));
  }
  if (result.resetAt !== undefined) {
    headers['X-RateLimit-Reset'] = String(Math.floor(result.resetAt / 1000));
    if (!result.ok) {
      const retryAfterSec = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
      headers['Retry-After'] = String(retryAfterSec);
    }
  }
  return headers;
}
