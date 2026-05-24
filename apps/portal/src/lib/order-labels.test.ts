// apps/portal/src/lib/order-labels.test.ts
//
// Invariantes + type guard pro dominio orders.

import { describe, expect, it } from 'vitest';
import {
  asOrderStatus,
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  orderStatusColor,
  orderStatusColorFg,
  orderStatusLabel,
  VALID_ORDER_STATUSES,
} from './order-labels';

describe('order-labels invariantes', () => {
  it('todo VALID_ORDER_STATUS tem label e color', () => {
    for (const s of VALID_ORDER_STATUSES) {
      expect(ORDER_STATUS_LABEL[s]).toBeDefined();
      expect(ORDER_STATUS_COLOR[s]).toBeDefined();
      expect(ORDER_STATUS_COLOR[s].bg).toBeDefined();
      expect(ORDER_STATUS_COLOR[s].color).toBeDefined();
    }
  });

  it('VALID_ORDER_STATUSES tem 5 estados (match Safra ERP)', () => {
    expect(VALID_ORDER_STATUSES).toEqual([
      'rascunho',
      'confirmado',
      'faturado',
      'entregue',
      'cancelado',
    ]);
  });

  it('labels em PT-BR (não inglês)', () => {
    expect(ORDER_STATUS_LABEL.rascunho).toBe('Rascunho');
    expect(ORDER_STATUS_LABEL.entregue).toBe('Entregue');
  });
});

describe('orderStatusLabel helper', () => {
  it('retorna label PT-BR pra status válido', () => {
    expect(orderStatusLabel('confirmado')).toBe('Confirmado');
    expect(orderStatusLabel('entregue')).toBe('Entregue');
  });

  it('retorna o input cru pra status desconhecido (forward-compat)', () => {
    expect(orderStatusLabel('unknown_future_status')).toBe('unknown_future_status');
  });
});

describe('orderStatusColor helper', () => {
  it('retorna tokens validos pra status conhecido', () => {
    const c = orderStatusColor('entregue');
    expect(c.color).toContain('success');
  });

  it('fallback pra rascunho em status desconhecido', () => {
    const c = orderStatusColor('xyz');
    expect(c).toBe(ORDER_STATUS_COLOR.rascunho);
  });

  it('entregue tem cor verde de success', () => {
    expect(orderStatusColor('entregue').color).toMatch(/success/);
  });

  it('confirmado + faturado compartilham mesma cor (brand-primary)', () => {
    expect(orderStatusColor('confirmado').color).toBe(orderStatusColor('faturado').color);
  });
});

describe('orderStatusColorFg helper (foreground-only)', () => {
  it('retorna cor success pra entregue', () => {
    expect(orderStatusColorFg('entregue')).toContain('success');
  });

  it('confirmado + faturado tem mesma cor brand-primary', () => {
    expect(orderStatusColorFg('confirmado')).toBe(orderStatusColorFg('faturado'));
    expect(orderStatusColorFg('confirmado')).toContain('brand-primary');
  });

  it('cancelado vira warning', () => {
    expect(orderStatusColorFg('cancelado')).toContain('warning');
  });

  it('fallback text-tertiary pra status desconhecido', () => {
    expect(orderStatusColorFg('unknown')).toContain('text-tertiary');
  });
});

describe('asOrderStatus type guard', () => {
  it('aceita os 5 status válidos', () => {
    for (const s of VALID_ORDER_STATUSES) {
      expect(asOrderStatus(s)).toBe(s);
    }
  });

  it('rejeita inválidos + null/empty', () => {
    expect(asOrderStatus('Confirmado')).toBeNull(); // case-sensitive
    expect(asOrderStatus(null)).toBeNull();
    expect(asOrderStatus('')).toBeNull();
    expect(asOrderStatus('processing')).toBeNull();
  });
});
