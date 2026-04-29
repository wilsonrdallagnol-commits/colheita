// packages/ai/src/pipeline.ts
/**
 * RagPipeline — orquestra retrieval + geração para responder perguntas.
 *
 * @example
 * ```ts
 * import { BM25InMemoryRetriever } from '@colheita/ai/retriever';
 * import { AiGenerator } from '@colheita/ai/generator';
 * import { RagPipeline } from '@colheita/ai/pipeline';
 * import { chunkDocuments } from '@colheita/ai/chunker';
 *
 * const retriever = new BM25InMemoryRetriever();
 * const generator = new AiGenerator();
 * const pipeline = new RagPipeline(retriever, generator);
 *
 * // Indexar documentos
 * const chunks = chunkDocuments(productDocs);
 * await pipeline.index(chunks);
 *
 * // Fazer uma pergunta
 * const answer = await pipeline.ask({
 *   query: 'Qual a dose recomendada de Xcensis para soja?',
 *   tenantId: 'uuid-do-tenant',
 * });
 *
 * console.log(answer.text);
 * ```
 */

import type { AiGenerator } from './generator.js';
import type {
  AiAnswer,
  AiChunk,
  ConversationTurn,
  DocumentKind,
  RagConfig,
  Retriever,
} from './types.js';

// ============================================================================
// Types
// ============================================================================

export interface AskInput {
  query: string;
  tenantId: string;
  /** Filtro opcional por tipo de documento */
  kinds?: DocumentKind[];
  /** Override de configuração por pergunta */
  config?: Pick<RagConfig, 'topK' | 'minScore' | 'maxTokens'>;
  /** Instrução adicional de sistema passada ao generator */
  systemHint?: string;
  /**
   * Histórico da conversa para respostas multi-turn.
   * Passado diretamente ao AiGenerator para contexto de turno anterior.
   */
  conversationHistory?: ConversationTurn[];
}

// ============================================================================
// Pipeline
// ============================================================================

export class RagPipeline {
  private retriever: Retriever;
  private generator: AiGenerator;
  private config: Required<RagConfig>;

  constructor(retriever: Retriever, generator: AiGenerator, config: RagConfig = {}) {
    this.retriever = retriever;
    this.generator = generator;
    this.config = {
      model: config.model ?? 'claude-haiku-4-5',
      topK: config.topK ?? 5,
      minScore: config.minScore ?? 0.1,
      maxTokens: config.maxTokens ?? 1024,
    };
  }

  /**
   * Indexa chunks no retriever (delegação direta).
   */
  async index(chunks: AiChunk[]): Promise<void> {
    return this.retriever.index(chunks);
  }

  /**
   * Remove todos os chunks de um tenant.
   */
  async purge(tenantId: string): Promise<void> {
    return this.retriever.purge(tenantId);
  }

  /**
   * Responde uma pergunta em linguagem natural usando RAG.
   */
  async ask(input: AskInput): Promise<AiAnswer> {
    const topK = input.config?.topK ?? this.config.topK;
    const minScore = input.config?.minScore ?? this.config.minScore;

    // 1. Retrieve
    const context = await this.retriever.retrieve({
      query: input.query,
      tenantId: input.tenantId,
      kinds: input.kinds,
      topK,
      minScore,
    });

    // 2. Generate
    return this.generator.generate({
      query: input.query,
      context,
      tenantId: input.tenantId,
      systemHint: input.systemHint,
      conversationHistory: input.conversationHistory,
    });
  }
}
