// apps/portal/src/app/(auth)/auth/callback/route.ts
import { createServerClient } from '@colheita/auth';
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

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/entrar?error=auth_failed', origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
