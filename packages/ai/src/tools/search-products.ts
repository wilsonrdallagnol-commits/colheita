// packages/ai/src/tools/search-products.ts
/**
 * Tool: search_products
 *
 * Permite ao agente Claude buscar produtos no catálogo do tenant via RAG.
 * O agente chama esta tool quando precisa responder perguntas sobre produtos:
 * composição declarada, embalagens, especificações técnicas, registro MAPA.
 *
 * Dose e posicionamento por cultura só existem para os adjuvantes da linha
 * Operate; a linha biológica é publicada apenas com identidade e composição
 * declarada (ver apps/website/docs/biologicos-compliance.md).
 *
 * @example (chamada pelo modelo)
 * {
 *   type: 'tool_use',
 *   name: 'search_products',
 *   input: { query: 'composição do Xcensis', tenantId: '...' }
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
      'Busca informações sobre produtos do catálogo Argho: composição declarada, embalagens, especificações técnicas, registro MAPA e — quando o catálogo publicar — janela de aplicação e dose. Use quando o usuário perguntar sobre um produto específico ou quiser comparar produtos. Dose publicada existe apenas para os adjuvantes da linha Operate; a linha biológica traz somente identidade e composição declarada, sem dose, cultura ou modo de aplicação.',
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
