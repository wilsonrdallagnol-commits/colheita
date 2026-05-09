// apps/api/src/lib/whatsapp-phone.test.ts
//
// Cobre C2 (hashPhone — PII redaction LGPD) e M1 (normalizePhoneE164,
// phoneDigitsOnly — match flexivel de telefone WhatsApp).

import { describe, expect, it } from 'vitest';
import { hashPhone, normalizePhoneE164, phoneDigitsOnly } from './whatsapp-phone.js';

describe('normalizePhoneE164', () => {
  it('aceita E.164 sem + (formato Meta)', () => {
    expect(normalizePhoneE164('5511987654321')).toBe('+5511987654321');
  });

  it('aceita E.164 com + (formato canonico)', () => {
    expect(normalizePhoneE164('+5511987654321')).toBe('+5511987654321');
  });

  it('remove espacos e formatacao', () => {
    expect(normalizePhoneE164('+55 (11) 98765-4321')).toBe('+5511987654321');
  });

  it('rejeita strings vazias', () => {
    expect(normalizePhoneE164('')).toBeNull();
    expect(normalizePhoneE164('   ')).toBeNull();
  });

  it('rejeita curtos demais (< 8 digitos)', () => {
    expect(normalizePhoneE164('1234567')).toBeNull();
  });

  it('rejeita longos demais (> 15 digitos)', () => {
    expect(normalizePhoneE164('1234567890123456')).toBeNull();
  });

  it('rejeita non-string', () => {
    expect(normalizePhoneE164(null)).toBeNull();
    expect(normalizePhoneE164(undefined)).toBeNull();
  });
});

describe('phoneDigitsOnly', () => {
  it('extrai digitos de telefone formatado', () => {
    expect(phoneDigitsOnly('+55 (11) 98765-4321')).toBe('5511987654321');
  });

  it('retorna string vazia para input invalido', () => {
    expect(phoneDigitsOnly(null)).toBe('');
    expect(phoneDigitsOnly(undefined)).toBe('');
  });

  it('preserva strings ja so-digitos', () => {
    expect(phoneDigitsOnly('5511987654321')).toBe('5511987654321');
  });
});

describe('hashPhone (LGPD)', () => {
  it('retorna 8 chars hex (sha256 truncado)', () => {
    const h = hashPhone('+5511987654321');
    expect(h).toMatch(/^[0-9a-f]{8}$/);
  });

  it('eh deterministico pro mesmo input', () => {
    expect(hashPhone('+5511987654321')).toBe(hashPhone('+5511987654321'));
  });

  it('produz hashes diferentes pra telefones diferentes', () => {
    expect(hashPhone('+5511987654321')).not.toBe(hashPhone('+5511987654322'));
  });

  it('NAO contem o telefone original em texto plano', () => {
    const phone = '+5511987654321';
    const h = hashPhone(phone);
    expect(h.includes('98765')).toBe(false);
    expect(h.includes('5511')).toBe(false);
  });
});
