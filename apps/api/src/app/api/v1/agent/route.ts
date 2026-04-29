// apps/api/src/app/api/v1/agent/route.ts
/**
 * POST /api/v1/agent
 *
 * Endpoint RAG: responde perguntas sobre o catálogo de produtos e trilhas de
 * aprendizado usando @colheita/ai (BM25 + Claude Haiku).
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
 *   400 — body inválido
 *   500 — erro interno
 */

import type { AiDocument, DocumentKind } from '@colheita/ai';
import { AiGenerator, BM25InMemoryRetriever, chunkDocuments, RagPipeline } from '@colheita/ai';
import { createServerClient, requireAuth } from '@colheita/auth';
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
// Request schema
// ============================================================================

const AgentRequestSchema = z.object({
  query: z.string().min(1).max(500),
  kinds: z.array(z.enum(['product', 'lesson', 'category', 'track', 'certification'])).optional(),
  topK: z.number().int().min(1).max(10).default(5),
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

  // 2. Parse do body
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

  const { query, kinds, topK } = parsed.data;

  // 3. Busca documentos do tenant
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

  // 4. Chunk + Index + Retrieve + Generate
  try {
    const chunks = chunkDocuments(docs, { targetChunkChars: 600, overlapChars: 80 });

    const retriever = new BM25InMemoryRetriever();
    await retriever.index(chunks);

    const generator = new AiGenerator();
    const pipeline = new RagPipeline(retriever, generator, { topK, minScore: 0.05 });

    const answer = await pipeline.ask({ query, tenantId, kinds });

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
