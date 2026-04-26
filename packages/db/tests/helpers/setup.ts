/**
 * Infraestrutura de teste RLS.
 *
 * Cria um banco limpo, aplica todas as migrations e fornece helpers
 * para simular contexto JWT sem precisar de um Supabase real.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_URL =
  process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/colheita_test';

let sql: postgres.Sql;

// ============================================================================
// Stubs do schema auth (simula Supabase Auth no Postgres vanilla)
// ============================================================================
const AUTH_SETUP_SQL = `
  -- Schema auth (Supabase stub)
  CREATE SCHEMA IF NOT EXISTS auth;

  CREATE TABLE IF NOT EXISTS auth.users (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email      text,
    created_at timestamptz DEFAULT now()
  );

  -- auth.uid() lê o sub do JWT (mesmo padrão do Supabase)
  CREATE OR REPLACE FUNCTION auth.uid()
  RETURNS uuid
  LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path = ''
  AS $$
    SELECT nullif(
      pg_catalog.current_setting('request.jwt.claims', true)::json ->> 'sub',
      ''
    )::uuid
  $$;

  -- Roles necessários para as grants nas migrations
  DO $$ BEGIN
    CREATE ROLE authenticated;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE ROLE anon;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE ROLE service_role;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
`;

// ============================================================================
// Migrations (aplicadas em ordem)
// ============================================================================
const MIGRATIONS_DIR = join(__dirname, '../../../../infra/supabase/migrations');

const MIGRATION_FILES = [
  '0001_foundation.sql',
  '0002_pim.sql',
  '0003_dam.sql',
  '0004_generator.sql',
  '0005_academia.sql',
  '0006_layout_inference.sql',
  '0007_audit_partitioning.sql',
  '0008_fk_indexes.sql',
] as const;

// ============================================================================
// setupDb — cria schema limpo e aplica migrations
// ============================================================================
export async function setupDb(): Promise<void> {
  // max: 1 — obrigatório quando migrations contêm BEGIN/COMMIT explícito em sql.unsafe()
  // onnotice suprime NOTICE do DROP CASCADE e CREATE SCHEMA IF NOT EXISTS (esperados)
  sql = postgres(DB_URL, { max: 1, onnotice: () => {} });

  // Limpa o schema público para garantir idempotência entre runs locais
  await sql.unsafe(`
    DROP SCHEMA IF EXISTS public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO postgres;
    GRANT ALL ON SCHEMA public TO public;
  `);

  // Cria auth stubs antes das migrations (0001 usa auth.users FK e grant para authenticated)
  await sql.unsafe(AUTH_SETUP_SQL);

  // Aplica todas as migrations em ordem
  for (const file of MIGRATION_FILES) {
    const migrationSql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    await sql.unsafe(migrationSql);
  }

  // Concede permissões de tabela ao role authenticated (RLS continua controlando acesso)
  await sql.unsafe(`
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
    GRANT USAGE ON SCHEMA auth TO authenticated;
  `);
}

export async function closeDb(): Promise<void> {
  if (sql) {
    await sql.end();
  }
}

// ============================================================================
// Fixtures de tenant + produtos
// ============================================================================
export type TenantFixture = {
  id: string;
  slug: string;
  productIds: string[];
};

export async function createTenantWithProducts(slug: string, name: string): Promise<TenantFixture> {
  const [tenant] = await sql`
    INSERT INTO public.tenants (slug, name, display_name, theme_tokens)
    VALUES (${slug}, ${name}, ${name}, '{}'::jsonb)
    RETURNING id
  `;

  const tenantId = tenant?.id as string;

  const [p1] = await sql`
    INSERT INTO public.products (tenant_id, slug, name, status)
    VALUES (${tenantId}, ${`${slug}-p1`}, ${`${name} Produto 1`}, 'published')
    RETURNING id
  `;

  const [p2] = await sql`
    INSERT INTO public.products (tenant_id, slug, name, status)
    VALUES (${tenantId}, ${`${slug}-p2`}, ${`${name} Produto 2`}, 'draft')
    RETURNING id
  `;

  return {
    id: tenantId,
    slug,
    productIds: [p1?.id as string, p2?.id as string],
  };
}

// ============================================================================
// queryAsTenant — executa queries com JWT simulado + role authenticated
// ============================================================================
export type JwtClaims = {
  tenantId: string;
  roles?: string[];
  sub?: string;
} | null;

export async function queryAsTenant<T>(
  claims: JwtClaims,
  fn: (sql: postgres.TransactionSql) => Promise<T>,
): Promise<T> {
  return sql.begin(async (txSql) => {
    if (claims !== null) {
      const payload = {
        tenant_id: claims.tenantId,
        sub: claims.sub ?? '00000000-0000-0000-0000-000000000001',
        roles: claims.roles ?? [],
      };
      // set_config com is_local=true: valor válido apenas nesta transação
      await txSql`SELECT set_config('request.jwt.claims', ${JSON.stringify(payload)}, true)`;
    }

    // SET ROLE authenticated para que RLS seja aplicado (superusers ignoram RLS por padrão)
    await txSql.unsafe('SET LOCAL ROLE authenticated');

    return fn(txSql);
  });
}
