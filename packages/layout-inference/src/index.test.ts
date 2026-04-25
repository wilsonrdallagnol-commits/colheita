import { describe, expect, it } from 'vitest';
import { LayoutBlueprintSchema, safeValidateBlueprint } from './blueprint/schema.js';
import { compileBlueprint } from './compiler/index.js';
import type { LayoutBlueprint } from './blueprint/schema.js';

const validBlueprint: LayoutBlueprint = {
  format: {
    aspectRatio: '9:16',
    orientation: 'portrait',
    intendedDpi: 72,
    intendedMedium: 'social',
  },
  grid: { columns: 12, rows: 'auto', density: 'high', gutterRelative: 0.04 },
  regions: [
    { id: 'header', type: 'brand_header', position: 'top', weight: 0.08 },
    {
      id: 'hero',
      type: 'headline_block',
      position: 'upper',
      weight: 0.18,
      hierarchy: ['primary', 'secondary'],
    },
    { id: 'product', type: 'product_centerpiece', position: 'center', weight: 0.4 },
    {
      id: 'specs',
      type: 'data_grid',
      position: 'lower',
      weight: 0.2,
      itemCount: 7,
      layoutHint: 'horizontal_chips',
    },
    { id: 'footer', type: 'footer', position: 'bottom', weight: 0.08 },
  ],
  visualIntent: {
    mood: 'technical_premium',
    density: 'high',
    balance: 'centered',
    emphasis: 'product_first',
    inferredPalette: 'dark',
  },
};

describe('LayoutBlueprintSchema', () => {
  it('aceita blueprint válido', () => {
    const result = safeValidateBlueprint(validBlueprint);
    expect(result.success).toBe(true);
  });

  it('rejeita IDs duplicados em regions', () => {
    const bad = {
      ...validBlueprint,
      regions: [
        ...validBlueprint.regions,
        { id: 'header', type: 'footer' as const, position: 'bottom' as const, weight: 0.05 },
      ],
    };
    const result = safeValidateBlueprint(bad);
    expect(result.success).toBe(false);
  });

  it('rejeita aspectRatio em formato inválido', () => {
    const bad = { ...validBlueprint, format: { ...validBlueprint.format, aspectRatio: '9x16' } };
    const result = safeValidateBlueprint(bad);
    expect(result.success).toBe(false);
  });

  it('rejeita ID de region em formato inválido', () => {
    const bad = {
      ...validBlueprint,
      regions: [
        { id: '1invalid', type: 'footer' as const, position: 'bottom' as const, weight: 0.5 },
      ],
    };
    const result = safeValidateBlueprint(bad);
    expect(result.success).toBe(false);
  });

  it('rejeita weight fora de [0, 1]', () => {
    const bad = {
      ...validBlueprint,
      regions: [{ id: 'h', type: 'footer' as const, position: 'bottom' as const, weight: 1.5 }],
    };
    const result = safeValidateBlueprint(bad);
    expect(result.success).toBe(false);
  });

  it('rejeita soma de weights fora da tolerância', () => {
    const bad = {
      ...validBlueprint,
      regions: [{ id: 'h', type: 'footer' as const, position: 'bottom' as const, weight: 0.1 }],
    };
    const result = safeValidateBlueprint(bad);
    expect(result.success).toBe(false);
  });
});

describe('compileBlueprint', () => {
  const theme = {
    tenantId: 'tenant-argho',
    tokensVersion: '1.0.0',
    themeRef: 'argho-dark',
  };

  it('compila blueprint válido com bindings auto', () => {
    const result = compileBlueprint({
      blueprint: validBlueprint,
      theme,
      bindings: {},
      blueprintHash: 'abc123',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.spec.regions).toHaveLength(validBlueprint.regions.length);
      expect(result.spec.tenantId).toBe('tenant-argho');
      expect(result.spec.regions[0]?.componentRef).toBeDefined();
    }
  });

  it('retorna erro quando binding é incompatível com tipo de região', () => {
    const result = compileBlueprint({
      blueprint: validBlueprint,
      theme,
      bindings: {
        product: { kind: 'cta', label: 'Comprar' }, // product_centerpiece não aceita cta
      },
      blueprintHash: 'abc123',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.code).toBe('incompatible_binding');
      expect(result.errors[0]?.regionId).toBe('product');
    }
  });

  it('aceita binding compatível: product_ref em product_centerpiece', () => {
    const result = compileBlueprint({
      blueprint: validBlueprint,
      theme,
      bindings: {
        product: { kind: 'product_ref', productId: 'xcensis-id' },
      },
      blueprintHash: 'abc123',
    });

    expect(result.ok).toBe(true);
  });

  it('mapeia componentRef correto pro tipo de região', () => {
    const result = compileBlueprint({
      blueprint: validBlueprint,
      theme,
      bindings: {},
      blueprintHash: 'abc123',
    });

    if (result.ok) {
      const productRegion = result.spec.regions.find((r) => r.id === 'product');
      expect(productRegion?.componentRef).toBe('ProductCenterpiece');

      const specsRegion = result.spec.regions.find((r) => r.id === 'specs');
      expect(specsRegion?.componentRef).toBe('DataGrid');
    }
  });
});
