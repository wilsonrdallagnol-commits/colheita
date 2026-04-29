// packages/jobs/src/jobs/safra-sync.ts
/**
 * Job: safra-sync-evento
 *
 * Processa eventos do webhook Safra de forma assíncrona.
 * A rota HTTP valida o HMAC e dispara este job imediatamente, sem bloquear.
 *
 * Isso garante:
 * - Resposta 200 imediata para o servidor Safra (SLA do webhook)
 * - Processamento seguro com retry em caso de falha de DB/email
 * - Visibilidade no dashboard do Trigger.dev por evento
 */
import { type SafraEvent, SafraEventSchema } from '@colheita/safra-contracts';
import { task } from '@trigger.dev/sdk/v3';
import { z } from 'zod';

// ─── Payload schema ────────────────────────────────────────────────────────────

export const safraEventoPayloadSchema = z.object({
  /**
   * Evento Safra — passado como unknown e validado com SafraEventSchema dentro do run()
   * para evitar conflitos de versão de Zod entre workspaces.
   */
  event: z.unknown(),
  /** Tenant que recebeu o evento (multi-tenant) */
  tenantId: z.string().uuid(),
  /** Timestamp de recebimento (ISO 8601) */
  receivedAt: z.string().datetime(),
});

export type SafraEventoPayload = z.infer<typeof safraEventoPayloadSchema>;

// ─── Handlers por tipo de evento ──────────────────────────────────────────────

type PedidoCriado = Extract<SafraEvent, { event: 'pedido.criado' }>;
type InventarioAtualizado = Extract<SafraEvent, { event: 'inventario.atualizado' }>;
type ProdutoAtualizado = Extract<SafraEvent, { event: 'produto.atualizado' }>;

async function handlePedidoCriado(event: PedidoCriado, _tenantId: string) {
  // Importação dinâmica para evitar dependência circular
  const { sendPedidoConfirmadoJob } = await import('./email-pedido.js');

  const notifyEmail = process.env.RESEND_NOTIFY_EMAIL;
  if (!notifyEmail) return;

  await sendPedidoConfirmadoJob.trigger({
    to: notifyEmail,
    pedidoId: event.data.pedido_id,
    clienteNome: event.data.distribuidor_nome,
    tenantName: process.env.RESEND_TENANT_NAME ?? 'Argho Distribuidora',
    itens: event.data.itens.map((item) => ({
      produto: item.produto_nome,
      quantidade: item.quantidade,
      unidade: item.unidade,
    })),
    valorTotal: event.data.total_liquido,
  });

  // Fase 2: persistir pedido no DB de ordens (CRM agro)
}

async function handleInventarioAtualizado(_event: InventarioAtualizado, _tenantId: string) {
  // Fase 2: sincronizar estoque no DB e invalidar cache do catálogo
}

async function handleProdutoAtualizado(_event: ProdutoAtualizado, _tenantId: string) {
  // Fase 2: atualizar produto no PIM se mapeamento existir
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export const safraEventoJob = task({
  id: 'safra-sync-evento',

  retry: {
    maxAttempts: 5,
    minTimeoutInMs: 1_000,
    maxTimeoutInMs: 60_000,
    factor: 2,
    randomize: true,
  },

  run: async (rawPayload: unknown): Promise<{ processed: boolean; eventType: string }> => {
    const parsed = safraEventoPayloadSchema.parse(rawPayload);
    const event: SafraEvent = SafraEventSchema.parse(parsed.event);
    const { tenantId } = parsed;

    switch (event.event) {
      case 'pedido.criado':
        await handlePedidoCriado(event, tenantId);
        break;
      case 'pedido.atualizado':
        // Fase 2: atualizar status do pedido
        break;
      case 'inventario.atualizado':
        await handleInventarioAtualizado(event, tenantId);
        break;
      case 'produto.atualizado':
        await handleProdutoAtualizado(event, tenantId);
        break;
      case 'cliente.cadastrado':
        // Fase 2: criar/atualizar distribuidor no DB
        break;
      default:
        // Evento desconhecido — ignorar silenciosamente
        break;
    }

    return { processed: true, eventType: event.event };
  },
});
