// packages/ai/src/chunker.ts
/**
 * Chunker — divide AiDocuments em AiChunks para indexação no RAG.
 *
 * Estratégia:
 * - Documentos curtos (< minChunkChars): chunk único
 * - Documentos longos: split por parágrafos/seções, com overlap para
 *   manter contexto entre chunks adjacentes
 *
 * Não usa embeddings — o chunker é puro (sem I/O, testável offline).
 */

import type { AiChunk, AiDocument } from './types.js';

// ============================================================================
// Config
// ============================================================================

export interface ChunkerConfig {
  /**
   * Tamanho alvo de cada chunk em caracteres.
   * Padrão: 800 (≈ 160 tokens com Haiku/Sonnet)
   */
  targetChunkChars?: number;
  /**
   * Overlap entre chunks consecutivos em caracteres.
   * Padrão: 120 (≈ 15% do chunk, preserva contexto entre fronteiras)
   */
  overlapChars?: number;
  /**
   * Tamanho mínimo de um chunk para ser incluído.
   * Chunks menores são descartados (ruído).
   * Padrão: 40
   */
  minChunkChars?: number;
}

const DEFAULTS: Required<ChunkerConfig> = {
  targetChunkChars: 800,
  overlapChars: 120,
  minChunkChars: 40,
};

// ============================================================================
// Public API
// ============================================================================

/**
 * Divide um AiDocument em AiChunks.
 *
 * @example
 * ```ts
 * const chunks = chunkDocument(productDoc);
 * await retriever.index(chunks);
 * ```
 */
export function chunkDocument(doc: AiDocument, config: ChunkerConfig = {}): AiChunk[] {
  const cfg = { ...DEFAULTS, ...config };
  const paragraphs = splitIntoParagraphs(doc.content);

  if (paragraphs.length === 0) {
    return [];
  }

  // Documentos pequenos: chunk único
  if (doc.content.length <= cfg.targetChunkChars) {
    return [makeChunk(doc, 0, buildHeader(doc) + doc.content, {})];
  }

  return buildChunks(doc, paragraphs, cfg);
}

/**
 * Divide uma lista de documentos, retornando todos os chunks em ordem.
 */
export function chunkDocuments(docs: AiDocument[], config: ChunkerConfig = {}): AiChunk[] {
  return docs.flatMap((doc) => chunkDocument(doc, config));
}

// ============================================================================
// Internals
// ============================================================================

/** Cabeçalho adicionado a cada chunk para situar o modelo. */
function buildHeader(doc: AiDocument): string {
  const kindLabel: Record<string, string> = {
    product: 'Produto',
    lesson: 'Lição',
    category: 'Categoria',
    track: 'Trilha',
    certification: 'Certificação',
  };
  return `[${kindLabel[doc.kind] ?? doc.kind}] ${doc.title}\n\n`;
}

/** Separa o texto em parágrafos não-vazios. */
function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function buildChunks(
  doc: AiDocument,
  paragraphs: string[],
  cfg: Required<ChunkerConfig>,
): AiChunk[] {
  const header = buildHeader(doc);
  const chunks: AiChunk[] = [];
  let buffer = header;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const withParagraph = buffer + (buffer === header ? '' : '\n\n') + paragraph;

    if (withParagraph.length > cfg.targetChunkChars && buffer !== header) {
      // Flush current buffer as a chunk
      if (buffer.trim().length >= cfg.minChunkChars) {
        chunks.push(makeChunk(doc, chunkIndex, buffer, { paragraphCount: chunkIndex }));
        chunkIndex++;
      }

      // Start new buffer with overlap from end of previous buffer
      const overlap = extractOverlap(buffer, cfg.overlapChars);
      buffer = header + (overlap ? `${overlap}\n\n` : '') + paragraph;
    } else {
      buffer = withParagraph;
    }
  }

  // Flush remaining
  if (buffer.trim().length >= cfg.minChunkChars) {
    chunks.push(makeChunk(doc, chunkIndex, buffer, { isLast: true }));
  }

  return chunks;
}

/** Extrai os últimos N caracteres de um texto para usar como overlap. */
function extractOverlap(text: string, overlapChars: number): string {
  if (text.length <= overlapChars) return text;
  const slice = text.slice(-overlapChars);
  // Tenta cortar no início de uma palavra
  const wordBoundary = slice.indexOf(' ');
  return wordBoundary > 0 ? slice.slice(wordBoundary + 1) : slice;
}

function makeChunk(
  doc: AiDocument,
  chunkIndex: number,
  text: string,
  extra: Record<string, unknown>,
): AiChunk {
  return {
    documentId: doc.id,
    kind: doc.kind,
    chunkIndex,
    text: text.trim(),
    tenantId: doc.tenantId,
    metadata: {
      ...doc.metadata,
      documentTitle: doc.title,
      chunkIndex,
      ...extra,
    },
  };
}
