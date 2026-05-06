// apps/portal/src/app/(public)/layout.tsx
// Layout publico da Plataforma Colheita.
import { createServerClient } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { ChatWidget } from '@/components/chat-widget';
import { Footer } from '@/components/Footer';
import { TopNav } from '@/components/TopNav';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  let user: { email?: string | null } | null = null;
  try {
    const supabase = createServerClient(cookieStore);
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (err) {
    // Supabase indisponivel (placeholder em deploy de demo) — segue sem user.
    captureError(err, { context: 'portal.publicLayout.getUser' });
    user = null;
  }

  return (
    <div
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}
    >
      <TopNav userEmail={user?.email ?? null} />

      <main style={{ flex: 1 }}>{children}</main>

      {/* Chat widget — apenas para distribuidores autenticados */}
      {user && <ChatWidget />}

      <Footer />
    </div>
  );
}
