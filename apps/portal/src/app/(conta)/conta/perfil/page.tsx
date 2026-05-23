// apps/portal/src/app/(conta)/conta/perfil/page.tsx
//
// Distribuidor edita perfil próprio: nome, telefone, empresa.
// Email é read-only (chave de login no Supabase auth).

import { createServerClient, requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ProfileForm } from '@/components/conta/profile-form';

export const metadata: Metadata = {
  title: 'Meu perfil',
};

export default async function PerfilPage() {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { data: userRow } = await supabase
    .from('users')
    .select('full_name, preferences')
    .eq('id', user.id)
    .maybeSingle();

  const prefs = (userRow?.preferences ?? {}) as { phone?: string; company?: string };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px 64px', width: '100%' }}>
      <Link
        href="/conta"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--colheita-text-tertiary)',
          textDecoration: 'none',
          marginBottom: '20px',
        }}
      >
        ← Minha conta
      </Link>

      <header style={{ marginBottom: '32px' }}>
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--colheita-brand-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '8px',
          }}
        >
          Conta · Perfil
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(1.5rem, 2.4vw, 1.875rem)',
            fontWeight: 600,
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.025em',
          }}
        >
          Meu perfil
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: '0.875rem',
            color: 'var(--colheita-text-secondary)',
            lineHeight: 1.55,
          }}
        >
          Informações pessoais usadas em pedidos, comunicação Argho e propostas comerciais.
        </p>
      </header>

      <ProfileForm
        email={user.email ?? '—'}
        defaultValues={{
          full_name: userRow?.full_name ?? '',
          phone: prefs.phone ?? '',
          company: prefs.company ?? '',
        }}
      />

      <hr
        style={{
          border: 0,
          borderTop: '1px solid var(--colheita-border-subtle)',
          margin: '40px 0 24px',
        }}
      />

      <Link
        href="/conta/senha"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--colheita-brand-primary)',
          textDecoration: 'none',
        }}
      >
        Trocar senha →
      </Link>
    </div>
  );
}
