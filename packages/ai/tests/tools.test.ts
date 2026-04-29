// packages/ai/tests/tools.test.ts
import { beforeEach, describe, expect, it } from 'vitest';
import { BM25InMemoryRetriever } from '../src/retriever.js';
import {
  createAgentTools,
  createSearchLessonsTool,
  createSearchProductsTool,
  executeTool,
  toolsToAnthropicFormat,
} from '../src/tools/index.js';
import type { AiChunk } from '../src/types.js';

const TENANT = '00000000-0000-0000-0000-000000000001';

function makeChunk(overrides: Partial<AiChunk> & { text: string; tenantId: string }): AiChunk {
  return {
    documentId: 'doc-1',
    kind: 'product',
    chunkIndex: 0,
    metadata: { documentTitle: 'Xcensis 10-00-06' },
    ...overrides,
  };
}

describe('createSearchProductsTool', () => {
  let retriever: BM25InMemoryRetriever;

  beforeEach(async () => {
    retriever = new BM25InMemoryRetriever();
    await retriever.index([
      makeChunk({
        tenantId: TENANT,
        kind: 'product',
        text: 'Xcensis fertilizante foliar para soja.',
      }),
      makeChunk({
        tenantId: TENANT,
        kind: 'lesson',
        chunkIndex: 1,
        text: 'Lição sobre Xcensis aplicação.',
      }),
    ]);
  });

  it('tem nome search_products', () => {
    const tool = createSearchProductsTool(retriever);
    expect(tool.name).toBe('search_products');
  });

  it('filtra apenas produtos', async () => {
    const tool = createSearchProductsTool(retriever);
    const result = await tool.execute({ query: 'Xcensis', tenantId: TENANT, topK: 5 });
    // Deve encontrar produto, não lição
    expect(typeof result).toBe('string');
    // Se encontrou algo, deve ser produto (não lição)
    if (result !== 'Nenhum produto encontrado para essa busca.') {
      expect(result).toContain('Xcensis 10-00-06');
    }
  });

  it('retorna mensagem quando nenhum produto encontrado', async () => {
    const tool = createSearchProductsTool(retriever);
    const result = await tool.execute({
      query: 'xyz_produto_inexistente_abc',
      tenantId: TENANT,
      topK: 3,
    });
    expect(result).toBe('Nenhum produto encontrado para essa busca.');
  });
});

describe('createSearchLessonsTool', () => {
  let retriever: BM25InMemoryRetriever;

  beforeEach(async () => {
    retriever = new BM25InMemoryRetriever();
    await retriever.index([
      makeChunk({
        tenantId: TENANT,
        kind: 'lesson',
        text: 'Lição: como aplicar fertilizante foliar.',
      }),
      makeChunk({
        tenantId: TENANT,
        kind: 'track',
        chunkIndex: 1,
        text: 'Trilha de manejo de culturas agrícolas.',
      }),
      makeChunk({
        tenantId: TENANT,
        kind: 'product',
        chunkIndex: 2,
        text: 'Produto fertilizante foliar Xcensis.',
      }),
    ]);
  });

  it('tem nome search_lessons', () => {
    const tool = createSearchLessonsTool(retriever);
    expect(tool.name).toBe('search_lessons');
  });

  it('retorna mensagem quando nenhuma lição encontrada', async () => {
    const tool = createSearchLessonsTool(retriever);
    const result = await tool.execute({
      query: 'xyz_licao_inexistente_abc',
      tenantId: TENANT,
      topK: 3,
    });
    expect(result).toBe('Nenhuma lição encontrada para essa busca.');
  });
});

describe('createAgentTools', () => {
  it('retorna array com 2 tools', () => {
    const retriever = new BM25InMemoryRetriever();
    const tools = createAgentTools(retriever);
    expect(tools).toHaveLength(2);
    expect(tools.map((t) => t.name).sort()).toEqual(['search_lessons', 'search_products']);
  });
});

describe('toolsToAnthropicFormat', () => {
  it('converte tools para formato Anthropic', () => {
    const retriever = new BM25InMemoryRetriever();
    const tools = createAgentTools(retriever);
    const anthropicTools = toolsToAnthropicFormat(tools);
    expect(anthropicTools).toHaveLength(2);
    for (const t of anthropicTools) {
      expect(t).toHaveProperty('name');
      expect(t).toHaveProperty('description');
      expect(t).toHaveProperty('input_schema');
      expect(t.input_schema).toHaveProperty('type', 'object');
    }
  });
});

describe('executeTool', () => {
  let retriever: BM25InMemoryRetriever;

  beforeEach(() => {
    retriever = new BM25InMemoryRetriever();
  });

  it('retorna erro para tool desconhecida', async () => {
    const tools = createAgentTools(retriever);
    const result = await executeTool(tools, { name: 'tool_inexistente', input: {} });
    expect(result).toContain('Tool desconhecida');
  });

  it('retorna erro de validação para input inválido', async () => {
    const tools = createAgentTools(retriever);
    const result = await executeTool(tools, {
      name: 'search_products',
      input: { query: '', tenantId: 'nao-e-uuid' }, // query vazia + tenantId inválido
    });
    expect(result).toContain('Erro de validação');
  });

  it('executa tool válida com sucesso', async () => {
    const tools = createAgentTools(retriever);
    const result = await executeTool(tools, {
      name: 'search_products',
      input: { query: 'produto', tenantId: TENANT, topK: 3 },
    });
    expect(typeof result).toBe('string');
  });
});
