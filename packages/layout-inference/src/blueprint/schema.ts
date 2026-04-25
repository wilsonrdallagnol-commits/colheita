/**
 * LayoutBlueprint — Schema Zod
 *
 * Fonte de verdade da estrutura de blueprints. Usado para:
 * 1. Validar output do vision model
 * 2. Validar edições manuais no admin
 * 3. Validar input do compiler antes do render
 *
 * Princípio: o blueprint é TENANT-AGNOSTIC. Não contém cores, fontes ou
 * conteúdo específico. Captura ESTRUTURA e INTENÇÃO. O tema é aplicado
 * no momento do render.
 */

import { z } from 'zod';

// ============================================================================
// FORMAT
// ============================================================================

export const LayoutFormatSchema = z.object({
  aspectRatio: z
    .string()
    .regex(/^\d+:\d+$/, 'aspectRatio deve ser no formato "W:H" (ex: "9:16", "16:9", "210:297")'),
  orientation: z.enum(['portrait', 'landscape', 'square']),
  intendedDpi: z.union([z.literal(72), z.literal(150), z.literal(300)]),
  intendedMedium: z.enum(['screen', 'print', 'social', 'presentation']),
});

export type LayoutFormat = z.infer<typeof LayoutFormatSchema>;

// ============================================================================
// GRID
// ============================================================================

export const LayoutGridSchema = z.object({
  columns: z.number().int().min(1).max(24),
  rows: z.union([z.number().int().min(1), z.literal('auto')]),
  density: z.enum(['minimal', 'medium', 'high', 'maximal']),
  gutterRelative: z.number().min(0).max(1),
});

export type LayoutGrid = z.infer<typeof LayoutGridSchema>;

// ============================================================================
// REGIONS
// ============================================================================

export const LayoutRegionTypeSchema = z.enum([
  'brand_header',
  'headline_block',
  'subheadline_block',
  'product_centerpiece',
  'product_gallery',
  'data_grid',
  'feature_list',
  'icon_grid',
  'testimonial',
  'cta_block',
  'footer',
  'badge_strip',
  'media_block',
  'qr_code',
  'legal_block',
  'decorative',
]);

export type LayoutRegionType = z.infer<typeof LayoutRegionTypeSchema>;

export const LayoutRegionSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z][a-z0-9_]*$/, 'id deve ser snake_case começando com letra'),
  type: LayoutRegionTypeSchema,
  position: z.enum(['top', 'upper', 'center', 'lower', 'bottom', 'left', 'right']),
  weight: z.number().min(0).max(1).describe('Proporção do espaço ocupado (0.0 a 1.0)'),
  hierarchy: z.array(z.string()).optional(),
  itemCount: z.number().int().nonnegative().optional(),
  layoutHint: z
    .enum(['horizontal_chips', 'vertical_stack', 'grid', 'carousel', 'overlap'])
    .optional(),
  notes: z.string().max(280).optional(),
});

export type LayoutRegion = z.infer<typeof LayoutRegionSchema>;

// ============================================================================
// VISUAL INTENT
// ============================================================================

export const LayoutVisualIntentSchema = z.object({
  mood: z.enum(['technical_premium', 'editorial', 'promotional', 'minimal', 'bold', 'cinematic']),
  density: z.enum(['minimal', 'medium', 'high', 'maximal']),
  balance: z.enum(['centered', 'asymmetric', 'left_heavy', 'right_heavy']),
  emphasis: z.enum(['product_first', 'data_first', 'message_first', 'visual_first']),
  inferredPalette: z.enum(['dark', 'light', 'high_contrast', 'gradient_heavy']).optional(),
});

export type LayoutVisualIntent = z.infer<typeof LayoutVisualIntentSchema>;

// ============================================================================
// BLUEPRINT (raiz)
// ============================================================================

export const LayoutBlueprintSchema = z
  .object({
    format: LayoutFormatSchema,
    grid: LayoutGridSchema,
    regions: z
      .array(LayoutRegionSchema)
      .min(1, 'Blueprint precisa ter ao menos uma região')
      .max(20, 'Blueprint não pode ter mais de 20 regiões'),
    visualIntent: LayoutVisualIntentSchema,
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (data) => {
      const totalWeight = data.regions.reduce((sum, r) => sum + r.weight, 0);
      // Tolerância: regiões podem se sobrepor parcialmente
      return totalWeight >= 0.5 && totalWeight <= 2.0;
    },
    {
      message: 'Soma dos pesos das regiões deve estar entre 0.5 e 2.0',
      path: ['regions'],
    },
  )
  .refine(
    (data) => {
      const ids = data.regions.map((r) => r.id);
      return new Set(ids).size === ids.length;
    },
    {
      message: 'IDs de regiões devem ser únicos',
      path: ['regions'],
    },
  );

export type LayoutBlueprint = z.infer<typeof LayoutBlueprintSchema>;

// ============================================================================
// Helpers
// ============================================================================

export function validateBlueprint(data: unknown): LayoutBlueprint {
  return LayoutBlueprintSchema.parse(data);
}

export function safeValidateBlueprint(data: unknown) {
  return LayoutBlueprintSchema.safeParse(data);
}

/**
 * JSON Schema do blueprint — passado pro vision model como structured output target.
 */
export function getBlueprintJsonSchema() {
  return {
    type: 'object',
    required: ['format', 'grid', 'regions', 'visualIntent'],
    properties: {
      format: {
        type: 'object',
        required: ['aspectRatio', 'orientation', 'intendedDpi', 'intendedMedium'],
        properties: {
          aspectRatio: { type: 'string', pattern: '^\\d+:\\d+$' },
          orientation: { type: 'string', enum: ['portrait', 'landscape', 'square'] },
          intendedDpi: { type: 'number', enum: [72, 150, 300] },
          intendedMedium: {
            type: 'string',
            enum: ['screen', 'print', 'social', 'presentation'],
          },
        },
      },
      grid: {
        type: 'object',
        required: ['columns', 'rows', 'density', 'gutterRelative'],
        properties: {
          columns: { type: 'integer', minimum: 1, maximum: 24 },
          rows: { oneOf: [{ type: 'integer', minimum: 1 }, { const: 'auto' }] },
          density: { type: 'string', enum: ['minimal', 'medium', 'high', 'maximal'] },
          gutterRelative: { type: 'number', minimum: 0, maximum: 1 },
        },
      },
      regions: {
        type: 'array',
        minItems: 1,
        maxItems: 20,
        items: {
          type: 'object',
          required: ['id', 'type', 'position', 'weight'],
          properties: {
            id: { type: 'string', pattern: '^[a-z][a-z0-9_]*$' },
            type: { type: 'string', enum: LayoutRegionTypeSchema.options },
            position: {
              type: 'string',
              enum: ['top', 'upper', 'center', 'lower', 'bottom', 'left', 'right'],
            },
            weight: { type: 'number', minimum: 0, maximum: 1 },
            hierarchy: { type: 'array', items: { type: 'string' } },
            itemCount: { type: 'integer', minimum: 0 },
            layoutHint: {
              type: 'string',
              enum: ['horizontal_chips', 'vertical_stack', 'grid', 'carousel', 'overlap'],
            },
            notes: { type: 'string', maxLength: 280 },
          },
        },
      },
      visualIntent: {
        type: 'object',
        required: ['mood', 'density', 'balance', 'emphasis'],
        properties: {
          mood: {
            type: 'string',
            enum: ['technical_premium', 'editorial', 'promotional', 'minimal', 'bold', 'cinematic'],
          },
          density: { type: 'string', enum: ['minimal', 'medium', 'high', 'maximal'] },
          balance: {
            type: 'string',
            enum: ['centered', 'asymmetric', 'left_heavy', 'right_heavy'],
          },
          emphasis: {
            type: 'string',
            enum: ['product_first', 'data_first', 'message_first', 'visual_first'],
          },
          inferredPalette: {
            type: 'string',
            enum: ['dark', 'light', 'high_contrast', 'gradient_heavy'],
          },
        },
      },
      notes: { type: 'string', maxLength: 1000 },
    },
  } as const;
}
