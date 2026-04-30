// packages/ai/src/embedding-providers.ts
//
// Implementações concretas de EmbeddingProvider.
//
// Filosofia: sem SDK externo — usa fetch nativo para evitar dependências
// pesadas. Cada provider é uma classe leve com retry defensivo.
//
// Providers disponíveis:
// - VoyageEmbeddingProvider: Voyage AI (recomendado pela Anthropic para uso com Claude)
//   Modelo: voyage-3-lite (1024 dims, custo baixo) ou voyage-3 (1024 dims, qualidade alta)
// - OpenAIEmbeddingProvider: OpenAI text-embedding-3-small (1536 dims)
//
// VARIÁVEIS DE AMBIENTE:
// - VOYAGE_API_KEY: chave de API do Voyage AI
// - OPENAI_API_KEY: chave de API da OpenAI

import type { EmbeddingProvider } from './vector-retriever.js';

// ============================================================================
// VoyageEmbeddingProvider
// ============================================================================

type VoyageModel =
  | 'voyage-3-lite' // 1024 dims, custo baixo (~$0.02/1M tokens) — desenvolvimento
  | 'voyage-3' // 1024 dims, qualidade superior (~$0.06/1M tokens) — produção
  | 'voyage-3-large'; // 1024 dims, máxima qualidade (~$0.18/1M tokens)

interface VoyageEmbeddingConfig {
  apiKey?: string;
  model?: VoyageModel;
  /** Número de tentativas em caso de erro de rede. Padrão: 2 */
  maxRetries?: number;
}

interface VoyageResponse {
  data: Array<{ embedding: number[] }>;
  usage: { total_tokens: number };
}

/**
 * Embedding provider via Voyage AI.
 *
 * Voyage AI é o parceiro de embeddings recomendado pela Anthropic para uso
 * conjunto com Claude. Modelos voyage-3 são superiores ao OpenAI text-embedding-3
 * em benchmarks de recuperação em português.
 *
 * Dimensão: 1024 (todos os modelos voyage-3-*)
 * Contexto: até 32k tokens por input
 *
 * @see https://docs.voyageai.com/reference/embeddings-api
 */
export class VoyageEmbeddingProvider implements EmbeddingProvider {
  readonly dimensions = 1024;
  readonly modelId: string;
  private readonly apiKey: string;
  private readonly maxRetries: number;

  constructor(config: VoyageEmbeddingConfig = {}) {
    this.modelId = config.model ?? 'voyage-3-lite';
    this.apiKey = config.apiKey ?? process.env.VOYAGE_API_KEY ?? '';
    this.maxRetries = config.maxRetries ?? 2;

    if (!this.apiKey) {
      throw new Error(
        'VoyageEmbeddingProvider: VOYAGE_API_KEY não configurada. ' +
          'Defina a variável de ambiente ou passe apiKey na configuração.',
      );
    }
  }

  async embed(text: string): Promise<number[]> {
    const trimmed = text.trim();
    if (!trimmed) throw new Error('VoyageEmbeddingProvider: texto vazio não pode ser indexado.');

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch('https://api.voyageai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.modelId,
            input: [trimmed],
          }),
        });

        if (!response.ok) {
          const body = await response.text().catch(() => response.statusText);
          throw new Error(`Voyage API ${response.status}: ${body}`);
        }

        const data = (await response.json()) as VoyageResponse;
        const embedding = data.data[0]?.embedding;

        if (!embedding || embedding.length !== this.dimensions) {
          throw new Error(
            `Voyage retornou embedding com ${embedding?.length ?? 0} dims; esperado ${this.dimensions}.`,
          );
        }

        return embedding;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < this.maxRetries) {
          // Backoff exponencial simples: 500ms, 1s
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
      }
    }

    throw lastError ?? new Error('VoyageEmbeddingProvider: falha desconhecida.');
  }
}

// ============================================================================
// OpenAIEmbeddingProvider
// ============================================================================

type OpenAIEmbeddingModel =
  | 'text-embedding-3-small' // 1536 dims, $0.02/1M tokens
  | 'text-embedding-3-large' // 3072 dims, $0.13/1M tokens
  | 'text-embedding-ada-002'; // 1536 dims (legado)

interface OpenAIEmbeddingConfig {
  apiKey?: string;
  model?: OpenAIEmbeddingModel;
  maxRetries?: number;
}

interface OpenAIResponse {
  data: Array<{ embedding: number[]; index: number }>;
  usage: { prompt_tokens: number; total_tokens: number };
}

/**
 * Embedding provider via OpenAI.
 *
 * Usa text-embedding-3-small (1536 dims) por padrão.
 * Alternativa quando Voyage AI não está configurado.
 *
 * NOTA: Se usar text-embedding-3-large (3072 dims), a coluna embedding
 * no banco precisa ser alterada via migration: ALTER TABLE product_embeddings
 * ALTER COLUMN embedding TYPE vector(3072);
 *
 * @see https://platform.openai.com/docs/api-reference/embeddings
 */
export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly dimensions: number;
  readonly modelId: string;
  private readonly apiKey: string;
  private readonly maxRetries: number;

  constructor(config: OpenAIEmbeddingConfig = {}) {
    this.modelId = config.model ?? 'text-embedding-3-small';
    this.apiKey = config.apiKey ?? process.env.OPENAI_API_KEY ?? '';
    this.maxRetries = config.maxRetries ?? 2;

    // Dimensões por modelo
    const dims: Record<OpenAIEmbeddingModel, number> = {
      'text-embedding-3-small': 1536,
      'text-embedding-3-large': 3072,
      'text-embedding-ada-002': 1536,
    };
    this.dimensions = dims[this.modelId as OpenAIEmbeddingModel] ?? 1536;

    if (!this.apiKey) {
      throw new Error(
        'OpenAIEmbeddingProvider: OPENAI_API_KEY não configurada. ' +
          'Defina a variável de ambiente ou passe apiKey na configuração.',
      );
    }
  }

  async embed(text: string): Promise<number[]> {
    const trimmed = text.trim();
    if (!trimmed) throw new Error('OpenAIEmbeddingProvider: texto vazio não pode ser indexado.');

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.modelId,
            input: trimmed,
            encoding_format: 'float',
          }),
        });

        if (!response.ok) {
          const body = await response.text().catch(() => response.statusText);
          throw new Error(`OpenAI API ${response.status}: ${body}`);
        }

        const data = (await response.json()) as OpenAIResponse;
        const embedding = data.data[0]?.embedding;

        if (!embedding || embedding.length !== this.dimensions) {
          throw new Error(
            `OpenAI retornou embedding com ${embedding?.length ?? 0} dims; esperado ${this.dimensions}.`,
          );
        }

        return embedding;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < this.maxRetries) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
      }
    }

    throw lastError ?? new Error('OpenAIEmbeddingProvider: falha desconhecida.');
  }
}

// ============================================================================
// MockEmbeddingProvider (apenas para testes)
// ============================================================================

/**
 * Provider simulado para testes unitários.
 * Retorna vetores determinísticos sem chamar API externa.
 * Dimensão configurável — deve corresponder à tabela de embeddings.
 */
export class MockEmbeddingProvider implements EmbeddingProvider {
  readonly dimensions: number;
  readonly modelId = 'mock-embedding';

  constructor(dimensions = 1536) {
    this.dimensions = dimensions;
  }

  async embed(text: string): Promise<number[]> {
    // Vetor determinístico baseado no hash do texto (para testes reproduzíveis)
    const hash = Array.from(text).reduce((acc, c) => acc ^ c.charCodeAt(0), 0);
    return Array.from(
      { length: this.dimensions },
      (_, i) => Math.sin(i * 0.1 + hash * 0.01) * 0.5 + 0.5,
    );
  }
}
