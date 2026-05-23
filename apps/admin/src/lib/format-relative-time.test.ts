// apps/admin/src/lib/format-relative-time.test.ts
//
// Espelho dos testes do portal. Mantido por copia (mesmo motivo do .ts).

import { describe, expect, it } from 'vitest';
import { formatRelativeTime } from './format-relative-time';

const NOW = new Date('2026-05-23T12:00:00.000Z').getTime();
const isoMsAgo = (ms: number) => new Date(NOW - ms).toISOString();

describe('formatRelativeTime (admin)', () => {
  it('< 1 min → "agora"', () => {
    expect(formatRelativeTime(isoMsAgo(0), NOW)).toBe('agora');
    expect(formatRelativeTime(isoMsAgo(59_999), NOW)).toBe('agora');
  });

  it('minutos', () => {
    expect(formatRelativeTime(isoMsAgo(60_000), NOW)).toBe('1m');
    expect(formatRelativeTime(isoMsAgo(59 * 60_000), NOW)).toBe('59m');
  });

  it('horas', () => {
    expect(formatRelativeTime(isoMsAgo(60 * 60_000), NOW)).toBe('1h');
    expect(formatRelativeTime(isoMsAgo(23 * 60 * 60_000), NOW)).toBe('23h');
  });

  it('dias', () => {
    expect(formatRelativeTime(isoMsAgo(24 * 60 * 60_000), NOW)).toBe('1d');
    expect(formatRelativeTime(isoMsAgo(6 * 24 * 60 * 60_000), NOW)).toBe('6d');
  });

  it('>= 7 dias → DD/MM', () => {
    expect(formatRelativeTime(isoMsAgo(10 * 24 * 60 * 60_000), NOW)).toMatch(/^\d{2}\/\d{2}$/);
  });

  it('futuro → "agora" (clock skew)', () => {
    expect(formatRelativeTime(new Date(NOW + 60_000).toISOString(), NOW)).toBe('agora');
  });
});
