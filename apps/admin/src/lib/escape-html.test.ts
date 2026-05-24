// apps/admin/src/lib/escape-html.test.ts
//
// Mirror reduzido dos tests do portal — guard XSS pro email do
// distribuidor (reply do agronomo via Resend).

import { describe, expect, it } from 'vitest';
import { escapeHtml } from './escape-html';

describe('admin escapeHtml', () => {
  it('vazio retorna vazio', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('texto comum passthrough', () => {
    expect(escapeHtml('Reposta normal do agrônomo')).toBe('Reposta normal do agrônomo');
  });

  it('escapa tags HTML básicas', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapa quotes (atributo breakout)', () => {
    expect(escapeHtml('"\' OR 1=1')).toBe('&quot;&#39; OR 1=1');
  });

  it('escapa ampersand primeiro (evita double-encode)', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('payload XSS completo neutralizado', () => {
    const result = escapeHtml('<a href="x" onclick=\'evil()\'>click</a>');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).not.toContain('"');
  });

  it('preserva unicode PT-BR', () => {
    expect(escapeHtml('Dose 500g/ha pra soja V3 — déficit Mn')).toBe(
      'Dose 500g/ha pra soja V3 — déficit Mn',
    );
  });
});
