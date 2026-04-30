// apps/api/next.config.ts
import {
  DEFAULT_SENTRY_OPTIONS,
  securityHeaders,
  withSentryConfig,
} from '@colheita/observability/next-config';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@colheita/auth',
    '@colheita/email',
    '@colheita/observability',
    '@colheita/tokens',
    '@colheita/db',
  ],
  async headers() {
    // API JSON — sem necessidade de frame-src/object-src permissivos;
    // CSP padrão se aplica mas o principal valor aqui são HSTS + nosniff.
    return [{ source: '/(.*)', headers: securityHeaders() }];
  },
  webpack(config) {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
    };
    return config;
  },
};

export default withSentryConfig(nextConfig, { ...DEFAULT_SENTRY_OPTIONS });
