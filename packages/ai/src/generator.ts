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
import type { AiAnswer, AiChunk, AiStreamEvent, GenerationInput } from './types.js';

// ============================================================================
// Defaults
// ============================================================================

const DEFAULT_MODEL = 'claude-haiku-4-5';
const DEFAULT_MAX_TOKENS = 1024;
const MAX_HISTORY_TURNS = 10;

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

  /** Builds the shared messages array used by both generate() and generateStream(). */
  private buildMessages(input: GenerationInput) {
    const contextBlock = buildContextBlock(input.context);
    const history = (input.conversationHistory ?? []).slice(-MAX_HISTORY_TURNS);
    return [
      ...history,
      {
        role: 'user' as const,
        content: `## Contexto\n\n${contextBlock}\n\n## Pergunta\n\n${input.query}`,
      },
    ];
  }

  async generate(input: GenerationInput): Promise<AiAnswer> {
    const systemPrompt = buildSystemPrompt(input.systemHint);
    const messages = this.buildMessages(input);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: systemPrompt,
      messages,
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

  /**
   * Versão streaming de generate().
   * Yields AiStreamEvent a medida que Claude gera o texto.
   * O evento final `done` inclui sources e usage.
   */
  async *generateStream(input: GenerationInput): AsyncGenerator<AiStreamEvent, void, undefined> {
    const systemPrompt = buildSystemPrompt(input.systemHint);
    const messages = this.buildMessages(input);

    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: this.maxTokens,
      system: systemPrompt,
      messages,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta' &&
        event.delta.text
      ) {
        yield { type: 'delta', text: event.delta.text };
      }
    }

    const finalMsg = await stream.finalMessage();
    const sources: AiChunk[] = input.context.filter((r) => r.score > 0.3).map((r) => r.chunk);

    yield {
      type: 'done',
      sources,
      usage: {
        inputTokens: finalMsg.usage.input_tokens,
        outputTokens: finalMsg.usage.output_tokens,
      },
    };
  }
}
