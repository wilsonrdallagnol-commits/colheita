// apps/portal/src/lib/format-relative-time.test.ts
//
// Garante que badge de tempo na inbox de notif é estável e
// previsível. Usa o argumento `now` pra controle determinístico.

import { describe, expect, it } from 'vitest';
import { formatRelativeTime } from './format-relative-time';

// Âncora: 2026-05-23T12:00:00.000Z (12:00 BRT UTC)
const NOW = new Date('2026-05-23T12:00:00.000Z').getTime();

function isoMsAgo(ms: number): string {
  return new Date(NOW - ms).toISOString();
}

describe('formatRelativeTime', () => {
  it('retorna "agora" para diff < 1 minuto', () => {
    expect(formatRelativeTime(isoMsAgo(0), NOW)).toBe('agora');
    expect(formatRelativeTime(isoMsAgo(30_000), NOW)).toBe('agora');
    expect(formatRelativeTime(isoMsAgo(59_999), NOW)).toBe('agora');
  });

  it('retorna "Nm" pra diff entre 1-59 minutos', () => {
    expect(formatRelativeTime(isoMsAgo(60_000), NOW)).toBe('1m');
    expect(formatRelativeTime(isoMsAgo(5 * 60_000), NOW)).toBe('5m');
    expect(formatRelativeTime(isoMsAgo(59 * 60_000), NOW)).toBe('59m');
  });

  it('retorna "Nh" pra diff entre 1-23 horas', () => {
    expect(formatRelativeTime(isoMsAgo(60 * 60_000), NOW)).toBe('1h');
    expect(formatRelativeTime(isoMsAgo(12 * 60 * 60_000), NOW)).toBe('12h');
    expect(formatRelativeTime(isoMsAgo(23 * 60 * 60_000), NOW)).toBe('23h');
  });

  it('retorna "Nd" pra diff entre 1-6 dias', () => {
    expect(formatRelativeTime(isoMsAgo(24 * 60 * 60_000), NOW)).toBe('1d');
    expect(formatRelativeTime(isoMsAgo(3 * 24 * 60 * 60_000), NOW)).toBe('3d');
    expect(formatRelativeTime(isoMsAgo(6 * 24 * 60 * 60_000), NOW)).toBe('6d');
  });

  it('retorna data DD/MM para diff >= 7 dias', () => {
    // 10 dias atrás de 2026-05-23 = 2026-05-13
    const tenDaysAgo = isoMsAgo(10 * 24 * 60 * 60_000);
    const result = formatRelativeTime(tenDaysAgo, NOW);
    // Date format depende da locale do runtime — checa padrão dd/MM
    expect(result).toMatch(/^\d{2}\/\d{2}$/);
  });

  it('trata datas no futuro como "agora" (diff negativo)', () => {
    // Notif criada 5min no futuro (clock skew client/server)
    const future = new Date(NOW + 5 * 60_000).toISOString();
    expect(formatRelativeTime(future, NOW)).toBe('agora');
  });

  it('é determinístico com `now` fixo', () => {
    const t = isoMsAgo(5 * 60_000);
    expect(formatRelativeTime(t, NOW)).toBe(formatRelativeTime(t, NOW));
  });

  it('boundary exato: 60min → 1h', () => {
    expect(formatRelativeTime(isoMsAgo(60 * 60_000), NOW)).toBe('1h');
  });

  it('boundary exato: 24h → 1d', () => {
    expect(formatRelativeTime(isoMsAgo(24 * 60 * 60_000), NOW)).toBe('1d');
  });

  it('boundary exato: 7d → vira formato data', () => {
    const result = formatRelativeTime(isoMsAgo(7 * 24 * 60 * 60_000), NOW);
    expect(result).toMatch(/^\d{2}\/\d{2}$/);
  });
});
