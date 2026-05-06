// apps/portal/src/app/(auth)/entrar/actions.ts
'use server';

import { createServerClient } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { cookies } from 'next/headers';
import { isSupabaseConfigured } from '@/lib/portal-config';

export async function signInWithMagicLink(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = formData.get('email');
  if (typeof email !== 'string' || !email.includes('@')) {
    return { error: 'Email inválido.' };
  }

  // Fallback claro quando Supabase prod ainda nao foi conectado.
  // UX consistente com PlaceholderHero da home.
  if (!isSupabaseConfigured(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    return {
      error:
        'Plataforma em construção. Login estará disponível assim que conectarmos o banco de produção.',
    };
  }

  // `next` é um path relativo passado pelo formulário (validado na página)
  const nextRaw = formData.get('next');
  const next =
    typeof nextRaw === 'string' && nextRaw.startsWith('/') && !nextRaw.startsWith('//')
      ? nextRaw
      : null;

  const cookieStore = await cookies();

  const baseUrl = process.env.NEXT_PUBLIC_PORTAL_URL ?? '';
  const callbackUrl = next
    ? `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`
    : `${baseUrl}/auth/callback`;

  try {
    const supabase = createServerClient(cookieStore);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl,
      },
    });

    if (error) {
      captureError(error, { context: 'portal.signInWithMagicLink', email });
      return { error: 'Erro ao enviar o link. Tente novamente.' };
    }
  } catch (err) {
    captureError(err, { context: 'portal.signInWithMagicLink.exception', email });
    return { error: 'Erro inesperado. Tente novamente em alguns instantes.' };
  }

  return {};
}
