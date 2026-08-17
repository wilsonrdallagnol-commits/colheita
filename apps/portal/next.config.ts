// apps/portal/next.config.ts
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
// @sparticuz/chromium (path dinâmico `__dirname/../bin`). As rotas que geram
// PDF via @colheita/generator precisam do binário no bundle da função.
// IMPORTANTE: apontar para o caminho REAL no virtual store do pnpm (`.pnpm/`),
// não para o symlink `node_modules/@sparticuz/chromium` — rastrear via symlink
// faz a Vercel rejeitar o pacote da função ("invalid deployment package").
const CHROMIUM_BINARY_GLOB =
  '../../node_modules/.pnpm/@sparticuz+chromium@*/node_modules/@sparticuz/chromium/bin/**/*';

const GENERATOR_ROUTES = ['/produtos/[slug]/ficha-tecnica', '/conta/materiais/catalogo'];

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
    '@colheita/ui',
    '@colheita/tokens',
    '@colheita/db',
  ],
  // Renomeacao dos biologicos (Catalogo Argho 2026, migration 0050):
  // biovas -> biotas, bovex -> sporax, titan -> harzon. O slug e a chave da
  // rota publica /produtos/[slug] — link ja compartilhado nao pode virar 404.
  // Mesmo padrao de apps/website/next.config.ts.
  //
  // ⚠️ TRAVA DE ORDEM (2026-08-13): o portal le os produtos do SUPABASE, e o
  // website le de arquivo estatico. Se estes redirects entrarem no ar ANTES da
  // migration 0050 rodar, /produtos/biovas manda para /produtos/biotas — que
  // ainda nao existe no banco — e os 8 biologicos viram 404 no portal.
  // Por isso ficam atras da env CATALOGO_2026_MIGRADO.
  //
  // COMO LIGAR, depois de aplicar a migration:
  //   1) psql "$DATABASE_URL_DIRECT" -f infra/supabase/migrations/0050_catalogo_2026_produtos.sql
  //   2) pnpm --filter @colheita/jobs reindex-all
  //   3) definir CATALOGO_2026_MIGRADO=1 no projeto colheita-portal (Vercel) e redeployar
  async redirects() {
    if (process.env.CATALOGO_2026_MIGRADO !== '1') return [];
    return [
      { source: '/produtos/biovas', destination: '/produtos/biotas', permanent: true },
      { source: '/produtos/bovex', destination: '/produtos/sporax', permanent: true },
      { source: '/produtos/titan', destination: '/produtos/harzon', permanent: true },
      {
        source: '/produtos/biovas/ficha-tecnica',
        destination: '/produtos/biotas/ficha-tecnica',
        permanent: true,
      },
      {
        source: '/produtos/bovex/ficha-tecnica',
        destination: '/produtos/sporax/ficha-tecnica',
        permanent: true,
      },
      {
        source: '/produtos/titan/ficha-tecnica',
        destination: '/produtos/harzon/ficha-tecnica',
        permanent: true,
      },
    ];
  },
  async headers() {
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
