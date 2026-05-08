// apps/portal/src/lib/rate-limit.ts
// Helper de rate limiting para endpoints pesados do portal.
//
// Padrão fail-open: sem UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// configurados, nenhum limite é aplicado (dev/CI/preview sem Redis).
// Em produção, ambas as envs DEVEM estar set — sem isso o portal fica
// exposto a DoS em endpoints como /produtos/:slug/ficha-tecnica.
//
// Espelha o padrão já usado em apps/api/src/app/api/v1/agent/route.ts
// para manter UMA implementação por monorepo.

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

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
 */
export function buildRateLimiter(args: BuildLimiterArgs): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

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
