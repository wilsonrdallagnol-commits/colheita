// apps/academia/src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

export async function middleware(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
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
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Rotas públicas: /entrar, /auth/callback, /trilhas (leitura), / (home pública)
  const isPublic =
    pathname === '/entrar' ||
    pathname.startsWith('/auth/callback') ||
    pathname === '/' ||
    pathname.startsWith('/trilhas');

  // Protege rotas privadas
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/entrar', request.url));
  }

  // Redireciona usuário logado que tenta acessar /entrar
  if (user && pathname === '/entrar') {
    return NextResponse.redirect(new URL('/meu-progresso', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
