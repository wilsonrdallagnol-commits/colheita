// apps/admin/src/lib/order-labels.ts
//
// Espelho de apps/portal/src/lib/order-labels.ts com `border` extra
// no color token (admin usa border colorido em alguns badges; portal
// usa só bg+color).

export type OrderStatus = 'rascunho' | 'confirmado' | 'faturado' | 'entregue' | 'cancelado';

export const VALID_ORDER_STATUSES: OrderStatus[] = [
  'rascunho',
  'confirmado',
  'faturado',
  'entregue',
  'cancelado',
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  rascunho: 'Rascunho',
  confirmado: 'Confirmado',
  faturado: 'Faturado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

/** Token bg + color + border (admin usa border colorido em alguns badges) */
export const ORDER_STATUS_COLOR: Record<
  OrderStatus,
  { bg: string; color: string; border: string }
> = {
  rascunho: {
    bg: 'var(--colheita-surface-elevated)',
    color: 'var(--colheita-text-tertiary)',
    border: 'var(--colheita-border)',
  },
  confirmado: {
    bg: 'color-mix(in oklch, var(--colheita-brand-primary) 12%, transparent)',
    color: 'var(--colheita-brand-primary)',
    border: 'var(--colheita-brand-primary)',
  },
  faturado: {
    bg: 'color-mix(in oklch, var(--colheita-brand-primary) 12%, transparent)',
    color: 'var(--colheita-brand-primary)',
    border: 'var(--colheita-brand-primary)',
  },
  entregue: {
    bg: 'var(--colheita-success-subtle)',
    color: 'var(--colheita-success)',
    border: 'var(--colheita-success)',
  },
  cancelado: {
    bg: 'color-mix(in oklch, var(--colheita-warning) 12%, transparent)',
    color: 'var(--colheita-warning)',
    border: 'var(--colheita-warning)',
  },
};

export function orderStatusLabel(s: string): string {
  return ORDER_STATUS_LABEL[s as OrderStatus] ?? s;
}

export function orderStatusColor(s: string): { bg: string; color: string; border: string } {
  return ORDER_STATUS_COLOR[s as OrderStatus] ?? ORDER_STATUS_COLOR.rascunho;
}

export function asOrderStatus(s: string | null | undefined): OrderStatus | null {
  return s && (VALID_ORDER_STATUSES as readonly string[]).includes(s) ? (s as OrderStatus) : null;
}
