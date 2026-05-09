// apps/admin/src/app/(dashboard)/categorias/nova/page.tsx
import { requireAuth } from '@colheita/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { CategoriaForm } from '@/components/categorias/categoria-form';
import { createCategoria } from '@/lib/actions/categorias';

export const metadata = { title: 'Nova categoria' };

export default async function NovaCategoriaPage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '560px' }}>
      <Link
        href="/categorias"
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
        ← Categorias
      </Link>

      <div style={{ marginBottom: '32px' }}>
        <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
          PIM · Nova categoria
        </p>
        <h1
          className="argho-display"
          style={{
            fontSize: 'clamp(1.75rem, 2.2vw, 2rem)',
            color: '#0a0a0a',
            margin: 0,
          }}
        >
          Nova categoria de produto
        </h1>
      </div>

      <CategoriaForm action={createCategoria} submitLabel="Criar categoria" />
    </div>
  );
}
