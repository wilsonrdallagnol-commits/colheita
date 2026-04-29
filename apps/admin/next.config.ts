// apps/admin/next.config.ts
import { DEFAULT_SENTRY_OPTIONS, withSentryConfig } from '@colheita/observability/next-config';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@colheita/auth',
    '@colheita/observability',
    '@colheita/ui',
    '@colheita/tokens',
    '@colheita/db',
    '@colheita/generator',
  ],
  webpack(config) {
    // Resolve .js extensions in workspace packages (TypeScript ESM convention)
    // to their actual .ts/.tsx source files when bundling with transpilePackages.
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
    };
    return config;
  },
};

export default withSentryConfig(nextConfig, { ...DEFAULT_SENTRY_OPTIONS });
