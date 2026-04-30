// apps/api/src/lib/safra-timestamp.ts
/**
 * Utilitário de validação de freshness para webhooks Safra.
 *
 * Extraído da route handler para testes unitários isolados.
 * Proteção contra replay attacks: eventos muito antigos são rejeitados.
 */

/**
 * Verifica se um evento de webhook está dentro da janela de tolerância.
 *
 * @param eventTimestamp - Timestamp ISO 8601 do evento (campo `timestamp` do payload)
 * @param nowMs - Timestamp atual em milissegundos (injetável para testes)
 * @param toleranceMs - Janela máxima aceita em ms (padrão: 10 minutos)
 * @returns true se o evento está dentro da janela; false se muito antigo ou timestamp inválido
 */
export function isEventFresh(
  eventTimestamp: string,
  nowMs: number = Date.now(),
  toleranceMs = 10 * 60 * 1000,
): boolean {
  const eventTime = new Date(eventTimestamp).getTime();

  // Timestamp inválido (NaN) → rejeita
  if (Number.isNaN(eventTime)) return false;

  const ageMs = nowMs - eventTime;

  // Evento do futuro (clock skew extremo) → aceita com folga de 60s
  if (ageMs < -60_000) return false;

  return ageMs <= toleranceMs;
}
