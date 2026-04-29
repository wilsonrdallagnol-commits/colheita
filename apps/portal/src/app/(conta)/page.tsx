// apps/portal/src/app/(conta)/page.tsx
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import { signOut } from '@/lib/actions/auth';

export const metadata = { title: 'Minha Conta' };

export default async function ContaPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--colheita-surface-background)',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'var(--colheita-text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '4px',
              }}
            >
              Minha Conta
            </h1>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--colheita-text-secondary)',
              }}
            >
              {user?.email}
            </p>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--colheita-radius-md)',
                backgroundColor: 'transparent',
                color: 'var(--colheita-text-secondary)',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: '1px solid var(--colheita-border)',
                cursor: 'pointer',
              }}
            >
              Sair
            </button>
          </form>
        </div>

        <div
          style={{
            backgroundColor: 'var(--colheita-surface-card)',
            border: '1px solid var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            padding: '24px',
          }}
        >
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--colheita-text-tertiary)',
              textAlign: 'center',
              padding: '24px 0',
            }}
          >
            Área do distribuidor em construção.
          </p>
        </div>
      </div>
    </div>
  );
}
