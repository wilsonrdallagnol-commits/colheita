// packages/ai/tests/retriever.test.ts
import { beforeEach, describe, expect, it } from 'vitest';
import { BM25InMemoryRetriever } from '../src/retriever.js';
import type { AiChunk } from '../src/types.js';

const T1 = '00000000-0000-0000-0000-000000000001';
const T2 = '00000000-0000-0000-0000-000000000002';

function makeChunk(overrides: Partial<AiChunk> & { text: string; tenantId: string }): AiChunk {
  return {
    documentId: 'doc-1',
    kind: 'product',
    chunkIndex: 0,
    metadata: {},
    ...overrides,
  };
}

describe('BM25InMemoryRetriever', () => {
  let retriever: BM25InMemoryRetriever;

  beforeEach(() => {
    retriever = new BM25InMemoryRetriever();
  });

  it('retorna array vazio quando não há chunks indexados', async () => {
    const results = await retriever.retrieve({ query: 'produto', tenantId: T1 });
    expect(results).toEqual([]);
  });

  it('encontra chunk relevante após indexação', async () => {
    await retriever.index([
      makeChunk({ tenantId: T1, text: 'Xcensis é um fertilizante foliar para soja.' }),
    ]);
    const results = await retriever.retrieve({ query: 'Xcensis fertilizante', tenantId: T1 });
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0]?.chunk.text).toContain('Xcensis');
  });

  it('score está entre 0 e 1', async () => {
    await retriever.index([makeChunk({ tenantId: T1, text: 'Dose de Xcensis para soja: 1L/ha.' })]);
    const results = await retriever.retrieve({ query: 'dose Xcensis', tenantId: T1 });
    for (const r of results) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    }
  });

  it('respeita isolamento de tenant', async () => {
    await retriever.index([
      makeChunk({ tenantId: T1, text: 'Produto exclusivo tenant 1.' }),
      makeChunk({ tenantId: T2, text: 'Produto exclusivo tenant 2.' }),
    ]);
    const r1 = await retriever.retrieve({ query: 'produto exclusivo', tenantId: T1 });
    const r2 = await retriever.retrieve({ query: 'produto exclusivo', tenantId: T2 });

    const ids1 = r1.map((r) => r.chunk.tenantId);
    const ids2 = r2.map((r) => r.chunk.tenantId);
    expect(ids1.every((id) => id === T1)).toBe(true);
    expect(ids2.every((id) => id === T2)).toBe(true);
  });

  it('filtra por kind quando kinds é especificado', async () => {
    await retriever.index([
      makeChunk({ tenantId: T1, kind: 'product', text: 'Produto agrícola com nutrientes.' }),
      makeChunk({
        tenantId: T1,
        kind: 'lesson',
        chunkIndex: 1,
        text: 'Lição sobre nutrientes agrícolas.',
      }),
    ]);
    const results = await retriever.retrieve({
      query: 'nutrientes agrícola',
      tenantId: T1,
      kinds: ['product'],
    });
    expect(results.every((r) => r.chunk.kind === 'product')).toBe(true);
  });

  it('respeita topK', async () => {
    await retriever.index([
      makeChunk({ tenantId: T1, chunkIndex: 0, text: 'Xcensis para soja dose recomendada.' }),
      makeChunk({ tenantId: T1, chunkIndex: 1, text: 'Xcensis para milho dose técnica.' }),
      makeChunk({ tenantId: T1, chunkIndex: 2, text: 'Xcensis para algodão aplicação.' }),
      makeChunk({ tenantId: T1, chunkIndex: 3, text: 'Xcensis composição garantida.' }),
      makeChunk({ tenantId: T1, chunkIndex: 4, text: 'Xcensis embalagens disponíveis.' }),
    ]);
    const results = await retriever.retrieve({
      query: 'Xcensis',
      tenantId: T1,
      topK: 2,
    });
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('respeita minScore filtrando resultados irrelevantes', async () => {
    await retriever.index([makeChunk({ tenantId: T1, text: 'Xcensis fertilizante foliar.' })]);
    const results = await retriever.retrieve({
      query: 'palavra completamente irrelevante xyzabc',
      tenantId: T1,
      minScore: 0.5,
    });
    // Query sem termos em comum → scores baixos → filtrado
    expect(results.every((r) => r.score >= 0.5)).toBe(true);
  });

  it('re-indexação é idempotente (não duplica chunks)', async () => {
    const chunk = makeChunk({ tenantId: T1, text: 'Xcensis fertilizante.' });
    await retriever.index([chunk]);
    await retriever.index([chunk]);
    const count = retriever.count(T1);
    expect(count).toBe(1);
  });

  it('purge remove todos os chunks do tenant', async () => {
    await retriever.index([
      makeChunk({ tenantId: T1, chunkIndex: 0, text: 'Chunk A do tenant 1.' }),
      makeChunk({ tenantId: T1, chunkIndex: 1, text: 'Chunk B do tenant 1.' }),
      makeChunk({ tenantId: T2, text: 'Chunk do tenant 2.' }),
    ]);
    await retriever.purge(T1);
    expect(retriever.count(T1)).toBe(0);
    expect(retriever.count(T2)).toBe(1);
  });

  it('retorna resultados ordenados por score decrescente', async () => {
    await retriever.index([
      makeChunk({
        tenantId: T1,
        chunkIndex: 0,
        text: 'Xcensis é o melhor fertilizante foliar para soja com alta concentração.',
      }),
      makeChunk({ tenantId: T1, chunkIndex: 1, text: 'Produto agrícola genérico.' }),
    ]);
    const results = await retriever.retrieve({
      query: 'Xcensis fertilizante foliar soja',
      tenantId: T1,
    });
    if (results.length > 1) {
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1]?.score ?? 0;
        const curr = results[i]?.score ?? 0;
        expect(prev).toBeGreaterThanOrEqual(curr);
      }
    }
  });
});
