// apps/admin/next.config.ts
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
// O @vercel/nft não consegue rastrear estaticamente os arquivos brotli do
// @sparticuz/chromium (carregados via path dinâmico `__dirname/../bin`). As
// rotas que geram PDF/PNG via @colheita/generator precisam do binário no bundle
// da função serverless — daí o force-include abaixo. `@sparticuz/chromium` é
// dep direta deste app, então `node_modules/...` resolve direto — sem acoplar
// ao layout interno (`.pnpm`) do package manager.
const CHROMIUM_BINARY_GLOB = 'node_modules/@sparticuz/chromium/bin/**/*';

const GENERATOR_ROUTES = [
  '/produtos/[slug]/ficha-tecnica',
  '/produtos/[slug]/banner',
  '/produtos/catalogo',
  '/compliance/dossie',
  '/leads/[id]/proposta/gerar',
  '/layout-inference',
  '/layout-inference/[id]',
];

// ── Next.js config ────────────────────────────────────────────────────────────
const nextConfig: NextConfig = {
  // Playwright e dependências nativas não podem ser bundled pelo webpack.
  // Devem ser resolvidos pelo Node.js no runtime.
  serverExternalPackages: [
    'playwright',
    'playwright-core',
    'chromium-bidi',
    '@sparticuz/chromium',
    '@colheita/generator',
    '@colheita/jobs',
  ],
  transpilePackages: [
    '@colheita/auth',
    '@colheita/observability',
    '@colheita/ui',
    '@colheita/tokens',
    '@colheita/db',
  ],
  outputFileTracingIncludes: Object.fromEntries(
    GENERATOR_ROUTES.map((route) => [route, [CHROMIUM_BINARY_GLOB]]),
  ),
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders() }];
  },
  webpack(config, { isServer }) {
    // Playwright e chromium-bidi são binários nativos — não podem ser bundled.
    // Adicionamos como externos no servidor para que o Node.js os resolva no runtime.
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
