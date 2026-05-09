// apps/admin/src/app/(auth)/login/actions.ts
'use server';

import { createServerClient } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface LoginState {
  error?: string;
  resetSent?: boolean;
}

/**
 * Login com email + senha. Substituiu magic link (loop infinito de validação
 * de email reportado pelo fundador 2026-05-09).
 *
 * Sucesso: cria session via cookies + redirect server-side pra /produtos.
 * Falha: retorna erro pra UI sem mensagem que vaze se email existe ou nao
 * (defensa contra user enumeration).
 */
export async function signInWithPassword(
  _prevState: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof email !== 'string' || !email.includes('@')) {
    return { error: 'Email inválido.' };
  }
  if (typeof password !== 'string' || password.length < 6) {
    return { error: 'Senha inválida.' };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Mensagem genérica — não revela se email existe (LGPD + segurança).
    // Sentry recebe contexto detalhado pra debug em prod.
    captureError(error, {
      context: 'admin.login.signInWithPassword',
      // Email NAO vai pro Sentry (PII). Apenas dominio pra correlacao.
      emailDomain: email.split('@')[1] ?? 'unknown',
    });
    return { error: 'Email ou senha incorretos.' };
  }

  redirect('/produtos');
}

/**
 * Reset de senha via Supabase. Envia email com link único pra trocar senha.
 * Não é magic link de login — é fluxo dedicado /auth/recover.
 */
export async function requestPasswordReset(
  _prevState: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get('email');
  if (typeof email !== 'string' || !email.includes('@')) {
    return { error: 'Email inválido.' };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const baseUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? '';
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/recover`,
  });

  if (error) {
    captureError(error, {
      context: 'admin.login.requestPasswordReset',
      emailDomain: email.split('@')[1] ?? 'unknown',
    });
    // Mesma mensagem de sucesso pra evitar enumeration.
  }

  // Sempre retorna sucesso (verdadeiro ou aparente) — não revela se email existe.
  return { resetSent: true };
}
