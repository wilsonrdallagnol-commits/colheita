// packages/auth/src/server.ts
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { redirect } from 'next/navigation';

export function createServerClient(cookieStore: ReadonlyRequestCookies) {
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Server Components não podem setar cookies.
          // O middleware (updateSession) é responsável por renovar a sessão.
        },
      },
    },
  );
}

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
