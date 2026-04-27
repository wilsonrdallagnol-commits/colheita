// apps/admin/src/middleware.ts
import { updateSession } from '@colheita/auth/middleware';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Exclui: estáticos Next.js, imagens, assets, /login e /auth/callback.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|login|auth/callback).*)',
  ],
};
