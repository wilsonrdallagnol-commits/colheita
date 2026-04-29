// apps/api/src/app/api/webhooks/safra/route.ts
//
// Webhook receiver para integração Safra ↔ Colheita.
// Valida assinatura HMAC-SHA256 antes de processar o payload.
//
// Header esperado: X-Safra-Signature: sha256=<hex>
// Segredo: SAFRA_WEBHOOK_SECRET (env)

import { sendPedidoConfirmado } from '@colheita/email';
import type {
  SafraClienteCadastrado,
  SafraInventarioAtualizado,
  SafraPedidoAtualizado,
  SafraPedidoCriado,
  SafraProdutoAtualizado,
} from '@colheita/safra-contracts';
import { SafraEventSchema } from '@colheita/safra-contracts';
import { type NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '../../../../lib/safra-hmac.js';

const WEBHOOK_SECRET = process.env.SAFRA_WEBHOOK_SECRET ?? '';

// ── Handlers por tipo de evento ───────────────────────────────────────────────
//
// Cada handler recebe o evento tipado e retorna { queued: boolean }.
// Fase 1 produção: substituir o stub por `await tasks.trigger(...)` do Trigger.dev.

async function handlePedidoCriado(event: SafraPedidoCriado): Promise<{ queued: boolean }> {
  // TODO (Trigger.dev Fase 2): await tasks.trigger('safra-pedido-criado', { event })

  // Envia email de confirmação ao distribuidor (RESEND_NOTIFY_EMAIL ou env por tenant)
  const notifyEmail = process.env.RESEND_NOTIFY_EMAIL;
  if (notifyEmail) {
    const itens = event.data.itens.map((item) => ({
      produto: item.produto_nome,
      quantidade: item.quantidade,
      unidade: item.unidade,
    }));

    sendPedidoConfirmado({
      to: notifyEmail,
      pedidoId: event.data.pedido_id,
      clienteNome: event.data.distribuidor_nome,
      tenantName: process.env.RESEND_TENANT_NAME ?? 'Argho Distribuidora',
      itens,
      valorTotal: event.data.total_liquido,
    }).catch(() => {
      // Falha silenciosa — email é best-effort, webhook sempre retorna 200
    });
  }

  return { queued: false };
}

async function handlePedidoAtualizado(_event: SafraPedidoAtualizado): Promise<{ queued: boolean }> {
  // TODO (Trigger.dev): await tasks.trigger('safra-pedido-atualizado', { event: _event })
  return { queued: false };
}

async function handleInventarioAtualizado(
  _event: SafraInventarioAtualizado,
): Promise<{ queued: boolean }> {
  // TODO (Trigger.dev): await tasks.trigger('safra-inventario-atualizado', { event: _event })
  return { queued: false };
}

async function handleProdutoAtualizado(
  _event: SafraProdutoAtualizado,
): Promise<{ queued: boolean }> {
  // TODO (Trigger.dev): await tasks.trigger('safra-produto-atualizado', { event: _event })
  return { queued: false };
}

async function handleClienteCadastrado(
  _event: SafraClienteCadastrado,
): Promise<{ queued: boolean }> {
  // TODO (Trigger.dev): await tasks.trigger('safra-cliente-cadastrado', { event: _event })
  return { queued: false };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('X-Safra-Signature');

  if (!verifySignature(body, signature, WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
  }

  // Valida o payload contra o schema de eventos Safra
  const parsed = SafraEventSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Evento desconhecido ou schema inválido.',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      },
      { status: 422 },
    );
  }

  const event = parsed.data;

  // Roteamento tipado por evento — cada handler é isolado e pronto para Trigger.dev
  let result: { queued: boolean };
  switch (event.event) {
    case 'pedido.criado':
      result = await handlePedidoCriado(event);
      break;
    case 'pedido.atualizado':
      result = await handlePedidoAtualizado(event);
      break;
    case 'inventario.atualizado':
      result = await handleInventarioAtualizado(event);
      break;
    case 'produto.atualizado':
      result = await handleProdutoAtualizado(event);
      break;
    case 'cliente.cadastrado':
      result = await handleClienteCadastrado(event);
      break;
  }

  return NextResponse.json(
    {
      received: true,
      event: event.event,
      tenant_id: event.tenant_id,
      queued: result.queued,
      processedAt: new Date().toISOString(),
    },
    { status: 200 },
  );
}
