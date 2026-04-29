// apps/admin/src/app/(dashboard)/produtos/page.tsx
import { createServerClient } from '@colheita/auth';
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
import { ProdutoFilters } from '@/components/produtos/produto-filters';
import { ProdutoGrid } from '@/components/produtos/produto-grid';

type ProdutoStatus = 'draft' | 'published' | 'archived';

interface SearchParams {
  q?: string;
  categoria?: string;
  status?: string;
}

export const metadata = { title: 'Produtos' };

async function fetchProdutos(
  supabase: ReturnType<typeof createServerClient>,
  q?: string,
  categoria?: string,
  status?: string,
) {
  const { data: categorias } = await supabase
    .from('product_categories')
    .select('id, slug, name')
    .order('name');

  let categoryId: string | undefined;
  if (categoria && categorias) {
    const cat = categorias.find((c) => c.slug === categoria);
    categoryId = cat?.id;
  }

  let query = supabase
    .from('products')
    .select('id, slug, name, tagline, status, category:product_categories(id, name)')
    .is('deleted_at', null)
    .order('name');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (status && ['draft', 'published', 'archived'].includes(status)) {
    query = query.eq('status', status);
  }

  if (q) {
    query = query.or(`name.ilike.%${q}%,tagline.ilike.%${q}%`);
  }

  const { data: produtos } = await query;

  return {
    categorias: categorias ?? [],
    produtos: (produtos ?? []).map((p) => ({
      ...p,
      status: p.status as ProdutoStatus,
      category: Array.isArray(p.category) ? (p.category[0] ?? null) : (p.category ?? null),
    })),
  };
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, categoria, status } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { categorias, produtos } = await fetchProdutos(supabase, q, categoria, status);

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
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Produtos</BreadcrumbPage>
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
            Produtos
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
            {produtos.length} {produtos.length === 1 ? 'produto' : 'produtos'}
          </p>
        </div>

        <Button asChild size="sm">
          <Link href="/produtos/novo">+ Novo produto</Link>
        </Button>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <ProdutoFilters
          categorias={categorias}
          initialQ={q ?? ''}
          initialCategoria={categoria ?? ''}
          initialStatus={(status as ProdutoStatus | undefined) ?? ''}
        />
      </div>

      <ProdutoGrid produtos={produtos} />
    </div>
  );
}
