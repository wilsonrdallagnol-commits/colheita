// apps/portal/src/app/(public)/layout.tsx
// Layout publico da Plataforma Colheita.
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { ChatWidget } from '@/components/chat-widget';
import { Footer } from '@/components/Footer';
import { TopNav } from '@/components/TopNav';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
