// packages/observability/tests/next-config.test.ts
/**
 * Testes para securityHeaders() — helper de security headers para Next.js.
 * Sem dependências externas: função pura que opera sobre strings.
 * Injeta `nodeEnv` explicitamente para evitar mutação de process.env.
 */

import { describe, expect, test } from 'vitest';
import { securityHeaders } from '../src/next-config.js';

// ── Helper ────────────────────────────────────────────────────────────────────

function header(env: string, key: string): string | undefined {
  return securityHeaders([], env).find((h) => h.key === key)?.value;
}

// ── Testes em produção ────────────────────────────────────────────────────────

describe('securityHeaders() em produção', () => {
  const env = 'production';

  test('retorna array não-vazio', () => {
    expect(securityHeaders([], env).length).toBeGreaterThan(0);
  });

  test('inclui X-Content-Type-Options: nosniff', () => {
    expect(header(env, 'X-Content-Type-Options')).toBe('nosniff');
  });

  test('inclui X-Frame-Options: SAMEORIGIN', () => {
    expect(header(env, 'X-Frame-Options')).toBe('SAMEORIGIN');
  });

  test('inclui X-XSS-Protection', () => {
    expect(header(env, 'X-XSS-Protection')).toBe('1; mode=block');
  });

  test('inclui Referrer-Policy: strict-origin-when-cross-origin', () => {
    expect(header(env, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  test('inclui Permissions-Policy com câmera, microfone e geolocalização bloqueados', () => {
    const val = header(env, 'Permissions-Policy');
    expect(val).toContain('camera=()');
    expect(val).toContain('microphone=()');
    expect(val).toContain('geolocation=()');
  });

  test('HSTS tem max-age=63072000 com includeSubDomains e preload em produção', () => {
    const hsts = header(env, 'Strict-Transport-Security');
    expect(hsts).toContain('max-age=63072000');
    expect(hsts).toContain('includeSubDomains');
    expect(hsts).toContain('preload');
  });

  test('CSP inclui upgrade-insecure-requests em produção', () => {
    expect(header(env, 'Content-Security-Policy')).toContain('upgrade-insecure-requests');
  });

  test('CSP NÃO inclui unsafe-eval em produção', () => {
    expect(header(env, 'Content-Security-Policy')).not.toContain("'unsafe-eval'");
  });

  test('CSP inclui unsafe-inline (necessário para RSC hidratação)', () => {
    expect(header(env, 'Content-Security-Policy')).toContain("'unsafe-inline'");
  });

  test('CSP connect-src inclui Supabase', () => {
    expect(header(env, 'Content-Security-Policy')).toContain('https://*.supabase.co');
  });

  test('CSP connect-src inclui PostHog', () => {
    expect(header(env, 'Content-Security-Policy')).toContain('https://eu.i.posthog.com');
  });

  test('CSP connect-src inclui Sentry', () => {
    expect(header(env, 'Content-Security-Policy')).toContain('https://*.sentry.io');
  });

  test('CSP NÃO inclui localhost em produção', () => {
    expect(header(env, 'Content-Security-Policy')).not.toContain('localhost');
  });

  test('CSP inclui object-src none', () => {
    expect(header(env, 'Content-Security-Policy')).toContain("object-src 'none'");
  });

  test('CSP inclui base-uri self', () => {
    expect(header(env, 'Content-Security-Policy')).toContain("base-uri 'self'");
  });
});

// ── Testes em desenvolvimento ─────────────────────────────────────────────────

describe('securityHeaders() em desenvolvimento', () => {
  const env = 'development';

  test('HSTS tem max-age=0 em desenvolvimento', () => {
    expect(header(env, 'Strict-Transport-Security')).toBe('max-age=0');
  });

  test('CSP inclui unsafe-eval em desenvolvimento (Next.js HMR)', () => {
    expect(header(env, 'Content-Security-Policy')).toContain("'unsafe-eval'");
  });

  test('CSP NÃO inclui upgrade-insecure-requests em desenvolvimento', () => {
    expect(header(env, 'Content-Security-Policy')).not.toContain('upgrade-insecure-requests');
  });

  test('CSP connect-src inclui localhost em desenvolvimento', () => {
    expect(header(env, 'Content-Security-Policy')).toContain('localhost');
  });
});

// ── Overrides ─────────────────────────────────────────────────────────────────

describe('securityHeaders() com overrides', () => {
  test('override substitui header com mesma key', () => {
    const headers = securityHeaders([{ key: 'X-Frame-Options', value: 'DENY' }]);
    expect(headers.find((h) => h.key === 'X-Frame-Options')?.value).toBe('DENY');
  });

  test('override não duplica o header', () => {
    const headers = securityHeaders([{ key: 'X-Frame-Options', value: 'DENY' }]);
    expect(headers.filter((h) => h.key === 'X-Frame-Options')).toHaveLength(1);
  });

  test('override adiciona novo header não existente', () => {
    const headers = securityHeaders([{ key: 'X-Custom-Header', value: 'custom-value' }]);
    expect(headers.find((h) => h.key === 'X-Custom-Header')?.value).toBe('custom-value');
  });

  test('sem override, todos os defaults estão presentes', () => {
    const keys = securityHeaders().map((h) => h.key);
    for (const expected of [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'Referrer-Policy',
      'Permissions-Policy',
    ]) {
      expect(keys).toContain(expected);
    }
  });
});
