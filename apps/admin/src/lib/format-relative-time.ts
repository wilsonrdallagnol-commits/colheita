// apps/admin/src/lib/format-relative-time.ts
//
// Espelho de apps/portal/src/lib/format-relative-time.ts.
// Mantido por copia pra evitar refactor agora pra @colheita/ui
// (que arrasta typing + bundling). Quando virar 3+ usages, promove.

/**
 * Tempo relativo curto em PT-BR:
 *   < 1 min        → "agora"
 *   1-59 min       → "Nm"
 *   1-23 horas     → "Nh"
 *   1-6 dias       → "Nd"
 *   ≥ 7 dias       → "DD/MM"
 *
 * @param iso  ISO 8601 string
 * @param now  Override "agora" para testes (default Date.now())
 */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const d = new Date(iso);
  const diff = now - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
