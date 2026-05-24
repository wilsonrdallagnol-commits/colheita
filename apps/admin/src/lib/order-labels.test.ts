// apps/admin/src/lib/order-labels.test.ts
//
// Mirror dos tests do portal mas com tokens border-inclusive
// (admin usa border colorida em alguns badges).

import { describe, expect, it } from 'vitest';
import {
  asOrderStatus,
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  orderStatusColor,
  orderStatusLabel,
  VALID_ORDER_STATUSES,
} from './order-labels';

describe('admin order-labels invariantes', () => {
  it('todo VALID_ORDER_STATUS tem label + bg + color + border', () => {
    for (const s of VALID_ORDER_STATUSES) {
      expect(ORDER_STATUS_LABEL[s]).toBeDefined();
      expect(ORDER_STATUS_COLOR[s].bg).toBeDefined();
      expect(ORDER_STATUS_COLOR[s].color).toBeDefined();
      expect(ORDER_STATUS_COLOR[s].border).toBeDefined();
    }
  });

  it('5 estados match Safra ERP', () => {
    expect(VALID_ORDER_STATUSES).toHaveLength(5);
  });

  it('rascunho default color tertiary + border generico', () => {
    expect(ORDER_STATUS_COLOR.rascunho.color).toContain('text-tertiary');
    expect(ORDER_STATUS_COLOR.rascunho.border).toContain('--colheita-border');
  });

  it('entregue success-subtle bg', () => {
    expect(ORDER_STATUS_COLOR.entregue.bg).toContain('success-subtle');
  });

  it('confirmado + faturado têm mesmas cores (alias visual)', () => {
    expect(ORDER_STATUS_COLOR.confirmado).toEqual(ORDER_STATUS_COLOR.faturado);
  });
});

describe('admin orderStatusLabel helper', () => {
  it('retorna PT-BR', () => {
    expect(orderStatusLabel('entregue')).toBe('Entregue');
    expect(orderStatusLabel('cancelado')).toBe('Cancelado');
  });

  it('fallback ao input cru pra status desconhecido', () => {
    expect(orderStatusLabel('unknown_v2')).toBe('unknown_v2');
  });
});

describe('admin orderStatusColor helper', () => {
  it('fallback rascunho pra status desconhecido', () => {
    expect(orderStatusColor('xyz')).toBe(ORDER_STATUS_COLOR.rascunho);
  });
});

describe('admin asOrderStatus type guard', () => {
  it('aceita validos', () => {
    expect(asOrderStatus('entregue')).toBe('entregue');
  });

  it('rejeita inválido', () => {
    expect(asOrderStatus('Entregue')).toBeNull();
    expect(asOrderStatus(null)).toBeNull();
  });
});
