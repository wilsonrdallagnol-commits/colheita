#!/usr/bin/env tsx

/**
 * RAG Eval Suite — roda golden queries Argho contra o pgvector retriever
 * em producao e gera relatorio com metricas de qualidade.
 *
 * Uso: pnpm --filter @colheita/jobs rag-eval
 *
 * Env requerida:
 *   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *   VOYAGE_API_KEY ou OPENAI_API_KEY
 *   ARGHO_TENANT_ID (uuid do tenant Argho)
 *
 * Saida: relatorio editorial em texto + exit 0/1 baseado em threshold
 * (recall@5 minimo 60%, MRR minimo 0.4).
 */

import {
  ARGHO_GOLDEN_QUERIES,
  formatEvalReport,
  OpenAIEmbeddingProvider,
  runEvalSuite,
  SupabaseVectorRetriever,
  VoyageEmbeddingProvider,
} from '@colheita/ai';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const ARGHO_TENANT_ID = process.env.ARGHO_TENANT_ID ?? '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌  SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorios.');
  process.exit(1);
}
if (!ARGHO_TENANT_ID) {
  console.error('❌  ARGHO_TENANT_ID eh obrigatorio.');
  process.exit(1);
}

// Thresholds editoriais — sprint dedicado pode ajustar
const MIN_RECALL_AT_K = 0.6;
const MIN_MRR = 0.4;

async function main() {
  console.log('🔍  Rodando RAG eval suite — Argho golden queries...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const embeddingProvider = process.env.VOYAGE_API_KEY
    ? new VoyageEmbeddingProvider()
    : new OpenAIEmbeddingProvider();

  const retriever = new SupabaseVectorRetriever(supabase, embeddingProvider);

  const result = await runEvalSuite({
    queries: ARGHO_GOLDEN_QUERIES,
    retriever,
    tenantId: ARGHO_TENANT_ID,
    k: 5,
  });

  console.log(formatEvalReport(result));

  // Quality gate
  const failedThresholds: string[] = [];
  if (result.recallAtK < MIN_RECALL_AT_K) {
    failedThresholds.push(
      `recall@5 ${(result.recallAtK * 100).toFixed(1)}% < ${MIN_RECALL_AT_K * 100}%`,
    );
  }
  if (result.mrr < MIN_MRR) {
    failedThresholds.push(`MRR ${result.mrr.toFixed(3)} < ${MIN_MRR}`);
  }

  if (failedThresholds.length > 0) {
    console.error('\n❌  Quality gate FALHOU:');
    for (const reason of failedThresholds) {
      console.error(`   • ${reason}`);
    }
    process.exit(1);
  }

  console.log('\n✅  Quality gate OK. RAG performance dentro do esperado.');
}

main().catch((err) => {
  console.error('💥  Falha:', err);
  process.exit(1);
});
