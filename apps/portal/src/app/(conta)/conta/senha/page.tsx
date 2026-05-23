// apps/portal/src/app/(conta)/conta/senha/page.tsx
//
// Distribuidor troca senha própria. Server action valida posse via
// signInWithPassword antes de updateUser (defesa session hijack).

import { requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { PasswordForm } from '@/components/conta/password-form';

export const metadata: Metadata = {
  title: 'Trocar senha',
};

export default async function SenhaPage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 24px 64px', width: '100%' }}>
      <Link
        href="/conta/perfil"
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
        ← Meu perfil
      </Link>

      <header style={{ marginBottom: '24px' }}>
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
          Conta · Segurança
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
          Trocar senha
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: '0.875rem',
            color: 'var(--colheita-text-secondary)',
            lineHeight: 1.55,
          }}
        >
          Pra mudar senha, confirme a atual e escolha uma nova com no mínimo 8 caracteres. A
          atualização desconecta outras sessões abertas em ~5 minutos.
        </p>
      </header>

      <PasswordForm />
    </div>
  );
}
