// apps/portal/src/lib/order-labels.ts
//
// Labels + colors do dominio orders (status sincronizados do Safra
// ERP). Antes duplicado em /conta/pedidos/page.tsx,
// /conta/pedidos/[id]/page.tsx e /conta/page.tsx (dashboard).
//
// Tipos batem com migration orders + ERP Safra:
//   rascunho | confirmado | faturado | entregue | cancelado

export type OrderStatus =
  | 'rascunho'
  | 'confirmado'
  | 'faturado'
  | 'entregue'
  | 'cancelado';

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

/**
 * Tokens de cor por status (background + foreground). Em alguns
 * componentes só o `color` é usado (badge inline simples); em outros
 * o bg adicional renderiza pill colorida.
 */
export const ORDER_STATUS_COLOR: Record<OrderStatus, { bg: string; color: string }> = {
  rascunho: {
    bg: 'var(--colheita-surface-elevated)',
    color: 'var(--colheita-text-tertiary)',
  },
  confirmado: {
    bg: 'color-mix(in oklch, var(--colheita-brand-primary) 12%, transparent)',
    color: 'var(--colheita-brand-primary)',
  },
  faturado: {
    bg: 'color-mix(in oklch, var(--colheita-brand-primary) 12%, transparent)',
    color: 'var(--colheita-brand-primary)',
  },
  entregue: {
    bg: 'var(--colheita-success-subtle, rgba(16,185,129,0.08))',
    color: 'var(--colheita-success, rgb(5,150,105))',
  },
  cancelado: {
    bg: 'color-mix(in oklch, var(--colheita-warning) 12%, transparent)',
    color: 'var(--colheita-warning)',
  },
};

/** Helper pra acessar label com fallback safe. */
export function orderStatusLabel(s: string): string {
  return ORDER_STATUS_LABEL[s as OrderStatus] ?? s;
}

/** Helper pra acessar color tokens com fallback safe (default = rascunho). */
export function orderStatusColor(s: string): { bg: string; color: string } {
  return ORDER_STATUS_COLOR[s as OrderStatus] ?? ORDER_STATUS_COLOR.rascunho;
}

/**
 * Versão simplificada que retorna só a cor foreground (sem bg).
 * Usada em listas compactas tipo dashboard que so colorem o texto.
 * Default text-tertiary pra status desconhecido (pra não esconder dado).
 */
export function orderStatusColorFg(s: string): string {
  if (s === 'entregue') return 'var(--colheita-success)';
  if (s === 'confirmado' || s === 'faturado') return 'var(--colheita-brand-primary)';
  if (s === 'cancelado') return 'var(--colheita-warning)';
  return 'var(--colheita-text-tertiary)';
}

export function asOrderStatus(s: string | null | undefined): OrderStatus | null {
  return s && (VALID_ORDER_STATUSES as readonly string[]).includes(s)
    ? (s as OrderStatus)
    : null;
}
