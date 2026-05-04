/**
 * CLI pra criar tenants programaticamente.
 *
 * Uso:
 *   pnpm tenant:create --slug=argho --name="Argho Agrosciences"
 *   pnpm tenant:create --slug=argho --name="Argho" --admin-email=admin@argho.com.br
 *   pnpm tenant:create --slug=argho --name="Argho" --theme-tokens=./argho-tokens.json
 *
 * Env vars obrigatórias:
 *   DATABASE_URL_DIRECT  (ou DATABASE_URL) — Postgres direct connection
 *   SUPABASE_URL         — necessário apenas com --admin-email
 *   SUPABASE_SERVICE_ROLE_KEY — necessário apenas com --admin-email
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

const DB_URL = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;

if (!DB_URL) {
  console.error('❌  DATABASE_URL_DIRECT or DATABASE_URL must be set');
  process.exit(1);
}

// ── Arg parsing ───────────────────────────────────────────────────────────────

interface Args {
  slug: string;
  name: string;
  adminEmail: string | null;
  themeTokens: Record<string, unknown> | null;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);

  const slug = args
    .find((a) => a.startsWith('--slug='))
    ?.split('=')
    .slice(1)
    .join('=');
  const name = args
    .find((a) => a.startsWith('--name='))
    ?.split('=')
    .slice(1)
    .join('=');
  const adminEmail =
    args
      .find((a) => a.startsWith('--admin-email='))
      ?.split('=')
      .slice(1)
      .join('=') ?? null;
  const themeTokensFile =
    args
      .find((a) => a.startsWith('--theme-tokens='))
      ?.split('=')
      .slice(1)
      .join('=') ?? null;

  if (!slug || !name) {
    console.error(
      'Uso: pnpm tenant:create --slug=<slug> --name="<Nome>" [--admin-email=<email>] [--theme-tokens=<arquivo.json>]',
    );
    process.exit(1);
  }

  let themeTokens: Record<string, unknown> | null = null;
  if (themeTokensFile) {
    try {
      const raw = readFileSync(themeTokensFile, 'utf-8');
      themeTokens = JSON.parse(raw) as Record<string, unknown>;
      console.log(`📦  theme_tokens carregado de ${themeTokensFile}`);
    } catch (err) {
      console.error(`❌  Não foi possível ler --theme-tokens: ${themeTokensFile}`, err);
      process.exit(1);
    }
  }

  return { slug, name, adminEmail, themeTokens };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      '❌  SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios para --admin-email',
    );
    process.exit(1);
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  const { slug, name, adminEmail, themeTokens } = parseArgs();
  const sql = postgres(DB_URL!, { max: 1, onnotice: () => {} });

  try {
    // 1. Criar ou verificar tenant
    const tokenPayload = themeTokens ? JSON.stringify(themeTokens) : '{}';
    const [tenant] = await sql`
      INSERT INTO public.tenants (slug, name, display_name, theme_tokens)
      VALUES (${slug}, ${name}, ${name}, ${tokenPayload}::jsonb)
      ON CONFLICT (slug) DO UPDATE
        SET name         = EXCLUDED.name,
            display_name = EXCLUDED.display_name,
            theme_tokens = CASE
              WHEN ${themeTokens !== null} THEN EXCLUDED.theme_tokens
              ELSE public.tenants.theme_tokens
            END,
            updated_at   = now()
      RETURNING id, slug
    `;

    if (!tenant) {
      console.warn(`⚠️   Tenant '${slug}' — nenhuma linha retornada (inesperado).`);
      return;
    }

    const tenantId = tenant.id as string;
    console.log(`✅  Tenant: ${tenant.slug} (${tenantId})`);
    if (themeTokens) console.log(`🎨  theme_tokens aplicado.`);

    // 2. Criar admin user via Supabase Auth (opcional)
    if (!adminEmail) {
      console.log('ℹ️   --admin-email não informado — nenhum usuário criado.');
      return;
    }

    const supabase = buildSupabaseAdmin();

    // Verifica se já existe um usuário com este e-mail
    const { data: existingList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const existing = existingList?.users.find((u) => u.email === adminEmail);

    let authUserId: string;

    if (existing) {
      authUserId = existing.id;
      console.log(`ℹ️   Usuário Auth já existe: ${adminEmail} (${authUserId})`);
    } else {
      // Cria usuário e envia magic link de boas-vindas
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: adminEmail,
        email_confirm: true, // confirma automaticamente
        user_metadata: { full_name: name },
      });

      if (createErr || !created?.user) {
        console.error('❌  Falha ao criar usuário Auth:', createErr);
        process.exit(1);
      }

      authUserId = created.user.id;
      console.log(`✅  Usuário Auth criado: ${adminEmail} (${authUserId})`);
    }

    // 3. Upsert na tabela public.users (espelho do Auth)
    await sql`
      INSERT INTO public.users (id, tenant_id, email, full_name, status)
      VALUES (${authUserId}::uuid, ${tenantId}::uuid, ${adminEmail}, ${name}, 'active')
      ON CONFLICT (id) DO UPDATE
        SET tenant_id  = EXCLUDED.tenant_id,
            email      = EXCLUDED.email,
            updated_at = now()
    `;
    console.log(`✅  public.users sincronizado para ${adminEmail}.`);

    // 4. Garante role 'admin' para o tenant
    const [role] = await sql`
      INSERT INTO public.roles (tenant_id, slug, name, permissions, is_system)
      VALUES (${tenantId}::uuid, 'admin', 'Administrador',
              ARRAY['*'], true)
      ON CONFLICT (tenant_id, slug) DO UPDATE
        SET name = EXCLUDED.name
      RETURNING id
    `;
    if (!role) throw new Error("Falha ao upsert role 'admin'");
    const roleId = role.id as string;

    await sql`
      INSERT INTO public.user_roles (user_id, role_id, tenant_id)
      VALUES (${authUserId}::uuid, ${roleId}::uuid, ${tenantId}::uuid)
      ON CONFLICT DO NOTHING
    `;
    console.log(`✅  Role 'admin' atribuída a ${adminEmail}.`);

    console.log('');
    console.log('🎉  Setup completo!');
    console.log(`    Tenant  : ${slug} (${tenantId})`);
    console.log(`    Admin   : ${adminEmail} (${authUserId})`);
    console.log('    Envie um magic link para o admin fazer o primeiro login.');
  } catch (err) {
    console.error('❌  Erro inesperado:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
