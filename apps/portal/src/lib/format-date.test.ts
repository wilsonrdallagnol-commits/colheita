// apps/portal/src/lib/format-date.test.ts

import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime } from './format-date';

describe('formatDate', () => {
  it('formata dd/MM/yyyy', () => {
    expect(formatDate('2026-05-23T12:00:00.000Z')).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('retorna — pra null/undefined/empty', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('')).toBe('—');
  });

  it('retorna — pra string inválida (defensivo)', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('aceita timestamp Postgres (timestamptz serializado)', () => {
    expect(formatDate('2026-05-23 12:00:00+00')).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});

describe('formatDateTime', () => {
  it('formata dd/MM/yyyy HH:mm', () => {
    expect(formatDateTime('2026-05-23T15:30:00.000Z')).toMatch(/\d{2}\/\d{2}\/\d{4}.*\d{2}:\d{2}/);
  });

  it('retorna — pra null/undefined/empty', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
    expect(formatDateTime('')).toBe('—');
  });

  it('retorna — pra string inválida', () => {
    expect(formatDateTime('xyz')).toBe('—');
  });
});
