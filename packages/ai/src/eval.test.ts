// packages/ai/src/eval.test.ts

import { describe, expect, it } from 'vitest';
import { ARGHO_GOLDEN_QUERIES, formatEvalReport, runEvalSuite } from './eval.js';
import type { AiChunk, RetrievalQuery, RetrievalResult, Retriever } from './types.js';

// Mock retriever que retorna chunks fixos baseado em palavras-chave
class MockRetriever implements Retriever {
  private docs: AiChunk[];

  constructor(docs: AiChunk[]) {
    this.docs = docs;
  }

  async index(_chunks: AiChunk[]): Promise<void> {
    /* no-op pra testes */
  }

  async purge(_tenantId: string): Promise<void> {
    /* no-op pra testes */
  }

  async retrieve(query: RetrievalQuery): Promise<RetrievalResult[]> {
    const queryLower = query.query.toLowerCase();
    const firstToken = queryLower.split(' ')[0] ?? '';
    const matches = this.docs.filter(
      (chunk) =>
        chunk.text.toLowerCase().includes(firstToken) ||
        ((chunk.metadata?.product_slug as string | undefined) ?? '')
          .toLowerCase()
          .includes(firstToken),
    );
    return matches.slice(0, query.topK ?? 5).map((chunk, i) => ({
      chunk,
      score: 1 - i * 0.1,
    }));
  }
}

function makeChunk(productSlug: string, text: string): AiChunk {
  return {
    documentId: `doc-${productSlug}`,
    chunkIndex: 0,
    text,
    kind: 'product',
    tenantId: 'argho-uuid',
    metadata: { product_slug: productSlug },
  };
}

describe('ARGHO_GOLDEN_QUERIES', () => {
  it('contem pelo menos 10 queries', () => {
    expect(ARGHO_GOLDEN_QUERIES.length).toBeGreaterThanOrEqual(10);
  });

  it('cada query tem id, query, expectedProductSlugs, category', () => {
    for (const q of ARGHO_GOLDEN_QUERIES) {
      expect(q.id).toBeTruthy();
      expect(q.query).toBeTruthy();
      expect(q.category).toBeTruthy();
      const hasExpected =
        (q.expectedChunkIds && q.expectedChunkIds.length > 0) ||
        (q.expectedProductSlugs && q.expectedProductSlugs.length > 0);
      expect(hasExpected).toBe(true);
    }
  });

  it('ids sao unicos', () => {
    const ids = ARGHO_GOLDEN_QUERIES.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cobre as 5 categorias principais', () => {
    const categories = new Set(ARGHO_GOLDEN_QUERIES.map((q) => q.category));
    expect(categories).toContain('agronomico');
    expect(categories).toContain('compliance');
    expect(categories).toContain('comercial');
    expect(categories).toContain('aplicacao');
    expect(categories).toContain('tecnico');
  });
});

describe('runEvalSuite', () => {
  it('retorna 100% recall quando retriever retorna todos os expected', async () => {
    const retriever = new MockRetriever([
      makeChunk('soja', 'soja conteudo'),
      makeChunk('milho', 'milho conteudo'),
    ]);

    const queries = [
      {
        id: 'q1',
        query: 'soja deficiencia',
        expectedProductSlugs: ['soja'],
        category: 'agronomico' as const,
      },
    ];

    const result = await runEvalSuite({
      queries,
      retriever,
      tenantId: 'argho-uuid',
      k: 5,
    });

    expect(result.total).toBe(1);
    expect(result.totalHits).toBe(1);
    expect(result.recallAtK).toBe(1);
    expect(result.mrr).toBe(1);
  });

  it('retorna 0% recall quando retriever nao acha', async () => {
    const retriever = new MockRetriever([makeChunk('milho', 'conteudo milho')]);

    const queries = [
      {
        id: 'q1',
        query: 'soja teste',
        expectedProductSlugs: ['operate-orange'],
        category: 'agronomico' as const,
      },
    ];

    const result = await runEvalSuite({
      queries,
      retriever,
      tenantId: 'argho-uuid',
      k: 5,
    });

    expect(result.recallAtK).toBe(0);
    expect(result.mrr).toBe(0);
    expect(result.totalHits).toBe(0);
  });

  it('MRR refletindo posicao do hit', async () => {
    // Retriever ordenado: chunk-irrelevante primeiro, chunk-target em pos 2
    class OrderedRetriever implements Retriever {
      async index(_chunks: AiChunk[]): Promise<void> {
        /* no-op */
      }
      async purge(_tenantId: string): Promise<void> {
        /* no-op */
      }
      async retrieve(): Promise<RetrievalResult[]> {
        return [
          { chunk: makeChunk('irrelevante-1', 'lorem'), score: 0.9 },
          { chunk: makeChunk('target', 'ipsum'), score: 0.8 },
          { chunk: makeChunk('irrelevante-2', 'foo'), score: 0.7 },
        ];
      }
    }

    const result = await runEvalSuite({
      queries: [
        {
          id: 'q1',
          query: 'q',
          expectedProductSlugs: ['target'],
          category: 'agronomico' as const,
        },
      ],
      retriever: new OrderedRetriever(),
      tenantId: 'argho-uuid',
    });

    // Posicao 2 → reciprocal rank = 1/2 = 0.5
    expect(result.mrr).toBe(0.5);
    expect(result.recallAtK).toBe(1);
  });

  it('calcula recall parcial corretamente', async () => {
    // 2 expected, retriever acha 1
    const retriever = new MockRetriever([makeChunk('a', 'a teste')]);

    const result = await runEvalSuite({
      queries: [
        {
          id: 'q1',
          query: 'a',
          expectedProductSlugs: ['a', 'b'],
          category: 'tecnico' as const,
        },
      ],
      retriever,
      tenantId: 'argho-uuid',
    });

    expect(result.recallAtK).toBe(0.5); // 1 de 2 = 50%
  });

  it('agrupa metricas por categoria', async () => {
    const retriever = new MockRetriever([makeChunk('a', 'a'), makeChunk('b', 'b')]);

    const result = await runEvalSuite({
      queries: [
        {
          id: 'q1',
          query: 'a',
          expectedProductSlugs: ['a'],
          category: 'agronomico' as const,
        },
        {
          id: 'q2',
          query: 'b',
          expectedProductSlugs: ['b'],
          category: 'agronomico' as const,
        },
        {
          id: 'q3',
          query: 'c',
          expectedProductSlugs: ['c'],
          category: 'compliance' as const,
        },
      ],
      retriever,
      tenantId: 'argho-uuid',
    });

    expect(result.perCategory.agronomico?.count).toBe(2);
    expect(result.perCategory.agronomico?.recall).toBe(1);
    expect(result.perCategory.compliance?.count).toBe(1);
    expect(result.perCategory.compliance?.recall).toBe(0);
  });

  it('mede latencia p50/p95', async () => {
    const retriever = new MockRetriever([makeChunk('a', 'a')]);

    const result = await runEvalSuite({
      queries: [
        {
          id: 'q1',
          query: 'a',
          expectedProductSlugs: ['a'],
          category: 'agronomico' as const,
        },
      ],
      retriever,
      tenantId: 'argho-uuid',
    });

    expect(result.p50Ms).toBeGreaterThanOrEqual(0);
    expect(result.p95Ms).toBeGreaterThanOrEqual(0);
  });
});

describe('formatEvalReport', () => {
  it('inclui totais, recall, MRR, latencia e per-category', async () => {
    const retriever = new MockRetriever([makeChunk('a', 'a teste')]);

    const result = await runEvalSuite({
      queries: [
        {
          id: 'sample-query',
          query: 'a teste',
          expectedProductSlugs: ['a'],
          category: 'agronomico' as const,
        },
      ],
      retriever,
      tenantId: 'argho-uuid',
    });

    const report = formatEvalReport(result);
    expect(report).toContain('RAG EVAL SUITE');
    expect(report).toContain('Recall@K');
    expect(report).toContain('MRR');
    expect(report).toContain('agronomico');
    expect(report).toContain('sample-query');
  });
});
