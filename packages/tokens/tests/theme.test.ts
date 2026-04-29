// packages/tokens/tests/theme.test.ts
/**
 * Testa TenantThemeTokensSchema e parseTenantThemeTokens.
 * Schema Zod puro — não requer I/O nem banco de dados.
 */
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME_TOKENS,
  parseTenantThemeTokens,
  TenantThemeTokensSchema,
} from '../src/theme.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

// Typed as Record so they can be spread in tests while still passing as `unknown` to safeParse
const MINIMAL_VALID: Record<string, unknown> = {
  version: 1,
  brand: {
    primary: 'oklch(0.55 0.18 145)',
    primaryForeground: 'oklch(0.98 0 0)',
  },
};

const FULL_VALID: Record<string, unknown> = {
  version: 1,
  brand: {
    primary: '#2D6A4F',
    primaryForeground: '#ffffff',
    secondary: 'oklch(0.75 0.12 80)',
    secondaryForeground: '#1a1a1a',
    accent: 'rgb(200, 220, 100)',
    accentForeground: '#000000',
  },
  semantic: {
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#2563eb',
  },
  typography: {
    fontDisplay: '"Geist", sans-serif',
    fontBody: '"Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace',
  },
  radius: {
    base: '8px',
  },
  logo: {
    lightUrl: 'https://cdn.argho.com.br/logo-light.svg',
    darkUrl: 'https://cdn.argho.com.br/logo-dark.svg',
    iconUrl: 'https://cdn.argho.com.br/icon.png',
  },
};

// ── TenantThemeTokensSchema — casos válidos ───────────────────────────────────

describe('TenantThemeTokensSchema — payloads válidos', () => {
  it('parseia payload mínimo (version + brand obrigatórios)', () => {
    const result = TenantThemeTokensSchema.safeParse(MINIMAL_VALID);
    expect(result.success).toBe(true);
  });

  it('parseia payload completo com todos os campos opcionais', () => {
    const result = TenantThemeTokensSchema.safeParse(FULL_VALID);
    expect(result.success).toBe(true);
  });

  it('aceita cores em formato hex (#rgb e #rrggbb)', () => {
    const result = TenantThemeTokensSchema.safeParse({
      ...MINIMAL_VALID,
      brand: { primary: '#2D6A4F', primaryForeground: '#fff' },
    });
    expect(result.success).toBe(true);
  });

  it('aceita radius em rem', () => {
    const result = TenantThemeTokensSchema.safeParse({
      ...MINIMAL_VALID,
      radius: { base: '0.5rem' },
    });
    expect(result.success).toBe(true);
  });

  it('aceita radius 0 (sem unidade)', () => {
    const result = TenantThemeTokensSchema.safeParse({
      ...MINIMAL_VALID,
      radius: { base: '0' },
    });
    expect(result.success).toBe(true);
  });

  it('DEFAULT_THEME_TOKENS é válido segundo o schema', () => {
    const result = TenantThemeTokensSchema.safeParse(DEFAULT_THEME_TOKENS);
    expect(result.success).toBe(true);
  });
});

// ── TenantThemeTokensSchema — casos inválidos ─────────────────────────────────

describe('TenantThemeTokensSchema — rejeições', () => {
  it('rejeita version diferente de 1', () => {
    const result = TenantThemeTokensSchema.safeParse({ ...MINIMAL_VALID, version: 2 });
    expect(result.success).toBe(false);
  });

  it('rejeita sem version', () => {
    const { version: _, ...noVersion } = MINIMAL_VALID as Record<string, unknown>;
    const result = TenantThemeTokensSchema.safeParse(noVersion);
    expect(result.success).toBe(false);
  });

  it('rejeita brand.primary vazio', () => {
    const result = TenantThemeTokensSchema.safeParse({
      ...MINIMAL_VALID,
      brand: { primary: '', primaryForeground: '#fff' },
    });
    expect(result.success).toBe(false);
  });

  it('rejeita sem brand', () => {
    const result = TenantThemeTokensSchema.safeParse({ version: 1 });
    expect(result.success).toBe(false);
  });

  it('rejeita radius com unidade inválida (ex: "8vw")', () => {
    const result = TenantThemeTokensSchema.safeParse({
      ...MINIMAL_VALID,
      radius: { base: '8vw' },
    });
    expect(result.success).toBe(false);
  });

  it('rejeita logo.lightUrl com URL inválida', () => {
    const result = TenantThemeTokensSchema.safeParse({
      ...MINIMAL_VALID,
      logo: { lightUrl: 'nao-e-url' },
    });
    expect(result.success).toBe(false);
  });

  it('rejeita null', () => {
    expect(TenantThemeTokensSchema.safeParse(null).success).toBe(false);
  });

  it('rejeita payload string', () => {
    expect(TenantThemeTokensSchema.safeParse('{}').success).toBe(false);
  });
});

// ── parseTenantThemeTokens ────────────────────────────────────────────────────

describe('parseTenantThemeTokens', () => {
  it('retorna os tokens parseados para payload válido', () => {
    const result = parseTenantThemeTokens(MINIMAL_VALID);
    expect(result.version).toBe(1);
    expect(result.brand.primary).toBe('oklch(0.55 0.18 145)');
  });

  it('retorna DEFAULT_THEME_TOKENS para payload inválido (objeto vazio)', () => {
    const result = parseTenantThemeTokens({});
    expect(result).toEqual(DEFAULT_THEME_TOKENS);
  });

  it('retorna DEFAULT_THEME_TOKENS para null', () => {
    const result = parseTenantThemeTokens(null);
    expect(result).toEqual(DEFAULT_THEME_TOKENS);
  });

  it('retorna DEFAULT_THEME_TOKENS para string inválida', () => {
    const result = parseTenantThemeTokens('nao-e-json');
    expect(result).toEqual(DEFAULT_THEME_TOKENS);
  });

  it('retorna DEFAULT_THEME_TOKENS para payload com version errada', () => {
    const result = parseTenantThemeTokens({
      version: 2,
      brand: { primary: '#000', primaryForeground: '#fff' },
    });
    expect(result).toEqual(DEFAULT_THEME_TOKENS);
  });

  it('preserva tokens opcionais quando válidos', () => {
    const result = parseTenantThemeTokens(FULL_VALID);
    expect(result.semantic?.success).toBe('#16a34a');
    expect(result.typography?.fontBody).toBe('"Inter", system-ui, sans-serif');
    expect(result.radius?.base).toBe('8px');
  });

  it('DEFAULT_THEME_TOKENS tem version 1 e brand.primary definido', () => {
    expect(DEFAULT_THEME_TOKENS.version).toBe(1);
    expect(DEFAULT_THEME_TOKENS.brand.primary).toBeTruthy();
    expect(DEFAULT_THEME_TOKENS.brand.primaryForeground).toBeTruthy();
  });
});
