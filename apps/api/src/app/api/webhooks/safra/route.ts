// apps/api/src/app/api/webhooks/safra/route.ts
//
// Webhook receiver para integração Safra ↔ Colheita.
// Valida assinatura HMAC-SHA256 antes de processar o payload.
//
// Header esperado: X-Safra-Signature: sha256=<hex>
// Segredo: SAFRA_WEBHOOK_SECRET (env)
//
// Proteção contra replay attacks:
//   1. Freshness check — rejeita eventos com timestamp > TIMESTAMP_TOLERANCE_MS antigos.
//   2. Rate limiting por IP — 60 req/min via Upstash (fail-open sem UPSTASH_REDIS_REST_URL).
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
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { type NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '../../../../lib/safra-hmac.js';

const WEBHOOK_SECRET = process.env.SAFRA_WEBHOOK_SECRET ?? '';

// Janela de tolerância de timestamp: rejeita eventos mais antigos que 10 minutos.
// Safra deve reenviar dentro desta janela em caso de falha temporária.
const TIMESTAMP_TOLERANCE_MS = 10 * 60 * 1000;

// ── Rate limiter (fail-open sem Upstash) ──────────────────────────────────────

function buildWebhookRateLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    // 60 req/min por IP — permite retries do Safra sem bloquear operações legítimas
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: false,
    prefix: '@colheita/webhook-safra',
  });
}

const webhookRateLimiter = buildWebhookRateLimiter();

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
  // 1. Rate limiting por IP (fail-open: prossegue sem Upstash configurado)
  if (webhookRateLimiter) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';
    try {
      const { success } = await webhookRateLimiter.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: 'Muitas requisições do mesmo IP. Aguarde e tente novamente.' },
          {
            status: 429,
            headers: { 'Retry-After': '60' },
          },
        );
      }
    } catch {
      // Falha no Redis → fail-open
    }
  }

  const body = await request.text();
  const signature = request.headers.get('X-Safra-Signature');

  // 2. Validação de assinatura HMAC-SHA256
  if (!verifySignature(body, signature, WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
  }

  // 3. Valida o payload contra o schema de eventos Safra
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

  // 4. Freshness check — rejeita eventos muito antigos (proteção contra replay)
  const eventAgeMs = Date.now() - new Date(event.timestamp).getTime();
  if (eventAgeMs > TIMESTAMP_TOLERANCE_MS) {
    return NextResponse.json(
      {
        error: 'Evento rejeitado: timestamp muito antigo.',
        details: `Evento de ${Math.round(eventAgeMs / 60000)} minuto(s) atrás. Tolerância: ${TIMESTAMP_TOLERANCE_MS / 60000} minutos.`,
      },
      { status: 400 },
    );
  }

  // 5. Com Trigger.dev configurado: dispara job assíncrono e retorna imediatamente
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

  // 6. Sem Trigger.dev (dev local): fallback síncrono/fire-and-forget
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
