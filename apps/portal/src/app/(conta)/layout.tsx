// apps/portal/src/app/(conta)/layout.tsx
import { createServerClient } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { Footer } from '@/components/Footer';
import { TopNav } from '@/components/TopNav';

export default async function ContaLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();

  // Resilient a Supabase indisponivel (env vars placeholder em deploy de demo).
  // Em vez de crashar com 500, redireciona para /entrar igual a quando user nao
  // esta logado — UX consistente.
  let user: { email?: string | null } | null = null;
  try {
    const supabase = createServerClient(cookieStore);
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (err) {
    captureError(err, { context: 'portal.contaLayout.getUser' });
  }

  if (!user) {
    redirect('/entrar');
  }

  return (
    <div
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}
    >
      <TopNav userEmail={user.email ?? null} />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
