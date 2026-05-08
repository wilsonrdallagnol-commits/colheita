// apps/portal/src/app/(auth)/auth/callback/route.ts
import { createServerClient } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextRaw = searchParams.get('next');

  // Valida que `next` é um path relativo para prevenir open redirect
  const next =
    typeof nextRaw === 'string' && nextRaw.startsWith('/') && !nextRaw.startsWith('//')
      ? nextRaw
      : '/conta';

  if (!code) {
    return NextResponse.redirect(new URL('/entrar?error=missing_code', origin));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Preserva sinal: sem isto perdemos visibilidade de auths falhando em prod.
    captureError(error, {
      context: 'portal.auth.callback.exchange',
      codePrefix: code.slice(0, 6),
    });
    return NextResponse.redirect(new URL('/entrar?error=auth_failed', origin));
  }

  // Atualiza last_seen_at do usuário no public.users.
  // O UPDATE policy permite que o próprio usuário atualize seu registro (id = auth.uid()).
  // Awaited com try/catch: falhar aqui NÃO bloqueia o login, mas precisamos do sinal
  // no Sentry — fire-and-forget engole erros silenciosamente e viola baseline senior.
  if (data.user) {
    try {
      await supabase
        .from('users')
        .update({ last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', data.user.id);
    } catch (err) {
      captureError(err, {
        context: 'portal.auth.callback.lastSeen',
        userId: data.user.id,
      });
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}
