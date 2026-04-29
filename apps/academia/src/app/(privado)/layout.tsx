// apps/academia/src/app/(privado)/layout.tsx
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function PrivadoLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/entrar');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top navigation */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid var(--colheita-border-subtle)',
          backgroundColor: 'var(--colheita-surface-background)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 32px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--colheita-radius-md)',
                backgroundColor: 'var(--colheita-brand-primary)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: 'var(--colheita-text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Academia Argho
            </span>
          </Link>

          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link
              href="/"
              style={{
                fontSize: '0.875rem',
                color: 'var(--colheita-text-secondary)',
                textDecoration: 'none',
              }}
            >
              Trilhas
            </Link>
            <Link
              href="/meu-progresso"
              style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'var(--colheita-text-primary)',
                textDecoration: 'none',
              }}
            >
              Meu Progresso
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
