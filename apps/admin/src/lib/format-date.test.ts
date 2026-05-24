// apps/admin/src/lib/format-date.test.ts (mirror reduzido)

import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime } from './format-date';

describe('admin formatDate', () => {
  it('dd/MM/yyyy', () => {
    expect(formatDate('2026-05-23T12:00:00.000Z')).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('null/undefined/empty → —', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('')).toBe('—');
  });

  it('string inválida → —', () => {
    expect(formatDate('xyz')).toBe('—');
  });
});

describe('admin formatDateTime', () => {
  it('dd/MM/yyyy HH:mm', () => {
    expect(formatDateTime('2026-05-23T15:30:00.000Z')).toMatch(/\d{2}:\d{2}/);
  });

  it('null/empty/invalid → —', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime('xyz')).toBe('—');
  });
});
