/**
 * DAM — Digital Asset Management
 *
 * Espelha /infra/supabase/migrations/0003_dam.sql.
 * As tabelas assets e produtos estão em ./index.ts.
 */

import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { assets, products, tenants } from './index.js';

// ============================================================================
// ASSET COLLECTIONS
// ============================================================================

export const assetCollections = pgTable(
  'asset_collections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    parentId: uuid('parent_id').references((): AnyPgColumn => assetCollections.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index('asset_collections_tenant_idx').on(table.tenantId),
    tenantSlugUnique: unique().on(table.tenantId, table.slug),
  }),
);

export type AssetCollection = typeof assetCollections.$inferSelect;
export type NewAssetCollection = typeof assetCollections.$inferInsert;

// ============================================================================
// PRODUCT ASSETS — relação N:N com role
// ============================================================================

export const productAssets = pgTable(
  'product_assets',
  {
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    role: text('role', {
      enum: ['gallery', 'datasheet', 'video', 'document', 'certificate'],
    }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.assetId, table.role] }),
    tenantIdx: index('product_assets_tenant_idx').on(table.tenantId),
    productIdx: index('product_assets_product_idx').on(table.productId),
  }),
);

export type ProductAsset = typeof productAssets.$inferSelect;
export type NewProductAsset = typeof productAssets.$inferInsert;

// ============================================================================
// RELATIONS
// ============================================================================

export const assetCollectionsRelations = relations(assetCollections, ({ one, many }) => ({
  tenant: one(tenants, { fields: [assetCollections.tenantId], references: [tenants.id] }),
  assets: many(assets),
}));

export const productAssetsRelations = relations(productAssets, ({ one }) => ({
  product: one(products, { fields: [productAssets.productId], references: [products.id] }),
  asset: one(assets, { fields: [productAssets.assetId], references: [assets.id] }),
  tenant: one(tenants, { fields: [productAssets.tenantId], references: [tenants.id] }),
}));
