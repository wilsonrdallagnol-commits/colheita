/**
 * Schema Drizzle — Programa Colheita Argho
 *
 * Espelha as migrations SQL em /infra/supabase/migrations.
 * Source of truth permanece o SQL — este schema é a representação TypeScript.
 *
 * Regra: toda tabela de domínio tem tenantId + RLS habilitado no SQL.
 * Aqui mantemos a tipagem alinhada.
 */

import type { TenantThemeTokens } from '@colheita/tokens';
import { relations, sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

// ============================================================================
// TENANTS
// ============================================================================

export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    displayName: text('display_name').notNull(),
    logoUrl: text('logo_url'),
    primaryDomain: text('primary_domain').unique(),
    status: text('status', { enum: ['active', 'suspended', 'archived'] })
      .notNull()
      .default('active'),
    settings: jsonb('settings').$type<Record<string, unknown>>().notNull().default({}),
    themeTokens: jsonb('theme_tokens')
      .$type<TenantThemeTokens>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: index('tenants_slug_idx').on(table.slug),
  }),
);

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

// ============================================================================
// USERS
// ============================================================================

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    email: text('email').notNull(),
    fullName: text('full_name'),
    avatarUrl: text('avatar_url'),
    status: text('status', { enum: ['active', 'invited', 'suspended'] })
      .notNull()
      .default('active'),
    preferences: jsonb('preferences').$type<Record<string, unknown>>().notNull().default({}),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index('users_tenant_idx').on(table.tenantId),
    emailIdx: index('users_email_idx').on(table.email),
    tenantEmailUnique: unique().on(table.tenantId, table.email),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ============================================================================
// PRODUCTS (PIM)
// ============================================================================

export const productCategories = pgTable(
  'product_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    parentId: uuid('parent_id').references((): AnyPgColumn => productCategories.id, {
      onDelete: 'set null',
    }),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index('product_categories_tenant_idx').on(table.tenantId),
    tenantSlugUnique: unique().on(table.tenantId, table.slug),
  }),
);

export type ProductComposition = {
  macros?: Record<string, number>; // { N: 10, P2O5: 5, K2O: 6 }
  micros?: Record<string, number>; // { Fe: 7.0, Zn: 0.8 }
  others?: Record<string, number>;
};

export type ProductPackaging = Array<{
  type: 'bag' | 'ibc' | 'drum' | 'bottle' | 'other';
  weightKg?: number;
  volumeL?: number;
  sku?: string;
}>;

export type ProductApplication = {
  crop: string;
  stage?: string;
  dosePerHa: number;
  unit: 'kg' | 'l' | 'g' | 'ml';
  notes?: string;
};

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').references(() => productCategories.id, {
      onDelete: 'set null',
    }),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    tagline: text('tagline'),
    description: text('description'),
    status: text('status', { enum: ['draft', 'published', 'archived'] })
      .notNull()
      .default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    composition: jsonb('composition').$type<ProductComposition>().notNull().default({}),
    technicalSpecs: jsonb('technical_specs').$type<Record<string, unknown>>().notNull().default({}),
    packaging: jsonb('packaging').$type<ProductPackaging>().notNull().default([]),
    applications: jsonb('applications').$type<ProductApplication[]>().notNull().default([]),
    marketing: jsonb('marketing').$type<Record<string, unknown>>().notNull().default({}),
    heroAssetId: uuid('hero_asset_id'),
    packshotAssetId: uuid('packshot_asset_id'),
    metaTitle: text('meta_title'),
    metaDescription: text('meta_description'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by').references(() => users.id),
    updatedBy: uuid('updated_by').references(() => users.id),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    tenantStatusIdx: index('products_tenant_status_idx').on(table.tenantId, table.status),
    categoryIdx: index('products_category_idx').on(table.tenantId, table.categoryId),
    tenantSlugUnique: unique().on(table.tenantId, table.slug),
  }),
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// ============================================================================
// REGULATORY REGISTRATIONS
// ============================================================================

export const regulatoryRegistrations = pgTable(
  'regulatory_registrations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    authority: text('authority', {
      enum: ['MAPA', 'ANVISA', 'IBAMA', 'STATE', 'OTHER'],
    }).notNull(),
    registrationNo: text('registration_no').notNull(),
    issuedAt: date('issued_at'),
    expiresAt: date('expires_at'),
    status: text('status', { enum: ['active', 'expired', 'pending', 'revoked'] })
      .notNull()
      .default('active'),
    documentUrl: text('document_url'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index('regulatory_product_idx').on(table.tenantId, table.productId),
    expiresIdx: index('regulatory_expires_idx').on(table.tenantId, table.expiresAt),
  }),
);

export type RegulatoryRegistration = typeof regulatoryRegistrations.$inferSelect;
export type NewRegulatoryRegistration = typeof regulatoryRegistrations.$inferInsert;

// ============================================================================
// ASSETS (DAM)
// ============================================================================

export const assets = pgTable(
  'assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    collectionId: uuid('collection_id'),
    filename: text('filename').notNull(),
    originalName: text('original_name').notNull(),
    mimeType: text('mime_type').notNull(),
    fileSize: bigint('file_size', { mode: 'number' }).notNull(),
    storagePath: text('storage_path').notNull(),
    type: text('type', { enum: ['image', 'video', 'document', 'audio', 'other'] }).notNull(),
    width: integer('width'),
    height: integer('height'),
    durationMs: integer('duration_ms'),
    title: text('title'),
    description: text('description'),
    altText: text('alt_text'),
    tags: text('tags').array().notNull().default(sql`ARRAY[]::text[]`),
    license: text('license', { enum: ['internal', 'public', 'restricted', 'licensed'] }).default(
      'internal',
    ),
    licenseNotes: text('license_notes'),
    expiresAt: date('expires_at'),
    variants: jsonb('variants')
      .$type<Array<{ label: string; path: string; width?: number; height?: number }>>()
      .notNull()
      .default([]),
    version: integer('version').notNull().default(1),
    parentId: uuid('parent_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by').references(() => users.id),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    tenantTypeIdx: index('assets_tenant_type_idx').on(table.tenantId, table.type),
  }),
);

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;

// ============================================================================
// RELATIONS
// ============================================================================

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  products: many(products),
  assets: many(assets),
}));

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, { fields: [products.tenantId], references: [tenants.id] }),
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
  heroAsset: one(assets, { fields: [products.heroAssetId], references: [assets.id] }),
  registrations: many(regulatoryRegistrations),
}));

export * from './academia.js';
export * from './dam.js';
// ============================================================================
// DOMAIN RE-EXPORTS
// ============================================================================
export * from './foundation.js';
export * from './generator.js';
export * from './layout-inference.js';
export * from './vectors.js';
