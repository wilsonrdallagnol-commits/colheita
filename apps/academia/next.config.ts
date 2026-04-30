// apps/academia/next.config.ts
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
    '@colheita/ui',
    '@colheita/tokens',
    '@colheita/db',
  ],
  async headers() {
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
