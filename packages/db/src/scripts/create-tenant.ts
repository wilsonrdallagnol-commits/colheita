/**
 * CLI pra criar tenants programaticamente.
 *
 * Uso: pnpm tenant:create --slug=minha-empresa --name="Minha Empresa"
 *
 * TODO Fase 1: adicionar suporte a theme_tokens via arquivo JSON e criação de admin user.
 */

import postgres from 'postgres';

const DB_URL = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;

if (!DB_URL) {
  console.error('❌  DATABASE_URL_DIRECT or DATABASE_URL must be set');
  process.exit(1);
}

function parseArgs(): { slug: string; name: string } {
  const args = process.argv.slice(2);
  const slug = args.find((a) => a.startsWith('--slug='))?.split('=')[1];
  const name = args.find((a) => a.startsWith('--name='))?.split('=')[1];

  if (!slug || !name) {
    console.error('Usage: pnpm tenant:create --slug=<slug> --name="<Name>"');
    process.exit(1);
  }

  return { slug, name };
}

async function run() {
  const { slug, name } = parseArgs();
  const sql = postgres(DB_URL!, { max: 1, onnotice: () => {} });

  try {
    const [tenant] = await sql`
      INSERT INTO public.tenants (slug, name, display_name, theme_tokens)
      VALUES (${slug}, ${name}, ${name}, '{}'::jsonb)
      ON CONFLICT (slug) DO NOTHING
      RETURNING id, slug
    `;

    if (!tenant) {
      console.warn(`⚠️   Tenant '${slug}' já existe — nenhuma alteração feita.`);
    } else {
      console.log(`✅  Tenant criado: ${tenant.slug} (${tenant.id})`);
    }
  } catch (err) {
    console.error('❌  Falha ao criar tenant:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
