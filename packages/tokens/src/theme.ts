/**
 * TenantThemeTokens — contrato dos design tokens persistidos por tenant.
 *
 * Este shape é gravado em `tenants.theme_tokens` (JSONB). O Drizzle aponta
 * o `$type<TenantThemeTokens>()` pra essa interface, garantindo que toda
 * leitura/escrita seja tipada.
 *
 * O `packages/tokens/build` (Style Dictionary, fase posterior) gera CSS
 * vars + JSON shapes a partir dessa interface canônica.
 *
 * Princípios:
 * - Tokens estruturais (espaçamentos, tipografia base) NÃO ficam aqui — são
 *   globais ao Programa Colheita. Aqui ficam só os que mudam por tenant.
 * - Cores em formato OKLCH preferencial (P3 wide-gamut, fallback hex em runtime).
 * - Schema versionado em `version` pra permitir migrations futuras.
 */

import { z } from 'zod';

// ----------------------------------------------------------------------------
// Primitivos
// ----------------------------------------------------------------------------

const ColorTokenSchema = z
  .string()
  .min(1)
  .describe('Cor em CSS color string: oklch(...), #hex, rgb(...), hsl(...)');

const FontFamilySchema = z
  .string()
  .min(1)
  .describe('CSS font-family stack completa, ex: "Inter, system-ui, sans-serif"');

const RadiusSchema = z
  .string()
  .regex(/^(\d+(\.\d+)?(px|rem|em)|0)$/, 'CSS length em px/rem/em ou 0')
  .describe('Border radius base (multiplos derivados em build)');

// ----------------------------------------------------------------------------
// Schema completo
// ----------------------------------------------------------------------------

export const TenantThemeTokensSchema = z.object({
  version: z
    .literal(1)
    .describe('Versao do schema; bump em breaking changes pra permitir migrations'),

  brand: z.object({
    primary: ColorTokenSchema,
    primaryForeground: ColorTokenSchema,
    secondary: ColorTokenSchema.optional(),
    secondaryForeground: ColorTokenSchema.optional(),
    accent: ColorTokenSchema.optional(),
    accentForeground: ColorTokenSchema.optional(),
  }),

  semantic: z
    .object({
      success: ColorTokenSchema.optional(),
      warning: ColorTokenSchema.optional(),
      danger: ColorTokenSchema.optional(),
      info: ColorTokenSchema.optional(),
    })
    .optional(),

  typography: z
    .object({
      fontDisplay: FontFamilySchema.optional(),
      fontBody: FontFamilySchema.optional(),
      fontMono: FontFamilySchema.optional(),
    })
    .optional(),

  radius: z
    .object({
      base: RadiusSchema,
    })
    .optional(),

  logo: z
    .object({
      lightUrl: z.string().url().optional(),
      darkUrl: z.string().url().optional(),
      iconUrl: z.string().url().optional(),
    })
    .optional(),

  custom: z
    .record(z.unknown())
    .optional()
    .describe('Escape hatch pra tokens proprietarios do tenant'),
});

export type TenantThemeTokens = z.infer<typeof TenantThemeTokensSchema>;

/**
 * Tokens default — usados quando tenant.theme_tokens é `{}` (estado inicial).
 * Identidade Argho ficará num arquivo separado preenchido pelo /hm-designer.
 */
export const DEFAULT_THEME_TOKENS: TenantThemeTokens = {
  version: 1,
  brand: {
    primary: 'oklch(0.55 0.18 145)',
    primaryForeground: 'oklch(0.98 0 0)',
  },
};

/**
 * Helper de validação seguro pra runtime.
 * Retorna defaults se o JSONB persistido não bater com o schema atual.
 */
export function parseTenantThemeTokens(raw: unknown): TenantThemeTokens {
  const result = TenantThemeTokensSchema.safeParse(raw);
  return result.success ? result.data : DEFAULT_THEME_TOKENS;
}
