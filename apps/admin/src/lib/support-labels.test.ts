// apps/admin/src/lib/support-labels.test.ts
//
// Espelho dos tests do portal mas com labels admin-specific.
// Foco: invariantes + type guard.

import { describe, expect, it } from 'vitest';
import {
  asTicketStatus,
  CATEGORY_LABEL,
  STATUS_LABEL,
  URGENCY_LABEL,
  VALID_CATEGORIES,
  VALID_STATUSES,
  VALID_URGENCIES,
} from './support-labels';

describe('admin support-labels invariantes', () => {
  it('todo VALID_STATUS tem label correspondente', () => {
    for (const s of VALID_STATUSES) {
      expect(STATUS_LABEL[s]).toBeDefined();
      expect(STATUS_LABEL[s].length).toBeGreaterThan(0);
    }
  });

  it('todo VALID_URGENCY tem label correspondente', () => {
    for (const u of VALID_URGENCIES) {
      expect(URGENCY_LABEL[u]).toBeDefined();
    }
  });

  it('todo VALID_CATEGORY tem label correspondente', () => {
    for (const c of VALID_CATEGORIES) {
      expect(CATEGORY_LABEL[c]).toBeDefined();
    }
  });

  it('waiting_user é "Aguardando user" no admin (vs portal "Aguardando você")', () => {
    expect(STATUS_LABEL.waiting_user).toBe('Aguardando user');
  });

  it('CATEGORY labels são versão curta no admin (vs portal verbose)', () => {
    expect(CATEGORY_LABEL.agronomic).toBe('Agronômico');
    expect(CATEGORY_LABEL.commercial).toBe('Comercial');
    expect(CATEGORY_LABEL.product).toBe('Produto');
  });

  it('VALID_CATEGORIES match migration 0036', () => {
    expect(VALID_CATEGORIES).toEqual([
      'agronomic',
      'commercial',
      'product',
      'logistics',
      'platform',
      'other',
    ]);
  });
});

describe('admin asTicketStatus type guard', () => {
  it('aceita os 5 status válidos', () => {
    for (const s of VALID_STATUSES) {
      expect(asTicketStatus(s)).toBe(s);
    }
  });

  it('rejeita strings inválidas', () => {
    expect(asTicketStatus('archived')).toBeNull();
    expect(asTicketStatus('Open')).toBeNull(); // case-sensitive
  });

  it('rejeita null/undefined/empty', () => {
    expect(asTicketStatus(null)).toBeNull();
    expect(asTicketStatus(undefined)).toBeNull();
    expect(asTicketStatus('')).toBeNull();
  });
});
