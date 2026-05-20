// apps/admin/src/app/api/agent/ask/route.ts
//
// Endpoint do AgentDock — recebe query do user logado e retorna resposta
// do agente agronomico Argho via RAG (pgvector + Claude Sonnet).
//
// Streaming via Server-Sent Events (text/event-stream) pra UI mostrar token
// por token sem timeout.

import {
  AiGenerator,
  OpenAIEmbeddingProvider,
  RagPipeline,
  SupabaseVectorRetriever,
  VoyageEmbeddingProvider,
} from '@colheita/ai';
import { createAdminClient, createServerClient, requireAuth } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { buildRateLimiter, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── Rate limit (15 req/min/user, fail-open sem Upstash) ─────────────────────
// Reusa helper compartilhado (warn no Sentry em prod sem Upstash, headers
// X-RateLimit-* + Retry-After). 15 req/min eh generoso pra chat humano mas
// barra bot/loop client-side queimando creditos Anthropic.

const agentRateLimiter = buildRateLimiter({
  prefix: '@colheita/admin/agent',
  limit: 15,
  window: '1 m',
});

// ── Pipeline singleton (cold-start safe) ────────────────────────────────────

let pipelineCache: RagPipeline | null = null;

function getPipeline() {
  if (pipelineCache) return pipelineCache;

  const admin = createAdminClient();
  const provider = process.env.VOYAGE_API_KEY
    ? new VoyageEmbeddingProvider()
    : new OpenAIEmbeddingProvider();

  const retriever = new SupabaseVectorRetriever(admin, provider);
  const generator = new AiGenerator();

  pipelineCache = new RagPipeline(retriever, generator, {
    topK: 6,
    minScore: 0.05,
    maxTokens: 800,
  });

  return pipelineCache;
}

// ── Validation helpers ──────────────────────────────────────────────────────

interface AskBody {
  query: string;
  contextPath?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

function validateBody(raw: unknown): AskBody | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  const query = obj.query;
  if (typeof query !== 'string' || query.trim().length === 0) return null;
  if (query.length > 1000) return null;

  const result: AskBody = { query: query.trim() };
  if (typeof obj.contextPath === 'string') {
    result.contextPath = obj.contextPath.slice(0, 200);
  }
  if (Array.isArray(obj.history)) {
    result.history = obj.history
      .filter(
        (h): h is { role: 'user' | 'assistant'; content: string } =>
          typeof h === 'object' &&
          h !== null &&
          ((h as { role?: unknown }).role === 'user' ||
            (h as { role?: unknown }).role === 'assistant') &&
          typeof (h as { content?: unknown }).content === 'string',
      )
      .slice(-10) // Últimos 10 turnos
      .map((h) => ({
        role: h.role,
        content: h.content.slice(0, 4000),
      }));
  }
  return result;
}

// ── POST handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth(cookieStore);
  } catch {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  // Rate limit por user (Claude API custa, vision custa mais — protege custos).
  // Headers X-RateLimit-* incluidos pra UI mostrar progresso futuramente.
  const rate = await checkRateLimit(agentRateLimiter, `agent:${user.id}`);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'Muitas perguntas em sequência. Aguarde alguns segundos.' },
      { status: 429, headers: rateLimitHeaders(rate) },
    );
  }

  const supabase = createServerClient(cookieStore);
  const { data: userRow } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle();

  const tenantId = userRow?.tenant_id as string | undefined;
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant não associado ao usuário.' }, { status: 403 });
  }

  let body: AskBody | null = null;
  try {
    const raw = await request.json();
    body = validateBody(raw);
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  if (!body) {
    return NextResponse.json(
      { error: 'Pergunta vazia ou muito longa (máx 1000 chars).' },
      { status: 400 },
    );
  }

  // System hint baseado no contexto da rota (page-aware agent)
  const contextHint = body.contextPath
    ? `O usuário está navegando em ${body.contextPath}. Considere isso ao responder.`
    : undefined;

  // Persistencia em conversation_logs — feita via service role pra bypassar
  // RLS (INSERT). Acumula resposta + sources durante o stream, grava no fim.
  // Falha de log NUNCA derruba a resposta ao user (best-effort).
  const adminClient = createAdminClient();
  const turnStartedAt = Date.now();
  let accumulatedAnswer = '';
  let accumulatedSources: unknown[] = [];

  async function persistTurn(status: 'ok' | 'error') {
    try {
      await adminClient.from('conversation_logs').insert({
        tenant_id: tenantId,
        user_id: user.id,
        query: body?.query ?? '',
        answer: accumulatedAnswer.slice(0, 16_000),
        context_path: body?.contextPath ?? null,
        sources: accumulatedSources.slice(0, 20),
        duration_ms: Date.now() - turnStartedAt,
        status,
      });
    } catch (logErr) {
      captureError(logErr instanceof Error ? logErr : new Error(String(logErr)), {
        context: 'admin.api.agent.ask.persistTurn',
      });
    }
  }

  // Stream response via SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const pipeline = getPipeline();
        const events = pipeline.askStream({
          query: body.query,
          tenantId,
          systemHint: contextHint,
          conversationHistory: body.history,
        });

        for await (const event of events) {
          // Acumula pra persistencia (sem alterar o que vai pro client).
          // Contrato do AiStreamEvent (packages/ai/src/types.ts):
          //   { type: 'delta', text } | { type: 'done', sources, usage }
          const ev = event as { type?: string; text?: string; sources?: unknown[] };
          if (ev.type === 'delta' && typeof ev.text === 'string') {
            accumulatedAnswer += ev.text;
          } else if (ev.type === 'done' && Array.isArray(ev.sources)) {
            accumulatedSources = ev.sources;
          }
          const payload = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        }

        controller.enqueue(encoder.encode('event: end\ndata: {}\n\n'));
        controller.close();
        await persistTurn('ok');
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), {
          context: 'admin.api.agent.ask',
        });
        // `detail` traz a mensagem real do erro — admin endpoint, ajuda
        // diagnóstico em prod. UI usa só `message` (genérica) no display.
        const errorPayload = JSON.stringify({
          type: 'error',
          message: 'Falha ao processar a pergunta. Tente de novo.',
          detail: err instanceof Error ? err.message : String(err),
        });
        controller.enqueue(encoder.encode(`event: error\ndata: ${errorPayload}\n\n`));
        controller.close();
        await persistTurn('error');
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
