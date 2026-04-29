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
