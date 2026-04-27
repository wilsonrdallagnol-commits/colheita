// apps/admin/next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@colheita/auth', '@colheita/ui', '@colheita/tokens', '@colheita/db'],
};

export default nextConfig;
