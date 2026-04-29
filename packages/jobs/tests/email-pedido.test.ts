// packages/jobs/tests/email-pedido.test.ts
//
// Testes de schema do job email-pedido-confirmado.

import { describe, expect, it } from 'vitest';
import {
  type PedidoConfirmadoPayload,
  pedidoConfirmadoPayloadSchema,
  sendPedidoConfirmadoJob,
} from '../src/jobs/email-pedido.js';

const VALID_ITEM = {
  produto: 'Xcensis 13.9.3.5',
  quantidade: 50,
  unidade: 'kg',
};

const VALID_PAYLOAD: PedidoConfirmadoPayload = {
  to: 'distribuidor@example.com',
  pedidoId: 'PED-2026-0042',
  clienteNome: 'Distribuidora Norte LTDA',
  tenantName: 'Argho Distribuidora',
  itens: [VALID_ITEM],
};

describe('pedidoConfirmadoPayloadSchema', () => {
  it('aceita payload mínimo válido (sem valorTotal)', () => {
    const result = pedidoConfirmadoPayloadSchema.safeParse(VALID_PAYLOAD);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.valorTotal).toBeUndefined();
    }
  });

  it('aceita payload com valorTotal definido', () => {
    const result = pedidoConfirmadoPayloadSchema.safeParse({
      ...VALID_PAYLOAD,
      valorTotal: 4_500.0,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.valorTotal).toBe(4_500.0);
    }
  });

  it('aceita múltiplos itens', () => {
    const result = pedidoConfirmadoPayloadSchema.safeParse({
      ...VALID_PAYLOAD,
      itens: [VALID_ITEM, { produto: 'Xcensis Cálcio', quantidade: 20, unidade: 'l' }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.itens).toHaveLength(2);
    }
  });

  it('rejeita array de itens vazio', () => {
    const result = pedidoConfirmadoPayloadSchema.safeParse({ ...VALID_PAYLOAD, itens: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('itens');
    }
  });

  it('rejeita email inválido', () => {
    const result = pedidoConfirmadoPayloadSchema.safeParse({ ...VALID_PAYLOAD, to: 'errado' });
    expect(result.success).toBe(false);
  });

  it('rejeita quantidade negativa no item', () => {
    const result = pedidoConfirmadoPayloadSchema.safeParse({
      ...VALID_PAYLOAD,
      itens: [{ ...VALID_ITEM, quantidade: -5 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejeita valorTotal negativo', () => {
    const result = pedidoConfirmadoPayloadSchema.safeParse({
      ...VALID_PAYLOAD,
      valorTotal: -100,
    });
    expect(result.success).toBe(false);
  });
});

describe('sendPedidoConfirmadoJob', () => {
  it('exporta task com id correto', () => {
    expect(sendPedidoConfirmadoJob.id).toBe('email-pedido-confirmado');
  });

  it('expõe método trigger (Trigger.dev task API)', () => {
    expect(typeof sendPedidoConfirmadoJob.trigger).toBe('function');
  });
});
