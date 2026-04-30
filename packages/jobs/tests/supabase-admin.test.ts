// packages/jobs/tests/supabase-admin.test.ts
//
// Testes para o helper buildSupabaseAdmin.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildSupabaseAdmin } from '../src/lib/supabase-admin.js';

const ORIG_ENV = process.env;

describe('buildSupabaseAdmin', () => {
  beforeEach(() => {
    process.env = { ...ORIG_ENV };
  });

  afterEach(() => {
    process.env = ORIG_ENV;
  });

  it('lança erro se SUPABASE_URL estiver ausente', () => {
    delete process.env.SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
    expect(() => buildSupabaseAdmin()).toThrow('SUPABASE_URL');
  });

  it('lança erro se SUPABASE_SERVICE_ROLE_KEY estiver ausente', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(() => buildSupabaseAdmin()).toThrow('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('lança erro se ambas as vars estiverem ausentes', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(() => buildSupabaseAdmin()).toThrow();
  });

  it('retorna cliente supabase quando vars estão configuradas', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.sig';
    const client = buildSupabaseAdmin();
    // O cliente Supabase expõe .from() e .auth como prova de construção correta
    expect(typeof client.from).toBe('function');
    expect(client.auth).toBeDefined();
    expect(client.auth.admin).toBeDefined();
  });
});
