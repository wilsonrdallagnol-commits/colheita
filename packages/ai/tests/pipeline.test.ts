// packages/ai/tests/pipeline.test.ts
/**
 * Testa o RagPipeline com um AiGenerator mockado.
 * Não requer acesso à API da Anthropic.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AiGenerator } from '../src/generator.js';
import { RagPipeline } from '../src/pipeline.js';
import { BM25InMemoryRetriever } from '../src/retriever.js';
import type { AiAnswer, AiChunk, GenerationInput } from '../src/types.js';

/** Extrai o argumento da primeira chamada ao generate (lança se não foi chamado). */
function firstGenerateCall(gen: AiGenerator): GenerationInput {
  const call = vi.mocked(gen.generate).mock.calls.at(0);
  if (!call) throw new Error('generator.generate não foi chamado');
  return call[0];
}

const TENANT = '00000000-0000-0000-0000-000000000001';

function mockGenerator(answer: string = 'Resposta simulada.'): AiGenerator {
  return {
    generate: vi.fn().mockResolvedValue({
      text: answer,
      sources: [],
      usage: { inputTokens: 10, outputTokens: 5 },
    } satisfies AiAnswer),
  } as unknown as AiGenerator;
}

function makeChunk(text: string, chunkIndex = 0): AiChunk {
  return {
    documentId: 'doc-1',
    kind: 'product',
    chunkIndex,
    text,
    metadata: { documentTitle: 'Xcensis 10-00-06' },
    tenantId: TENANT,
  };
}

describe('RagPipeline', () => {
  let retriever: BM25InMemoryRetriever;
  let generator: AiGenerator;
  let pipeline: RagPipeline;

  beforeEach(() => {
    retriever = new BM25InMemoryRetriever();
    generator = mockGenerator();
    pipeline = new RagPipeline(retriever, generator);
  });

  it('indexa e recupera chunks via pipeline.index()', async () => {
    const chunks = [makeChunk('Xcensis aumenta produtividade da soja.')];
    await pipeline.index(chunks);
    expect(retriever.count(TENANT)).toBe(1);
  });

  it('ask() retorna resposta do generator', async () => {
    await pipeline.index([makeChunk('Xcensis para soja dose 1L/ha.')]);
    const answer = await pipeline.ask({ query: 'dose Xcensis', tenantId: TENANT });
    expect(answer.text).toBe('Resposta simulada.');
  });

  it('ask() chama generator com query e contexto', async () => {
    await pipeline.index([
      makeChunk('Xcensis fertilizante foliar para soja.'),
      makeChunk('Dose: 1L/ha para soja.', 1),
    ]);
    await pipeline.ask({ query: 'Xcensis soja', tenantId: TENANT });

    expect(generator.generate).toHaveBeenCalledOnce();
    const call = firstGenerateCall(generator);
    expect(call.query).toBe('Xcensis soja');
    expect(call.context.length).toBeGreaterThanOrEqual(1);
  });

  it('purge remove todos os chunks do tenant', async () => {
    await pipeline.index([makeChunk('Chunk de produto.')]);
    await pipeline.purge(TENANT);
    expect(retriever.count(TENANT)).toBe(0);
  });

  it('ask() com topK override limita contexto', async () => {
    // Indexar 5 chunks
    await pipeline.index(
      Array.from({ length: 5 }, (_, i) =>
        makeChunk(`Xcensis informação número ${i + 1} sobre produto agrícola.`, i),
      ),
    );

    await pipeline.ask({ query: 'Xcensis informação', tenantId: TENANT, config: { topK: 2 } });

    const call = firstGenerateCall(generator);
    expect(call.context.length).toBeLessThanOrEqual(2);
  });

  it('ask() com kinds filtra por tipo de documento', async () => {
    await retriever.index([
      {
        documentId: 'p1',
        kind: 'product',
        chunkIndex: 0,
        text: 'Xcensis produto agrícola.',
        metadata: {},
        tenantId: TENANT,
      },
      {
        documentId: 'l1',
        kind: 'lesson',
        chunkIndex: 0,
        text: 'Lição sobre Xcensis agrícola.',
        metadata: {},
        tenantId: TENANT,
      },
    ]);

    await pipeline.ask({ query: 'Xcensis', tenantId: TENANT, kinds: ['product'] });

    const call = firstGenerateCall(generator);
    expect(call.context.every((r) => r.chunk.kind === 'product')).toBe(true);
  });

  it('ask() com systemHint passa hint ao generator', async () => {
    await pipeline.index([makeChunk('Informação sobre produto.')]);
    await pipeline.ask({
      query: 'produto',
      tenantId: TENANT,
      systemHint: 'Responda de forma técnica.',
    });

    const call = firstGenerateCall(generator);
    expect(call.systemHint).toBe('Responda de forma técnica.');
  });

  it('retorna usage do generator no AiAnswer', async () => {
    await pipeline.index([makeChunk('Produto agrícola.')]);
    const answer = await pipeline.ask({ query: 'produto', tenantId: TENANT });
    expect(answer.usage.inputTokens).toBe(10);
    expect(answer.usage.outputTokens).toBe(5);
  });
});
