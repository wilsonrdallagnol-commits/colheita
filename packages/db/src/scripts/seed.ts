/**
 * Seed — cria tenant Argho + produto Xcensis de demonstração.
 *
 * Uso: pnpm db:seed
 *
 * Idempotente: usa INSERT ... ON CONFLICT DO NOTHING.
 * Seguro rodar múltiplas vezes em dev local.
 *
 * TODO Fase 1: expandir com produtos reais, usuários de demo, assets de referência.
 */

import { ARGHO_TENANT_NAME, ARGHO_TENANT_SLUG, ARGHO_THEME_TOKENS } from '@colheita/tokens';
import postgres from 'postgres';

const DB_URL = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;

if (!DB_URL) {
  console.error('❌  DATABASE_URL_DIRECT or DATABASE_URL must be set');
  process.exit(1);
}

async function run() {
  const sql = postgres(DB_URL!, { max: 1, onnotice: () => {} });

  try {
    console.log('🌱  Seeding database…');

    // Tenant Argho
    const [tenant] = await sql`
      INSERT INTO public.tenants (slug, name, display_name, theme_tokens)
      VALUES (
        ${ARGHO_TENANT_SLUG},
        ${ARGHO_TENANT_NAME},
        ${ARGHO_TENANT_NAME},
        ${sql.json(JSON.parse(JSON.stringify(ARGHO_THEME_TOKENS)))}
      )
      ON CONFLICT (slug) DO UPDATE
        SET theme_tokens = EXCLUDED.theme_tokens,
            display_name = EXCLUDED.display_name
      RETURNING id, slug
    `;
    console.log(`  ✅  Tenant: ${tenant?.slug} (${tenant?.id})`);

    // Produto Xcensis (demo)
    await sql`
      INSERT INTO public.products (tenant_id, slug, name, status)
      VALUES (${tenant?.id}, 'xcensis', 'Xcensis', 'published')
      ON CONFLICT (tenant_id, slug) DO NOTHING
    `;
    console.log('  ✅  Produto demo: xcensis');

    console.log('✅  Seed concluído.');
  } catch (err) {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
