// packages/ai/src/vector-retriever.ts
/**
 * SupabaseVectorRetriever — retriever de produção via pgvector.
 *
 * Armazena embeddings nas tabelas `product_embeddings` e `lesson_embeddings`
 * e usa as funções SQL `match_product_embeddings` / `match_lesson_embeddings`
 * para busca por similaridade coseno (HNSW index).
 *
 * Injeção de dependência de embedding:
 * - Aceita qualquer `EmbeddingProvider` — não força OpenAI ou Voyage.
 * - Implementações disponíveis em apps (não aqui) para separar key mgmt.
 *
 * Diferenças do BM25InMemoryRetriever:
 * - Persiste embeddings no banco (upsert idempotente por chunk_type)
 * - Busca semântica (não lexical) — captura sinônimos e variações
 * - Requer API de embedding externa (custo adicional: ~$0.01/1M tokens)
 * - Para produção com >10k chunks ou busca multi-idioma
 */

import type { AiChunk, RetrievalQuery, RetrievalResult, Retriever } from './types.js';

// ============================================================================
// EmbeddingProvider — interface de abstração do modelo de embedding
// ============================================================================

/**
 * Provedor de embeddings. Implementar para cada modelo:
 * - OpenAI: embed via @ai-sdk/openai + embedMany()
 * - Voyage: embed via voyage-ai SDK (recomendado com Claude)
 * - Local: sentence-transformers (para testes sem API)
 */
export interface EmbeddingProvider {
  /**
   * Gera o vetor de embedding para um texto.
   * @param text Texto de até 8192 tokens (depende do modelo)
   * @returns Vetor de floats com dimensão `dimensions`
   */
  embed(text: string): Promise<number[]>;

  /**
   * Dimensão do vetor. Deve corresponder à coluna `embedding` no banco.
   * Padrão: 1536 (text-embedding-3-small / Voyage-3-lite)
   */
  readonly dimensions: number;

  /**
   * Identificador do modelo (para logging e detecção de desatualização).
   */
  readonly modelId: string;
}

// ============================================================================
// Tipos de resultado das funções SQL
// ============================================================================

interface MatchProductRow {
  product_id: string;
  chunk_text: string;
  chunk_type: string;
  similarity: number;
}

interface MatchLessonRow {
  lesson_id: string;
  chunk_text: string;
  chunk_type: string;
  similarity: number;
}

// ============================================================================
// SupabaseVectorRetriever
// ============================================================================

// Supabase client shape (mínimo necessário para evitar dependência de @supabase/supabase-js)
interface MinimalSupabaseClient {
  // biome-ignore lint/suspicious/noExplicitAny: API dinâmica do Supabase
  from(table: string): any;
  // biome-ignore lint/suspicious/noExplicitAny: RPC params variados por função
  rpc(fn: string, params?: Record<string, unknown>): any;
}

export class SupabaseVectorRetriever implements Retriever {
  constructor(
    private readonly supabase: MinimalSupabaseClient,
    private readonly embeddingProvider: EmbeddingProvider,
  ) {}

  // ── index ────────────────────────────────────────────────────────────────

  /**
   * Indexa chunks gerando embeddings e fazendo upsert nas tabelas do banco.
   * Apenas 'product' e 'lesson' são suportados — outros kinds são ignorados.
   * O upsert é idempotente por (product_id | lesson_id, chunk_type).
   */
  async index(chunks: AiChunk[]): Promise<void> {
    // Agrupa por kind para batch paralelo
    const productChunks = chunks.filter((c) => c.kind === 'product');
    const lessonChunks = chunks.filter((c) => c.kind === 'lesson');

    await Promise.all([
      this.indexProductChunks(productChunks),
      this.indexLessonChunks(lessonChunks),
    ]);
  }

  private async indexProductChunks(chunks: AiChunk[]): Promise<void> {
    if (chunks.length === 0) return;

    const rows = await Promise.all(
      chunks.map(async (chunk) => ({
        tenant_id: chunk.tenantId,
        product_id: chunk.documentId,
        chunk_text: chunk.text,
        chunk_type: chunk.metadata.chunkType ?? 'description',
        embedding: await this.embeddingProvider.embed(chunk.text),
        model: this.embeddingProvider.modelId,
      })),
    );

    const { error } = await this.supabase
      .from('product_embeddings')
      .upsert(rows, { onConflict: 'product_id,chunk_type' });

    if (error) {
      throw new Error(`Falha ao indexar product_embeddings: ${error.message}`);
    }
  }

  private async indexLessonChunks(chunks: AiChunk[]): Promise<void> {
    if (chunks.length === 0) return;

    const rows = await Promise.all(
      chunks.map(async (chunk) => ({
        tenant_id: chunk.tenantId,
        lesson_id: chunk.documentId,
        chunk_text: chunk.text,
        chunk_type: chunk.metadata.chunkType ?? 'content',
        embedding: await this.embeddingProvider.embed(chunk.text),
        model: this.embeddingProvider.modelId,
      })),
    );

    const { error } = await this.supabase
      .from('lesson_embeddings')
      .upsert(rows, { onConflict: 'lesson_id,chunk_type' });

    if (error) {
      throw new Error(`Falha ao indexar lesson_embeddings: ${error.message}`);
    }
  }

  // ── retrieve ─────────────────────────────────────────────────────────────

  /**
   * Recupera os chunks mais similares à query via pgvector (similaridade coseno).
   * Usa as funções SQL `match_product_embeddings` e `match_lesson_embeddings`
   * definidas na migration 0011_vectors.sql.
   *
   * Filtra por `kinds` se especificado; caso contrário busca em ambas as tabelas.
   */
  async retrieve(query: RetrievalQuery): Promise<RetrievalResult[]> {
    const { query: queryText, tenantId, kinds, topK = 5, minScore = 0.7 } = query;

    // Gera embedding da query uma vez para reutilizar em ambas as buscas
    const queryEmbedding = await this.embeddingProvider.embed(queryText);

    const wantsProducts = !kinds || kinds.includes('product');
    const wantsLessons = !kinds || kinds.includes('lesson');

    const searches: Promise<RetrievalResult[]>[] = [];

    if (wantsProducts) {
      searches.push(this.searchProducts(queryEmbedding, topK, minScore, tenantId));
    }
    if (wantsLessons) {
      searches.push(this.searchLessons(queryEmbedding, topK, minScore, tenantId));
    }

    const results = (await Promise.all(searches)).flat();

    // Ordena por score decrescente e limita ao topK global
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  private async searchProducts(
    queryEmbedding: number[],
    topK: number,
    minScore: number,
    tenantId: string,
  ): Promise<RetrievalResult[]> {
    // p_tenant_id é obrigatório: a função SQL roda via service_role (sem JWT),
    // então não pode resolver o tenant por app_tenant_id() — o caller informa.
    const { data, error } = await this.supabase.rpc('match_product_embeddings', {
      query_embedding: queryEmbedding,
      match_count: topK,
      similarity_threshold: minScore,
      p_tenant_id: tenantId,
    });

    if (error) {
      throw new Error(`Falha em match_product_embeddings: ${error.message}`);
    }

    const rows = (data ?? []) as MatchProductRow[];
    return rows.map((row) => ({
      score: row.similarity,
      chunk: {
        documentId: row.product_id,
        kind: 'product' as const,
        chunkIndex: 0,
        text: row.chunk_text,
        metadata: { chunkType: row.chunk_type },
        tenantId,
      },
    }));
  }

  private async searchLessons(
    queryEmbedding: number[],
    topK: number,
    minScore: number,
    tenantId: string,
  ): Promise<RetrievalResult[]> {
    const { data, error } = await this.supabase.rpc('match_lesson_embeddings', {
      query_embedding: queryEmbedding,
      match_count: topK,
      similarity_threshold: minScore,
      p_tenant_id: tenantId,
    });

    if (error) {
      throw new Error(`Falha em match_lesson_embeddings: ${error.message}`);
    }

    const rows = (data ?? []) as MatchLessonRow[];
    return rows.map((row) => ({
      score: row.similarity,
      chunk: {
        documentId: row.lesson_id,
        kind: 'lesson' as const,
        chunkIndex: 0,
        text: row.chunk_text,
        metadata: { chunkType: row.chunk_type },
        tenantId,
      },
    }));
  }

  // ── purge ─────────────────────────────────────────────────────────────────

  /**
   * Remove todos os embeddings de um tenant.
   * Usado ao excluir um tenant ou ao re-indexar do zero.
   */
  async purge(tenantId: string): Promise<void> {
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      this.supabase.from('product_embeddings').delete().eq('tenant_id', tenantId),
      this.supabase.from('lesson_embeddings').delete().eq('tenant_id', tenantId),
    ]);

    if (e1) throw new Error(`Falha ao purgar product_embeddings: ${e1.message}`);
    if (e2) throw new Error(`Falha ao purgar lesson_embeddings: ${e2.message}`);
  }
}
