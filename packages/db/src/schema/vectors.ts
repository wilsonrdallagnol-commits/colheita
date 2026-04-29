// packages/db/src/schema/vectors.ts
//
// Drizzle schema para as tabelas de embeddings pgvector.
// Migration: 0011_vectors.sql
// Fase 2: Knowledge Base via RAG com similaridade coseno.

import { index, pgTable, text, timestamp, unique, uuid, vector } from 'drizzle-orm/pg-core';
import { products } from './index.js';

// Dimensão padrão: text-embedding-3-small (OpenAI) ou Voyage-3-lite (Anthropic)
// Se trocar de modelo, criar migration ALTER TABLE ... ALTER COLUMN embedding TYPE vector(<nova_dim>)
const EMBEDDING_DIMS = 1536;

// ============================================================================
// PRODUCT EMBEDDINGS
// ============================================================================

export const productEmbeddings = pgTable(
  'product_embeddings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),

    /** Texto original que gerou o embedding (para re-indexação e debug) */
    chunkText: text('chunk_text').notNull(),

    /**
     * Tipo do chunk: 'name' | 'description' | 'composition' | 'specs' | 'application'
     * Permite filtros seletivos e re-indexação parcial.
     */
    chunkType: text('chunk_type').notNull().default('description'),

    /** Vetor de embedding (1536 dims = text-embedding-3-small) */
    embedding: vector('embedding', { dimensions: EMBEDDING_DIMS }).notNull(),

    /** Modelo usado para geração — útil para detectar embeddings desatualizados */
    model: text('model').notNull().default('text-embedding-3-small'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index('product_embeddings_tenant_idx').on(table.tenantId),
    // HNSW index é criado no SQL — Drizzle não suporta criação de índice HNSW ainda
    uniqueProductChunk: unique('product_embeddings_unique').on(table.productId, table.chunkType),
  }),
);

export type ProductEmbedding = typeof productEmbeddings.$inferSelect;
export type NewProductEmbedding = typeof productEmbeddings.$inferInsert;

// ============================================================================
// LESSON EMBEDDINGS
// ============================================================================

export const lessonEmbeddings = pgTable(
  'lesson_embeddings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    lessonId: uuid('lesson_id').notNull(),

    /** Texto original do chunk da lição */
    chunkText: text('chunk_text').notNull(),

    /** Tipo do chunk: 'content' | 'title' | 'summary' */
    chunkType: text('chunk_type').notNull().default('content'),

    /** Vetor de embedding */
    embedding: vector('embedding', { dimensions: EMBEDDING_DIMS }).notNull(),

    model: text('model').notNull().default('text-embedding-3-small'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index('lesson_embeddings_tenant_idx').on(table.tenantId),
    uniqueLessonChunk: unique('lesson_embeddings_unique').on(table.lessonId, table.chunkType),
  }),
);

export type LessonEmbedding = typeof lessonEmbeddings.$inferSelect;
export type NewLessonEmbedding = typeof lessonEmbeddings.$inferInsert;
