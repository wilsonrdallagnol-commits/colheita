// apps/portal/src/lib/support-labels.test.ts
//
// Garante invariantes do dominio support_tickets — mismatches entre
// VALID_* e *_LABEL causariam UI quebrada ou validacao buggy.

import { describe, expect, it } from 'vitest';
import {
  asTicketCategory,
  asTicketStatus,
  asTicketUrgency,
  CATEGORY_LABEL,
  STATUS_LABEL,
  URGENCY_LABEL,
  VALID_CATEGORIES,
  VALID_STATUSES,
  VALID_URGENCIES,
} from './support-labels';

describe('support-labels invariantes', () => {
  it('todo VALID_STATUS tem label correspondente', () => {
    for (const s of VALID_STATUSES) {
      expect(STATUS_LABEL[s]).toBeDefined();
      expect(STATUS_LABEL[s].length).toBeGreaterThan(0);
    }
  });

  it('todo VALID_URGENCY tem label correspondente', () => {
    for (const u of VALID_URGENCIES) {
      expect(URGENCY_LABEL[u]).toBeDefined();
      expect(URGENCY_LABEL[u].length).toBeGreaterThan(0);
    }
  });

  it('todo VALID_CATEGORY tem label correspondente', () => {
    for (const c of VALID_CATEGORIES) {
      expect(CATEGORY_LABEL[c]).toBeDefined();
      expect(CATEGORY_LABEL[c].length).toBeGreaterThan(0);
    }
  });

  it('VALID_STATUSES contém os 5 estados conhecidos', () => {
    expect(VALID_STATUSES).toHaveLength(5);
    expect(VALID_STATUSES).toContain('open');
    expect(VALID_STATUSES).toContain('closed');
  });

  it('VALID_CATEGORIES tem todas as categorias (match migration 0036)', () => {
    expect(VALID_CATEGORIES).toEqual([
      'agronomic',
      'commercial',
      'product',
      'logistics',
      'platform',
      'other',
    ]);
  });

  it('labels são em PT-BR (não inglês)', () => {
    expect(STATUS_LABEL.open).toBe('Aberto');
    expect(URGENCY_LABEL.high).toBe('Alta');
    expect(CATEGORY_LABEL.agronomic).toContain('agronômica');
  });
});

describe('asTicketStatus type guard', () => {
  it('retorna valor tipado pra strings válidas', () => {
    expect(asTicketStatus('open')).toBe('open');
    expect(asTicketStatus('closed')).toBe('closed');
  });

  it('retorna null pra strings inválidas', () => {
    expect(asTicketStatus('invalid')).toBeNull();
    expect(asTicketStatus('OPEN')).toBeNull(); // case-sensitive
  });

  it('retorna null pra null/undefined/empty', () => {
    expect(asTicketStatus(null)).toBeNull();
    expect(asTicketStatus(undefined)).toBeNull();
    expect(asTicketStatus('')).toBeNull();
  });
});

describe('asTicketUrgency type guard', () => {
  it('aceita valores válidos', () => {
    expect(asTicketUrgency('low')).toBe('low');
    expect(asTicketUrgency('urgent')).toBe('urgent');
  });

  it('rejeita injection (SQL-like)', () => {
    expect(asTicketUrgency("' OR 1=1")).toBeNull();
  });
});

describe('asTicketCategory type guard', () => {
  it('aceita todas as 6 categorias', () => {
    for (const c of VALID_CATEGORIES) {
      expect(asTicketCategory(c)).toBe(c);
    }
  });

  it('rejeita strings desconhecidas', () => {
    expect(asTicketCategory('billing')).toBeNull();
    expect(asTicketCategory('Agronomic')).toBeNull(); // case-sensitive
  });
});
