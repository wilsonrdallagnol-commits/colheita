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
  let user: { id?: string; email?: string | null } | null = null;
  let unreadNotifs = 0;
  try {
    const supabase = createServerClient(cookieStore);
    const result = await supabase.auth.getUser();
    user = result.data.user;

    if (user?.id) {
      // Conta notificacoes nao lidas pro badge no bell.
      // head:true evita transferir os rows (so o count).
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null);
      unreadNotifs = count ?? 0;
    }
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
      <TopNav userEmail={user.email ?? null} unreadNotifs={unreadNotifs} />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
