import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 15_000,
    // Test files share a single Postgres DB — run sequentially to avoid
    // concurrent setupDb() calls that race on CREATE SCHEMA
    fileParallelism: false,
  },
});
