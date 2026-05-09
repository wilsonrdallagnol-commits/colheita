// apps/admin/src/app/(auth)/auth/callback/route.ts
//
// Callback OAuth/email-link. Login primario agora e password (signInWithPassword)
// — esta rota cobre apenas:
//   - Reset de senha (resetPasswordForEmail) → redireciona pra /auth/recover
//   - OAuth flows futuros (Google/Microsoft, se um dia adicionarmos)
//
// O `type` query param indica o fluxo. Magic link (signInWithOtp) foi removido
// — gerava loop infinito de validacao reportado em 2026-05-09.

import { createServerClient } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type'); // 'recovery' | 'invite' | 'signup' | etc
  const next = searchParams.get('next') ?? '/produtos';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', origin));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    captureError(error, { context: 'admin.auth.callback.exchangeCodeForSession', type });
    return NextResponse.redirect(new URL('/login?error=auth_failed', origin));
  }

  // Recovery flow: redireciona pra pagina de troca de senha (nao pra dashboard).
  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/auth/recover', origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
