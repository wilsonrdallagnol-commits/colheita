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
 * - pedido.criado        → upsert em orders + order_items; dispara email de confirmação
 * - pedido.atualizado    → atualiza status do pedido em orders
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
type PedidoAtualizado = Extract<SafraEvent, { event: 'pedido.atualizado' }>;
type ClienteCadastrado = Extract<SafraEvent, { event: 'cliente.cadastrado' }>;
type InventarioAtualizado = Extract<SafraEvent, { event: 'inventario.atualizado' }>;
type ProdutoAtualizado = Extract<SafraEvent, { event: 'produto.atualizado' }>;

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * pedido.criado — persiste o pedido no banco e dispara email de confirmação.
 *
 * 1. Busca o usuário no portal pelo email do distribuidor (se disponível via
 *    distribuidor_id do Safra — não confiável, não usamos; futuro: vincular por email).
 * 2. Upserta em orders (idempotente por safra_pedido_id).
 * 3. Apaga itens anteriores e insere os itens do evento (snapshot).
 * 4. Dispara email de confirmação (fire-and-forget via Trigger.dev job).
 */
async function handlePedidoCriado(event: PedidoCriado, tenantId: string) {
  const supabase = buildSupabaseAdmin();
  const { data: orderData } = event;

  // 1. Tenta vincular ao usuário do portal pelo safra distribuidor_id se presente
  //    (melhor-esforço — null quando não mapeado)
  let distribuidorId: string | null = null;
  if (orderData.distribuidor_id) {
    // distribuidor_id no evento é o UUID do user no portal (opcional)
    const { data: userRow } = await supabase
      .from('users')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('id', orderData.distribuidor_id)
      .maybeSingle();
    distribuidorId = userRow?.id ?? null;
  }

  // 2. Upsert do cabeçalho do pedido
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .upsert(
      {
        tenant_id: tenantId,
        distribuidor_id: distribuidorId,
        safra_pedido_id: orderData.pedido_id,
        numero: orderData.numero,
        status: orderData.status,
        distribuidor_nome: orderData.distribuidor_nome,
        distribuidor_cpf_cnpj: orderData.distribuidor_cpf_cnpj ?? null,
        total_bruto: orderData.total_bruto,
        total_desconto: orderData.total_desconto,
        total_liquido: orderData.total_liquido,
        observacoes: orderData.observacoes ?? null,
        emitido_em: orderData.emitido_em,
        prazo_entrega: orderData.prazo_entrega ?? null,
        synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'tenant_id,safra_pedido_id',
        ignoreDuplicates: false,
      },
    )
    .select('id')
    .single();

  if (orderError || !order) {
    throw new Error(
      `[safra] Falha ao criar pedido ${orderData.pedido_id}: ${orderError?.message ?? 'sem retorno'}`,
    );
  }

  // 3. Substitui os itens (delete + insert — snapshot imutável por pedido)
  await supabase.from('order_items').delete().eq('order_id', order.id);

  const items = orderData.itens.map((item) => ({
    tenant_id: tenantId,
    order_id: order.id,
    produto_codigo: item.produto_codigo,
    produto_nome: item.produto_nome,
    quantidade: item.quantidade,
    unidade: item.unidade,
    preco_unitario: item.preco_unitario,
    desconto_pct: item.desconto_pct,
    total: item.total,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(items);
  if (itemsError) {
    throw new Error(
      `[safra] Falha ao inserir itens do pedido ${orderData.pedido_id}: ${itemsError.message}`,
    );
  }

  // 4. Email de confirmação (fire-and-forget via job separado)
  const notifyEmail = process.env.RESEND_NOTIFY_EMAIL;
  if (notifyEmail) {
    // Importação dinâmica para evitar dependência circular
    const { sendPedidoConfirmadoJob } = await import('./email-pedido.js');
    await sendPedidoConfirmadoJob.trigger({
      to: notifyEmail,
      pedidoId: orderData.pedido_id,
      clienteNome: orderData.distribuidor_nome,
      tenantName: process.env.RESEND_TENANT_NAME ?? 'Argho Distribuidora',
      itens: orderData.itens.map((item) => ({
        produto: item.produto_nome,
        quantidade: item.quantidade,
        unidade: item.unidade,
      })),
      valorTotal: orderData.total_liquido,
    });
  }
}

/**
 * pedido.atualizado — atualiza o status do pedido na tabela orders.
 *
 * Safra envia apenas o diff de status (status_anterior → status_novo).
 * Atualizamos o status e guardamos o status_anterior + motivo para rastreabilidade.
 * Se o pedido não existir no banco, ignoramos (pode ter chegado antes de pedido.criado
 * ou ser de um pedido pré-integração).
 */
async function handlePedidoAtualizado(event: PedidoAtualizado, tenantId: string) {
  const { pedido_id, status_novo, status_anterior, atualizado_em, motivo } = event.data;

  const supabase = buildSupabaseAdmin();

  // Busca pelo safra_pedido_id
  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('tenant_id', tenantId)
    .eq('safra_pedido_id', pedido_id)
    .maybeSingle();

  if (!order) {
    // Pedido não encontrado — pode ser pré-integração. Ignoramos.
    return;
  }

  const validStatuses = ['rascunho', 'confirmado', 'faturado', 'entregue', 'cancelado'] as const;
  if (!validStatuses.includes(status_novo as (typeof validStatuses)[number])) {
    // Status desconhecido — ignoramos para não violar o check constraint
    return;
  }

  const { error } = await supabase
    .from('orders')
    .update({
      status: status_novo,
      status_anterior: status_anterior,
      motivo_ultima_atualizacao: motivo ?? null,
      synced_at: atualizado_em,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  if (error) {
    throw new Error(`[safra] Falha ao atualizar pedido ${pedido_id}: ${error.message}`);
  }
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
        await handlePedidoAtualizado(event, tenantId);
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
