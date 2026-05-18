// apps/api/next.config.ts
// Importa diretamente do @sentry/nextjs e define helpers inline para evitar
// o problema de bootstrap do next.config.ts (CJS require vs ESM exports).
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

// ── Sentry options ────────────────────────────────────────────────────────────
const DEFAULT_SENTRY_OPTIONS = {
  silent: !process.env.CI,
  disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
} as const;

// ── Security headers ──────────────────────────────────────────────────────────
function securityHeaders(): { key: string; value: string }[] {
  const isDev = process.env.NODE_ENV !== 'production';
  const scriptSrc = ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])].join(' ');
  const connectSrc = [
    "'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    ...(isDev ? ['http://localhost:54321', 'ws://localhost:54321'] : []),
    'https://*.sentry.io',
    'https://*.ingest.sentry.io',
    'https://eu.i.posthog.com',
    'https://eu-assets.i.posthog.com',
    'https://*.trigger.dev',
  ].join(' ');
  return [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'X-XSS-Protection', value: '1; mode=block' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
    },
    {
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
        ...(!isDev ? ['upgrade-insecure-requests'] : []),
      ].join('; '),
    },
  ];
}

// ── Output file tracing — binário do Chromium serverless ──────────────────────
// O @vercel/nft não rastreia estaticamente os arquivos brotli do
// @sparticuz/chromium (path dinâmico `__dirname/../bin`). A rota que gera PDF
// via @colheita/generator precisa do binário no bundle da função.
// IMPORTANTE: apontar para o caminho REAL no virtual store do pnpm (`.pnpm/`),
// não para o symlink `node_modules/@sparticuz/chromium` — rastrear via symlink
// faz a Vercel rejeitar o pacote da função ("invalid deployment package").
const CHROMIUM_BINARY_GLOB =
  '../../node_modules/.pnpm/@sparticuz+chromium@*/node_modules/@sparticuz/chromium/bin/**/*';

const GENERATOR_ROUTES = ['/api/v1/catalog/[slug]/ficha-tecnica'];

// ── Next.js config ────────────────────────────────────────────────────────────
const nextConfig: NextConfig = {
  serverExternalPackages: [
    'playwright',
    'playwright-core',
    'chromium-bidi',
    '@sparticuz/chromium',
    '@colheita/generator',
    '@colheita/jobs',
  ],
  outputFileTracingIncludes: Object.fromEntries(
    GENERATOR_ROUTES.map((route) => [route, [CHROMIUM_BINARY_GLOB]]),
  ),
  transpilePackages: [
    '@colheita/auth',
    '@colheita/email',
    '@colheita/observability',
    '@colheita/tokens',
    '@colheita/db',
  ],
  async headers() {
    // API JSON — CSP padrão aplica; principal valor são HSTS + nosniff.
    return [{ source: '/(.*)', headers: securityHeaders() }];
  },
  webpack(config, { isServer }) {
    if (isServer) {
      const prior = Array.isArray(config.externals)
        ? config.externals
        : config.externals
          ? [config.externals]
          : [];
      config.externals = [
        ...prior,
        'playwright',
        'playwright-core',
        'chromium-bidi',
        '@sparticuz/chromium',
      ];
    }
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
    };
    return config;
  },
};

export default withSentryConfig(nextConfig, { ...DEFAULT_SENTRY_OPTIONS });
