/**
 * Vision Analyzer
 *
 * Recebe imagem (buffer ou URL) → chama Claude Sonnet 4.5 vision →
 * retorna LayoutBlueprint validado + métricas (tokens, custo, latência).
 *
 * Modelo escolhido: Claude Sonnet 4.5
 *   - Qualidade superior em análise estrutural
 *   - Vision nativo
 *   - Custo razoável (~$0.01-0.05 por análise)
 *   - Consistência com restante do stack Anthropic
 */

import { anthropic } from '@ai-sdk/anthropic';
import {
  calculateModelCost,
  FEATURE_COST_CEILINGS_USD,
  type SupportedModel,
} from '@colheita/config';
import { generateText } from 'ai';
import { type LayoutBlueprint, safeValidateBlueprint } from '../blueprint/schema.js';
import {
  ANALYZER_PROMPT_VERSION,
  ANALYZER_SYSTEM_PROMPT,
  ANALYZER_USER_PROMPT,
} from '../prompts/analyzer.js';

const MODEL_ID: SupportedModel = 'claude-sonnet-4-5';

const ESTIMATED_MAX_COST_PER_CALL_USD =
  FEATURE_COST_CEILINGS_USD.layoutInference.estimatedMaxPerCallUsd;

export type AnalyzerInput =
  | { kind: 'url'; url: string; mimeType: string }
  | { kind: 'buffer'; data: Buffer; mimeType: string };

export type AnalysisResult = {
  blueprint: LayoutBlueprint;
  raw: {
    rawText: string;
  };
  metrics: {
    modelUsed: string;
    promptVersion: string;
    tokensInput: number;
    tokensOutput: number;
    durationMs: number;
    costUsd: number;
  };
};

export type AnalysisError = {
  ok: false;
  error:
    | 'invalid_blueprint'
    | 'model_error'
    | 'timeout'
    | 'cost_ceiling_exceeded'
    | 'invalid_input';
  details: string;
  raw?: string;
};

export type AnalyzerResponse = ({ ok: true } & AnalysisResult) | AnalysisError;

export type AnalyzerOptions = {
  input: AnalyzerInput;
  /** Timeout total da operação (default 60s) */
  timeoutMs?: number;
  /** Retries em falhas transitórias da API (default 2) */
  maxRetries?: number;
  /**
   * Cost ceiling: se a soma de custo já consumido pelo tenant + estimativa
   * desta call ultrapassar este valor, a análise é rejeitada antes do call.
   * Caller deve passar o valor já gasto em `consumedCostUsd`.
   */
  maxCostUsd?: number;
  /** Custo já consumido pelo tenant na janela de cost ceiling */
  consumedCostUsd?: number;
};

/**
 * Analisa uma imagem de layout e retorna o blueprint estruturado.
 *
 * @example
 * const result = await analyzeLayout({
 *   input: { kind: 'url', url: 'https://...', mimeType: 'image/png' },
 *   maxCostUsd: 5.00,
 *   consumedCostUsd: tenantUsage.todayUsd,
 * });
 *
 * if (result.ok) {
 *   console.log(result.blueprint.regions.length);
 *   console.log(`Custo: $${result.metrics.costUsd.toFixed(4)}`);
 * }
 */
export async function analyzeLayout(opts: AnalyzerOptions): Promise<AnalyzerResponse> {
  const { input, timeoutMs = 60_000, maxRetries = 2, maxCostUsd, consumedCostUsd = 0 } = opts;

  // ============================================================================
  // Pre-flight: cost ceiling
  // ============================================================================
  if (maxCostUsd !== undefined) {
    const projected = consumedCostUsd + ESTIMATED_MAX_COST_PER_CALL_USD;
    if (projected > maxCostUsd) {
      return {
        ok: false,
        error: 'cost_ceiling_exceeded',
        details: `Cost ceiling exceeded: consumed=$${consumedCostUsd.toFixed(4)}, ceiling=$${maxCostUsd.toFixed(2)}, projected=$${projected.toFixed(4)}`,
      };
    }
  }

  // ============================================================================
  // Pre-flight: validação de input (defesa contra entrada malformada)
  // ============================================================================
  if (input.kind === 'url') {
    try {
      new URL(input.url);
    } catch {
      return { ok: false, error: 'invalid_input', details: 'URL malformada' };
    }
    if (!input.mimeType.startsWith('image/') && input.mimeType !== 'application/pdf') {
      return {
        ok: false,
        error: 'invalid_input',
        details: `mimeType não suportado: ${input.mimeType}`,
      };
    }
  } else {
    if (input.data.length === 0) {
      return { ok: false, error: 'invalid_input', details: 'Buffer vazio' };
    }
    if (input.data.length > 20 * 1024 * 1024) {
      return {
        ok: false,
        error: 'invalid_input',
        details: `Imagem maior que 20MB (${input.data.length} bytes)`,
      };
    }
  }

  const startedAt = Date.now();

  try {
    const imagePart =
      input.kind === 'url'
        ? { type: 'image' as const, image: new URL(input.url) }
        : { type: 'image' as const, image: input.data, mimeType: input.mimeType };

    const result = await Promise.race([
      generateText({
        model: anthropic(MODEL_ID),
        system: ANALYZER_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [imagePart, { type: 'text', text: ANALYZER_USER_PROMPT }],
          },
        ],
        temperature: 0.2,
        maxTokens: 4_000,
        // Retry só em falhas transitórias (rate limit, network, 5xx) — AI SDK trata
        maxRetries,
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
    ]);

    const durationMs = Date.now() - startedAt;
    const rawText = result.text.trim();

    // Tenta parsear JSON (modelo pode às vezes envolver em ```json)
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return {
        ok: false,
        error: 'invalid_blueprint',
        details: 'Modelo não retornou JSON válido',
        raw: rawText,
      };
    }

    const validation = safeValidateBlueprint(parsed);
    if (!validation.success) {
      return {
        ok: false,
        error: 'invalid_blueprint',
        details: validation.error.message,
        raw: rawText,
      };
    }

    const tokensInput = result.usage.promptTokens;
    const tokensOutput = result.usage.completionTokens;
    const costUsd = calculateModelCost(MODEL_ID, {
      input: tokensInput,
      output: tokensOutput,
    });

    return {
      ok: true,
      blueprint: validation.data,
      raw: { rawText },
      metrics: {
        modelUsed: MODEL_ID,
        promptVersion: ANALYZER_PROMPT_VERSION,
        tokensInput,
        tokensOutput,
        durationMs,
        costUsd,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'timeout') {
      return { ok: false, error: 'timeout', details: `Timeout após ${timeoutMs}ms` };
    }
    return { ok: false, error: 'model_error', details: message };
  }
}
