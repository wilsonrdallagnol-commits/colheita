/**
 * Layout Inference — Schema Drizzle
 *
 * Espelha /infra/supabase/migrations/0006_layout_inference.sql
 *
 * Princípio: o LayoutBlueprint é uma representação ABSTRATA, tenant-agnostic,
 * da estrutura de um layout de referência. O tema (cores, fontes, espaçamento)
 * é aplicado no momento do render via @colheita/tokens.
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  numeric,
  index,
  uniqueIndex,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { tenants, users } from './index.js';
import { assets } from './index.js';

// ============================================================================
// Tipos do Blueprint (validados por Zod no app)
// ============================================================================

export type LayoutFormat = {
  aspectRatio: string;                     // "9:16", "16:9", "1:1", "210:297" (A4)
  orientation: 'portrait' | 'landscape' | 'square';
  intendedDpi: 72 | 150 | 300;
  intendedMedium: 'screen' | 'print' | 'social' | 'presentation';
};

export type LayoutGrid = {
  columns: number;                         // 4, 6, 8, 12
  rows: number | 'auto';
  density: 'minimal' | 'medium' | 'high' | 'maximal';
  gutterRelative: number;                  // 0.0–1.0
};

export type LayoutRegionType =
  | 'brand_header'
  | 'headline_block'
  | 'subheadline_block'
  | 'product_centerpiece'
  | 'product_gallery'
  | 'data_grid'
  | 'feature_list'
  | 'icon_grid'
  | 'testimonial'
  | 'cta_block'
  | 'footer'
  | 'badge_strip'
  | 'media_block'
  | 'qr_code'
  | 'legal_block'
  | 'decorative';

export type LayoutRegion = {
  id: string;                              // 'header', 'hero', 'specs'
  type: LayoutRegionType;
  position: 'top' | 'upper' | 'center' | 'lower' | 'bottom' | 'left' | 'right';
  weight: number;                          // 0.0–1.0 — proporção vertical/horizontal
  hierarchy?: string[];                    // pra blocos com sub-elementos
  itemCount?: number;
  layoutHint?: 'horizontal_chips' | 'vertical_stack' | 'grid' | 'carousel' | 'overlap';
  notes?: string;                          // observação livre do vision model
};

export type LayoutVisualIntent = {
  mood: 'technical_premium' | 'editorial' | 'promotional' | 'minimal' | 'bold' | 'cinematic';
  density: 'minimal' | 'medium' | 'high' | 'maximal';
  balance: 'centered' | 'asymmetric' | 'left_heavy' | 'right_heavy';
  emphasis: 'product_first' | 'data_first' | 'message_first' | 'visual_first';
  inferredPalette?: 'dark' | 'light' | 'high_contrast' | 'gradient_heavy';
};

export type LayoutBlueprintData = {
  format: LayoutFormat;
  grid: LayoutGrid;
  regions: LayoutRegion[];
  visualIntent: LayoutVisualIntent;
  // Dados livres pra capturar nuances que não cabem no schema fechado
  notes?: string;
};

// ============================================================================
// LAYOUT REFERENCES
// ============================================================================

export const layoutReferences = pgTable(
  'layout_references',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id').notNull().references(() => assets.id, { onDelete: 'restrict' }),
    title: text('title').notNull(),
    description: text('description'),
    sourceUrl: text('source_url'),
    sourceType: text('source_type', {
      enum: ['upload', 'url', 'historical', 'competitor', 'inspiration'],
    })
      .notNull()
      .default('upload'),
    tags: text('tags').array().notNull().default(sql`ARRAY[]::text[]`),
    intendedCategory: text('intended_category', {
      enum: ['datasheet', 'banner', 'social_post', 'catalog', 'presentation', 'flyer', 'other'],
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by').references(() => users.id),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    tenantIdx: index('layout_references_tenant_idx').on(table.tenantId),
    categoryIdx: index('layout_references_category_idx').on(table.tenantId, table.intendedCategory),
  }),
);

export type LayoutReference = typeof layoutReferences.$inferSelect;
export type NewLayoutReference = typeof layoutReferences.$inferInsert;

// ============================================================================
// LAYOUT BLUEPRINTS
// ============================================================================

export const layoutBlueprints = pgTable(
  'layout_blueprints',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    referenceId: uuid('reference_id')
      .notNull()
      .references(() => layoutReferences.id, { onDelete: 'cascade' }),
    version: integer('version').notNull().default(1),
    parentId: uuid('parent_id').references((): AnyPgColumn => layoutBlueprints.id, {
      onDelete: 'set null',
    }),
    isCurrent: boolean('is_current').notNull().default(true),
    blueprint: jsonb('blueprint').$type<LayoutBlueprintData>().notNull(),
    rawAnalysis: jsonb('raw_analysis').$type<Record<string, unknown>>().notNull().default({}),
    status: text('status', {
      enum: ['analyzing', 'draft', 'reviewed', 'approved', 'archived'],
    })
      .notNull()
      .default('draft'),
    reviewedBy: uuid('reviewed_by').references(() => users.id),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    reviewNotes: text('review_notes'),
    modelUsed: text('model_used'),
    tokensInput: integer('tokens_input'),
    tokensOutput: integer('tokens_output'),
    durationMs: integer('duration_ms'),
    costUsd: numeric('cost_usd', { precision: 10, scale: 6 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by').references(() => users.id),
  },
  (table) => ({
    tenantIdx: index('layout_blueprints_tenant_idx').on(table.tenantId),
    referenceIdx: index('layout_blueprints_reference_idx').on(table.referenceId, table.version),
    statusIdx: index('layout_blueprints_status_idx').on(table.tenantId, table.status),
    oneCurrentPerRef: uniqueIndex('layout_blueprints_one_current_per_ref')
      .on(table.referenceId)
      .where(sql`is_current = true`),
  }),
);

export type LayoutBlueprint = typeof layoutBlueprints.$inferSelect;
export type NewLayoutBlueprint = typeof layoutBlueprints.$inferInsert;

// ============================================================================
// RELATIONS
// ============================================================================

export const layoutReferencesRelations = relations(layoutReferences, ({ one, many }) => ({
  tenant: one(tenants, { fields: [layoutReferences.tenantId], references: [tenants.id] }),
  asset: one(assets, { fields: [layoutReferences.assetId], references: [assets.id] }),
  blueprints: many(layoutBlueprints),
}));

export const layoutBlueprintsRelations = relations(layoutBlueprints, ({ one }) => ({
  tenant: one(tenants, { fields: [layoutBlueprints.tenantId], references: [tenants.id] }),
  reference: one(layoutReferences, {
    fields: [layoutBlueprints.referenceId],
    references: [layoutReferences.id],
  }),
}));
