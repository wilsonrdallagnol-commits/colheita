// packages/ai/src/eval.ts
/**
 * RAG Evaluation Suite
 *
 * Roda golden queries contra o retriever e mede metricas:
 *  - Recall@K: dos top-K retornados, quantos sao relevantes (esperados)?
 *  - MRR (Mean Reciprocal Rank): posicao media do primeiro chunk relevante
 *  - Latencia p50/p95
 *
 * Usado em CI ou em sprint de avaliacao do modelo / chunk strategy.
 *
 * @example
 * ```ts
 * import { runEvalSuite, ARGHO_GOLDEN_QUERIES } from '@colheita/ai/eval';
 *
 * const results = await runEvalSuite({
 *   queries: ARGHO_GOLDEN_QUERIES,
 *   retriever,
 *   tenantId: 'argho-uuid',
 *   k: 5,
 * });
 *
 * console.log(`Recall@5: ${(results.recallAtK * 100).toFixed(1)}%`);
 * console.log(`MRR: ${results.mrr.toFixed(3)}`);
 * ```
 */

import type { AiChunk, RetrievalResult, Retriever } from './types.js';

// ============================================================================
// Golden queries
// ============================================================================

export interface GoldenQuery {
  /** Identificador estavel pra correlacionar resultados ao longo do tempo */
  id: string;
  /** A pergunta como o usuario faria */
  query: string;
  /** Slugs ou IDs dos chunks que DEVEM aparecer no top-K (opcional) */
  expectedChunkIds?: string[];
  /** Slugs de produtos que devem ser referenciados (alternativa a chunk_id) */
  expectedProductSlugs?: string[];
  /** Categoria pra agrupamento de relatorio */
  category: 'agronomico' | 'tecnico' | 'compliance' | 'comercial' | 'aplicacao';
  /** Notas pra debug — explica o porque desta query ser relevante */
  notes?: string;
}

/**
 * Golden queries baseadas em perguntas reais que vendedores e
 * distribuidores Argho recebem em campo. Cada uma tem expectedProductSlugs
 * derivados do catalogo Argho.
 */
export const ARGHO_GOLDEN_QUERIES: GoldenQuery[] = [
  {
    id: 'soja-zn-mt',
    query: 'soja com deficiência de zinco no Mato Grosso, o que indicar?',
    expectedProductSlugs: ['operate-orange', 'operate-plus'],
    category: 'agronomico',
    notes: 'Operate Orange tem Zn em destaque; Operate Plus é multi-NPK com micronutrientes.',
  },
  {
    id: 'milho-citronela',
    query: 'qual produto Argho recomendar para milho safrinha?',
    expectedProductSlugs: ['operate-citronela', 'operate-orange'],
    category: 'agronomico',
  },
  {
    id: 'biovas-cana',
    query: 'biovas é indicado para cana-de-açúcar?',
    expectedProductSlugs: ['biovas'],
    category: 'tecnico',
  },
  {
    id: 'dose-folhar',
    query: 'qual a dose foliar recomendada para soja em V4?',
    expectedProductSlugs: ['operate-plus', 'operate-orange'],
    category: 'aplicacao',
  },
  {
    id: 'mapa-titan',
    query: 'titan tem registro MAPA?',
    expectedProductSlugs: ['titan'],
    category: 'compliance',
  },
  {
    id: 'preco-stron',
    query: 'qual o preço de stron 20L?',
    expectedProductSlugs: ['stron'],
    category: 'comercial',
    notes:
      'Verifica se o RAG nao alucinaria preco — devera retornar produto + indicar consulta comercial.',
  },
  {
    id: 'lifeon-cafe',
    query: 'lifeon serve para café?',
    expectedProductSlugs: ['lifeon'],
    category: 'agronomico',
  },
  {
    id: 'compatibilidade',
    query: 'operate plus pode ser misturado com glifosato?',
    expectedProductSlugs: ['operate-plus'],
    category: 'aplicacao',
    notes: 'Verifica se o RAG retorna a tabela de compatibilidade da ficha tecnica.',
  },
  {
    id: 'periodo-carencia',
    query: 'qual o período de carência do impuch?',
    expectedProductSlugs: ['impuch'],
    category: 'compliance',
  },
  {
    id: 'fispq-n-import',
    query: 'preciso da FISPQ do n-import',
    expectedProductSlugs: ['n-import'],
    category: 'compliance',
    notes: 'Deveria recuperar o asset role=msds linkado ao produto.',
  },
];

// ============================================================================
// Métricas
// ============================================================================

export interface EvalQueryResult {
  queryId: string;
  query: string;
  category: string;
  retrieved: RetrievalResult[];
  expected: string[];
  /** Posicoes 1-indexed onde cada expected apareceu no retrieved (0 = nao apareceu) */
  hitPositions: number[];
  /** Numero de expected que apareceram no top-K */
  hitCount: number;
  /** Hit count / expected length */
  recall: number;
  /** Reciprocal rank: 1/rank do primeiro hit, ou 0 se nenhum */
  reciprocalRank: number;
  durationMs: number;
}

export interface EvalSuiteResult {
  total: number;
  totalHits: number;
  /** Media dos recalls por query */
  recallAtK: number;
  /** Mean Reciprocal Rank — qualidade de ranking do top hit */
  mrr: number;
  /** Latencia em ms */
  p50Ms: number;
  p95Ms: number;
  perQuery: EvalQueryResult[];
  perCategory: Record<string, { count: number; recall: number; mrr: number }>;
}

// ============================================================================
// Runner
// ============================================================================

export interface RunEvalSuiteOpts {
  queries: GoldenQuery[];
  retriever: Retriever;
  tenantId: string;
  /** Top-K a recuperar (default 5) */
  k?: number;
}

/**
 * Verifica se um chunk corresponde a um expected ID/slug.
 * Aceita match em chunk.id, chunk.documentId, chunk.metadata.slug ou
 * chunk.metadata.product_slug (varias convencoes do indexer).
 */
function matchesExpected(chunk: AiChunk, expected: string[]): boolean {
  const meta = (chunk.metadata ?? {}) as Record<string, unknown>;
  const candidates: string[] = [
    chunk.documentId,
    typeof meta.slug === 'string' ? meta.slug : '',
    typeof meta.product_slug === 'string' ? meta.product_slug : '',
    typeof meta.lesson_slug === 'string' ? meta.lesson_slug : '',
  ].filter(Boolean);

  return expected.some((exp) => candidates.includes(exp));
}

export async function runEvalSuite(opts: RunEvalSuiteOpts): Promise<EvalSuiteResult> {
  const { queries, retriever, tenantId, k = 5 } = opts;
  const perQuery: EvalQueryResult[] = [];
  const latencies: number[] = [];

  for (const goldenQuery of queries) {
    const startedAt = Date.now();
    const retrieved = await retriever.retrieve({
      query: goldenQuery.query,
      tenantId,
      topK: k,
    });
    const durationMs = Date.now() - startedAt;
    latencies.push(durationMs);

    const expected = [
      ...(goldenQuery.expectedChunkIds ?? []),
      ...(goldenQuery.expectedProductSlugs ?? []),
    ];

    const hitPositions = expected.map((exp) => {
      const idx = retrieved.findIndex((result) => matchesExpected(result.chunk, [exp]));
      return idx >= 0 ? idx + 1 : 0;
    });

    const hitCount = hitPositions.filter((p) => p > 0).length;
    const recall = expected.length === 0 ? 0 : hitCount / expected.length;

    // Reciprocal rank: 1/posicao do primeiro hit (qualquer expected)
    const firstHitPositions = hitPositions.filter((p) => p > 0);
    const reciprocalRank = firstHitPositions.length > 0 ? 1 / Math.min(...firstHitPositions) : 0;

    perQuery.push({
      queryId: goldenQuery.id,
      query: goldenQuery.query,
      category: goldenQuery.category,
      retrieved,
      expected,
      hitPositions,
      hitCount,
      recall,
      reciprocalRank,
      durationMs,
    });
  }

  // Agregadas
  const totalHits = perQuery.reduce((sum, q) => sum + q.hitCount, 0);
  const recallAtK =
    perQuery.length === 0 ? 0 : perQuery.reduce((sum, q) => sum + q.recall, 0) / perQuery.length;
  const mrr =
    perQuery.length === 0
      ? 0
      : perQuery.reduce((sum, q) => sum + q.reciprocalRank, 0) / perQuery.length;

  const sortedLatencies = [...latencies].sort((a, b) => a - b);
  const p50Ms = sortedLatencies[Math.floor(sortedLatencies.length * 0.5)] ?? 0;
  const p95Ms = sortedLatencies[Math.floor(sortedLatencies.length * 0.95)] ?? 0;

  // Per category
  const perCategory: Record<string, { count: number; recall: number; mrr: number }> = {};
  for (const q of perQuery) {
    const cat = q.category;
    if (!perCategory[cat]) {
      perCategory[cat] = { count: 0, recall: 0, mrr: 0 };
    }
    const ref = perCategory[cat];
    if (ref) {
      ref.count++;
      ref.recall += q.recall;
      ref.mrr += q.reciprocalRank;
    }
  }
  for (const cat of Object.keys(perCategory)) {
    const ref = perCategory[cat];
    if (ref && ref.count > 0) {
      ref.recall = ref.recall / ref.count;
      ref.mrr = ref.mrr / ref.count;
    }
  }

  return {
    total: perQuery.length,
    totalHits,
    recallAtK,
    mrr,
    p50Ms,
    p95Ms,
    perQuery,
    perCategory,
  };
}

/**
 * Formata um EvalSuiteResult em texto estruturado pra console/log.
 */
export function formatEvalReport(result: EvalSuiteResult): string {
  const lines: string[] = [];
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('  RAG EVAL SUITE — Resultado');
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`  Total queries:  ${result.total}`);
  lines.push(`  Total hits:     ${result.totalHits}`);
  lines.push(`  Recall@K:       ${(result.recallAtK * 100).toFixed(1)}%`);
  lines.push(`  MRR:            ${result.mrr.toFixed(3)}`);
  lines.push(`  Latencia p50:   ${result.p50Ms}ms`);
  lines.push(`  Latencia p95:   ${result.p95Ms}ms`);
  lines.push('');
  lines.push('  Por categoria:');
  for (const [cat, stats] of Object.entries(result.perCategory)) {
    lines.push(
      `    ${cat.padEnd(14)} ${stats.count} queries | recall ${(stats.recall * 100).toFixed(1)}% | MRR ${stats.mrr.toFixed(3)}`,
    );
  }
  lines.push('');
  lines.push('  Per query:');
  for (const q of result.perQuery) {
    const status = q.hitCount === q.expected.length ? '✓' : q.hitCount > 0 ? '~' : '✗';
    lines.push(
      `    ${status} [${q.queryId}] ${q.hitCount}/${q.expected.length} | ${q.durationMs}ms`,
    );
    lines.push(`      "${q.query}"`);
    if (q.hitCount < q.expected.length) {
      const missing = q.expected.filter((_, i) => q.hitPositions[i] === 0);
      lines.push(`      ⚠️  faltou: ${missing.join(', ')}`);
    }
  }
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════');
  return lines.join('\n');
}
