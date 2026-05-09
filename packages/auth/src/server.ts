// packages/auth/src/server.ts
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { redirect } from 'next/navigation';

// Em Server Components o cookieStore eh ReadonlyRequestCookies (sem .set).
// Em Server Actions e Route Handlers, `cookies()` retorna um store mutavel
// que TAMBEM aceita .set(name, value, options) — mesmo runtime, tipo diferente.
// Tipamos a versao mutavel como interseccao explicita (sem `any`) e checamos
// `typeof set === 'function'` em runtime pra suportar ambos cenarios.
type CookieSetter = (name: string, value: string, options?: Record<string, unknown>) => void;
type MutableCookieStore = ReadonlyRequestCookies & { set?: CookieSetter };

export function createServerClient(cookieStore: ReadonlyRequestCookies) {
  const store = cookieStore as MutableCookieStore;
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>,
        ) {
          // Bug fix 2026-05-09 (loop infinito de login):
          // Sem isso, signInWithPassword setava session no Supabase mas os
          // cookies de session nunca chegavam ao browser. Middleware nao via
          // session → redirecionava pra /login → loop.
          //
          // Em Server Components puros (RSC) o store eh readonly e .set lanca.
          // Capturamos pra nao quebrar render — middleware ainda renova a
          // sessao via updateSession() em cada request.
          // Em RSC store.set eh undefined — checagem evita crash sem try/catch.
          // Em Server Actions/Route Handlers, store.set existe e funciona.
          if (typeof store.set !== 'function') return;
          try {
            for (const { name, value, options } of cookiesToSet) {
              store.set(name, value, options);
            }
          } catch {
            // Defesa em profundidade: alguns paths podem ainda lancar
            // (e.g. headers ja enviados). Erro nao bloqueia render — middleware
            // (updateSession) renova a sessao em request subsequente.
          }
        },
      },
    },
  );
}

/**
 * Cliente Supabase com service_role — bypassa RLS.
 * Usar APENAS em Server Actions e Route Handlers do admin.
 * NUNCA expor ao cliente. NUNCA usar em contextos de usuário final.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

/**
 * Retorna a sessão atual lendo o JWT do cookie SEM validação no servidor Supabase.
 * AVISO: Não usar para decisões de autorização — o JWT pode estar adulterado.
 * Para autorização, use sempre `getUser()` ou `requireAuth()`.
 * Use `getSession()` apenas para leituras não-sensíveis (ex: exibir email na UI).
 */
export async function getSession(cookieStore: ReadonlyRequestCookies) {
  const supabase = createServerClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser(cookieStore: ReadonlyRequestCookies) {
  const supabase = createServerClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Requer autenticação. Redireciona para /login se não autenticado.
 * ATENÇÃO: Só pode ser chamado de Server Components e Server Actions.
 * Não usar em Route Handlers — redirect() não funciona lá.
 */
export async function requireAuth(cookieStore: ReadonlyRequestCookies) {
  const user = await getUser(cookieStore);
  if (!user) redirect('/login');
  return user;
}
