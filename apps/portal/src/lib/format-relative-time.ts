// apps/portal/src/lib/format-relative-time.ts
//
// Formata timestamp ISO 8601 como tempo relativo curto em PT-BR.
// Usado no badge de timestamp da inbox de notificacoes
// (components/conta/notification-item.tsx).
//
// Decisao de design: faixas curtas + fallback data dd/MM. Não mostra
// "ontem"/"semana passada" — formato compacto pra grid de inbox onde
// precisamos coluna fixa pequena. Resolução: 1 minuto.

/**
 * Retorna representação relativa curta:
 *   < 1 min        → "agora"
 *   1-59 min       → "Nm" (e.g. "5m")
 *   1-23 horas     → "Nh" (e.g. "3h")
 *   1-6 dias       → "Nd" (e.g. "2d")
 *   ≥ 7 dias       → "DD/MM"
 *
 * @param iso ISO 8601 string. Aceita Date.toISOString() ou Postgres
 *   timestamptz serializado. Tempos no futuro renderizam como "agora"
 *   (diff negativo cai no primeiro branch).
 * @param now Override do "agora" para testes determinísticos. Default
 *   `Date.now()`.
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
