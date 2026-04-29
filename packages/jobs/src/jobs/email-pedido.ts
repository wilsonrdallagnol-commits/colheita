// packages/jobs/src/jobs/email-pedido.ts
/**
 * Job: email-pedido-confirmado
 *
 * Enviado quando o webhook Safra recebe um evento pedido.criado.
 * Usa @colheita/email → Resend.
 *
 * Trigger em apps/api (POST /api/webhooks/safra).
 */
import { sendPedidoConfirmado } from '@colheita/email';
import { task } from '@trigger.dev/sdk/v3';
import { z } from 'zod';

// ─── Payload schema ────────────────────────────────────────────────────────────

const pedidoItemSchema = z.object({
  produto: z.string(),
  quantidade: z.number().positive(),
  unidade: z.string(),
});

export const pedidoConfirmadoPayloadSchema = z.object({
  /** Email do distribuidor a notificar */
  to: z.string().email(),
  /** ID do pedido no sistema Safra */
  pedidoId: z.string(),
  /** Nome do distribuidor/cliente */
  clienteNome: z.string(),
  /** Nome do tenant (ex: "Argho Distribuidora") */
  tenantName: z.string(),
  /** Itens do pedido */
  itens: z.array(pedidoItemSchema).min(1),
  /** Valor total em reais (opcional) */
  valorTotal: z.number().positive().optional(),
});

export type PedidoConfirmadoPayload = z.infer<typeof pedidoConfirmadoPayloadSchema>;

// ─── Task ─────────────────────────────────────────────────────────────────────

export const sendPedidoConfirmadoJob = task({
  id: 'email-pedido-confirmado',

  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 2_000,
    maxTimeoutInMs: 30_000,
    factor: 2,
    randomize: true,
  },

  run: async (rawPayload: unknown): Promise<{ emailId: string }> => {
    const payload = pedidoConfirmadoPayloadSchema.parse(rawPayload);
    const { id: emailId } = await sendPedidoConfirmado(payload);
    return { emailId };
  },
});
