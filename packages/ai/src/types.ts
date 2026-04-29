// packages/ai/src/types.ts
/**
 * Tipos compartilhados do pacote @colheita/ai.
 *
 * Pipeline RAG:
 *   Document (PIM/Academia) → Chunks → Retriever → RetrievalResult[] → Generator → AiAnswer
 *
 * Agent tools:
 *   AiTool[] → Claude (tool_use) → ToolResult → resposta final
 */

import { z } from 'zod';

// ============================================================================
// Document — unidade de conteúdo indexável
// ============================================================================

/**
 * Tipo da fonte do documento. Determina como o conteúdo é chunked e
 * qual prompt de síntese é usado.
 */
export type DocumentKind = 'product' | 'lesson' | 'category' | 'track' | 'certification';

/**
 * Documento pronto para indexação no RAG. Representa um item do PIM,
 * da Academia ou outro domínio.
 */
export interface AiDocument {
  /** ID único do documento no sistema de origem */
  id: string;
  /** Tipo da fonte */
  kind: DocumentKind;
  /** Título para exibição */
  title: string;
  /** Conteúdo de texto completo (Markdown ou texto plano) */
  content: string;
  /** Metadados livres (slug, nível, cultura-alvo, etc.) */
  metadata: Record<string, unknown>;
  /** Tenant dono do documento */
  tenantId: string;
}

// ============================================================================
// Chunk — fragmento de documento para retrieval
// ============================================================================

/**
 * Fragmento de um AiDocument pronto para ser recuperado.
 * Cada chunk é independente e deve ser semanticamente autocontido.
 */
export interface AiChunk {
  /** ID do documento de origem */
  documentId: string;
  /** Tipo da fonte (copiado do documento) */
  kind: DocumentKind;
  /** Índice sequencial do chunk dentro do documento (0-based) */
  chunkIndex: number;
  /** Texto do chunk */
  text: string;
  /** Metadados herdados + adicionados pelo chunker */
  metadata: Record<string, unknown>;
  /** Tenant dono do documento */
  tenantId: string;
}

// ============================================================================
// Retrieval
// ============================================================================

/**
 * Resultado do retriever: um chunk com score de relevância.
 * Score entre 0 (irrelevante) e 1 (altamente relevante).
 */
export interface RetrievalResult {
  chunk: AiChunk;
  /** Score de relevância (normalizado 0–1) */
  score: number;
}

/**
 * Opções para uma busca no retriever.
 */
export interface RetrievalQuery {
  /** Consulta de linguagem natural */
  query: string;
  /** Tenant a filtrar */
  tenantId: string;
  /** Tipos de documento a incluir (undefined = todos) */
  kinds?: DocumentKind[];
  /** Número máximo de resultados */
  topK?: number;
  /** Score mínimo para incluir no resultado (0–1) */
  minScore?: number;
}

// ============================================================================
// Retriever interface
// ============================================================================

/**
 * Interface do retriever — recupera chunks relevantes dado uma query.
 * Implementações: BM25InMemory (testes), PostgresFTS (produção).
 */
export interface Retriever {
  /**
   * Indexa um conjunto de chunks (idempotente: re-indexar substitui).
   */
  index(chunks: AiChunk[]): Promise<void>;

  /**
   * Recupera os chunks mais relevantes para a query.
   */
  retrieve(query: RetrievalQuery): Promise<RetrievalResult[]>;

  /**
   * Remove todos os chunks de um tenant (ex: ao deletar dados).
   */
  purge(tenantId: string): Promise<void>;
}

// ============================================================================
// Generator — síntese de respostas com Claude
// ============================================================================

/**
 * Um turno de conversa anterior (histórico multi-turn).
 * Compatível com o formato de mensagens da Anthropic SDK.
 */
export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Pergunta + contexto recuperado passados ao gerador.
 */
export interface GenerationInput {
  query: string;
  context: RetrievalResult[];
  /** Instrução de sistema adicional (ex: "responda em tom técnico") */
  systemHint?: string;
  /** ID do tenant para rastreamento */
  tenantId: string;
  /**
   * Histórico de conversas anteriores para suporte multi-turn.
   * Máximo recomendado: 10 turnos (5 pares pergunta/resposta).
   * Turnos mais antigos são descartados automaticamente para controle de custo.
   */
  conversationHistory?: ConversationTurn[];
}

/**
 * Resposta gerada pelo LLM.
 */
export interface AiAnswer {
  /** Resposta em Markdown */
  text: string;
  /** Chunks que embasaram a resposta */
  sources: AiChunk[];
  /** Tokens usados (para controle de custo) */
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Evento de streaming do gerador.
 * `delta` — fragmento de texto a ser acumulado pelo cliente.
 * `done`  — sinaliza fim da stream, inclui sources e usage.
 */
export type AiStreamEvent =
  | { type: 'delta'; text: string }
  | {
      type: 'done';
      sources: AiChunk[];
      usage: { inputTokens: number; outputTokens: number };
    };

// ============================================================================
// Agent tools
// ============================================================================

/**
 * Definição de uma ferramenta para o agente Claude (tool_use).
 * Compatível com o formato de tools da Anthropic SDK.
 *
 * TInput é o tipo do output do schema (após defaults aplicados).
 * O input schema pode aceitar valores parciais (ex: ZodDefault).
 */
export interface AiTool<TInput = unknown, TOutput = string> {
  /** Nome da ferramenta (snake_case) */
  name: string;
  /** Descrição usada pelo modelo para decidir quando usar */
  description: string;
  /**
   * Schema Zod do input. Pode ser ZodDefault (topK opcional) —
   * por isso usamos ZodType<TInput, ZodTypeDef, unknown> para aceitar
   * schemas com defaults sem violar a variância do tipo.
   */
  // biome-ignore lint/suspicious/noExplicitAny: ZodDefault makes input type `T | undefined`; `any` is needed for variance
  inputSchema: z.ZodType<TInput, z.ZodTypeDef, any>;
  /** Função de execução da ferramenta */
  execute: (input: TInput) => Promise<TOutput>;
}

// ============================================================================
// RAG Pipeline config
// ============================================================================

/**
 * Configuração completa do pipeline RAG.
 */
export interface RagConfig {
  /** Modelo Claude para síntese. Padrão: claude-haiku-4-5 (custo mínimo) */
  model?: string;
  /** Número de chunks recuperados. Padrão: 5 */
  topK?: number;
  /** Score mínimo de relevância. Padrão: 0.1 */
  minScore?: number;
  /** Máximo de tokens na resposta. Padrão: 1024 */
  maxTokens?: number;
}

// ============================================================================
// Zod schemas para validação de runtime
// ============================================================================

export const AiDocumentSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['product', 'lesson', 'category', 'track', 'certification']),
  title: z.string().min(1),
  content: z.string(),
  metadata: z.record(z.unknown()),
  tenantId: z.string().uuid(),
});

export const RetrievalQuerySchema = z.object({
  query: z.string().min(1).max(500),
  tenantId: z.string().uuid(),
  kinds: z.array(z.enum(['product', 'lesson', 'category', 'track', 'certification'])).optional(),
  topK: z.number().int().min(1).max(20).default(5),
  minScore: z.number().min(0).max(1).default(0.1),
});
