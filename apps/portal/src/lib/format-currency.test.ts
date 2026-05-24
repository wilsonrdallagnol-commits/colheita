// apps/portal/src/lib/format-currency.test.ts

import { describe, expect, it } from 'vitest';
import { formatCurrency } from './format-currency';

describe('formatCurrency', () => {
  it('formata número simples', () => {
    expect(formatCurrency(123.45)).toMatch(/R\$\s*123,45/);
  });

  it('formata string numérica (DB numeric vem como string)', () => {
    expect(formatCurrency('1500')).toMatch(/R\$\s*1\.500,00/);
  });

  it('aceita 0', () => {
    expect(formatCurrency(0)).toMatch(/R\$\s*0,00/);
  });

  it('grandes valores com separador de milhar', () => {
    expect(formatCurrency('1234567.89')).toMatch(/R\$\s*1\.234\.567,89/);
  });

  it('arredonda pra 2 casas (centavos)', () => {
    expect(formatCurrency('10.999')).toMatch(/R\$\s*11,00/);
  });

  it('null/undefined retornam zero (defensivo)', () => {
    expect(formatCurrency(null)).toMatch(/R\$\s*0,00/);
    expect(formatCurrency(undefined)).toMatch(/R\$\s*0,00/);
  });

  it('NaN string retorna zero (defensivo)', () => {
    expect(formatCurrency('abc')).toMatch(/R\$\s*0,00/);
  });

  it('valor negativo (devolucao/credito)', () => {
    const result = formatCurrency(-50);
    expect(result).toContain('50,00');
    expect(result).toContain('-');
  });

  it('decimal com vírgula como input — comporta como NaN (Intl não aceita)', () => {
    // Garante que não silencia inputs malformados como número válido
    expect(formatCurrency('1,50')).toMatch(/R\$\s*0,00/);
  });
});
