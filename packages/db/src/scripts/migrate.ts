/**
 * Migration runner — aplica todas as migrations SQL em ordem.
 *
 * Uso: pnpm db:migrate
 *
 * Requer: DATABASE_URL_DIRECT (porta 5432, sem pooler) ou DATABASE_URL como fallback.
 * Em produção: aponte para Supabase direto (não Supavisor) pra suportar DDL transacional.
 *
 * TODO Fase 1: substituir por drizzle-kit migrate quando o setup do Drizzle estiver completo.
 * Por ora aplica os arquivos SQL manualmente em ordem — suficiente pra dev local.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_URL = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;

if (!DB_URL) {
  console.error('❌  DATABASE_URL_DIRECT or DATABASE_URL must be set');
  process.exit(1);
}

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
  '0009_auth_hook.sql',
  '0010_public_read_policies.sql',
] as const;

async function run() {
  const sql = postgres(DB_URL!, { max: 1, onnotice: () => {} });

  try {
    console.log('🚀  Applying migrations…');

    for (const file of MIGRATION_FILES) {
      const migrationSql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
      await sql.unsafe(migrationSql);
      console.log(`  ✅  ${file}`);
    }

    console.log('✅  All migrations applied.');
  } catch (err) {
    console.error('❌  Migration failed:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
