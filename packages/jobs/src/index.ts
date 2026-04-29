// packages/jobs/src/index.ts
/**
 * @colheita/jobs — Trigger.dev v3 background jobs
 *
 * Exporta:
 * - Tasks (para trigger de dentro de outros tasks via .trigger())
 * - Payload schemas Zod (para validação nos callers)
 * - Helpers de trigger tipados (para apps Next.js via tasks.trigger())
 *
 * @example
 * ```ts
 * // Em um Server Action ou API Route:
 * import { sendCertificadoEmitidoJob } from '@colheita/jobs';
 * await sendCertificadoEmitidoJob.trigger({ to, userName, ... });
 * ```
 */

// Email jobs
export {
  type CertificadoEmitidoPayload,
  certificadoEmitidoPayloadSchema,
  sendCertificadoEmitidoJob,
} from './jobs/email-certificado.js';

export {
  type PedidoConfirmadoPayload,
  pedidoConfirmadoPayloadSchema,
  sendPedidoConfirmadoJob,
} from './jobs/email-pedido.js';

// PDF jobs
export {
  type GerarFichaTecnicaPayload,
  gerarFichaTecnicaJob,
  gerarFichaTecnicaPayloadSchema,
} from './jobs/gerar-ficha-tecnica.js';

// Safra sync
export {
  type SafraEventoPayload,
  safraEventoJob,
  safraEventoPayloadSchema,
} from './jobs/safra-sync.js';
