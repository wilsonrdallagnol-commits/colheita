// apps/admin/src/lib/format-currency.test.ts
// Mirror reduzido dos tests do portal.

import { describe, expect, it } from 'vitest';
import { formatCurrency } from './format-currency';

describe('admin formatCurrency', () => {
  it('formata número e string com separadores BR', () => {
    expect(formatCurrency(1500)).toMatch(/R\$\s*1\.500,00/);
    expect(formatCurrency('99.5')).toMatch(/R\$\s*99,50/);
  });

  it('null/undefined → R$ 0,00', () => {
    expect(formatCurrency(null)).toMatch(/R\$\s*0,00/);
    expect(formatCurrency(undefined)).toMatch(/R\$\s*0,00/);
  });

  it('NaN string → R$ 0,00', () => {
    expect(formatCurrency('xyz')).toMatch(/R\$\s*0,00/);
  });

  it('valores negativos preservados', () => {
    expect(formatCurrency(-25)).toContain('25,00');
  });
});
