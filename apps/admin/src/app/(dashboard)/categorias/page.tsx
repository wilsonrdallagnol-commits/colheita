// apps/admin/src/app/(dashboard)/categorias/page.tsx
import { createServerClient, requireAuth } from '@colheita/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
} from '@colheita/ui';
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
    <div style={{ padding: '32px' }}>
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span style={{ color: 'var(--colheita-text-tertiary)', fontSize: '0.8125rem' }}>
              Argho
            </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Categorias</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div
        style={{
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'var(--colheita-text-primary)',
              letterSpacing: '-0.025em',
              marginBottom: '4px',
            }}
          >
            Categorias
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
            {(categorias ?? []).length}{' '}
            {(categorias ?? []).length === 1 ? 'categoria' : 'categorias'} de produto
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
