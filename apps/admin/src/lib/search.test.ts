// apps/admin/src/lib/search.test.ts
//
// Tests para sanitizeSearchQuery — neutraliza chars da DSL do PostgREST
// (virgulas, parenteses, asterisco) antes de interpolar em query.or().

import { describe, expect, it } from 'vitest';
import { sanitizeSearchQuery } from './search';

describe('sanitizeSearchQuery', () => {
  it('passa string normal sem alteracao', () => {
    expect(sanitizeSearchQuery('trichoderma')).toBe('trichoderma');
  });

  it('preserva acentos e caracteres BR', () => {
    expect(sanitizeSearchQuery('Açaí da Argho')).toBe('Açaí da Argho');
  });

  it('remove virgulas (separador de predicados do PostgREST)', () => {
    expect(sanitizeSearchQuery('foo, bar')).toBe('foo bar');
  });

  it('remove parenteses (agrupamento)', () => {
    expect(sanitizeSearchQuery('foo (bar)')).toBe('foo bar');
  });

  it('remove asteriscos (wildcard / glob)', () => {
    expect(sanitizeSearchQuery('foo*bar')).toBe('foobar');
  });

  it('remove todos os chars perigosos em sequencia', () => {
    expect(sanitizeSearchQuery('a,b*c(d)e')).toBe('abcde');
  });

  it('neutraliza tentativa de injecao via or()', () => {
    // Tentativa: encerrar predicado com `)`, comecar novo com `,`
    const malicious = 'x),deleted_at.is.null';
    const safe = sanitizeSearchQuery(malicious);
    expect(safe).toBe('xdeleted_at.is.null');
    expect(safe).not.toContain(',');
    expect(safe).not.toContain(')');
  });

  it('limita tamanho a 100 chars', () => {
    const long = 'a'.repeat(200);
    expect(sanitizeSearchQuery(long).length).toBe(100);
  });

  it('retorna string vazia se input vazio', () => {
    expect(sanitizeSearchQuery('')).toBe('');
  });

  it('retorna string vazia se input so contem chars perigosos', () => {
    expect(sanitizeSearchQuery(',,**(())')).toBe('');
  });
});
