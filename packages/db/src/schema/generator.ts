/**
 * Generator — Material Templates & Generated Materials
 *
 * Espelha /infra/supabase/migrations/0004_generator.sql.
 */

import { relations, sql } from 'drizzle-orm';
import { index, integer, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { tenants, users } from './index.js';

// ============================================================================
// Tipos auxiliares
// ============================================================================

export type TemplateFormat = {
  width: number;
  height: number;
  unit: 'px' | 'mm' | 'cm' | 'in';
  dpi: 72 | 150 | 300;
};

export type GeneratedOutput = {
  format: 'pdf' | 'png' | 'jpg' | 'svg' | 'webp';
  assetId?: string;
  url?: string;
  pages?: number;
};

// ============================================================================
// MATERIAL TEMPLATES
// ============================================================================

export const materialTemplates = pgTable(
  'material_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category', {
      enum: ['datasheet', 'banner', 'social_post', 'catalog', 'presentation', 'flyer', 'other'],
    }).notNull(),
    format: jsonb('format').$type<TemplateFormat>().notNull(),
    inputSchema: jsonb('input_schema').$type<Record<string, unknown>>().notNull().default({}),
    componentRef: text('component_ref').notNull(),
    status: text('status', { enum: ['active', 'draft', 'deprecated'] })
      .notNull()
      .default('active'),
    version: integer('version').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index('material_templates_tenant_idx').on(table.tenantId),
    categoryIdx: index('material_templates_category_idx').on(table.tenantId, table.category),
    tenantSlugVersionUnique: unique().on(table.tenantId, table.slug, table.version),
  }),
);

export type MaterialTemplate = typeof materialTemplates.$inferSelect;
export type NewMaterialTemplate = typeof materialTemplates.$inferInsert;

// ============================================================================
// GENERATED MATERIALS
// ============================================================================

export const generatedMaterials = pgTable(
  'generated_materials',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    templateId: uuid('template_id')
      .notNull()
      .references(() => materialTemplates.id, { onDelete: 'restrict' }),
    inputData: jsonb('input_data').$type<Record<string, unknown>>().notNull(),
    productIds: uuid('product_ids').array().notNull().default(sql`ARRAY[]::uuid[]`),
    outputs: jsonb('outputs').$type<GeneratedOutput[]>().notNull().default([]),
    status: text('status', {
      enum: ['pending', 'processing', 'completed', 'failed'],
    })
      .notNull()
      .default('pending'),
    error: text('error'),
    durationMs: integer('duration_ms'),
    pages: integer('pages'),
    generatedBy: uuid('generated_by').references(() => users.id),
    generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    publicToken: text('public_token').unique(),
    publicViews: integer('public_views').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index('generated_materials_tenant_idx').on(table.tenantId, table.generatedAt),
    templateIdx: index('generated_materials_template_idx').on(table.tenantId, table.templateId),
    statusIdx: index('generated_materials_status_idx').on(table.status),
    publicTokenIdx: index('generated_materials_public_token_idx').on(table.publicToken),
  }),
);

export type GeneratedMaterial = typeof generatedMaterials.$inferSelect;
export type NewGeneratedMaterial = typeof generatedMaterials.$inferInsert;

// ============================================================================
// RELATIONS
// ============================================================================

export const materialTemplatesRelations = relations(materialTemplates, ({ one, many }) => ({
  tenant: one(tenants, { fields: [materialTemplates.tenantId], references: [tenants.id] }),
  materials: many(generatedMaterials),
}));

export const generatedMaterialsRelations = relations(generatedMaterials, ({ one }) => ({
  tenant: one(tenants, { fields: [generatedMaterials.tenantId], references: [tenants.id] }),
  template: one(materialTemplates, {
    fields: [generatedMaterials.templateId],
    references: [materialTemplates.id],
  }),
  generatedByUser: one(users, {
    fields: [generatedMaterials.generatedBy],
    references: [users.id],
  }),
}));
