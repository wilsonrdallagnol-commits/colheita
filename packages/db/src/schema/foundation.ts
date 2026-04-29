/**
 * Foundation — Roles, User-Roles, Audit Events
 *
 * Espelha /infra/supabase/migrations/0001_foundation.sql (tabelas extras).
 * As tabelas tenants e users estão em ./index.ts.
 */

import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { tenants, users } from './index.js';

// ============================================================================
// ROLES
// ============================================================================

export const roles = pgTable(
  'roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    permissions: text('permissions').array().notNull().default(sql`ARRAY[]::text[]`),
    isSystem: boolean('is_system').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index('roles_tenant_idx').on(table.tenantId),
    tenantSlugUnique: unique().on(table.tenantId, table.slug),
  }),
);

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

// ============================================================================
// USER_ROLES
// ============================================================================

export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
    grantedBy: uuid('granted_by').references(() => users.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
    tenantIdx: index('user_roles_tenant_idx').on(table.tenantId),
    userIdx: index('user_roles_user_idx').on(table.userId),
  }),
);

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;

// ============================================================================
// AUDIT EVENTS
// ============================================================================

export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    actorId: uuid('actor_id').references(() => users.id),
    action: text('action').notNull(),
    resource: text('resource').notNull(),
    resourceId: text('resource_id'),
    payload: jsonb('payload').$type<Record<string, unknown>>(),
    // PostgreSQL inet — stored as text in Drizzle (no native inet type)
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantCreatedIdx: index('audit_tenant_created_idx').on(table.tenantId, table.createdAt),
    resourceIdx: index('audit_resource_idx').on(table.tenantId, table.resource, table.resourceId),
  }),
);

export type AuditEvent = typeof auditEvents.$inferSelect;
export type NewAuditEvent = typeof auditEvents.$inferInsert;

// ============================================================================
// RELATIONS
// ============================================================================

export const rolesRelations = relations(roles, ({ one, many }) => ({
  tenant: one(tenants, { fields: [roles.tenantId], references: [tenants.id] }),
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
  tenant: one(tenants, { fields: [userRoles.tenantId], references: [tenants.id] }),
}));
