// packages/jobs/tests/gerar-ficha-tecnica.test.ts
//
// Testes de schema do job gerar-ficha-tecnica.

import { describe, expect, it } from 'vitest';
import {
  type GerarFichaTecnicaPayload,
  gerarFichaTecnicaJob,
  gerarFichaTecnicaPayloadSchema,
} from '../src/jobs/gerar-ficha-tecnica.js';

const VALID_PAYLOAD: GerarFichaTecnicaPayload = {
  productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  tenantId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  fichaTecnica: {
    productName: 'Xcensis 13.9.3.5',
    composition: {
      macros: { N: 13, P2O5: 9, K2O: 3, CaO: 5 },
    },
    technicalSpecs: { densidade: '1.25 g/mL' },
    packaging: [],
    applications: [],
    tenantName: 'Argho Distribuidora',
  },
};

describe('gerarFichaTecnicaPayloadSchema', () => {
  it('aceita payload mínimo válido', () => {
    const result = gerarFichaTecnicaPayloadSchema.safeParse(VALID_PAYLOAD);
    expect(result.success).toBe(true);
  });

  it('aceita payload com todos os campos opcionais', () => {
    const result = gerarFichaTecnicaPayloadSchema.safeParse({
      ...VALID_PAYLOAD,
      fichaTecnica: {
        ...VALID_PAYLOAD.fichaTecnica,
        tagline: 'Alta performance foliar',
        description: 'Fertilizante organomineral de alta solubilidade.',
        tenantLogoUrl: 'https://argho.com.br/logo.png',
        mapaRegistration: 'BR-12345/2024',
        year: 2026,
        composition: {
          macros: { N: 13 },
          micros: { Zn: 0.5, B: 0.2 },
          others: { 'matéria orgânica': 12 },
        },
        packaging: [{ type: 'bag', weightKg: 25, sku: 'XCN-25KG' }],
        applications: [
          {
            crop: 'Soja',
            stage: 'V3-V5',
            dosePerHa: 3.0,
            unit: 'l',
            notes: 'Aplicar via foliar.',
          },
        ],
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fichaTecnica.packaging).toHaveLength(1);
      expect(result.data.fichaTecnica.applications).toHaveLength(1);
    }
  });

  it('rejeita productId com formato inválido (não UUID)', () => {
    const result = gerarFichaTecnicaPayloadSchema.safeParse({
      ...VALID_PAYLOAD,
      productId: 'nao-e-uuid',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('productId');
    }
  });

  it('rejeita tenantId com formato inválido', () => {
    const result = gerarFichaTecnicaPayloadSchema.safeParse({
      ...VALID_PAYLOAD,
      tenantId: 'nao-e-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita productName vazio', () => {
    const result = gerarFichaTecnicaPayloadSchema.safeParse({
      ...VALID_PAYLOAD,
      fichaTecnica: { ...VALID_PAYLOAD.fichaTecnica, productName: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejeita tenantLogoUrl com formato inválido', () => {
    const result = gerarFichaTecnicaPayloadSchema.safeParse({
      ...VALID_PAYLOAD,
      fichaTecnica: {
        ...VALID_PAYLOAD.fichaTecnica,
        tenantLogoUrl: 'nao-e-url',
      },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.flatMap((i) => i.path);
      expect(paths).toContain('tenantLogoUrl');
    }
  });

  it('rejeita embalagem com tipo inválido', () => {
    const result = gerarFichaTecnicaPayloadSchema.safeParse({
      ...VALID_PAYLOAD,
      fichaTecnica: {
        ...VALID_PAYLOAD.fichaTecnica,
        packaging: [{ type: 'caixa', weightKg: 10 }],
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejeita dosePerHa negativa', () => {
    const result = gerarFichaTecnicaPayloadSchema.safeParse({
      ...VALID_PAYLOAD,
      fichaTecnica: {
        ...VALID_PAYLOAD.fichaTecnica,
        applications: [{ crop: 'Milho', dosePerHa: -1, unit: 'l' }],
      },
    });
    expect(result.success).toBe(false);
  });

  it('aplica defaults: packaging e applications como arrays vazios', () => {
    const payload = {
      productId: VALID_PAYLOAD.productId,
      tenantId: VALID_PAYLOAD.tenantId,
      fichaTecnica: {
        productName: 'Produto Teste',
        composition: {},
        technicalSpecs: {},
        tenantName: 'Argho',
        // packaging e applications omitidos
      },
    };
    const result = gerarFichaTecnicaPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fichaTecnica.packaging).toEqual([]);
      expect(result.data.fichaTecnica.applications).toEqual([]);
    }
  });
});

describe('gerarFichaTecnicaJob', () => {
  it('exporta task com id correto', () => {
    expect(gerarFichaTecnicaJob.id).toBe('gerar-ficha-tecnica');
  });

  it('expõe método trigger (Trigger.dev task API)', () => {
    expect(typeof gerarFichaTecnicaJob.trigger).toBe('function');
  });
});
