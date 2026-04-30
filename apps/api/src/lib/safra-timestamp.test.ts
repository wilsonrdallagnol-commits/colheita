// apps/api/src/lib/safra-timestamp.test.ts
/**
 * Testes para isEventFresh() — validação de freshness de webhooks Safra.
 *
 * Cada teste injeta `nowMs` explicitamente para controle total do tempo.
 */

import { describe, expect, test } from 'vitest';
import { isEventFresh } from './safra-timestamp.js';

const NOW = new Date('2026-04-30T15:00:00.000Z').getTime();
const TEN_MIN_MS = 10 * 60 * 1000;

// ── Eventos válidos ────────────────────────────────────────────────────────────

describe('eventos dentro da janela de tolerância', () => {
  test('evento com timestamp igual ao agora é aceito', () => {
    const ts = new Date(NOW).toISOString();
    expect(isEventFresh(ts, NOW)).toBe(true);
  });

  test('evento de 1 segundo atrás é aceito', () => {
    const ts = new Date(NOW - 1_000).toISOString();
    expect(isEventFresh(ts, NOW)).toBe(true);
  });

  test('evento de 5 minutos atrás é aceito', () => {
    const ts = new Date(NOW - 5 * 60_000).toISOString();
    expect(isEventFresh(ts, NOW)).toBe(true);
  });

  test('evento exatamente no limite de 10 minutos é aceito', () => {
    const ts = new Date(NOW - TEN_MIN_MS).toISOString();
    expect(isEventFresh(ts, NOW)).toBe(true);
  });
});

// ── Eventos rejeitados — muito antigos ────────────────────────────────────────

describe('eventos fora da janela de tolerância (replay)', () => {
  test('evento de 10 min + 1ms é rejeitado', () => {
    const ts = new Date(NOW - TEN_MIN_MS - 1).toISOString();
    expect(isEventFresh(ts, NOW)).toBe(false);
  });

  test('evento de 11 minutos é rejeitado', () => {
    const ts = new Date(NOW - 11 * 60_000).toISOString();
    expect(isEventFresh(ts, NOW)).toBe(false);
  });

  test('evento de 1 hora atrás é rejeitado', () => {
    const ts = new Date(NOW - 60 * 60_000).toISOString();
    expect(isEventFresh(ts, NOW)).toBe(false);
  });

  test('evento de 24 horas atrás é rejeitado', () => {
    const ts = new Date(NOW - 24 * 60 * 60_000).toISOString();
    expect(isEventFresh(ts, NOW)).toBe(false);
  });
});

// ── Clock skew / futuro ───────────────────────────────────────────────────────

describe('clock skew', () => {
  test('evento 30s no futuro é aceito (clock skew pequeno)', () => {
    const ts = new Date(NOW + 30_000).toISOString();
    expect(isEventFresh(ts, NOW)).toBe(true);
  });

  test('evento exatamente 60s no futuro é aceito (limite do clock skew)', () => {
    const ts = new Date(NOW + 60_000).toISOString();
    expect(isEventFresh(ts, NOW)).toBe(true);
  });

  test('evento 61s no futuro é rejeitado (clock skew extremo)', () => {
    const ts = new Date(NOW + 61_000).toISOString();
    expect(isEventFresh(ts, NOW)).toBe(false);
  });

  test('evento 5 minutos no futuro é rejeitado', () => {
    const ts = new Date(NOW + 5 * 60_000).toISOString();
    expect(isEventFresh(ts, NOW)).toBe(false);
  });
});

// ── Timestamps inválidos ──────────────────────────────────────────────────────

describe('timestamps inválidos', () => {
  test('string vazia é rejeitada', () => {
    expect(isEventFresh('', NOW)).toBe(false);
  });

  test('string não-ISO é rejeitada', () => {
    expect(isEventFresh('not-a-date', NOW)).toBe(false);
  });

  test('timestamp "null" como string é rejeitado', () => {
    expect(isEventFresh('null', NOW)).toBe(false);
  });

  test('data sem hora é rejeitada por ser inválida como datetime', () => {
    // "2026-04-30" → JavaScript interpreta como UTC midnight, que pode ser válido
    // mas está fora do padrão datetime ISO 8601 exigido pelo Zod
    // Aqui testamos que o comportamento do JS (aceitar) é OK para datas válidas
    const ts = '2026-04-30';
    const parsed = new Date(ts).getTime();
    const result = isEventFresh(ts, NOW);
    // Se o JS parsear a data como UTC midnight, é dentro do mesmo dia → aceito
    // Se não parsear → NaN → rejeitado
    if (Number.isNaN(parsed)) {
      expect(result).toBe(false);
    } else {
      // UTC midnight do mesmo dia: 2026-04-30T00:00Z = NOW - 15h → rejeitado (> 10min)
      expect(result).toBe(false);
    }
  });
});

// ── Tolerância customizável ───────────────────────────────────────────────────

describe('tolerância customizável', () => {
  test('tolerância de 1 minuto rejeita evento de 2 minutos', () => {
    const ts = new Date(NOW - 2 * 60_000).toISOString();
    expect(isEventFresh(ts, NOW, 60_000)).toBe(false);
  });

  test('tolerância de 30 minutos aceita evento de 20 minutos', () => {
    const ts = new Date(NOW - 20 * 60_000).toISOString();
    expect(isEventFresh(ts, NOW, 30 * 60_000)).toBe(true);
  });
});
