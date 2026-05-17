// packages/ai/src/indexing.ts
/**
 * Chunk builders — transformam produtos e lições do PIM/Academia em AiChunk[]
 * prontos pra indexação no pgvector.
 *
 * Extraído do script reindex-all pra ser reutilizado tanto pelo CLI quanto
 * pelo endpoint /api/admin/reindex do admin.
 */

import type { AiChunk } from './types.js';

export interface ProductRow {
  id: string;
  tenant_id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  composition: {
    macros?: Record<string, number>;
    micros?: Record<string, number>;
    others?: Record<string, number>;
  } | null;
  applications: Array<{
    crop: string;
    stage?: string;
    dosePerHa: number;
    unit: string;
    notes?: string;
  }> | null;
}

export interface LessonRow {
  id: string;
  tenant_id: string;
  title: string;
  content: Record<string, unknown> | null;
}

/**
 * Quebra um produto em chunks semânticos: nome, descrição, composição,
 * indicações por cultura. Cada chunk vira 1 embedding (upsert por chunkType).
 */
export function buildProductChunks(product: ProductRow): AiChunk[] {
  const chunks: AiChunk[] = [];
  const { id, tenant_id } = product;

  const nameText = [product.name, product.tagline].filter(Boolean).join(' — ');
  if (nameText) {
    chunks.push({
      documentId: id,
      kind: 'product',
      chunkIndex: 0,
      text: nameText,
      metadata: { chunkType: 'name' },
      tenantId: tenant_id,
    });
  }

  if (product.description) {
    chunks.push({
      documentId: id,
      kind: 'product',
      chunkIndex: 1,
      text: product.description,
      metadata: { chunkType: 'description' },
      tenantId: tenant_id,
    });
  }

  if (product.composition) {
    const parts: string[] = [];
    const { macros, micros, others } = product.composition;
    if (macros && Object.keys(macros).length > 0) {
      parts.push(
        `Macronutrientes: ${Object.entries(macros)
          .map(([k, v]) => `${k}: ${v}%`)
          .join(', ')}`,
      );
    }
    if (micros && Object.keys(micros).length > 0) {
      parts.push(
        `Micronutrientes: ${Object.entries(micros)
          .map(([k, v]) => `${k}: ${v}%`)
          .join(', ')}`,
      );
    }
    if (others && Object.keys(others).length > 0) {
      parts.push(
        `Outros: ${Object.entries(others)
          .map(([k, v]) => `${k}: ${v}%`)
          .join(', ')}`,
      );
    }
    if (parts.length > 0) {
      chunks.push({
        documentId: id,
        kind: 'product',
        chunkIndex: 2,
        text: `Composição de ${product.name}: ${parts.join('. ')}`,
        metadata: { chunkType: 'composition' },
        tenantId: tenant_id,
      });
    }
  }

  if (product.applications && product.applications.length > 0) {
    const appText = product.applications
      .map(
        (app) =>
          `${app.crop}${app.stage ? ` (${app.stage})` : ''}: ${app.dosePerHa} ${app.unit}/ha${
            app.notes ? ` — ${app.notes}` : ''
          }`,
      )
      .join('; ');
    chunks.push({
      documentId: id,
      kind: 'product',
      chunkIndex: 3,
      text: `Indicações por cultura de ${product.name}: ${appText}`,
      metadata: { chunkType: 'application' },
      tenantId: tenant_id,
    });
  }

  return chunks;
}

/**
 * Transforma uma lição da Academia num único chunk (título + corpo).
 */
export function buildLessonChunk(lesson: LessonRow): AiChunk {
  const parts: string[] = [lesson.title];
  if (lesson.content) {
    const c = lesson.content;
    if (c.type === 'article' && typeof c.body === 'string') parts.push(c.body);
    else if (typeof c.text === 'string') parts.push(c.text);
    else if (typeof c.description === 'string') parts.push(c.description);
  }
  return {
    documentId: lesson.id,
    kind: 'lesson',
    chunkIndex: 0,
    text: parts.filter(Boolean).join('\n\n'),
    metadata: { chunkType: 'content' },
    tenantId: lesson.tenant_id,
  };
}
