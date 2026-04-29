// packages/jobs/tests/safra-sync.test.ts
//
// Testes de schema do job safra-sync-evento.

import { describe, expect, it } from 'vitest';
import {
  type SafraEventoPayload,
  safraEventoJob,
  safraEventoPayloadSchema,
} from '../src/jobs/safra-sync.js';

const VALID_TENANT_ID = 'c3d4e5f6-a7b8-9012-cdef-012345678902';
const RECEIVED_AT = '2026-04-29T10:00:00.000Z';

// Evento mínimo válido — qualquer objeto passará pois event: z.unknown()
const VALID_PAYLOAD: SafraEventoPayload = {
  event: {
    event: 'pedido.criado',
    tenant_id: VALID_TENANT_ID,
    data: { pedido_id: 'PED-001', distribuidor_nome: 'Norte LTDA', itens: [], total_liquido: 0 },
  },
  tenantId: VALID_TENANT_ID,
  receivedAt: RECEIVED_AT,
};

describe('safraEventoPayloadSchema', () => {
  it('aceita payload válido com evento pedido.criado', () => {
    const result = safraEventoPayloadSchema.safeParse(VALID_PAYLOAD);
    expect(result.success).toBe(true);
  });

  it('aceita qualquer objeto como event (z.unknown())', () => {
    const result = safraEventoPayloadSchema.safeParse({
      event: { tipo: 'desconhecido', qualquer: 'campo' },
      tenantId: VALID_TENANT_ID,
      receivedAt: RECEIVED_AT,
    });
    expect(result.success).toBe(true);
  });

  it('aceita string como event', () => {
    const result = safraEventoPayloadSchema.safeParse({
      event: 'raw-string-event',
      tenantId: VALID_TENANT_ID,
      receivedAt: RECEIVED_AT,
    });
    expect(result.success).toBe(true);
  });

  it('rejeita tenantId vazio', () => {
    const result = safraEventoPayloadSchema.safeParse({ ...VALID_PAYLOAD, tenantId: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('tenantId');
    }
  });

  it('rejeita receivedAt vazio', () => {
    const result = safraEventoPayloadSchema.safeParse({ ...VALID_PAYLOAD, receivedAt: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('receivedAt');
    }
  });

  it('rejeita payload sem tenantId', () => {
    const { tenantId: _omit, ...withoutTenantId } = VALID_PAYLOAD;
    const result = safraEventoPayloadSchema.safeParse(withoutTenantId);
    expect(result.success).toBe(false);
  });

  it('preserva o campo event como-recebido', () => {
    const customEvent = { foo: 'bar', nested: { x: 1 } };
    const result = safraEventoPayloadSchema.safeParse({
      event: customEvent,
      tenantId: VALID_TENANT_ID,
      receivedAt: RECEIVED_AT,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.event).toEqual(customEvent);
    }
  });
});

describe('safraEventoJob', () => {
  it('exporta task com id correto', () => {
    expect(safraEventoJob.id).toBe('safra-sync-evento');
  });

  it('expõe método trigger (Trigger.dev task API)', () => {
    expect(typeof safraEventoJob.trigger).toBe('function');
  });
});
