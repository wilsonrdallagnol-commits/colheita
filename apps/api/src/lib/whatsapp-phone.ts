// apps/api/src/lib/whatsapp-phone.ts
//
// Helpers de normalizacao + redaction de telefone WhatsApp.
//
// Extraido do route handler pra permitir testes unitarios isolados (sem mock
// pesado de SupabaseClient). LGPD: hashPhone retorna sha256 truncado em 8 chars
// pra correlacao em incident response sem revelar PII.

import crypto from 'node:crypto';

/**
 * Normaliza telefone vindo do payload Meta (E.164 sem '+') pra formato canonico
 * com '+' e somente digitos. Retorna null se entrada invalida.
 */
export function normalizePhoneE164(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string') return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null; // E.164 limits
  return `+${digits}`;
}

/**
 * Extrai apenas digitos (sem '+') — util pra comparacao com phones armazenados
 * em formatos variaveis (com/sem '+', com/sem espacos).
 */
export function phoneDigitsOnly(raw: string | null | undefined): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/\D/g, '');
}

/**
 * Hash truncado SHA256 (8 chars hex). Para Sentry/logs sem expor PII.
 */
export function hashPhone(phone: string): string {
  return crypto.createHash('sha256').update(phone).digest('hex').slice(0, 8);
}
