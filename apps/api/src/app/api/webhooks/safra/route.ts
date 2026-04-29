// apps/api/src/app/api/webhooks/safra/route.ts
//
// Webhook receiver para integração Safra ↔ Colheita.
// Valida assinatura HMAC-SHA256 antes de processar o payload.
//
// Header esperado: X-Safra-Signature: sha256=<hex>
// Segredo: SAFRA_WEBHOOK_SECRET (env)
//
// Arquitetura:
//   Com TRIGGER_SECRET_KEY: dispara safraEventoJob (assíncrono, retry, observável)
//   Sem TRIGGER_SECRET_KEY: fallback síncrono (dev local sem Trigger.dev)

import { sendPedidoConfirmado } from '@colheita/email';
import { safraEventoJob } from '@colheita/jobs';
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

// ── Fallback handlers (dev sem Trigger.dev) ───────────────────────────────────
//
// Usados apenas quando TRIGGER_SECRET_KEY não está configurado.
// Em produção, tudo vai via safraEventoJob.

async function fallbackPedidoCriado(event: SafraPedidoCriado): Promise<void> {
  const notifyEmail = process.env.RESEND_NOTIFY_EMAIL;
  if (!notifyEmail) return;

  sendPedidoConfirmado({
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
  }).catch(() => {
    // Falha silenciosa — webhook sempre retorna 200
  });
}

async function fallbackPedidoAtualizado(_event: SafraPedidoAtualizado): Promise<void> {
  // Fase 2: atualizar status
}

async function fallbackInventarioAtualizado(_event: SafraInventarioAtualizado): Promise<void> {
  // Fase 2: sincronizar estoque
}

async function fallbackProdutoAtualizado(_event: SafraProdutoAtualizado): Promise<void> {
  // Fase 2: atualizar PIM
}

async function fallbackClienteCadastrado(_event: SafraClienteCadastrado): Promise<void> {
  // Fase 2: criar distribuidor
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

  // Com Trigger.dev configurado: dispara job assíncrono e retorna imediatamente
  if (process.env.TRIGGER_SECRET_KEY) {
    safraEventoJob
      .trigger({
        event,
        tenantId: event.tenant_id,
        receivedAt: new Date().toISOString(),
      })
      .catch(() => {
        // Não expor falha do Trigger.dev — webhook ainda retorna 200
      });

    return NextResponse.json({
      received: true,
      event: event.event,
      tenant_id: event.tenant_id,
      queued: true,
      processedAt: new Date().toISOString(),
    });
  }

  // Sem Trigger.dev (dev local): fallback síncrono/fire-and-forget
  switch (event.event) {
    case 'pedido.criado':
      await fallbackPedidoCriado(event);
      break;
    case 'pedido.atualizado':
      await fallbackPedidoAtualizado(event);
      break;
    case 'inventario.atualizado':
      await fallbackInventarioAtualizado(event);
      break;
    case 'produto.atualizado':
      await fallbackProdutoAtualizado(event);
      break;
    case 'cliente.cadastrado':
      await fallbackClienteCadastrado(event);
      break;
  }

  return NextResponse.json({
    received: true,
    event: event.event,
    tenant_id: event.tenant_id,
    queued: false,
    processedAt: new Date().toISOString(),
  });
}
