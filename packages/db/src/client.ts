import { drizzle } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';
import * as schema from './schema/index.js';

/**
 * Conexão Postgres compartilhada — admin client.
 *
 * REGRA DE OURO: este client usa role do banco direto e BYPASSA RLS.
 * Use APENAS em:
 *   - Migrations
 *   - Seeds
 *   - Background jobs administrativos (auditados)
 *   - Endpoints internos onde tenant_id é injetado manualmente
 *
 * Pra requests de usuário, use o client Supabase com JWT —
 * RLS é aplicado automaticamente via auth.tenant_id().
 *
 * ============================================================================
 * Connection pooling — produção vs dev
 * ============================================================================
 * Em produção atrás do Supavisor (transaction mode na porta 6543):
 *   - max=1 por instância (Vercel/edge faz fan-out, pooler faz multiplex)
 *   - prepare=false (transaction mode não suporta prepared statements)
 *
 * Em dev (porta 5432 direta):
 *   - max=10
 *   - prepare=true (suporta prepared statements)
 *
 * Para migrations sempre use DATABASE_URL_DIRECT (porta 5432) que suporta
 * prepared statements e DDL transacional.
 * ============================================================================
 */

type ClientMode = 'pool' | 'direct';

function detectMode(url: string): ClientMode {
  // Supavisor transaction mode roda em :6543
  if (url.includes(':6543')) return 'pool';
  // Default: conexão direta (dev local, migrations, jobs)
  return 'direct';
}

function createClient(url: string): Sql {
  const mode = detectMode(url);
  return postgres(url, {
    max: mode === 'pool' ? 1 : 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: mode === 'direct',
    // Falha rápida se o banco rejeitar — evita pool gigante de conexões pendentes
    max_lifetime: 60 * 30,
  });
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    '[@colheita/db] DATABASE_URL is required. ' +
      'In production, point to Supavisor transaction-mode pooler (port 6543). ' +
      'For migrations, use DATABASE_URL_DIRECT (port 5432).',
  );
}

const queryClient = createClient(databaseUrl);

export const db = drizzle(queryClient, { schema, casing: 'snake_case' });

/**
 * Cliente direto (porta 5432) para migrations e operações que exigem
 * prepared statements ou DDL transacional. Lê DATABASE_URL_DIRECT,
 * fallback para DATABASE_URL se não definido (dev local).
 */
export function createDirectClient() {
  const url = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error('[@colheita/db] DATABASE_URL_DIRECT or DATABASE_URL required');
  }
  const client = postgres(url, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
    prepare: true,
  });
  return { client, db: drizzle(client, { schema, casing: 'snake_case' }) };
}

export { schema };
export * from './schema/index.js';
