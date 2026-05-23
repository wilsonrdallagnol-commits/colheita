// apps/portal/src/lib/support-labels.ts
//
// Single source of truth dos labels do dominio support_tickets.
// Antes estava duplicado em 3 arquivos portal + 3 admin (6 cópias)
// — qualquer mudança de wording precisava lembrar de atualizar
// todas. Extraído pra evitar drift.
//
// Mantém PT-BR (UI do distribuidor). Pares value/label permitem
// generic <select> e tabela de status visual.

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_user'
  | 'resolved'
  | 'closed';

export type TicketUrgency = 'low' | 'normal' | 'high' | 'urgent';

export type TicketCategory =
  | 'agronomic'
  | 'commercial'
  | 'product'
  | 'logistics'
  | 'platform'
  | 'other';

export const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  waiting_user: 'Aguardando você',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

export const URGENCY_LABEL: Record<TicketUrgency, string> = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
};

export const CATEGORY_LABEL: Record<TicketCategory, string> = {
  agronomic: 'Recomendação agronômica',
  commercial: 'Comercial / pedido',
  product: 'Produto específico',
  logistics: 'Logística / entrega',
  platform: 'Plataforma Colheita',
  other: 'Outros',
};

// Listas pra validacao em server actions
export const VALID_STATUSES: TicketStatus[] = [
  'open',
  'in_progress',
  'waiting_user',
  'resolved',
  'closed',
];

export const VALID_URGENCIES: TicketUrgency[] = ['low', 'normal', 'high', 'urgent'];

export const VALID_CATEGORIES: TicketCategory[] = [
  'agronomic',
  'commercial',
  'product',
  'logistics',
  'platform',
  'other',
];

/**
 * Type guards seguros pra validar input de form/query string.
 * Retorna o valor tipado se válido, null se não.
 */
export function asTicketStatus(s: string | null | undefined): TicketStatus | null {
  return s && (VALID_STATUSES as readonly string[]).includes(s) ? (s as TicketStatus) : null;
}

export function asTicketUrgency(s: string | null | undefined): TicketUrgency | null {
  return s && (VALID_URGENCIES as readonly string[]).includes(s) ? (s as TicketUrgency) : null;
}

export function asTicketCategory(s: string | null | undefined): TicketCategory | null {
  return s && (VALID_CATEGORIES as readonly string[]).includes(s) ? (s as TicketCategory) : null;
}
