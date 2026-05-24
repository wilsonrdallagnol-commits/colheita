// apps/portal/src/lib/format-date.ts
//
// Formatação consistente de timestamps ISO 8601 em PT-BR.
// Duplicado inline em /conta/pedidos/page, /conta/pedidos/[id]/page,
// /conta/assistente/historico/page. Consolida pra um lugar.

/** Formata data dd/MM/yyyy. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Formata data + hora dd/MM/yyyy HH:mm. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
