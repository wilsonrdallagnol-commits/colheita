// packages/jobs/src/lib/supabase-admin.ts
//
// Cliente Supabase service role para jobs background.
// Bypass RLS — usar apenas em jobs autenticados via Trigger.dev.
//
// VARIÁVEIS DE AMBIENTE obrigatórias:
//   SUPABASE_URL            — URL do projeto Supabase
//   SUPABASE_SERVICE_ROLE_KEY — chave service role (bypass RLS)

import { createClient } from '@supabase/supabase-js';

export function buildSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      '[jobs] SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios para jobs com acesso ao DB.',
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
