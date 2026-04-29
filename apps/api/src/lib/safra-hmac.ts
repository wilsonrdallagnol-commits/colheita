// apps/api/src/lib/safra-hmac.ts
/**
 * Utilitário de verificação de assinatura HMAC-SHA256 para webhooks Safra.
 *
 * Extraído da route handler para permitir testes unitários isolados.
 * Usa `timingSafeEqual` para prevenir timing attacks.
 *
 * Header esperado: X-Safra-Signature: sha256=<hex>
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verifica a assinatura HMAC-SHA256 do webhook Safra.
 *
 * @param body - Corpo bruto da requisição (string UTF-8)
 * @param signatureHeader - Valor do header X-Safra-Signature (ex: "sha256=abc123...")
 * @param secret - Segredo compartilhado para HMAC
 * @returns true se a assinatura é válida, false caso contrário
 */
export function verifySignature(
  body: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!secret || !signatureHeader) return false;

  const [scheme, signature] = signatureHeader.split('=');
  if (scheme !== 'sha256' || !signature) return false;

  const expected = createHmac('sha256', secret).update(body, 'utf8').digest('hex');

  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}
