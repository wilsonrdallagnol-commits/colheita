// packages/jobs/src/jobs/embed-content.ts
//
// Jobs de re-indexação de embeddings para o Knowledge Base.
// Chamados quando um produto ou lição é criado/atualizado no admin.
//
// Fluxo:
// 1. Admin/API chama embedProdutoJob.trigger({ productId, tenantId })
// 2. Job busca os dados do produto/lição via Supabase service role
// 3. Gera chunks (nome, descrição, composição, aplicações)
// 4. Cria embeddings via VoyageEmbeddingProvider (ou OpenAI como fallback)
// 5. Faz upsert via SupabaseVectorRetriever
//
// VARIÁVEIS DE AMBIENTE necessárias:
// - SUPABASE_URL: URL do projeto Supabase
// - SUPABASE_SERVICE_ROLE_KEY: chave service role (bypass RLS)
// - VOYAGE_API_KEY ou OPENAI_API_KEY: provedor de embeddings

import type { AiChunk } from '@colheita/ai';
import {
  MockEmbeddingProvider,
  OpenAIEmbeddingProvider,
  SupabaseVectorRetriever,
  VoyageEmbeddingProvider,
} from '@colheita/ai';
import { task } from '@trigger.dev/sdk/v3';
import { z } from 'zod';
import { buildSupabaseAdmin } from '../lib/supabase-admin.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const buildSupabaseClient = buildSupabaseAdmin;

function buildEmbeddingProvider() {
  // Ordem de preferência: Voyage → OpenAI → Mock (apenas CI/dev sem keys)
  if (process.env.VOYAGE_API_KEY) {
    return new VoyageEmbeddingProvider();
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIEmbeddingProvider();
  }
  if (process.env.NODE_ENV === 'test' || process.env.CI) {
    return new MockEmbeddingProvider(1536);
  }
  throw new Error(
    'embed-content: nenhum provider de embedding configurado. ' +
      'Defina VOYAGE_API_KEY ou OPENAI_API_KEY.',
  );
}

// ── Produto ───────────────────────────────────────────────────────────────────

export const embedProdutoPayloadSchema = z.object({
  /** UUID do produto a indexar */
  productId: z.string().uuid(),
  /** Tenant do produto (para isolamento RLS) */
  tenantId: z.string().uuid(),
});

export type EmbedProdutoPayload = z.infer<typeof embedProdutoPayloadSchema>;

interface ProductRow {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  composition: {
    macros?: Record<string, number>;
    micros?: Record<string, number>;
    others?: Record<string, number>;
  } | null;
  applications: Array<{
    crop: string;
    stage?: string;
    dosePerHa: number;
    unit: string;
    notes?: string;
  }> | null;
}

function buildProductChunks(product: ProductRow, tenantId: string): AiChunk[] {
  const chunks: AiChunk[] = [];

  // Chunk 1: Nome + tagline
  const nameText = [product.name, product.tagline].filter(Boolean).join(' — ');
  if (nameText) {
    chunks.push({
      documentId: product.id,
      kind: 'product',
      chunkIndex: 0,
      text: nameText,
      metadata: { chunkType: 'name' },
      tenantId,
    });
  }

  // Chunk 2: Descrição completa
  if (product.description) {
    chunks.push({
      documentId: product.id,
      kind: 'product',
      chunkIndex: 1,
      text: product.description,
      metadata: { chunkType: 'description' },
      tenantId,
    });
  }

  // Chunk 3: Composição (se tiver dados)
  if (product.composition) {
    const parts: string[] = [];
    const { macros, micros, others } = product.composition;

    if (macros && Object.keys(macros).length > 0) {
      const macroStr = Object.entries(macros)
        .map(([k, v]) => `${k}: ${v}%`)
        .join(', ');
      parts.push(`Macronutrientes: ${macroStr}`);
    }
    if (micros && Object.keys(micros).length > 0) {
      const microStr = Object.entries(micros)
        .map(([k, v]) => `${k}: ${v}%`)
        .join(', ');
      parts.push(`Micronutrientes: ${microStr}`);
    }
    if (others && Object.keys(others).length > 0) {
      const otherStr = Object.entries(others)
        .map(([k, v]) => `${k}: ${v}%`)
        .join(', ');
      parts.push(`Outros: ${otherStr}`);
    }

    if (parts.length > 0) {
      chunks.push({
        documentId: product.id,
        kind: 'product',
        chunkIndex: 2,
        text: `Composição de ${product.name}: ${parts.join('. ')}`,
        metadata: { chunkType: 'composition' },
        tenantId,
      });
    }
  }

  // Chunk 4: Indicações por cultura (agregadas)
  if (product.applications && product.applications.length > 0) {
    const appText = product.applications
      .map(
        (app) =>
          `${app.crop}${app.stage ? ` (${app.stage})` : ''}: ${app.dosePerHa} ${app.unit}/ha${app.notes ? ` — ${app.notes}` : ''}`,
      )
      .join('; ');

    chunks.push({
      documentId: product.id,
      kind: 'product',
      chunkIndex: 3,
      text: `Indicações por cultura de ${product.name}: ${appText}`,
      metadata: { chunkType: 'application' },
      tenantId,
    });
  }

  return chunks;
}

export const embedProdutoJob = task({
  id: 'embed-produto',

  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 5_000,
    maxTimeoutInMs: 60_000,
    factor: 2,
    randomize: true,
  },

  run: async (rawPayload: unknown): Promise<{ chunksIndexed: number }> => {
    const { productId, tenantId } = embedProdutoPayloadSchema.parse(rawPayload);

    const supabase = buildSupabaseClient();
    const embeddingProvider = buildEmbeddingProvider();
    const retriever = new SupabaseVectorRetriever(supabase, embeddingProvider);

    // Busca dados do produto (inclui composição e indicações)
    const { data: product, error } = await supabase
      .from('products')
      .select('id, name, tagline, description, composition, applications')
      .eq('id', productId)
      .is('deleted_at', null)
      .single();

    if (error || !product) {
      throw new Error(
        `embed-produto: produto ${productId} não encontrado — ${error?.message ?? 'null'}`,
      );
    }

    const chunks = buildProductChunks(product as ProductRow, tenantId);

    if (chunks.length === 0) {
      return { chunksIndexed: 0 };
    }

    await retriever.index(chunks);
    return { chunksIndexed: chunks.length };
  },
});

// ── Lição ─────────────────────────────────────────────────────────────────────

export const embedLicaoPayloadSchema = z.object({
  /** UUID da lição a indexar */
  lessonId: z.string().uuid(),
  /** Tenant da lição */
  tenantId: z.string().uuid(),
});

export type EmbedLicaoPayload = z.infer<typeof embedLicaoPayloadSchema>;

interface LessonRow {
  id: string;
  title: string;
  content: Record<string, unknown> | null;
}

function extractLessonText(lesson: LessonRow): string {
  if (!lesson.content) return lesson.title;

  const content = lesson.content;
  const parts: string[] = [lesson.title];

  // Extrai texto do content jsonb (suporta artigo markdown e outros)
  if (content.type === 'article' && typeof content.body === 'string') {
    parts.push(content.body);
  } else if (typeof content.text === 'string') {
    parts.push(content.text);
  } else if (typeof content.description === 'string') {
    parts.push(content.description);
  }

  return parts.filter(Boolean).join('\n\n');
}

export const embedLicaoJob = task({
  id: 'embed-licao',

  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 5_000,
    maxTimeoutInMs: 60_000,
    factor: 2,
    randomize: true,
  },

  run: async (rawPayload: unknown): Promise<{ chunksIndexed: number }> => {
    const { lessonId, tenantId } = embedLicaoPayloadSchema.parse(rawPayload);

    const supabase = buildSupabaseClient();
    const embeddingProvider = buildEmbeddingProvider();
    const retriever = new SupabaseVectorRetriever(supabase, embeddingProvider);

    const { data: lesson, error } = await supabase
      .from('learning_lessons')
      .select('id, title, content')
      .eq('id', lessonId)
      .single();

    if (error || !lesson) {
      throw new Error(
        `embed-licao: lição ${lessonId} não encontrada — ${error?.message ?? 'null'}`,
      );
    }

    const text = extractLessonText(lesson as LessonRow);

    if (!text.trim()) {
      return { chunksIndexed: 0 };
    }

    const chunk: AiChunk = {
      documentId: lesson.id as string,
      kind: 'lesson',
      chunkIndex: 0,
      text,
      metadata: { chunkType: 'content' },
      tenantId,
    };

    await retriever.index([chunk]);
    return { chunksIndexed: 1 };
  },
});
