// apps/admin/src/app/(dashboard)/categorias/page.tsx
import { createServerClient, requireAuth } from '@colheita/auth';
import { Button } from '@colheita/ui';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { CategoriaRow } from '@/components/categorias/categoria-row';

export const metadata = { title: 'Categorias' };

export default async function CategoriasPage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { data: categorias } = await supabase
    .from('product_categories')
    .select('id, slug, name, description, sort_order')
    .order('sort_order', { ascending: true })
    .order('name');

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)' }}>
      <div
        style={{
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
            PIM · Taxonomia
          </p>
          <h1
            className="argho-display"
            style={{
              fontSize: 'clamp(1.875rem, 2.4vw, 2.375rem)',
              color: '#0a0a0a',
              margin: '0 0 8px',
            }}
          >
            Categorias do catálogo
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--colheita-text-secondary)',
              margin: 0,
              maxWidth: '60ch',
            }}
          >
            {(categorias ?? []).length}{' '}
            {(categorias ?? []).length === 1 ? 'categoria' : 'categorias'} — organizam o portfólio
            Argho por linha de produtos.
          </p>
        </div>

        <Button asChild size="sm">
          <Link href="/categorias/nova">+ Nova categoria</Link>
        </Button>
      </div>

      {/* Lista */}
      <div
        style={{
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
          overflow: 'hidden',
        }}
      >
        {(categorias ?? []).length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--colheita-text-tertiary)',
              fontSize: '0.875rem',
            }}
          >
            Nenhuma categoria ainda.{' '}
            <Link
              href="/categorias/nova"
              style={{ color: 'var(--colheita-brand-primary)', textDecoration: 'none' }}
            >
              Criar a primeira
            </Link>
            .
          </div>
        ) : (
          (categorias ?? []).map((cat, idx) => (
            <CategoriaRow
              key={cat.id}
              categoria={cat}
              isLast={idx === (categorias ?? []).length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
