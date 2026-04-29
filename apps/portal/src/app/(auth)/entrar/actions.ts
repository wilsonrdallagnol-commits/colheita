// apps/portal/src/app/(auth)/entrar/actions.ts
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

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_PORTAL_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: 'Erro ao enviar o link. Tente novamente.' };
  }

  return {};
}
