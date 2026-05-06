// apps/portal/src/lib/portal-config.test.ts
import { describe, expect, it } from 'vitest';
import { isSupabaseConfigured, sanitizeSearchQuery } from './portal-config';

describe('isSupabaseConfigured', () => {
  it('returns false for undefined', () => {
    expect(isSupabaseConfigured(undefined)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isSupabaseConfigured(null)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isSupabaseConfigured('')).toBe(false);
  });

  it('returns false for placeholder URL (Vercel demo)', () => {
    expect(isSupabaseConfigured('https://placeholder-prod.supabase.co')).toBe(false);
  });

  it('returns false for placeholder anywhere in URL', () => {
    expect(isSupabaseConfigured('https://my-placeholder.supabase.co')).toBe(false);
  });

  it('returns false for localhost dev', () => {
    expect(isSupabaseConfigured('http://localhost:54321')).toBe(false);
  });

  it('returns false for 127.0.0.1', () => {
    expect(isSupabaseConfigured('http://127.0.0.1:54321')).toBe(false);
  });

  it('returns true for real Supabase prod URL', () => {
    expect(isSupabaseConfigured('https://abc123def456.supabase.co')).toBe(true);
  });

  it('returns true for self-hosted Supabase', () => {
    expect(isSupabaseConfigured('https://supabase.argho.com.br')).toBe(true);
  });
});

describe('sanitizeSearchQuery', () => {
  it('preserves alphanumeric and accented chars (busca por produto)', () => {
    expect(sanitizeSearchQuery('impuch milho')).toBe('impuch milho');
    expect(sanitizeSearchQuery('grão-de-bico')).toBe('grão-de-bico');
  });

  it('removes commas (PostgREST predicate separator)', () => {
    expect(sanitizeSearchQuery('a,b,c')).toBe('abc');
  });

  it('removes parentheses (PostgREST grouping)', () => {
    expect(sanitizeSearchQuery('test(injection)')).toBe('testinjection');
  });

  it('removes asterisks (already a wildcard in ilike)', () => {
    expect(sanitizeSearchQuery('a*b')).toBe('ab');
  });

  it('neutralizes attempt to inject predicate via or()', () => {
    // Sem sanitizacao, isso permitiria mostrar produtos deletados:
    //   query.or("name.ilike.%x),deleted_at.is.null,name.ilike.%y%")
    const attack = 'x),deleted_at.is.null,name.ilike.%y';
    const safe = sanitizeSearchQuery(attack);
    expect(safe).not.toContain(',');
    expect(safe).not.toContain(')');
    expect(safe).not.toContain('(');
    expect(safe).toBe('xdeleted_at.is.nullname.ilike.%y');
  });

  it('limits to 200 chars', () => {
    const huge = 'a'.repeat(500);
    expect(sanitizeSearchQuery(huge).length).toBe(200);
  });

  it('handles empty string', () => {
    expect(sanitizeSearchQuery('')).toBe('');
  });
});
