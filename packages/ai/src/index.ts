// packages/ai/src/index.ts
/**
 * @colheita/ai — Pacote de IA para o projeto Colheita.
 *
 * Fornece:
 * - Chunker: divide documentos em chunks para indexação
 * - BM25InMemoryRetriever: retrieval in-memory sem dependências externas
 * - AiGenerator: geração com Claude via Anthropic SDK
 * - RagPipeline: orquestra retrieval + geração (RAG completo)
 * - Agent tools: search_products e search_lessons para uso com tool_use
 *
 * @example
 * ```ts
 * import { BM25InMemoryRetriever, AiGenerator, RagPipeline, chunkDocuments } from '@colheita/ai';
 *
 * const retriever = new BM25InMemoryRetriever();
 * const generator = new AiGenerator();
 * const pipeline = new RagPipeline(retriever, generator);
 *
 * const chunks = chunkDocuments(docs);
 * await pipeline.index(chunks);
 * const answer = await pipeline.ask({ query: '...', tenantId: '...' });
 * ```
 */

export type { ChunkerConfig } from './chunker.js';

// Chunker
export { chunkDocument, chunkDocuments } from './chunker.js';
export type { GeneratorConfig } from './generator.js';
// Generator
export { AiGenerator } from './generator.js';
export type { AskInput } from './pipeline.js';
// Pipeline
export { RagPipeline } from './pipeline.js';
// Retriever
export { BM25InMemoryRetriever } from './retriever.js';
// Tools
export {
  createAgentTools,
  createSearchLessonsTool,
  createSearchProductsTool,
  executeTool,
  toolsToAnthropicFormat,
} from './tools/index.js';
// Types
export type {
  AiAnswer,
  AiChunk,
  AiDocument,
  AiTool,
  ConversationTurn,
  DocumentKind,
  GenerationInput,
  RagConfig,
  RetrievalQuery,
  RetrievalResult,
  Retriever,
} from './types.js';
