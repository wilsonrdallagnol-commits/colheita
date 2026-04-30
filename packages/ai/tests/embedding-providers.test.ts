// packages/ai/tests/embedding-providers.test.ts
//
// Testes dos EmbeddingProviders.
// VoyageEmbeddingProvider e OpenAIEmbeddingProvider: mocks de fetch.
// MockEmbeddingProvider: sem mocks (determinístico sem API).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MockEmbeddingProvider,
  OpenAIEmbeddingProvider,
  VoyageEmbeddingProvider,
} from '../src/embedding-providers.js';

// ── MockEmbeddingProvider ─────────────────────────────────────────────────────

describe('MockEmbeddingProvider', () => {
  it('retorna vetor com dimensão padrão (1536)', async () => {
    const provider = new MockEmbeddingProvider();
    const embedding = await provider.embed('teste de embedding');
    expect(embedding).toHaveLength(1536);
    expect(provider.dimensions).toBe(1536);
    expect(provider.modelId).toBe('mock-embedding');
  });

  it('aceita dimensão customizada', async () => {
    const provider = new MockEmbeddingProvider(1024);
    const embedding = await provider.embed('outro texto');
    expect(embedding).toHaveLength(1024);
    expect(provider.dimensions).toBe(1024);
  });

  it('retorna vetores determinísticos para o mesmo texto', async () => {
    const provider = new MockEmbeddingProvider();
    const e1 = await provider.embed('texto igual');
    const e2 = await provider.embed('texto igual');
    expect(e1).toEqual(e2);
  });

  it('retorna vetores diferentes para textos diferentes', async () => {
    const provider = new MockEmbeddingProvider();
    const e1 = await provider.embed('produto xcensis');
    const e2 = await provider.embed('lição de nutrição');
    // Vetores diferentes (alta probabilidade estatística)
    expect(e1.slice(0, 5)).not.toEqual(e2.slice(0, 5));
  });

  it('todos os valores estão no range esperado (0-1)', async () => {
    const provider = new MockEmbeddingProvider();
    const embedding = await provider.embed('Argho distribuidora');
    for (const v of embedding) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

// ── VoyageEmbeddingProvider ───────────────────────────────────────────────────

describe('VoyageEmbeddingProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.VOYAGE_API_KEY;
  });

  it('lança erro se VOYAGE_API_KEY não estiver configurada', () => {
    expect(() => new VoyageEmbeddingProvider()).toThrow('VOYAGE_API_KEY');
  });

  it('usa VOYAGE_API_KEY do environment', () => {
    process.env.VOYAGE_API_KEY = 'test-key';
    expect(() => new VoyageEmbeddingProvider()).not.toThrow();
  });

  it('usa voyage-3-lite como modelo padrão', () => {
    process.env.VOYAGE_API_KEY = 'test-key';
    const provider = new VoyageEmbeddingProvider();
    expect(provider.modelId).toBe('voyage-3-lite');
    expect(provider.dimensions).toBe(1024);
  });

  it('retorna embedding da API com sucesso', async () => {
    process.env.VOYAGE_API_KEY = 'test-key';
    const mockEmbedding = Array.from({ length: 1024 }, () => Math.random());

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ embedding: mockEmbedding }], usage: { total_tokens: 10 } }),
    } as Response);

    const provider = new VoyageEmbeddingProvider();
    const result = await provider.embed('nutrição foliar soja');

    expect(result).toHaveLength(1024);
    expect(result).toEqual(mockEmbedding);
  });

  it('passa o modelo correto no body da requisição', async () => {
    process.env.VOYAGE_API_KEY = 'test-key';
    const mockEmbedding = Array.from({ length: 1024 }, () => 0.1);
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ embedding: mockEmbedding }], usage: {} }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const provider = new VoyageEmbeddingProvider({ apiKey: 'key', model: 'voyage-3' });
    await provider.embed('test');

    const callArgs = mockFetch.mock.calls[0];
    if (!callArgs) throw new Error('fetch not called');
    const body = JSON.parse((callArgs[1] as RequestInit).body as string);
    expect(body.model).toBe('voyage-3');
    expect(body.input).toEqual(['test']);
  });

  it('lança erro se a API retornar status não-OK', async () => {
    process.env.VOYAGE_API_KEY = 'test-key';
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
      statusText: 'Unauthorized',
    } as Response);

    const provider = new VoyageEmbeddingProvider({ maxRetries: 0 });
    await expect(provider.embed('test')).rejects.toThrow('401');
  });

  it('lança erro para texto vazio', async () => {
    process.env.VOYAGE_API_KEY = 'test-key';
    const provider = new VoyageEmbeddingProvider();
    await expect(provider.embed('  ')).rejects.toThrow('texto vazio');
  });

  it('lança erro se dimensão do embedding for incorreta', async () => {
    process.env.VOYAGE_API_KEY = 'test-key';
    const wrongDimEmbedding = Array.from({ length: 512 }, () => 0.1); // Errado: 512 em vez de 1024

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ embedding: wrongDimEmbedding }], usage: {} }),
    } as Response);

    const provider = new VoyageEmbeddingProvider({ maxRetries: 0 });
    await expect(provider.embed('test')).rejects.toThrow('512 dims');
  });
});

// ── OpenAIEmbeddingProvider ───────────────────────────────────────────────────

describe('OpenAIEmbeddingProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.OPENAI_API_KEY;
  });

  it('lança erro se OPENAI_API_KEY não estiver configurada', () => {
    expect(() => new OpenAIEmbeddingProvider()).toThrow('OPENAI_API_KEY');
  });

  it('usa text-embedding-3-small como modelo padrão (1536 dims)', () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const provider = new OpenAIEmbeddingProvider();
    expect(provider.modelId).toBe('text-embedding-3-small');
    expect(provider.dimensions).toBe(1536);
  });

  it('text-embedding-3-large tem 3072 dims', () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const provider = new OpenAIEmbeddingProvider({ model: 'text-embedding-3-large' });
    expect(provider.dimensions).toBe(3072);
  });

  it('retorna embedding da API com sucesso', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const mockEmbedding = Array.from({ length: 1536 }, () => Math.random());

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ embedding: mockEmbedding, index: 0 }],
        usage: { prompt_tokens: 5, total_tokens: 5 },
      }),
    } as Response);

    const provider = new OpenAIEmbeddingProvider({ apiKey: 'test-key' });
    const result = await provider.embed('Xcensis fertilizante');

    expect(result).toHaveLength(1536);
  });

  it('lança erro se a API retornar status não-OK', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => 'Rate limit exceeded',
      statusText: 'Too Many Requests',
    } as Response);

    const provider = new OpenAIEmbeddingProvider({ maxRetries: 0 });
    await expect(provider.embed('test')).rejects.toThrow('429');
  });

  it('lança erro para texto vazio', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const provider = new OpenAIEmbeddingProvider();
    await expect(provider.embed('')).rejects.toThrow('texto vazio');
  });
});
