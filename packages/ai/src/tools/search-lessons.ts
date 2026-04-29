// packages/ai/src/tools/search-lessons.ts
/**
 * Tool: search_lessons
 *
 * Permite ao agente Claude buscar conteúdo de lições e trilhas da Academia
 * via RAG. O agente usa esta tool para:
 * - Responder perguntas sobre conceitos técnicos abordados na Academia
 * - Recomendar trilhas ou lições para o distribuidor
 * - Verificar pré-requisitos ou ordem de estudo
 */

import { z } from 'zod';
import type { AiTool, Retriever } from '../types.js';

const SearchLessonsInput = z.object({
  query: z
    .string()
    .min(1)
    .max(300)
    .describe('Consulta em linguagem natural sobre conteúdo educacional'),
  tenantId: z.string().uuid().describe('UUID do tenant'),
  topK: z.number().int().min(1).max(10).default(3).describe('Número de resultados a retornar'),
});

type SearchLessonsInput = z.infer<typeof SearchLessonsInput>;

/**
 * Cria a tool search_lessons configurada com um retriever.
 */
export function createSearchLessonsTool(retriever: Retriever): AiTool<SearchLessonsInput> {
  return {
    name: 'search_lessons',
    description:
      'Busca conteúdo das trilhas de aprendizado da Academia: lições sobre produtos, boas práticas agronômicas, aplicação de insumos, manejo de culturas. Use quando o usuário quiser aprender sobre um tema ou pedir recomendações de estudo.',
    inputSchema: SearchLessonsInput,
    async execute(input) {
      const results = await retriever.retrieve({
        query: input.query,
        tenantId: input.tenantId,
        kinds: ['lesson', 'track'],
        topK: input.topK,
        minScore: 0.05,
      });

      if (results.length === 0) {
        return 'Nenhuma lição encontrada para essa busca.';
      }

      return results
        .map((r, i) => {
          const title =
            (r.chunk.metadata.documentTitle as string | undefined) ?? r.chunk.documentId;
          const kind = r.chunk.kind === 'lesson' ? 'Lição' : 'Trilha';
          return `[${i + 1}] ${kind}: ${title} (relevância: ${(r.score * 100).toFixed(0)}%)\n${r.chunk.text}`;
        })
        .join('\n\n---\n\n');
    },
  };
}
