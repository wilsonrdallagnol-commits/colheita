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
 *
 * Handlers implementados:
 * - pedido.criado        → dispara email de confirmação (Resend)
 * - cliente.cadastrado   → convida distribuidor via Supabase Auth Admin
 * - inventario.atualizado → upsert em product_stock
 * - produto.atualizado   → arquiva produto no PIM se Safra marcar inativo
 */
import { type SafraEvent, SafraEventSchema } from '@colheita/safra-contracts';
import { task } from '@trigger.dev/sdk/v3';
import { z } from 'zod';
import { buildSupabaseAdmin } from '../lib/supabase-admin.js';

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

// ─── Type aliases ──────────────────────────────────────────────────────────────

type PedidoCriado = Extract<SafraEvent, { event: 'pedido.criado' }>;
type ClienteCadastrado = Extract<SafraEvent, { event: 'cliente.cadastrado' }>;
type InventarioAtualizado = Extract<SafraEvent, { event: 'inventario.atualizado' }>;
type ProdutoAtualizado = Extract<SafraEvent, { event: 'produto.atualizado' }>;

// ─── Handlers ─────────────────────────────────────────────────────────────────

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
}

/**
 * cliente.cadastrado — convida o distribuidor para o portal.
 *
 * Safra envia o evento quando um novo cliente é criado no ERP.
 * Se o cliente tem email, mandamos um convite magic link para o portal.
 * O trigger `on_auth_user_created` cria o registro em public.users
 * automaticamente; atualizamos o status para 'invited'.
 *
 * Se não há email (campo opcional no schema Safra), ignoramos silenciosamente.
 */
async function handleClienteCadastrado(event: ClienteCadastrado, tenantId: string) {
  const { email } = event.data;

  if (!email) {
    // Sem email — não há como convidar. Log implícito via Trigger.dev.
    return;
  }

  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL ?? 'http://localhost:3001';
  const supabase = buildSupabaseAdmin();

  // Convida via Supabase Auth Admin — envia magic link para o portal
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${portalUrl}/auth/callback`,
    data: {
      tenant_id: tenantId,
      safra_cliente_id: event.data.cliente_id,
    },
  });

  if (error) {
    // "already been registered" — usuário existe, não é erro fatal
    if (
      error.message.includes('already been registered') ||
      error.message.includes('already exists')
    ) {
      return;
    }
    // Outros erros: relança para ativar retry do Trigger.dev
    throw new Error(`[safra] Falha ao convidar distribuidor ${email}: ${error.message}`);
  }

  // Trigger `on_auth_user_created` cria public.users com status='active'.
  // Corrigimos para 'invited' (status semântico correto antes do primeiro login).
  if (data.user) {
    await supabase
      .from('users')
      .update({
        status: 'invited',
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.user.id);
  }
}

/**
 * inventario.atualizado — sincroniza estoque do Safra para product_stock.
 *
 * Upserta o estoque por (tenant_id, safra_codigo, deposito).
 * Tenta vincular ao produto no PIM via safra_codigo — se não houver
 * mapeamento, cria o registro sem product_id (estoque "órfão" visível
 * no admin para configurar o mapeamento posteriormente).
 */
async function handleInventarioAtualizado(event: InventarioAtualizado, tenantId: string) {
  const { produto_codigo, deposito, estoque_atual, unidade, atualizado_em } = event.data;
  const depositoKey = deposito ?? 'principal';

  const supabase = buildSupabaseAdmin();

  // Tenta encontrar o produto mapeado no PIM
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('safra_codigo', produto_codigo)
    .maybeSingle();

  // Upsert em product_stock
  const { error } = await supabase.from('product_stock').upsert(
    {
      tenant_id: tenantId,
      product_id: product?.id ?? null,
      safra_codigo: produto_codigo,
      deposito: depositoKey,
      estoque: estoque_atual,
      unidade,
      synced_at: atualizado_em,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'tenant_id,safra_codigo,deposito',
      ignoreDuplicates: false,
    },
  );

  if (error) {
    throw new Error(
      `[safra] Falha ao atualizar estoque de ${produto_codigo} (${depositoKey}): ${error.message}`,
    );
  }
}

/**
 * produto.atualizado — atualiza produto no PIM se houver mapeamento via safra_codigo.
 *
 * Comportamento:
 * - Sem mapeamento (safra_codigo não encontrado): ignora.
 * - Com mapeamento e ativo=false: arquiva o produto no PIM
 *   (apenas se estiver publicado — não toca rascunhos).
 * - Com mapeamento e ativo=true: mantém o status atual do PIM
 *   (admin tem controle sobre publicação).
 *
 * Não atualiza nome nem outros campos — o PIM é a fonte da verdade
 * para metadados editoriais do produto.
 */
async function handleProdutoAtualizado(event: ProdutoAtualizado, tenantId: string) {
  const { produto_codigo, ativo } = event.data;

  const supabase = buildSupabaseAdmin();

  // Busca o produto mapeado
  const { data: product } = await supabase
    .from('products')
    .select('id, status')
    .eq('tenant_id', tenantId)
    .eq('safra_codigo', produto_codigo)
    .maybeSingle();

  if (!product) {
    // Sem mapeamento — nada a fazer
    return;
  }

  // Se o Safra desativou o produto e ele está publicado, arquivamos
  if (!ativo && product.status === 'published') {
    const { error } = await supabase
      .from('products')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', product.id);

    if (error) {
      throw new Error(
        `[safra] Falha ao arquivar produto ${produto_codigo} (id=${product.id}): ${error.message}`,
      );
    }
  }
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
        // Fase 4: atualizar status do pedido na tabela orders (quando implementada)
        break;
      case 'cliente.cadastrado':
        await handleClienteCadastrado(event, tenantId);
        break;
      case 'inventario.atualizado':
        await handleInventarioAtualizado(event, tenantId);
        break;
      case 'produto.atualizado':
        await handleProdutoAtualizado(event, tenantId);
        break;
      default:
        // Evento desconhecido — ignorar silenciosamente
        break;
    }

    return { processed: true, eventType: event.event };
  },
});
