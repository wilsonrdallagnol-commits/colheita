// packages/ai/src/tools/search-products.ts
/**
 * Tool: search_products
 *
 * Permite ao agente Claude buscar produtos no catálogo do tenant via RAG.
 * O agente chama esta tool quando precisa responder perguntas sobre produtos:
 * composição, indicações de uso, doses, embalagens, especificações técnicas.
 *
 * @example (chamada pelo modelo)
 * {
 *   type: 'tool_use',
 *   name: 'search_products',
 *   input: { query: 'dose de Xcensis para soja', tenantId: '...' }
 * }
 */

import { z } from 'zod';
import type { AiTool, Retriever } from '../types.js';

const SearchProductsInput = z.object({
  query: z
    .string()
    .min(1)
    .max(300)
    .describe('Consulta de busca em linguagem natural sobre produtos'),
  tenantId: z.string().uuid().describe('UUID do tenant'),
  topK: z.number().int().min(1).max(10).default(3).describe('Número de resultados a retornar'),
});

type SearchProductsInput = z.infer<typeof SearchProductsInput>;

/**
 * Cria a tool search_products configurada com um retriever.
 */
export function createSearchProductsTool(retriever: Retriever): AiTool<SearchProductsInput> {
  return {
    name: 'search_products',
    description:
      'Busca informações sobre produtos agroquímicos do catálogo: composição garantida, indicações por cultura, dose recomendada, embalagens, especificações técnicas, registro MAPA. Use quando o usuário perguntar sobre um produto específico ou quiser comparar produtos.',
    inputSchema: SearchProductsInput,
    async execute(input) {
      const results = await retriever.retrieve({
        query: input.query,
        tenantId: input.tenantId,
        kinds: ['product'],
        topK: input.topK,
        minScore: 0.05,
      });

      if (results.length === 0) {
        return 'Nenhum produto encontrado para essa busca.';
      }

      return results
        .map((r, i) => {
          const title =
            (r.chunk.metadata.documentTitle as string | undefined) ?? r.chunk.documentId;
          return `[${i + 1}] ${title} (relevância: ${(r.score * 100).toFixed(0)}%)\n${r.chunk.text}`;
        })
        .join('\n\n---\n\n');
    },
  };
}
