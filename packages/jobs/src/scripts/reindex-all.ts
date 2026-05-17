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

import {
  buildLessonChunk,
  buildProductChunks,
  type LessonRow,
  MockEmbeddingProvider,
  OpenAIEmbeddingProvider,
  type ProductRow,
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

// Chunk builders (buildProductChunks, buildLessonChunk) e tipos (ProductRow,
// LessonRow) agora vivem em @colheita/ai/indexing — compartilhados com o
// endpoint /api/admin/reindex do admin (DRY).

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
