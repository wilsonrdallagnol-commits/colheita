// packages/ai/src/retriever.ts
/**
 * BM25InMemoryRetriever — implementação de retrieval sem banco de dados.
 *
 * Usa TF-IDF simplificado (BM25-like) com normalização de tokens:
 * - tokenização por whitespace + remoção de pontuação
 * - stopwords PT-BR removidas
 * - score = soma de tf-idf dos tokens da query presentes no chunk
 *
 * Adequado para:
 * - Testes unitários (sem Docker)
 * - Desenvolvimento local
 * - Catálogos pequenos (< 10k chunks)
 *
 * Para produção, use PostgresFTSRetriever (tsvector, índice GIN).
 */

import type { AiChunk, RetrievalQuery, RetrievalResult, Retriever } from './types.js';

// ============================================================================
// Stopwords PT-BR
// ============================================================================

const STOPWORDS_PT = new Set([
  'a',
  'ao',
  'aos',
  'aquela',
  'aquelas',
  'aquele',
  'aqueles',
  'aquilo',
  'as',
  'até',
  'com',
  'como',
  'da',
  'das',
  'de',
  'dela',
  'delas',
  'dele',
  'deles',
  'depois',
  'do',
  'dos',
  'e',
  'ela',
  'elas',
  'ele',
  'eles',
  'em',
  'entre',
  'era',
  'essa',
  'essas',
  'esse',
  'esses',
  'esta',
  'estas',
  'este',
  'estes',
  'eu',
  'foi',
  'from',
  'há',
  'isso',
  'isto',
  'já',
  'lhe',
  'lhes',
  'lo',
  'mas',
  'me',
  'mesmo',
  'meu',
  'minha',
  'muito',
  'na',
  'não',
  'nas',
  'nem',
  'no',
  'nos',
  'nós',
  'o',
  'os',
  'ou',
  'para',
  'pela',
  'pelas',
  'pelo',
  'pelos',
  'por',
  'qual',
  'quando',
  'que',
  'quem',
  'se',
  'sem',
  'ser',
  'seu',
  'seus',
  'só',
  'sua',
  'suas',
  'também',
  'te',
  'tem',
  'tendo',
  'ter',
  'teu',
  'toda',
  'todas',
  'todo',
  'todos',
  'tu',
  'tua',
  'tuas',
  'um',
  'uma',
  'umas',
  'uns',
  'você',
  'vocês',
  'vos',
  'à',
  'às',
]);

// BM25 constants
const K1 = 1.5;
const B = 0.75;

// ============================================================================
// Tokenizer
// ============================================================================

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\wÀ-úÀ-ÿ\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS_PT.has(t));
}

// ============================================================================
// Inverted index
// ============================================================================

interface IndexEntry {
  chunk: AiChunk;
  termFreqs: Map<string, number>;
  termCount: number;
}

// ============================================================================
// BM25InMemoryRetriever
// ============================================================================

export class BM25InMemoryRetriever implements Retriever {
  private _idx = new Map<string, IndexEntry[]>(); // keyed by tenantId
  private docFreq = new Map<string, Map<string, number>>(); // tenantId → term → docCount

  async index(chunks: AiChunk[]): Promise<void> {
    for (const chunk of chunks) {
      const { tenantId } = chunk;

      if (!this._idx.has(tenantId)) {
        this._idx.set(tenantId, []);
        this.docFreq.set(tenantId, new Map());
      }

      // Safe: we just initialized these above
      const tenantDocs = this._idx.get(tenantId) ?? [];
      const tenantDf = this.docFreq.get(tenantId) ?? new Map<string, number>();

      // Remove chunk existente com mesmo documentId + chunkIndex (idempotente)
      const existingIdx = tenantDocs.findIndex(
        (e) => e.chunk.documentId === chunk.documentId && e.chunk.chunkIndex === chunk.chunkIndex,
      );
      if (existingIdx >= 0) {
        // Decrementar df dos tokens do chunk removido
        const old = tenantDocs[existingIdx] ?? { termFreqs: new Map<string, number>() };
        for (const term of old.termFreqs.keys()) {
          const df = (tenantDf.get(term) ?? 1) - 1;
          if (df <= 0) {
            tenantDf.delete(term);
          } else {
            tenantDf.set(term, df);
          }
        }
        tenantDocs.splice(existingIdx, 1);
      }

      // Tokenizar e calcular TF
      const tokens = tokenize(chunk.text);
      const termFreqs = new Map<string, number>();
      for (const token of tokens) {
        termFreqs.set(token, (termFreqs.get(token) ?? 0) + 1);
      }

      // Atualizar DF
      for (const term of termFreqs.keys()) {
        tenantDf.set(term, (tenantDf.get(term) ?? 0) + 1);
      }

      tenantDocs.push({ chunk, termFreqs, termCount: tokens.length });
    }
  }

  async retrieve(query: RetrievalQuery): Promise<RetrievalResult[]> {
    const { tenantId, topK = 5, minScore = 0.1, kinds } = query;
    const tenantDocs = this._idx.get(tenantId) ?? [];
    const tenantDf = this.docFreq.get(tenantId) ?? new Map();
    const N = tenantDocs.length;

    if (N === 0) return [];

    const queryTokens = tokenize(query.query);
    if (queryTokens.length === 0) return [];

    // Comprimento médio dos documentos
    const avgDocLen = tenantDocs.reduce((sum, e) => sum + e.termCount, 0) / N;

    // Calcular BM25 score para cada documento
    const scored: { entry: IndexEntry; score: number }[] = [];

    for (const entry of tenantDocs) {
      // Filtro por kind
      if (kinds && kinds.length > 0 && !kinds.includes(entry.chunk.kind)) {
        continue;
      }

      let score = 0;
      for (const term of queryTokens) {
        const tf = entry.termFreqs.get(term) ?? 0;
        if (tf === 0) continue;

        const df = tenantDf.get(term) ?? 0;
        if (df === 0) continue;

        // IDF (BM25)
        const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);

        // TF normalizado (BM25)
        const tfNorm = (tf * (K1 + 1)) / (tf + K1 * (1 - B + B * (entry.termCount / avgDocLen)));

        score += idf * tfNorm;
      }

      if (score > 0) {
        scored.push({ entry, score });
      }
    }

    if (scored.length === 0) return [];

    // Normalizar scores para 0–1
    const maxScore = Math.max(...scored.map((s) => s.score));

    return scored
      .map(({ entry, score }) => ({
        chunk: entry.chunk,
        score: maxScore > 0 ? score / maxScore : 0,
      }))
      .filter((r) => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  async purge(tenantId: string): Promise<void> {
    this._idx.delete(tenantId);
    this.docFreq.delete(tenantId);
  }

  /** Retorna o número de chunks indexados para um tenant (útil em testes). */
  count(tenantId: string): number {
    return this._idx.get(tenantId)?.length ?? 0;
  }
}
