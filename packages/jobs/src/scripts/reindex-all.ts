#!/usr/bin/env tsx

/**
 * Reindex de embeddings — indexa TODOS os produtos e lições de TODOS os tenants.
 *
 * Uso: pnpm --filter @colheita/jobs reindex-all
 * Alias raiz: pnpm embed:reindex
 *
 * Requerimentos:
 *   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *   VOYAGE_API_KEY ou OPENAI_API_KEY
 *
 * Idempotente: upsert por (product_id|lesson_id, chunk_type).
 * Adequado para primeira indexação pós-deploy ou re-indexação total após troca de modelo.
 */

import type { AiChunk } from '@colheita/ai';
import {
  MockEmbeddingProvider,
  OpenAIEmbeddingProvider,
  SupabaseVectorRetriever,
  VoyageEmbeddingProvider,
} from '@colheita/ai';
import { createClient } from '@supabase/supabase-js';

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌  SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.');
  process.exit(1);
}

function buildEmbeddingProvider() {
  if (process.env.VOYAGE_API_KEY) {
    console.log('📡  Usando VoyageEmbeddingProvider (voyage-3-lite)');
    return new VoyageEmbeddingProvider();
  }
  if (process.env.OPENAI_API_KEY) {
    console.log('📡  Usando OpenAIEmbeddingProvider (text-embedding-3-small)');
    return new OpenAIEmbeddingProvider();
  }
  if (process.env.NODE_ENV === 'test' || process.env.CI) {
    console.log('📡  Usando MockEmbeddingProvider (CI/test)');
    return new MockEmbeddingProvider(1536);
  }
  console.error(
    '❌  Nenhum provider de embedding configurado. Configure VOYAGE_API_KEY ou OPENAI_API_KEY.',
  );
  process.exit(1);
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProductRow {
  id: string;
  tenant_id: string;
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

interface LessonRow {
  id: string;
  tenant_id: string;
  title: string;
  content: Record<string, unknown> | null;
}

// ── Chunk builders ────────────────────────────────────────────────────────────

function buildProductChunks(product: ProductRow): AiChunk[] {
  const chunks: AiChunk[] = [];
  const { id, tenant_id } = product;

  const nameText = [product.name, product.tagline].filter(Boolean).join(' — ');
  if (nameText) {
    chunks.push({
      documentId: id,
      kind: 'product',
      chunkIndex: 0,
      text: nameText,
      metadata: { chunkType: 'name' },
      tenantId: tenant_id,
    });
  }

  if (product.description) {
    chunks.push({
      documentId: id,
      kind: 'product',
      chunkIndex: 1,
      text: product.description,
      metadata: { chunkType: 'description' },
      tenantId: tenant_id,
    });
  }

  if (product.composition) {
    const parts: string[] = [];
    const { macros, micros, others } = product.composition;
    if (macros && Object.keys(macros).length > 0) {
      parts.push(
        `Macronutrientes: ${Object.entries(macros)
          .map(([k, v]) => `${k}: ${v}%`)
          .join(', ')}`,
      );
    }
    if (micros && Object.keys(micros).length > 0) {
      parts.push(
        `Micronutrientes: ${Object.entries(micros)
          .map(([k, v]) => `${k}: ${v}%`)
          .join(', ')}`,
      );
    }
    if (others && Object.keys(others).length > 0) {
      parts.push(
        `Outros: ${Object.entries(others)
          .map(([k, v]) => `${k}: ${v}%`)
          .join(', ')}`,
      );
    }
    if (parts.length > 0) {
      chunks.push({
        documentId: id,
        kind: 'product',
        chunkIndex: 2,
        text: `Composição de ${product.name}: ${parts.join('. ')}`,
        metadata: { chunkType: 'composition' },
        tenantId: tenant_id,
      });
    }
  }

  if (product.applications && product.applications.length > 0) {
    const appText = product.applications
      .map(
        (app) =>
          `${app.crop}${app.stage ? ` (${app.stage})` : ''}: ${app.dosePerHa} ${app.unit}/ha${app.notes ? ` — ${app.notes}` : ''}`,
      )
      .join('; ');
    chunks.push({
      documentId: id,
      kind: 'product',
      chunkIndex: 3,
      text: `Indicações por cultura de ${product.name}: ${appText}`,
      metadata: { chunkType: 'application' },
      tenantId: tenant_id,
    });
  }

  return chunks;
}

function buildLessonChunk(lesson: LessonRow): AiChunk {
  const parts: string[] = [lesson.title];
  if (lesson.content) {
    const c = lesson.content;
    if (c.type === 'article' && typeof c.body === 'string') parts.push(c.body);
    else if (typeof c.text === 'string') parts.push(c.text);
    else if (typeof c.description === 'string') parts.push(c.description);
  }
  return {
    documentId: lesson.id,
    kind: 'lesson',
    chunkIndex: 0,
    text: parts.filter(Boolean).join('\n\n'),
    metadata: { chunkType: 'content' },
    tenantId: lesson.tenant_id,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const embeddingProvider = buildEmbeddingProvider();
  const retriever = new SupabaseVectorRetriever(supabase, embeddingProvider);

  // ── Produtos ────────────────────────────────────────────────────────────────
  console.log('\n🔍  Buscando produtos...');
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, tenant_id, name, tagline, description, composition, applications')
    .is('deleted_at', null)
    .order('name');

  if (prodErr) {
    console.error('❌  Erro ao buscar produtos:', prodErr.message);
    process.exit(1);
  }

  const productChunks = (products ?? []).flatMap((p) => buildProductChunks(p as ProductRow));
  console.log(`   ${products?.length ?? 0} produtos → ${productChunks.length} chunks`);

  if (productChunks.length > 0) {
    console.log('   Indexando produtos...');
    await retriever.index(productChunks);
    console.log('   ✅  Produtos indexados');
  }

  // ── Lições ──────────────────────────────────────────────────────────────────
  console.log('\n🔍  Buscando lições...');
  const { data: lessons, error: lessErr } = await supabase
    .from('learning_lessons')
    .select('id, tenant_id, title, content')
    .order('title');

  if (lessErr) {
    console.error('❌  Erro ao buscar lições:', lessErr.message);
    process.exit(1);
  }

  const lessonChunks = (lessons ?? [])
    .map((l) => buildLessonChunk(l as LessonRow))
    .filter((chunk) => chunk.text.trim().length > 0);
  console.log(`   ${lessons?.length ?? 0} lições → ${lessonChunks.length} chunks`);

  if (lessonChunks.length > 0) {
    console.log('   Indexando lições...');
    await retriever.index(lessonChunks);
    console.log('   ✅  Lições indexadas');
  }

  // ── Resumo ───────────────────────────────────────────────────────────────────
  const totalChunks = productChunks.length + lessonChunks.length;
  console.log(`\n✅  Reindex concluído — ${totalChunks} chunks indexados no pgvector.\n`);
}

run().catch((err) => {
  console.error('❌  Reindex falhou:', err);
  process.exit(1);
});
