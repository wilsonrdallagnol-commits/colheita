// apps/portal/src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

export async function middleware(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sem credenciais: middleware vira no-op para nao crashar (502/MIDDLEWARE_INVOCATION_FAILED).
  // Rotas /conta sao protegidas pelo layout (conta) via redirect.
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  let user: { email?: string | null } | null = null;
  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet)
            supabaseResponse.cookies.set(name, value, options);
        },
      },
    });
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // Supabase indisponivel — middleware no-op.
    return supabaseResponse;
  }

  // Protege rotas /conta/* — requer autenticação
  if (!user && pathname.startsWith('/conta')) {
    return NextResponse.redirect(new URL('/entrar', request.url));
  }

  // Redireciona usuário logado que tenta acessar /entrar
  if (user && pathname === '/entrar') {
    return NextResponse.redirect(new URL('/conta', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
