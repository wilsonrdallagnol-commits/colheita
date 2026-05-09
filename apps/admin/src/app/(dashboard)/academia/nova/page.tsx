// apps/admin/src/app/(dashboard)/academia/nova/page.tsx
import { requireAuth } from '@colheita/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { TrilhaForm } from '@/components/academia/trilha-form';
import { createTrilha } from '@/lib/actions/academia';

export const metadata = { title: 'Nova Trilha' };

export default async function NovaTrilhaPage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '720px' }}>
      <Link
        href="/academia"
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
        ← Academia
      </Link>

      <div style={{ marginBottom: '32px' }}>
        <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
          Academia · Nova trilha
        </p>
        <h1
          className="argho-display"
          style={{
            fontSize: 'clamp(1.875rem, 2.4vw, 2.375rem)',
            color: '#0a0a0a',
            margin: '0 0 8px',
          }}
        >
          Criar trilha de aprendizado
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--colheita-text-secondary)',
            margin: 0,
            maxWidth: '60ch',
          }}
        >
          Estruture módulos, lições e quizzes — vendedores e distribuidores recebem certificado ao
          concluir.
        </p>
      </div>

      <TrilhaForm action={createTrilha} submitLabel="Criar trilha" />
    </div>
  );
}
