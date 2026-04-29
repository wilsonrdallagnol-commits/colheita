// packages/ai/src/generator.ts
/**
 * Generator — sintetiza respostas com Claude usando contexto recuperado.
 *
 * Usa claude-haiku-4-5 por padrão (menor custo). Para respostas mais
 * elaboradas, configure model: 'claude-sonnet-4-5'.
 *
 * O generator não acessa o retriever — ele recebe os chunks já recuperados
 * como GenerationInput.context. O pipeline.ts orquestra os dois.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AiAnswer, AiChunk, GenerationInput } from './types.js';

// ============================================================================
// Defaults
// ============================================================================

const DEFAULT_MODEL = 'claude-haiku-4-5';
const DEFAULT_MAX_TOKENS = 1024;

// ============================================================================
// System prompt base
// ============================================================================

function buildSystemPrompt(hint?: string): string {
  const base = `Você é um assistente especializado em produtos agroquímicos e trilhas de aprendizado da plataforma Colheita.

Responda com base EXCLUSIVAMENTE nas informações fornecidas no contexto abaixo. Se a informação não estiver no contexto, diga "Não tenho informação suficiente para responder essa pergunta."

Regras:
- Responda em Português Brasileiro
- Use Markdown para formatação quando útil
- Seja preciso e objetivo
- Cite as fontes pelo título quando relevante`;

  return hint ? `${base}\n\n${hint}` : base;
}

function buildContextBlock(context: GenerationInput['context']): string {
  if (context.length === 0) {
    return 'Nenhum contexto relevante encontrado.';
  }

  return context
    .map((result, i) => {
      const title =
        (result.chunk.metadata.documentTitle as string | undefined) ?? result.chunk.documentId;
      return `--- Fonte ${i + 1}: ${title} (relevância: ${(result.score * 100).toFixed(0)}%) ---\n${result.chunk.text}`;
    })
    .join('\n\n');
}

// ============================================================================
// Generator
// ============================================================================

export interface GeneratorConfig {
  model?: string;
  maxTokens?: number;
  apiKey?: string;
}

export class AiGenerator {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;

  constructor(config: GeneratorConfig = {}) {
    this.client = new Anthropic({
      apiKey: config.apiKey ?? process.env.ANTHROPIC_API_KEY,
    });
    this.model = config.model ?? DEFAULT_MODEL;
    this.maxTokens = config.maxTokens ?? DEFAULT_MAX_TOKENS;
  }

  async generate(input: GenerationInput): Promise<AiAnswer> {
    const contextBlock = buildContextBlock(input.context);
    const systemPrompt = buildSystemPrompt(input.systemHint);

    const userMessage = `## Contexto\n\n${contextBlock}\n\n## Pergunta\n\n${input.query}`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const text = textBlock?.type === 'text' ? textBlock.text : '';

    const sources: AiChunk[] = input.context.filter((r) => r.score > 0.3).map((r) => r.chunk);

    return {
      text,
      sources,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}
