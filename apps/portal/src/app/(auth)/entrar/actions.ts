// apps/portal/src/app/(auth)/entrar/actions.ts
'use server';

import { createServerClient } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/portal-config';

// Login via email + senha. O fluxo magic-link foi removido aqui pelo mesmo
// motivo que foi removido do admin: o OTP era pré-consumido por scanners de
// email (Outlook/Gmail/gateways corporativos), ou expirava antes do user
// clicar — e o usuário ficava preso em /entrar?error=missing_code com o
// erro otp_expired do Supabase no hash. Decisão explícita do fundador
// (consistente com o admin).

export async function signInWithPassword(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof email !== 'string' || !email.includes('@')) {
    return { error: 'Email inválido.' };
  }
  if (typeof password !== 'string' || password.length === 0) {
    return { error: 'Informe sua senha.' };
  }

  // Fallback claro quando Supabase prod ainda não foi conectado (mesma UX do
  // PlaceholderHero da home).
  if (!isSupabaseConfigured(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    return {
      error:
        'Plataforma em construção. Login estará disponível assim que conectarmos o banco de produção.',
    };
  }

  // `next` é um path relativo passado pelo formulário (validado na página).
  const nextRaw = formData.get('next');
  const next =
    typeof nextRaw === 'string' && nextRaw.startsWith('/') && !nextRaw.startsWith('//')
      ? nextRaw
      : '/conta';

  const cookieStore = await cookies();
  try {
    const supabase = createServerClient(cookieStore);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // "Invalid login credentials" é input do usuário — não vale alertar no
      // Sentry. Qualquer outro erro vai (sinal de quebra real, não wrong-password).
      const code = (error as { code?: unknown }).code;
      const isInvalidCredentials =
        error.message.toLowerCase().includes('invalid login credentials') ||
        (typeof code === 'string' && code === 'invalid_credentials');

      if (!isInvalidCredentials) {
        captureError(error, { context: 'portal.signInWithPassword', email });
      }
      return {
        error: isInvalidCredentials
          ? 'Email ou senha incorretos.'
          : 'Erro ao entrar. Tente novamente.',
      };
    }
  } catch (err) {
    captureError(err, { context: 'portal.signInWithPassword.exception', email });
    return { error: 'Erro inesperado. Tente novamente em alguns instantes.' };
  }

  // redirect() lança NEXT_REDIRECT — Next intercepta. Não retorna.
  redirect(next);
}
