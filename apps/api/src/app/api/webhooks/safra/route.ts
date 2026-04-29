// apps/api/src/app/api/webhooks/safra/route.ts
//
// Webhook receiver para integração Safra ↔ Colheita.
// Valida assinatura HMAC-SHA256 antes de processar o payload.
//
// Header esperado: X-Safra-Signature: sha256=<hex>
// Segredo: SAFRA_WEBHOOK_SECRET (env)

import { createHmac, timingSafeEqual } from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';

const WEBHOOK_SECRET = process.env.SAFRA_WEBHOOK_SECRET;

function verifySignature(body: string, signatureHeader: string | null): boolean {
  if (!WEBHOOK_SECRET || !signatureHeader) return false;

  const [scheme, signature] = signatureHeader.split('=');
  if (scheme !== 'sha256' || !signature) return false;

  const expected = createHmac('sha256', WEBHOOK_SECRET).update(body, 'utf8').digest('hex');

  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('X-Safra-Signature');

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
  }

  // TODO: Processar evento via Trigger.dev (Fase 1 produção)
  // Ex: disparo de sync de pedidos, atualizações de inventário, etc.
  //
  // Por enquanto, apenas loga e confirma o recebimento.
  const event = (payload as Record<string, unknown>).event ?? 'unknown';

  return NextResponse.json(
    {
      received: true,
      event,
      processedAt: new Date().toISOString(),
    },
    { status: 200 },
  );
}
