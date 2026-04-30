// apps/api/src/app/api/v1/agent/route.ts
/**
 * POST /api/v1/agent
 *
 * Endpoint RAG: responde perguntas sobre o catálogo de produtos e trilhas de
 * aprendizado usando @colheita/ai.
 *
 * Retriever strategy (auto-seleção):
 * - Produção: SupabaseVectorRetriever (pgvector HNSW) quando VOYAGE_API_KEY ou OPENAI_API_KEY
 *   estiver configurado + SUPABASE_SERVICE_ROLE_KEY.
 * - Fallback: BM25InMemoryRetriever para dev/CI sem keys de embedding.
 *
 * Rate limiting (sliding window):
 * - 10 req/min por usuário quando UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN estão set.
 * - Fail-open: sem Upstash configurado, nenhum limite é aplicado (dev/CI).
 *
 * Requer autenticação (cookie de sessão ou Bearer token).
 * O tenant_id é extraído da sessão autenticada.
 *
 * Request body:
 *   { query: string, kinds?: DocumentKind[], topK?: number }
 *
 * Response 200:
 *   { answer: string, sources: AiChunk[], usage: { inputTokens, outputTokens } }
 *
 * Errors:
 *   401 — não autenticado
 *   429 — rate limit excedido
 *   400 — body inválido
 *   500 — erro interno
 */

import type {
  AiDocument,
  AiStreamEvent,
  ConversationTurn,
  DocumentKind,
  Retriever,
} from '@colheita/ai';
import {
  AiGenerator,
  BM25InMemoryRetriever,
  chunkDocuments,
  MockEmbeddingProvider,
  OpenAIEmbeddingProvider,
  RagPipeline,
  SupabaseVectorRetriever,
  VoyageEmbeddingProvider,
} from '@colheita/ai';
import { createServerClient, requireAuth } from '@colheita/auth';
import { createClient as createSupabaseServiceClient } from '@supabase/supabase-js';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ============================================================================
// Rate limiter — sliding window 10 req/min por usuário (fail-open sem Upstash)
// ============================================================================

/**
 * Retorna um `Ratelimit` configurado quando as env vars do Upstash estiverem
 * presentes; caso contrário retorna `null` (sem rate limiting — dev/CI).
 */
function buildRateLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: false,
    prefix: '@colheita/agent',
  });
}

const rateLimiter = buildRateLimiter();

// ============================================================================
// Retriever factory — auto-seleciona pgvector ou BM25 conforme env vars
// ============================================================================

/**
 * Retorna `SupabaseVectorRetriever` (pgvector) quando as env vars de embedding
 * e de service role estiverem configuradas; caso contrário, retorna `null`
 * e o caller deve usar BM25 com documentos em memória.
 */
function buildVectorRetriever(): Retriever | null {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  let embeddingProvider:
    | InstanceType<typeof VoyageEmbeddingProvider>
    | InstanceType<typeof OpenAIEmbeddingProvider>
    | InstanceType<typeof MockEmbeddingProvider>;

  if (process.env.VOYAGE_API_KEY) {
    embeddingProvider = new VoyageEmbeddingProvider();
  } else if (process.env.OPENAI_API_KEY) {
    embeddingProvider = new OpenAIEmbeddingProvider();
  } else if (process.env.NODE_ENV === 'test' || process.env.CI) {
    embeddingProvider = new MockEmbeddingProvider(1536);
  } else {
    return null;
  }

  const supabase = createSupabaseServiceClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return new SupabaseVectorRetriever(supabase, embeddingProvider);
}

// ============================================================================
// Request schema
// ============================================================================

const ConversationTurnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(4000),
});

const AgentRequestSchema = z.object({
  query: z.string().min(1).max(500),
  kinds: z.array(z.enum(['product', 'lesson', 'category', 'track', 'certification'])).optional(),
  topK: z.number().int().min(1).max(10).default(5),
  /** Histórico de até 10 turnos de conversa para suporte multi-turn */
  conversationHistory: z.array(ConversationTurnSchema).max(10).optional(),
  /** Se true, retorna SSE stream (text/event-stream) em vez de JSON */
  stream: z.boolean().default(false),
});

// ============================================================================
// Data fetching — busca catálogo do tenant para indexação
// ============================================================================

async function fetchTenantDocuments(
  supabase: ReturnType<typeof createServerClient>,
  tenantId: string,
  kinds?: DocumentKind[],
): Promise<AiDocument[]> {
  const docs: AiDocument[] = [];
  const includeProducts = !kinds || kinds.includes('product');
  const includeLessons = !kinds || kinds.includes('lesson') || kinds.includes('track');

  // Busca produtos publicados
  if (includeProducts) {
    const { data: products } = await supabase
      .from('products')
      .select(
        'id, slug, name, tagline, description, composition, technical_specs, packaging, applications',
      )
      .eq('tenant_id', tenantId)
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('name');

    for (const p of products ?? []) {
      // Monta texto do produto de forma estruturada
      const lines: string[] = [`Produto: ${p.name}`];
      if (p.tagline) lines.push(`Tagline: ${p.tagline}`);
      if (p.description) lines.push(`Descrição: ${p.description}`);

      const comp = p.composition as Record<string, unknown> | null;
      if (comp && typeof comp === 'object') {
        const parts = Object.entries(comp)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        if (parts) lines.push(`Composição: ${parts}`);
      }

      const specs = p.technical_specs as Record<string, unknown> | null;
      if (specs && typeof specs === 'object') {
        const parts = Object.entries(specs)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' | ');
        if (parts) lines.push(`Especificações técnicas: ${parts}`);
      }

      const applications = p.applications as
        | { culture?: string; dose?: string; stage?: string; notes?: string }[]
        | null;
      if (Array.isArray(applications) && applications.length > 0) {
        const appText = applications
          .map((a) => {
            const parts = [a.culture, a.stage, a.dose ? `dose ${a.dose}` : null, a.notes]
              .filter(Boolean)
              .join(', ');
            return parts;
          })
          .filter(Boolean)
          .join('; ');
        if (appText) lines.push(`Indicações por cultura: ${appText}`);
      }

      docs.push({
        id: p.id,
        kind: 'product',
        title: p.name,
        content: lines.join('\n'),
        metadata: { slug: p.slug },
        tenantId,
      });
    }
  }

  // Busca lições publicadas (via trilhas publicadas)
  if (includeLessons) {
    const { data: lessons } = await supabase
      .from('learning_lessons')
      .select(
        `id, title, content, content_type,
         module:learning_modules!inner(
           id, title,
           track:learning_tracks!inner(id, title, status, tenant_id)
         )`,
      )
      .eq('learning_modules.learning_tracks.tenant_id', tenantId)
      .eq('learning_modules.learning_tracks.status', 'published')
      .is('deleted_at', null)
      .order('sort_order');

    for (const lesson of lessons ?? []) {
      const mod = Array.isArray(lesson.module) ? lesson.module[0] : lesson.module;
      const track = mod ? (Array.isArray(mod.track) ? mod.track[0] : mod.track) : null;

      const trackTitle = (track as { title?: string } | null)?.title ?? 'Trilha';
      const modTitle = (mod as { title?: string } | null)?.title ?? 'Módulo';

      const content =
        typeof lesson.content === 'string' ? lesson.content : JSON.stringify(lesson.content ?? '');

      docs.push({
        id: lesson.id,
        kind: 'lesson',
        title: lesson.title,
        content: `[${trackTitle} > ${modTitle}]\n${lesson.title}\n\n${content}`,
        metadata: { trackTitle, modTitle },
        tenantId,
      });
    }
  }

  return docs;
}

// ============================================================================
// Route handler
// ============================================================================

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  // 1. Autenticação
  let session: Awaited<ReturnType<typeof requireAuth>>;
  try {
    session = await requireAuth(cookieStore);
  } catch {
    return NextResponse.json(
      { error: 'Autenticação necessária.' },
      { status: 401, headers: CORS_HEADERS },
    );
  }

  const tenantId = session.user_metadata?.tenant_id as string | undefined;
  if (!tenantId) {
    return NextResponse.json(
      { error: 'Tenant não identificado na sessão.' },
      { status: 401, headers: CORS_HEADERS },
    );
  }

  // 2. Rate limiting (fail-open: sem Upstash configurado, segue sem limitar)
  if (rateLimiter) {
    const userId = session.id;
    try {
      const { success, limit, remaining, reset } = await rateLimiter.limit(userId);
      if (!success) {
        const retryAfterSecs = Math.ceil((reset - Date.now()) / 1000);
        return NextResponse.json(
          { error: 'Muitas requisições. Aguarde um momento e tente novamente.' },
          {
            status: 429,
            headers: {
              ...CORS_HEADERS,
              'Retry-After': String(retryAfterSecs > 0 ? retryAfterSecs : 60),
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': String(remaining),
              'X-RateLimit-Reset': String(reset),
            },
          },
        );
      }
    } catch {
      // Falha no Redis → fail-open (não bloqueia requisição)
    }
  }

  // 3. Parse do body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Body inválido (esperado JSON).' },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const parsed = AgentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos.', details: parsed.error.issues },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const { query, kinds, topK, conversationHistory, stream: wantsStream } = parsed.data;

  // 5. Setup retriever — preferência: pgvector; fallback: BM25 em memória
  const vectorRetriever = buildVectorRetriever();

  // 6. Setup pipeline
  let pipeline: RagPipeline;
  try {
    let retriever: Retriever;

    if (vectorRetriever) {
      // Produção: usa pgvector — não precisa buscar nem indexar documentos em memória
      retriever = vectorRetriever;
    } else {
      // Dev/CI: busca catálogo, chunka e indexa em memória com BM25
      const supabase = createServerClient(cookieStore);
      const docs = await fetchTenantDocuments(supabase, tenantId, kinds);

      if (docs.length === 0) {
        return NextResponse.json(
          {
            answer: 'Não encontrei informações disponíveis para responder sua pergunta.',
            sources: [],
            usage: { inputTokens: 0, outputTokens: 0 },
          },
          { status: 200, headers: CORS_HEADERS },
        );
      }

      const chunks = chunkDocuments(docs, { targetChunkChars: 600, overlapChars: 80 });
      const bm25 = new BM25InMemoryRetriever();
      await bm25.index(chunks);
      retriever = bm25;
    }

    const generator = new AiGenerator();
    pipeline = new RagPipeline(retriever, generator, { topK, minScore: 0.05 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido.';
    return NextResponse.json(
      {
        error: 'Erro ao processar pergunta.',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }

  const askInput = {
    query,
    tenantId,
    kinds,
    conversationHistory: conversationHistory as ConversationTurn[] | undefined,
  };

  // ── 5a. Streaming (SSE) ────────────────────────────────────────────────────
  if (wantsStream) {
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        function send(event: AiStreamEvent) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
        try {
          for await (const event of pipeline.askStream(askInput)) {
            send(event);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro desconhecido.';
          send({
            type: 'done',
            sources: [],
            usage: { inputTokens: 0, outputTokens: 0 },
          });
          void message; // erro registrado implicitamente pelo runtime Next.js
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  }

  // ── 5b. JSON (non-streaming) ───────────────────────────────────────────────
  try {
    const answer = await pipeline.ask(askInput);

    return NextResponse.json(
      {
        answer: answer.text,
        sources: answer.sources.map((s) => ({
          documentId: s.documentId,
          kind: s.kind,
          chunkIndex: s.chunkIndex,
          metadata: s.metadata,
        })),
        usage: answer.usage,
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido.';
    return NextResponse.json(
      {
        error: 'Erro ao processar pergunta.',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
