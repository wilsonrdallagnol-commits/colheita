// apps/api/src/app/api/webhooks/whatsapp/route.ts
//
// Camada 10 (Integrações) — webhook receiver do WhatsApp Business Cloud API.
//
// Captura mensagens entrantes do WhatsApp Business da Argho e:
//   1. Se telefone bate com lead existente: registra lead_activity (kind='whatsapp')
//   2. Se telefone novo: cria lead com source='whatsapp', status='novo' + activity inicial
//   3. Resposta 200 OK em <5s (Meta exige) — processamento assincrono via service role
//
// Meta verifica o webhook via:
//   - GET com hub.verify_token query param (subscription validation)
//   - POST com X-Hub-Signature-256 header (sha256 HMAC do body)
//
// VARIAVEIS:
//   - WHATSAPP_VERIFY_TOKEN — string secreta cadastrada no Meta App dashboard
//   - WHATSAPP_APP_SECRET   — App Secret do Meta App (validar HMAC)
//   - WHATSAPP_TENANT_ID    — UUID do tenant Argho (qual tenant o lead capturado pertence)
//   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (criar lead bypassando RLS)
//
// SEM essas envs, o webhook fica em modo "ignore" (return 200 sem fazer nada) —
// evita loops de retry do Meta enquanto o setup nao esta completo em prod.

import crypto from 'node:crypto';
import { captureError } from '@colheita/observability';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { type NextRequest, NextResponse } from 'next/server';
import { hashPhone, phoneDigitsOnly } from '@/lib/whatsapp-phone';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── Rate limiter (fail-open sem Upstash) ─────────────────────────────────────

function buildLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    // Meta envia retries em rajada — 120/min por IP cobre operacao normal
    limiter: Ratelimit.slidingWindow(120, '1 m'),
    analytics: false,
    prefix: '@colheita/webhook-whatsapp',
  });
}

const limiter = buildLimiter();

// ── HMAC validation (X-Hub-Signature-256) ────────────────────────────────────
//
// Meta assina o body com sha256 do APP_SECRET. Header chega como:
//   X-Hub-Signature-256: sha256=<hex>
// Comparacao em tempo constante via crypto.timingSafeEqual.

function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) return false; // sem secret configurado, rejeita
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;

  const expectedHex = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
  const providedHex = signatureHeader.slice('sha256='.length);

  // Lengths devem bater pra timingSafeEqual nao throw
  if (expectedHex.length !== providedHex.length) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(expectedHex, 'hex'), Buffer.from(providedHex, 'hex'));
  } catch {
    return false;
  }
}

// ── GET — Meta subscription verification ─────────────────────────────────────
//
// Quando o webhook eh registrado no Meta App, eles fazem GET com:
//   ?hub.mode=subscribe&hub.verify_token=<token>&hub.challenge=<random>
// Devemos retornar o `hub.challenge` em texto puro pra validar.

export async function GET(request: NextRequest): Promise<NextResponse> {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!verifyToken) {
    return NextResponse.json({ error: 'WHATSAPP_VERIFY_TOKEN not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === verifyToken && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return NextResponse.json({ error: 'verification failed' }, { status: 403 });
}

// ── Tipos do payload Meta (subset usado) ─────────────────────────────────────

interface WaMessage {
  from: string; // E.164 sem +
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'interactive' | string;
  text?: { body: string };
  // ... outros tipos nao usados na v1
}

interface WaContact {
  wa_id: string;
  profile?: { name?: string };
}

interface WaValue {
  messaging_product: string;
  metadata: { display_phone_number: string; phone_number_id: string };
  contacts?: WaContact[];
  messages?: WaMessage[];
}

interface WaChange {
  value: WaValue;
  field: 'messages' | string;
}

interface WaEntry {
  id: string;
  changes: WaChange[];
}

interface WaPayload {
  object: 'whatsapp_business_account' | string;
  entry?: WaEntry[];
}

// ── Persistencia: cria lead OU adiciona activity ─────────────────────────────

// Service role client — tipo any pra schema dinamico (RLS bypass via service key).
// O webhook nao precisa de type-safety estrita do schema porque so faz INSERT/SELECT
// em 2 tabelas conhecidas. Reduz fricçao com generics complexos do supabase-js.
// biome-ignore lint/suspicious/noExplicitAny: service client com schema dinamico
type ServiceClient = SupabaseClient<any, any, any>;

async function processIncomingMessage({
  supabase,
  tenantId,
  message,
  contactName,
}: {
  supabase: ServiceClient;
  tenantId: string;
  message: WaMessage;
  contactName: string | undefined;
}): Promise<{ leadId: string; createdNew: boolean }> {
  const phone = message.from.startsWith('+') ? message.from : `+${message.from}`;
  const body =
    message.type === 'text' && message.text?.body
      ? message.text.body
      : `[${message.type}] (mensagem nao-textual recebida via WhatsApp)`;

  // 1. Tenta achar lead existente pelo telefone.
  // M1 fix 2026-05-09: match por E.164 completo normalizado (phone com/sem '+').
  // Fallback pros ultimos 11 digitos (DDI+DDD+8) reduz colisao vs slice(-9).
  const digits = phoneDigitsOnly(message.from);
  const phoneSuffix = digits.slice(-11);
  const { data: existing } = await supabase
    .from('leads')
    .select('id, phone')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .or(`phone.eq.${phone},phone.eq.${digits},phone.ilike.%${phoneSuffix}%`)
    .limit(1)
    .maybeSingle();

  let leadId = (existing?.id as string | undefined) ?? null;
  let createdNew = false;

  if (!leadId) {
    // Cria lead novo
    const { data: created, error: createErr } = await supabase
      .from('leads')
      .insert({
        tenant_id: tenantId,
        name: contactName?.trim() || `WhatsApp ${phone}`,
        phone,
        source: 'whatsapp',
        status: 'novo',
        notes: `Capturado via webhook WhatsApp em ${new Date().toLocaleString('pt-BR')}.`,
      })
      .select('id')
      .single();

    if (createErr || !created) {
      throw new Error(`failed to create lead: ${createErr?.message ?? 'no data'}`);
    }
    leadId = created.id as string;
    createdNew = true;
  }

  // 2. Registra activity (idempotente).
  // metadata NAO inclui contact_name pra reduzir PII em logs.
  // C1 (idempotencia): migration cria UNIQUE index em (metadata->>'message_id')
  // WHERE kind='whatsapp'. Postgres rejeita INSERT duplicado com codigo 23505.
  // Aqui tratamos 23505 como sucesso silencioso — retry do Meta nao duplica.
  const { error: insertErr } = await supabase.from('lead_activities').insert({
    tenant_id: tenantId,
    lead_id: leadId,
    kind: 'whatsapp',
    body,
    metadata: {
      message_id: message.id,
      message_type: message.type,
      timestamp: message.timestamp,
    },
  });

  if (insertErr && insertErr.code !== '23505') {
    // 23505 = unique_violation (Meta retry — esperado). Outros erros: propaga.
    throw new Error(`failed to insert lead_activity: ${insertErr.message}`);
  }

  return { leadId, createdNew };
}

// ── POST — incoming messages ─────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const tenantId = process.env.WHATSAPP_TENANT_ID;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Env incompleto — retorna 200 pra Meta nao retry indefinidamente
  if (!tenantId || !supabaseUrl || !serviceKey) {
    return NextResponse.json({ status: 'ignored', reason: 'env not configured' }, { status: 200 });
  }

  // Rate limit por IP (Meta envia rajadas em retries)
  if (limiter) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const result = await limiter.limit(`wa:${ip}`);
    if (!result.success) {
      return NextResponse.json({ error: 'rate limit' }, { status: 429 });
    }
  }

  // Le body raw pra HMAC ANTES do parse JSON (qualquer mudanca quebra hash)
  const rawBody = await request.text();
  const signatureHeader = request.headers.get('x-hub-signature-256');

  if (!verifyMetaSignature(rawBody, signatureHeader)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let payload: WaPayload;
  try {
    payload = JSON.parse(rawBody) as WaPayload;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (payload.object !== 'whatsapp_business_account' || !payload.entry) {
    // Outros eventos (status, templates, etc) — aceitamos sem processar
    return NextResponse.json({ status: 'noop' }, { status: 200 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let processed = 0;
  let createdNew = 0;

  for (const entry of payload.entry) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'messages') continue;
      const value = change.value;
      const contacts = value.contacts ?? [];
      const messages = value.messages ?? [];

      for (const message of messages) {
        const contact = contacts.find((c) => c.wa_id === message.from);
        try {
          const result = await processIncomingMessage({
            supabase,
            tenantId,
            message,
            contactName: contact?.profile?.name,
          });
          processed++;
          if (result.createdNew) createdNew++;
        } catch (err) {
          // Falha em 1 mensagem NAO derruba o webhook — Meta vai retry se 5xx.
          // PII (telefone) e hashed antes de ir pro Sentry (LGPD).
          captureError(err, {
            context: 'webhook.whatsapp.processMessage',
            messageId: message.id,
            phoneHash: hashPhone(message.from),
            messageType: message.type,
          });
        }
      }
    }
  }

  return NextResponse.json({ status: 'ok', processed, createdNew }, { status: 200 });
}
