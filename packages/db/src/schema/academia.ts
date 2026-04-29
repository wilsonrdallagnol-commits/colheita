/**
 * Academia — Trilhas, Módulos, Lições, Progresso, Certificações
 *
 * Espelha /infra/supabase/migrations/0005_academia.sql.
 */

import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { assets, tenants, users } from './index.js';

// ============================================================================
// Tipos auxiliares
// ============================================================================

export type LessonContent =
  | { markdown: string } // article
  | { asset_id: string; duration_s?: number; transcript?: string } // video
  | { questions: unknown[]; passing_score?: number } // quiz
  | { scenario_id: string; config?: Record<string, unknown> } // simulation
  | Record<string, unknown>; // other/interactive

// ============================================================================
// LEARNING TRACKS
// ============================================================================

export const learningTracks = pgTable(
  'learning_tracks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    description: text('description'),
    audience: text('audience').array().notNull().default(sql`ARRAY[]::text[]`),
    level: text('level', { enum: ['beginner', 'intermediate', 'advanced', 'expert'] })
      .notNull()
      .default('beginner'),
    estimatedMinutes: integer('estimated_minutes'),
    coverAssetId: uuid('cover_asset_id').references(() => assets.id, { onDelete: 'set null' }),
    grantsCertification: boolean('grants_certification').notNull().default(false),
    certificationValidityDays: integer('certification_validity_days'),
    status: text('status', { enum: ['draft', 'published', 'archived'] })
      .notNull()
      .default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    sortOrder: integer('sort_order').notNull().default(0),
    prerequisiteTrackIds: uuid('prerequisite_track_ids').array().default(sql`ARRAY[]::uuid[]`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantStatusIdx: index('learning_tracks_tenant_status_idx').on(table.tenantId, table.status),
    tenantSlugUnique: unique().on(table.tenantId, table.slug),
  }),
);

export type LearningTrack = typeof learningTracks.$inferSelect;
export type NewLearningTrack = typeof learningTracks.$inferInsert;

// ============================================================================
// LEARNING MODULES
// ============================================================================

export const learningModules = pgTable(
  'learning_modules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    trackId: uuid('track_id')
      .notNull()
      .references(() => learningTracks.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    trackIdx: index('learning_modules_track_idx').on(table.trackId, table.sortOrder),
    trackSlugUnique: unique().on(table.trackId, table.slug),
  }),
);

export type LearningModule = typeof learningModules.$inferSelect;
export type NewLearningModule = typeof learningModules.$inferInsert;

// ============================================================================
// LEARNING LESSONS
// ============================================================================

export const learningLessons = pgTable(
  'learning_lessons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    moduleId: uuid('module_id')
      .notNull()
      .references(() => learningModules.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    type: text('type', {
      enum: ['video', 'article', 'quiz', 'simulation', 'document', 'interactive'],
    }).notNull(),
    content: jsonb('content').$type<LessonContent>().notNull().default({}),
    relatedProductIds: uuid('related_product_ids').array().default(sql`ARRAY[]::uuid[]`),
    estimatedMinutes: integer('estimated_minutes'),
    isRequired: boolean('is_required').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    moduleIdx: index('learning_lessons_module_idx').on(table.moduleId, table.sortOrder),
    moduleSlugUnique: unique().on(table.moduleId, table.slug),
  }),
);

export type LearningLesson = typeof learningLessons.$inferSelect;
export type NewLearningLesson = typeof learningLessons.$inferInsert;

// ============================================================================
// LEARNING PROGRESS
// ============================================================================

export const learningProgress = pgTable(
  'learning_progress',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => learningLessons.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    status: text('status', {
      enum: ['not_started', 'in_progress', 'completed', 'failed'],
    })
      .notNull()
      .default('in_progress'),
    score: numeric('score', { precision: 5, scale: 2 }),
    attempts: integer('attempts').notNull().default(0),
    data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.lessonId] }),
    userIdx: index('learning_progress_user_idx').on(table.userId, table.tenantId),
    lessonIdx: index('learning_progress_lesson_idx').on(table.lessonId, table.status),
  }),
);

export type LearningProgress = typeof learningProgress.$inferSelect;
export type NewLearningProgress = typeof learningProgress.$inferInsert;

// ============================================================================
// CERTIFICATIONS
// ============================================================================

export const certifications = pgTable(
  'certifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    trackId: uuid('track_id')
      .notNull()
      .references(() => learningTracks.id, { onDelete: 'restrict' }),
    certificateNo: text('certificate_no').notNull().unique(),
    verificationCode: text('verification_code').notNull().unique(),
    finalScore: numeric('final_score', { precision: 5, scale: 2 }),
    issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    status: text('status', { enum: ['active', 'expired', 'revoked'] })
      .notNull()
      .default('active'),
    certificateAssetId: uuid('certificate_asset_id').references(() => assets.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('certifications_user_idx').on(table.userId, table.tenantId),
    trackIdx: index('certifications_track_idx').on(table.tenantId, table.trackId),
    verifyIdx: index('certifications_verify_idx').on(table.verificationCode),
  }),
);

export type Certification = typeof certifications.$inferSelect;
export type NewCertification = typeof certifications.$inferInsert;

// ============================================================================
// RELATIONS
// ============================================================================

export const learningTracksRelations = relations(learningTracks, ({ one, many }) => ({
  tenant: one(tenants, { fields: [learningTracks.tenantId], references: [tenants.id] }),
  coverAsset: one(assets, { fields: [learningTracks.coverAssetId], references: [assets.id] }),
  modules: many(learningModules),
  certifications: many(certifications),
}));

export const learningModulesRelations = relations(learningModules, ({ one, many }) => ({
  tenant: one(tenants, { fields: [learningModules.tenantId], references: [tenants.id] }),
  track: one(learningTracks, {
    fields: [learningModules.trackId],
    references: [learningTracks.id],
  }),
  lessons: many(learningLessons),
}));

export const learningLessonsRelations = relations(learningLessons, ({ one, many }) => ({
  tenant: one(tenants, { fields: [learningLessons.tenantId], references: [tenants.id] }),
  module: one(learningModules, {
    fields: [learningLessons.moduleId],
    references: [learningModules.id],
  }),
  progress: many(learningProgress),
}));

export const learningProgressRelations = relations(learningProgress, ({ one }) => ({
  user: one(users, { fields: [learningProgress.userId], references: [users.id] }),
  lesson: one(learningLessons, {
    fields: [learningProgress.lessonId],
    references: [learningLessons.id],
  }),
  tenant: one(tenants, { fields: [learningProgress.tenantId], references: [tenants.id] }),
}));

export const certificationsRelations = relations(certifications, ({ one }) => ({
  tenant: one(tenants, { fields: [certifications.tenantId], references: [tenants.id] }),
  user: one(users, { fields: [certifications.userId], references: [users.id] }),
  track: one(learningTracks, {
    fields: [certifications.trackId],
    references: [learningTracks.id],
  }),
  certificateAsset: one(assets, {
    fields: [certifications.certificateAssetId],
    references: [assets.id],
  }),
}));
