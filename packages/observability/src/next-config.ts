// packages/observability/src/next-config.ts
/**
 * Re-exports para uso em next.config.ts das apps.
 *
 * Uso:
 *   import { withSentryConfig } from '@colheita/observability/next-config';
 */
export { withSentryConfig } from '@sentry/nextjs';

/**
 * Opções padrão do Sentry webpack plugin para o monorepo Colheita.
 * As apps podem sobrescrever via spread.
 */
export const DEFAULT_SENTRY_OPTIONS = {
  // Silencia output verbose do webpack plugin em dev
  silent: !process.env.CI,
  // Source map upload apenas quando SENTRY_AUTH_TOKEN está configurado
  disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
} as const;

// ── Security Headers ─────────────────────────────────────────────────────────

type SecurityHeader = { key: string; value: string };

/**
 * Retorna security headers padrão para uso no `headers()` do next.config.ts.
 *
 * Inclui: CSP conservador, HSTS, X-Frame-Options, Referrer-Policy,
 * Permissions-Policy e X-Content-Type-Options.
 *
 * `unsafe-eval` é incluído apenas em desenvolvimento (Next.js HMR).
 * Em produção apenas `unsafe-inline` (necessário para hidratação RSC).
 *
 * @param overrides - Headers extras ou que sobrescrevem os defaults (matching por key).
 *
 * Uso em next.config.ts:
 * ```ts
 * import { securityHeaders } from '@colheita/observability/next-config';
 *
 * const nextConfig = {
 *   async headers() {
 *     return [{ source: '/(.*)', headers: securityHeaders() }];
 *   },
 * };
 * ```
 */
export function securityHeaders(overrides: SecurityHeader[] = []): SecurityHeader[] {
  const isDev = process.env.NODE_ENV !== 'production';

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    // unsafe-eval necessário apenas para HMR do Next.js em dev
    ...(isDev ? ["'unsafe-eval'"] : []),
  ].join(' ');

  const connectSrc = [
    "'self'",
    // Supabase (REST + Realtime)
    'https://*.supabase.co',
    'wss://*.supabase.co',
    // Supabase local (dev)
    ...(isDev ? ['http://localhost:54321', 'ws://localhost:54321'] : []),
    // Sentry
    'https://*.sentry.io',
    'https://*.ingest.sentry.io',
    // PostHog analytics
    'https://eu.i.posthog.com',
    'https://eu-assets.i.posthog.com',
    // Trigger.dev (job dashboard callbacks)
    'https://*.trigger.dev',
  ].join(' ');

  const defaults: SecurityHeader[] = [
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'X-Frame-Options',
      value: 'SAMEORIGIN',
    },
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block',
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
    },
    {
      // HSTS: 2 anos, subdomains, preload — apenas em produção (dev usa HTTP)
      key: 'Strict-Transport-Security',
      value: isDev ? 'max-age=0' : 'max-age=63072000; includeSubDomains; preload',
    },
    {
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        `script-src ${scriptSrc}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        `connect-src ${connectSrc}`,
        "frame-src 'none'",
        "frame-ancestors 'self'",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        // Força upgrade de requests HTTP → HTTPS em produção
        ...(!isDev ? ['upgrade-insecure-requests'] : []),
      ].join('; '),
    },
  ];

  // Overrides substituem headers defaults com a mesma key
  const overrideKeys = new Set(overrides.map((h) => h.key));
  return [...defaults.filter((h) => !overrideKeys.has(h.key)), ...overrides];
}
