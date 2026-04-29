// packages/jobs/src/jobs/email-certificado.ts
/**
 * Job: email-certificado-emitido
 *
 * Enviado quando um usuário conclui todas as lições de uma trilha
 * que concede certificação. Usa @colheita/email → Resend.
 *
 * Trigger em apps/academia (markLicaoCompleta server action).
 */
import { sendCertificadoEmitido } from '@colheita/email';
import { task } from '@trigger.dev/sdk/v3';
import { z } from 'zod';

// ─── Payload schema ────────────────────────────────────────────────────────────

export const certificadoEmitidoPayloadSchema = z.object({
  /** Email do destinatário */
  to: z.string().email(),
  /** Nome de exibição do usuário */
  userName: z.string().min(1),
  /** Título da trilha completada */
  trackTitle: z.string().min(1),
  /** Número único do certificado (ARGHO-AAAA-XXXXXXXX) */
  certificateNo: z.string().min(1),
  /** URL pública do certificado na Academia */
  certificateUrl: z.string().url(),
  /** Data de expiração ISO 8601 (opcional — trilhas sem validade não têm) */
  expiresAt: z.string().optional(),
});

export type CertificadoEmitidoPayload = z.infer<typeof certificadoEmitidoPayloadSchema>;

// ─── Task ─────────────────────────────────────────────────────────────────────

export const sendCertificadoEmitidoJob = task({
  id: 'email-certificado-emitido',

  // Email é crítico: 3 tentativas com backoff exponencial
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 2_000,
    maxTimeoutInMs: 30_000,
    factor: 2,
    randomize: true,
  },

  run: async (rawPayload: unknown): Promise<{ emailId: string }> => {
    const payload = certificadoEmitidoPayloadSchema.parse(rawPayload);
    const { id: emailId } = await sendCertificadoEmitido(payload);
    return { emailId };
  },
});
