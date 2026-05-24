// apps/admin/src/lib/support-labels.ts
//
// Espelho de apps/portal/src/lib/support-labels.ts.
// Mantido por copia pra evitar refactor pra @colheita/ui agora —
// promove quando 3+ usages compartilhados.
//
// Labels diferem do portal no STATUS_LABEL.waiting_user:
//   - portal: 'Aguardando você' (perspectiva distribuidor)
//   - admin: 'Aguardando user' (perspectiva staff Argho)

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
  waiting_user: 'Aguardando user',
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
  agronomic: 'Agronômico',
  commercial: 'Comercial',
  product: 'Produto',
  logistics: 'Logística',
  platform: 'Plataforma',
  other: 'Outros',
};

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

export function asTicketStatus(s: string | null | undefined): TicketStatus | null {
  return s && (VALID_STATUSES as readonly string[]).includes(s) ? (s as TicketStatus) : null;
}
