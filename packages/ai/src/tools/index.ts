// packages/ai/src/tools/index.ts
/**
 * Tools do agente Colheita para uso com Claude (tool_use).
 *
 * @example
 * ```ts
 * import { createAgentTools, toolsToAnthropicFormat } from '@colheita/ai/tools';
 * import { BM25InMemoryRetriever } from '@colheita/ai/retriever';
 *
 * const retriever = new BM25InMemoryRetriever();
 * const tools = createAgentTools(retriever);
 * const anthropicTools = toolsToAnthropicFormat(tools);
 *
 * const response = await client.messages.create({
 *   model: 'claude-haiku-4-5',
 *   tools: anthropicTools,
 *   messages: [{ role: 'user', content: 'Qual a composição do Xcensis?' }],
 * });
 * ```
 */

import type Anthropic from '@anthropic-ai/sdk';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { AiTool, Retriever } from '../types.js';
import { createSearchLessonsTool } from './search-lessons.js';
import { createSearchProductsTool } from './search-products.js';

export { createSearchLessonsTool } from './search-lessons.js';
export { createSearchProductsTool } from './search-products.js';

/**
 * Cria o conjunto completo de tools do agente Colheita.
 */
export function createAgentTools(retriever: Retriever): AiTool[] {
  return [
    createSearchProductsTool(retriever) as AiTool,
    createSearchLessonsTool(retriever) as AiTool,
  ];
}

/**
 * Converte AiTool[] para o formato Anthropic SDK (tools param da messages.create).
 */
export function toolsToAnthropicFormat(tools: AiTool[]): Anthropic.Messages.Tool[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: zodToJsonSchema(tool.inputSchema, {
      $refStrategy: 'none',
    }) as Anthropic.Messages.Tool['input_schema'],
  }));
}

/**
 * Executa o resultado de um tool_use do modelo.
 *
 * @example
 * ```ts
 * const toolUseBlock = response.content.find(b => b.type === 'tool_use');
 * const result = await executeTool(tools, toolUseBlock);
 * ```
 */
export async function executeTool(
  tools: AiTool[],
  toolUse: { name: string; input: unknown },
): Promise<string> {
  const tool = tools.find((t) => t.name === toolUse.name);
  if (!tool) {
    return `Tool desconhecida: ${toolUse.name}`;
  }

  const parsed = tool.inputSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    return `Erro de validação: ${parsed.error.message}`;
  }

  try {
    const result = await tool.execute(parsed.data);
    return typeof result === 'string' ? result : JSON.stringify(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `Erro ao executar ${toolUse.name}: ${message}`;
  }
}
