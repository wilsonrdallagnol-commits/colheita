// apps/academia/src/app/(auth)/entrar/actions.ts
'use server';

import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';

export async function signInWithMagicLink(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = formData.get('email');
  if (typeof email !== 'string' || !email.includes('@')) {
    return { error: 'Email inválido.' };
  }

  // `next` é um path relativo passado pelo formulário (validado na página)
  const nextRaw = formData.get('next');
  const next =
    typeof nextRaw === 'string' && nextRaw.startsWith('/') && !nextRaw.startsWith('//')
      ? nextRaw
      : null;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const baseUrl = process.env.NEXT_PUBLIC_ACADEMIA_URL ?? '';
  const callbackUrl = next
    ? `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`
    : `${baseUrl}/auth/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl,
    },
  });

  if (error) {
    return { error: 'Erro ao enviar o link. Tente novamente.' };
  }

  return {};
}
