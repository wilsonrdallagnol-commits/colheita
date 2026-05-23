// apps/portal/src/app/api/agent/ask/route.ts
//
// Endpoint do agente agronômico do PORTAL — distribuidor logado.
// Espelha apps/admin/src/app/api/agent/ask/route.ts mas com:
//   - Rate limit mais restrito (10/min vs 15/min do admin)
//   - SystemHint customizado pro contexto distribuidor (não admin Argho)
//   - Tabela conversation_logs com flag source='portal'
//
// Streaming via SSE pra UI mostrar token por token.

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

// Portal: 10 req/min/user (distribuidor é uso mais esporádico que admin)
const agentRateLimiter = buildRateLimiter({
  prefix: '@colheita/portal/agent',
  limit: 10,
  window: '1 m',
});

// Pipeline singleton cold-start safe
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
      .slice(-10)
      .map((h) => ({ role: h.role, content: h.content.slice(0, 4000) }));
  }
  return result;
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth(cookieStore);
  } catch {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const rate = await checkRateLimit(agentRateLimiter, `portal-agent:${user.id}`);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'Muitas perguntas em sequência. Aguarde alguns segundos.' },
      { status: 429, headers: rateLimitHeaders(rate) },
    );
  }

  const supabase = createServerClient(cookieStore);
  const { data: userRow } = await supabase
    .from('users')
    .select('tenant_id, full_name')
    .eq('id', user.id)
    .maybeSingle();

  const tenantId = userRow?.tenant_id as string | undefined;
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant não associado ao usuário.' }, { status: 403 });
  }

  let body: AskBody | null = null;
  try {
    body = validateBody(await request.json());
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }
  if (!body) {
    return NextResponse.json(
      { error: 'Pergunta vazia ou muito longa (máx 1000 chars).' },
      { status: 400 },
    );
  }

  // System hint distribuidor: contexto operacional + identifica origem portal
  // pra system prompt usar tom mais direto (recomendação acionável em campo).
  const userName = (userRow?.full_name as string | undefined) ?? 'distribuidor';
  const contextParts = [
    `Você está atendendo um ${userName === 'distribuidor' ? 'distribuidor Argho' : userName} via Plataforma Colheita (portal externo, não admin interno).`,
    'Foco em recomendação acionável: dose por hectare conforme rótulo, janela fenológica, compatibilidade de calda, ordem de mistura quando aplicável.',
    body.contextPath
      ? `O distribuidor está navegando em ${body.contextPath}. Considere isso ao responder.`
      : null,
  ].filter(Boolean);
  const contextHint = contextParts.join(' ');

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
        // Distinguir origem portal vs admin em conversation_logs - útil
        // pra analytics ("quais perguntas dos distribuidores na semana?")
        source: 'portal',
      });
    } catch (logErr) {
      captureError(logErr instanceof Error ? logErr : new Error(String(logErr)), {
        context: 'portal.api.agent.ask.persistTurn',
      });
    }
  }

  const encoder = new TextEncoder();
  // FIX MÉDIO #9 (auditoria): listen request.signal pra abortar
  // geração quando cliente desconectar (tab fechada / nav). Sem isso,
  // Anthropic continuava streamando tokens órfãos = $ desperdiçado +
  // função Vercel ocupada até maxDuration. Verifica abort no inicio
  // de cada iteração do generator + cancel() final do ReadableStream
  // pra cleanup.
  const aborted = { value: false };
  const onAbort = () => {
    aborted.value = true;
  };
  request.signal.addEventListener('abort', onAbort, { once: true });

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
          // Early-exit se cliente desconectou. Próxima chamada do Anthropic
          // SDK pode continuar 1 iteração, mas paramos de enfileirar e
          // o GC limpa o generator quando for await sai do escopo.
          if (aborted.value) break;

          const ev = event as { type?: string; text?: string; sources?: unknown[] };
          if (ev.type === 'delta' && typeof ev.text === 'string') {
            accumulatedAnswer += ev.text;
          } else if (ev.type === 'done' && Array.isArray(ev.sources)) {
            accumulatedSources = ev.sources;
          }
          const payload = `data: ${JSON.stringify(event)}\n\n`;
          try {
            controller.enqueue(encoder.encode(payload));
          } catch {
            // Controller já fechado — sai do loop limpo
            aborted.value = true;
            break;
          }
        }

        if (!aborted.value) {
          controller.enqueue(encoder.encode('event: end\ndata: {}\n\n'));
        }
        controller.close();
        // Persiste mesmo em abort — agronomo vê pergunta parcial nos logs
        await persistTurn(aborted.value ? 'error' : 'ok');
      } catch (err) {
        if (aborted.value) {
          // Erro post-abort é esperado (Anthropic stream interrompida)
          controller.close();
          await persistTurn('error');
          return;
        }
        captureError(err instanceof Error ? err : new Error(String(err)), {
          context: 'portal.api.agent.ask',
        });
        const errorPayload = JSON.stringify({
          type: 'error',
          message: 'Falha ao processar a pergunta. Tente de novo.',
          detail: err instanceof Error ? err.message : String(err),
        });
        try {
          controller.enqueue(encoder.encode(`event: error\ndata: ${errorPayload}\n\n`));
        } catch {
          // controller fechado
        }
        controller.close();
        await persistTurn('error');
      } finally {
        request.signal.removeEventListener('abort', onAbort);
      }
    },
    cancel() {
      // ReadableStream cancel (cliente fecha conexão SSE) — marca abort
      // pra próxima iteração do generator sair do loop.
      aborted.value = true;
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
