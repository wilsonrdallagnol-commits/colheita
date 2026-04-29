// packages/ai/tests/vector-retriever.test.ts
//
// Testes do SupabaseVectorRetriever usando mocks do cliente Supabase.
// Sem banco de dados real — valida a lógica de mapeamento, tratamento de erros
// e delegação ao EmbeddingProvider.

import { describe, expect, it, vi } from 'vitest';
import type { AiChunk } from '../src/types.js';
import type { EmbeddingProvider } from '../src/vector-retriever.js';
import { SupabaseVectorRetriever } from '../src/vector-retriever.js';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const TENANT_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const PRODUCT_ID = '11111111-2222-3333-4444-555555555555';
const LESSON_ID = '66666666-7777-8888-9999-aaaaaaaaaaaa';

const MOCK_EMBEDDING = Array.from({ length: 1536 }, (_, i) => i * 0.001);

/** EmbeddingProvider simulado — retorna vetor fixo para todos os textos */
const mockEmbeddingProvider: EmbeddingProvider = {
  embed: vi.fn(async (_text: string) => MOCK_EMBEDDING),
  dimensions: 1536,
  modelId: 'mock-embedding-model',
};

/** Cria um chunk de produto para testes */
function makeProductChunk(override?: Partial<AiChunk>): AiChunk {
  return {
    documentId: PRODUCT_ID,
    kind: 'product',
    chunkIndex: 0,
    text: 'Xcensis 13.9.3.5 — fertilizante organomineral de alta solubilidade.',
    metadata: { chunkType: 'description' },
    tenantId: TENANT_ID,
    ...override,
  };
}

/** Cria um chunk de lição para testes */
function makeLessonChunk(override?: Partial<AiChunk>): AiChunk {
  return {
    documentId: LESSON_ID,
    kind: 'lesson',
    chunkIndex: 0,
    text: 'Nutrição foliar: conceitos básicos de absorção e translocação.',
    metadata: { chunkType: 'content' },
    tenantId: TENANT_ID,
    ...override,
  };
}

// ── Testes de index ───────────────────────────────────────────────────────────

describe('SupabaseVectorRetriever.index()', () => {
  it('faz upsert de product_embeddings ao indexar chunk de produto', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      from: vi.fn().mockReturnValue({ upsert }),
      rpc: vi.fn(),
    };

    const retriever = new SupabaseVectorRetriever(supabase, mockEmbeddingProvider);
    await retriever.index([makeProductChunk()]);

    expect(supabase.from).toHaveBeenCalledWith('product_embeddings');
    expect(upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          tenant_id: TENANT_ID,
          product_id: PRODUCT_ID,
          chunk_type: 'description',
          model: 'mock-embedding-model',
        }),
      ]),
      expect.objectContaining({ onConflict: 'product_id,chunk_type' }),
    );
  });

  it('faz upsert de lesson_embeddings ao indexar chunk de lição', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      from: vi.fn().mockReturnValue({ upsert }),
      rpc: vi.fn(),
    };

    const retriever = new SupabaseVectorRetriever(supabase, mockEmbeddingProvider);
    await retriever.index([makeLessonChunk()]);

    expect(supabase.from).toHaveBeenCalledWith('lesson_embeddings');
    expect(upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          tenant_id: TENANT_ID,
          lesson_id: LESSON_ID,
          chunk_type: 'content',
        }),
      ]),
      expect.objectContaining({ onConflict: 'lesson_id,chunk_type' }),
    );
  });

  it('indexa chunks mistos (produto + lição) em paralelo', async () => {
    const tables: string[] = [];
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      from: vi.fn((table: string) => {
        tables.push(table);
        return { upsert };
      }),
      rpc: vi.fn(),
    };

    const retriever = new SupabaseVectorRetriever(supabase, mockEmbeddingProvider);
    await retriever.index([makeProductChunk(), makeLessonChunk()]);

    expect(tables).toContain('product_embeddings');
    expect(tables).toContain('lesson_embeddings');
    expect(upsert).toHaveBeenCalledTimes(2);
  });

  it('ignora chunks de kinds não suportados (ex: category)', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      from: vi.fn().mockReturnValue({ upsert }),
      rpc: vi.fn(),
    };

    const retriever = new SupabaseVectorRetriever(supabase, mockEmbeddingProvider);
    await retriever.index([{ ...makeProductChunk(), kind: 'category' }]);

    // Nenhuma chamada ao banco — não há tabela para 'category'
    expect(upsert).not.toHaveBeenCalled();
  });

  it('lança erro se o Supabase retornar error ao indexar produto', async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: { message: 'connection refused' } }),
      }),
      rpc: vi.fn(),
    };

    const retriever = new SupabaseVectorRetriever(supabase, mockEmbeddingProvider);
    await expect(retriever.index([makeProductChunk()])).rejects.toThrow(
      'Falha ao indexar product_embeddings',
    );
  });

  it('chama embeddingProvider.embed() uma vez por chunk', async () => {
    const embedSpy = vi.fn(async () => MOCK_EMBEDDING);
    const provider: EmbeddingProvider = { embed: embedSpy, dimensions: 1536, modelId: 'test' };
    const supabase = {
      from: vi.fn().mockReturnValue({ upsert: vi.fn().mockResolvedValue({ error: null }) }),
      rpc: vi.fn(),
    };

    const retriever = new SupabaseVectorRetriever(supabase, provider);
    const chunks = [
      makeProductChunk(),
      makeProductChunk({ chunkIndex: 1, metadata: { chunkType: 'name' } }),
    ];
    await retriever.index(chunks);

    expect(embedSpy).toHaveBeenCalledTimes(2);
  });
});

// ── Testes de retrieve ────────────────────────────────────────────────────────

describe('SupabaseVectorRetriever.retrieve()', () => {
  const mockProductRows = [
    {
      product_id: PRODUCT_ID,
      chunk_text: 'Xcensis foliar',
      chunk_type: 'description',
      similarity: 0.92,
    },
  ];
  const mockLessonRows = [
    {
      lesson_id: LESSON_ID,
      chunk_text: 'Absorção de nutrientes',
      chunk_type: 'content',
      similarity: 0.85,
    },
  ];

  it('chama match_product_embeddings e match_lesson_embeddings por padrão', async () => {
    const rpc = vi.fn((fn: string) => {
      if (fn === 'match_product_embeddings')
        return Promise.resolve({ data: mockProductRows, error: null });
      if (fn === 'match_lesson_embeddings')
        return Promise.resolve({ data: mockLessonRows, error: null });
      return Promise.resolve({ data: [], error: null });
    });
    const supabase = { from: vi.fn(), rpc };

    const retriever = new SupabaseVectorRetriever(supabase, mockEmbeddingProvider);
    const results = await retriever.retrieve({ query: 'nutrição foliar', tenantId: TENANT_ID });

    expect(rpc).toHaveBeenCalledWith('match_product_embeddings', expect.any(Object));
    expect(rpc).toHaveBeenCalledWith('match_lesson_embeddings', expect.any(Object));
    // Ordenado por score desc
    expect(results[0]?.score).toBeGreaterThanOrEqual(results[1]?.score ?? 0);
    expect(results).toHaveLength(2);
  });

  it('filtra apenas produtos quando kinds: ["product"]', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: mockProductRows, error: null });
    const supabase = { from: vi.fn(), rpc };

    const retriever = new SupabaseVectorRetriever(supabase, mockEmbeddingProvider);
    await retriever.retrieve({ query: 'produto', tenantId: TENANT_ID, kinds: ['product'] });

    expect(rpc).toHaveBeenCalledWith('match_product_embeddings', expect.any(Object));
    expect(rpc).not.toHaveBeenCalledWith('match_lesson_embeddings', expect.any(Object));
  });

  it('filtra apenas lições quando kinds: ["lesson"]', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: mockLessonRows, error: null });
    const supabase = { from: vi.fn(), rpc };

    const retriever = new SupabaseVectorRetriever(supabase, mockEmbeddingProvider);
    await retriever.retrieve({ query: 'lição', tenantId: TENANT_ID, kinds: ['lesson'] });

    expect(rpc).not.toHaveBeenCalledWith('match_product_embeddings', expect.any(Object));
    expect(rpc).toHaveBeenCalledWith('match_lesson_embeddings', expect.any(Object));
  });

  it('mapeia rows de produto para RetrievalResult com kind="product"', async () => {
    const rpc = vi.fn((fn: string) => {
      if (fn === 'match_product_embeddings')
        return Promise.resolve({ data: mockProductRows, error: null });
      return Promise.resolve({ data: [], error: null });
    });
    const supabase = { from: vi.fn(), rpc };

    const retriever = new SupabaseVectorRetriever(supabase, mockEmbeddingProvider);
    const results = await retriever.retrieve({
      query: 'test',
      tenantId: TENANT_ID,
      kinds: ['product'],
    });

    expect(results[0]).toMatchObject({
      score: 0.92,
      chunk: {
        documentId: PRODUCT_ID,
        kind: 'product',
        text: 'Xcensis foliar',
        metadata: { chunkType: 'description' },
      },
    });
  });

  it('lança erro se match_product_embeddings retornar error', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
    const supabase = { from: vi.fn(), rpc };

    const retriever = new SupabaseVectorRetriever(supabase, mockEmbeddingProvider);
    await expect(
      retriever.retrieve({ query: 'test', tenantId: TENANT_ID, kinds: ['product'] }),
    ).rejects.toThrow('match_product_embeddings');
  });

  it('respeita topK limitando resultados combinados', async () => {
    const manyProductRows = Array.from({ length: 8 }, (_, i) => ({
      product_id: PRODUCT_ID,
      chunk_text: `Chunk ${i}`,
      chunk_type: 'description',
      similarity: 0.9 - i * 0.05,
    }));
    const rpc = vi.fn((fn: string) => {
      if (fn === 'match_product_embeddings')
        return Promise.resolve({ data: manyProductRows, error: null });
      return Promise.resolve({ data: [], error: null });
    });
    const supabase = { from: vi.fn(), rpc };

    const retriever = new SupabaseVectorRetriever(supabase, mockEmbeddingProvider);
    const results = await retriever.retrieve({
      query: 'test',
      tenantId: TENANT_ID,
      kinds: ['product'],
      topK: 3,
    });

    expect(results).toHaveLength(3);
    // Ordenado por score desc
    expect(results[0]?.score).toBeGreaterThanOrEqual(results[2]?.score ?? 0);
  });
});

// ── Testes de purge ───────────────────────────────────────────────────────────

describe('SupabaseVectorRetriever.purge()', () => {
  it('deleta product_embeddings e lesson_embeddings do tenant', async () => {
    const deleteCall = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    const tables: string[] = [];
    const supabase = {
      from: vi.fn((table: string) => {
        tables.push(table);
        return { delete: deleteCall };
      }),
      rpc: vi.fn(),
    };

    const retriever = new SupabaseVectorRetriever(supabase, mockEmbeddingProvider);
    await retriever.purge(TENANT_ID);

    expect(tables).toContain('product_embeddings');
    expect(tables).toContain('lesson_embeddings');
  });
});
