/**
 * Pricing centralizado — Programa Colheita Argho
 *
 * Tabela canônica de preços de modelos AI (USD por 1M tokens), versionada.
 *
 * Princípios:
 * - Source of truth único pra consumo de IA em todo o monorepo.
 * - Preços por modelo + versão; bump em `version` quando provider mudar tabela.
 * - Cost ceilings padrão por feature, sobrescritíveis por tenant via config DB.
 *
 * Atualização: ao mudar preços oficiais, bumpar `PRICING_VERSION` e abrir ADR.
 *
 * Source: https://www.anthropic.com/pricing (verificar antes de alterar)
 */

export const PRICING_VERSION = 1 as const;

/**
 * Preços por modelo (USD por 1.000.000 de tokens).
 * Inclui apenas modelos efetivamente usados no Programa Colheita.
 */
export const MODEL_PRICING = {
  /** Anthropic Claude Sonnet 4.5 — vision + text default */
  'claude-sonnet-4-5': {
    inputPer1M: 3.0,
    outputPer1M: 15.0,
    cacheReadPer1M: 0.3,
    cacheWritePer1M: 3.75,
  },
  /** Anthropic Claude Opus 4 — usado pra tarefas críticas/complexas */
  'claude-opus-4': {
    inputPer1M: 15.0,
    outputPer1M: 75.0,
    cacheReadPer1M: 1.5,
    cacheWritePer1M: 18.75,
  },
  /** Anthropic Claude Haiku 4.5 — fallback rápido/barato */
  'claude-haiku-4-5': {
    inputPer1M: 1.0,
    outputPer1M: 5.0,
    cacheReadPer1M: 0.1,
    cacheWritePer1M: 1.25,
  },
} as const;

export type SupportedModel = keyof typeof MODEL_PRICING;

export type ModelPricing = (typeof MODEL_PRICING)[SupportedModel];

/**
 * Estimativas conservadoras de custo MÁXIMO por chamada, por feature.
 * Usado em pre-flight checks pra rejeitar requests antes de bater na API
 * quando o tenant atingiu o cost ceiling.
 */
export const FEATURE_COST_CEILINGS_USD = {
  /** Layout inference: imagem + resposta JSON estruturada */
  layoutInference: {
    estimatedMaxPerCallUsd: 0.15,
    /** Cost ceiling default por tenant por dia (override via tenant.settings) */
    defaultDailyCeilingUsd: 5.0,
  },
  /** Generator (PDF/PNG via Playwright + AI assistance opcional) */
  generator: {
    estimatedMaxPerCallUsd: 0.05,
    defaultDailyCeilingUsd: 2.0,
  },
} as const;

/**
 * Calcula custo em USD pra uma chamada de modelo.
 *
 * @example
 * const cost = calculateModelCost('claude-sonnet-4-5', { input: 5000, output: 1200 });
 */
export function calculateModelCost(
  model: SupportedModel,
  tokens: { input: number; output: number; cacheRead?: number; cacheWrite?: number },
): number {
  const pricing = MODEL_PRICING[model];
  const inputCost = (tokens.input / 1_000_000) * pricing.inputPer1M;
  const outputCost = (tokens.output / 1_000_000) * pricing.outputPer1M;
  const cacheReadCost = ((tokens.cacheRead ?? 0) / 1_000_000) * pricing.cacheReadPer1M;
  const cacheWriteCost = ((tokens.cacheWrite ?? 0) / 1_000_000) * pricing.cacheWritePer1M;
  return inputCost + outputCost + cacheReadCost + cacheWriteCost;
}
