// packages/jobs/tests/embed-content.test.ts
//
// Testes de schema dos jobs de embedding.
// Valida os schemas Zod e as exportações (task API).

import { describe, expect, it } from 'vitest';
import {
  type EmbedLicaoPayload,
  type EmbedProdutoPayload,
  embedLicaoJob,
  embedLicaoPayloadSchema,
  embedProdutoJob,
  embedProdutoPayloadSchema,
} from '../src/jobs/embed-content.js';

const PRODUCT_ID = '11111111-2222-3333-4444-555555555555';
const LESSON_ID = '66666666-7777-8888-9999-aaaaaaaaaaaa';
const TENANT_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

// ── embedProdutoPayloadSchema ─────────────────────────────────────────────────

describe('embedProdutoPayloadSchema', () => {
  const VALID: EmbedProdutoPayload = {
    productId: PRODUCT_ID,
    tenantId: TENANT_ID,
  };

  it('aceita payload válido', () => {
    const result = embedProdutoPayloadSchema.safeParse(VALID);
    expect(result.success).toBe(true);
  });

  it('rejeita productId não-UUID', () => {
    const result = embedProdutoPayloadSchema.safeParse({ ...VALID, productId: 'nao-uuid' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('productId');
    }
  });

  it('rejeita tenantId não-UUID', () => {
    const result = embedProdutoPayloadSchema.safeParse({ ...VALID, tenantId: 'nao-uuid' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('tenantId');
    }
  });

  it('rejeita payload sem productId', () => {
    const { productId: _omit, ...without } = VALID;
    const result = embedProdutoPayloadSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it('rejeita payload sem tenantId', () => {
    const { tenantId: _omit, ...without } = VALID;
    const result = embedProdutoPayloadSchema.safeParse(without);
    expect(result.success).toBe(false);
  });
});

// ── embedProdutoJob ───────────────────────────────────────────────────────────

describe('embedProdutoJob', () => {
  it('exporta task com id correto', () => {
    expect(embedProdutoJob.id).toBe('embed-produto');
  });

  it('expõe método trigger (Trigger.dev task API)', () => {
    expect(typeof embedProdutoJob.trigger).toBe('function');
  });
});

// ── embedLicaoPayloadSchema ───────────────────────────────────────────────────

describe('embedLicaoPayloadSchema', () => {
  const VALID: EmbedLicaoPayload = {
    lessonId: LESSON_ID,
    tenantId: TENANT_ID,
  };

  it('aceita payload válido', () => {
    const result = embedLicaoPayloadSchema.safeParse(VALID);
    expect(result.success).toBe(true);
  });

  it('rejeita lessonId não-UUID', () => {
    const result = embedLicaoPayloadSchema.safeParse({ ...VALID, lessonId: 'nao-uuid' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('lessonId');
    }
  });

  it('rejeita tenantId não-UUID', () => {
    const result = embedLicaoPayloadSchema.safeParse({ ...VALID, tenantId: '123' });
    expect(result.success).toBe(false);
  });

  it('rejeita payload sem lessonId', () => {
    const { lessonId: _omit, ...without } = VALID;
    const result = embedLicaoPayloadSchema.safeParse(without);
    expect(result.success).toBe(false);
  });
});

// ── embedLicaoJob ─────────────────────────────────────────────────────────────

describe('embedLicaoJob', () => {
  it('exporta task com id correto', () => {
    expect(embedLicaoJob.id).toBe('embed-licao');
  });

  it('expõe método trigger (Trigger.dev task API)', () => {
    expect(typeof embedLicaoJob.trigger).toBe('function');
  });
});
