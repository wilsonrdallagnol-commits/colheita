// apps/website/next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@colheita/tokens'],
  // Renomeacao dos biologicos (Catalogo Argho 2026): biovas -> biotas,
  // bovex -> sporax, titan -> harzon. Link publicado nao pode virar 404.
  async redirects() {
    return [
      { source: '/produtos/biovas', destination: '/produtos/biotas', permanent: true },
      { source: '/produtos/bovex', destination: '/produtos/sporax', permanent: true },
      { source: '/produtos/titan', destination: '/produtos/harzon', permanent: true },
    ];
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Baseline dos apps irmãos (portal/admin) — site estático sem auth,
          // CSP enxuta ('unsafe-inline' necessário: Next injeta inline scripts
          // de hydration e o site usa styles inline por design).
          {
            key: 'Strict-Transport-Security',
            value: isProd ? 'max-age=63072000; includeSubDomains; preload' : 'max-age=0',
          },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // 'unsafe-eval' só em dev (HMR/react-refresh do Next usa eval;
              // a build de produção não tem react-refresh).
              `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "media-src 'self'",
              "font-src 'self'",
              "connect-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
      // Cache agressivo para assets estaticos pesados (videos + imagens).
      // O nome do asset eh estavel — se mudarmos conteudo, mudamos o nome
      // (versionamento via filename eh manual). Aceita-se 1 ano de cache.
      {
        source: '/:path*.webm',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*.mp4',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/argho-heart-poster-:variant*.png',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/argho-heart-poster-:variant*.jpg',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
