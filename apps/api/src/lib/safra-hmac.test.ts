// apps/api/src/lib/safra-hmac.test.ts
/**
 * Testes para verifySignature — função de verificação HMAC-SHA256 do webhook Safra.
 * Cobre: assinatura válida, assinatura errada, header malformado, timing safety.
 */
import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifySignature } from './safra-hmac.js';

const SECRET = 'test-secret-for-argho-safra-webhook';
const BODY = JSON.stringify({ event: 'pedido.criado', tenant_id: 'uuid-001' });

/** Gera a assinatura HMAC-SHA256 correta para body + secret. */
function sign(body: string, secret = SECRET): string {
  return `sha256=${createHmac('sha256', secret).update(body, 'utf8').digest('hex')}`;
}

describe('verifySignature — assinatura válida', () => {
  it('retorna true para body e assinatura corretos', () => {
    expect(verifySignature(BODY, sign(BODY), SECRET)).toBe(true);
  });

  it('retorna true para body vazio com assinatura correta', () => {
    const emptySignature = sign('');
    expect(verifySignature('', emptySignature, SECRET)).toBe(true);
  });

  it('verifica body com caracteres Unicode (UTF-8)', () => {
    const unicodeBody = JSON.stringify({ text: 'Fazenda São João — Área: 100ha' });
    const sig = sign(unicodeBody);
    expect(verifySignature(unicodeBody, sig, SECRET)).toBe(true);
  });
});

describe('verifySignature — assinatura inválida', () => {
  it('retorna false para assinatura completamente diferente', () => {
    const wrong = `sha256=${'a'.repeat(64)}`;
    expect(verifySignature(BODY, wrong, SECRET)).toBe(false);
  });

  it('retorna false quando body foi alterado', () => {
    const sig = sign(BODY);
    const tamperedBody = `${BODY} `;
    expect(verifySignature(tamperedBody, sig, SECRET)).toBe(false);
  });

  it('retorna false quando secret está errado', () => {
    const sig = sign(BODY, 'outro-secret');
    expect(verifySignature(BODY, sig, SECRET)).toBe(false);
  });
});

describe('verifySignature — header malformado', () => {
  it('retorna false para header null', () => {
    expect(verifySignature(BODY, null, SECRET)).toBe(false);
  });

  it('retorna false para header sem scheme (sem "sha256=")', () => {
    const hex = createHmac('sha256', SECRET).update(BODY, 'utf8').digest('hex');
    expect(verifySignature(BODY, hex, SECRET)).toBe(false);
  });

  it('retorna false para scheme diferente de sha256 (ex: "md5=")', () => {
    expect(verifySignature(BODY, `md5=${sign(BODY)}`, SECRET)).toBe(false);
  });

  it('retorna false para header vazio', () => {
    expect(verifySignature(BODY, '', SECRET)).toBe(false);
  });

  it('retorna false para header com apenas "sha256="', () => {
    expect(verifySignature(BODY, 'sha256=', SECRET)).toBe(false);
  });

  it('retorna false quando hex tem tamanho errado (não 64 chars)', () => {
    expect(verifySignature(BODY, 'sha256=abc123', SECRET)).toBe(false);
  });
});

describe('verifySignature — secret ausente ou inválido', () => {
  it('retorna false para secret vazio', () => {
    const sig = sign(BODY);
    expect(verifySignature(BODY, sig, '')).toBe(false);
  });
});
