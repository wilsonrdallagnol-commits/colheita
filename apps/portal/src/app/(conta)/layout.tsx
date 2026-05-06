// apps/portal/src/app/(conta)/layout.tsx
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { Footer } from '@/components/Footer';
import { TopNav } from '@/components/TopNav';

export default async function ContaLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
