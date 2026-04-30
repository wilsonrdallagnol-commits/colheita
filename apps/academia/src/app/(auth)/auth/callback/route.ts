// apps/academia/src/app/(auth)/auth/callback/route.ts
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextRaw = searchParams.get('next');
  const next =
    typeof nextRaw === 'string' && nextRaw.startsWith('/') && !nextRaw.startsWith('//')
      ? nextRaw
      : '/meu-progresso';

  if (!code) {
    return NextResponse.redirect(new URL('/entrar?error=missing_code', origin));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/entrar?error=auth_failed', origin));
  }

  // Atualiza last_seen_at do usuário no public.users.
  // Falha silenciosa: não impede o login se o registro ainda não existir.
  if (data.user) {
    await supabase
      .from('users')
      .update({ last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', data.user.id)
      .then(() => {
        /* fire-and-forget — silently ignored */
      });
  }

  return NextResponse.redirect(new URL(next, origin));
}
