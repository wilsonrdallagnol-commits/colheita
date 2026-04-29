// packages/jobs/tests/email-certificado.test.ts
//
// Testes de schema e exportações do job email-certificado-emitido.
// Não dispara o job contra Trigger.dev — testa apenas validação de payload.

import { describe, expect, it } from 'vitest';
import {
  type CertificadoEmitidoPayload,
  certificadoEmitidoPayloadSchema,
  sendCertificadoEmitidoJob,
} from '../src/jobs/email-certificado.js';

const VALID_PAYLOAD: CertificadoEmitidoPayload = {
  to: 'distribuidor@example.com',
  userName: 'João Silva',
  trackTitle: 'Nutrição de Culturas Básicas',
  certificateNo: 'ARGHO-2026-A1B2C3D4',
  certificateUrl: 'https://academia.argho.com/meu-progresso/certificados/ARGHO-2026-A1B2C3D4',
};

describe('certificadoEmitidoPayloadSchema', () => {
  it('aceita payload mínimo válido (sem expiresAt)', () => {
    const result = certificadoEmitidoPayloadSchema.safeParse(VALID_PAYLOAD);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.expiresAt).toBeUndefined();
    }
  });

  it('aceita payload com expiresAt definido', () => {
    const payload = { ...VALID_PAYLOAD, expiresAt: '2027-04-29T00:00:00.000Z' };
    const result = certificadoEmitidoPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.expiresAt).toBe('2027-04-29T00:00:00.000Z');
    }
  });

  it('rejeita email inválido', () => {
    const result = certificadoEmitidoPayloadSchema.safeParse({
      ...VALID_PAYLOAD,
      to: 'nao-e-email',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('to');
    }
  });

  it('rejeita userName vazio', () => {
    const result = certificadoEmitidoPayloadSchema.safeParse({ ...VALID_PAYLOAD, userName: '' });
    expect(result.success).toBe(false);
  });

  it('rejeita trackTitle vazio', () => {
    const result = certificadoEmitidoPayloadSchema.safeParse({ ...VALID_PAYLOAD, trackTitle: '' });
    expect(result.success).toBe(false);
  });

  it('rejeita certificateUrl inválida', () => {
    const result = certificadoEmitidoPayloadSchema.safeParse({
      ...VALID_PAYLOAD,
      certificateUrl: 'nao-e-url',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('certificateUrl');
    }
  });

  it('rejeita certificateNo vazio', () => {
    const result = certificadoEmitidoPayloadSchema.safeParse({
      ...VALID_PAYLOAD,
      certificateNo: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('sendCertificadoEmitidoJob', () => {
  it('exporta task com id correto', () => {
    expect(sendCertificadoEmitidoJob.id).toBe('email-certificado-emitido');
  });

  it('expõe método trigger (Trigger.dev task API)', () => {
    expect(typeof sendCertificadoEmitidoJob.trigger).toBe('function');
  });
});
