// packages/email/src/client.ts
/**
 * Singleton do cliente Resend.
 * Lê RESEND_API_KEY do ambiente em runtime.
 * Em testes, substituir com vi.mock ou injetar via factory.
 */
import { Resend } from 'resend';

let _client: Resend | null = null;

export function getResendClient(): Resend {
  if (!_client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        '[email] RESEND_API_KEY não configurado. Adicione ao .env ou às variáveis de ambiente.',
      );
    }
    _client = new Resend(apiKey);
  }
  return _client;
}

/** Reset singleton (útil em testes) */
export function _resetResendClient(): void {
  _client = null;
}
