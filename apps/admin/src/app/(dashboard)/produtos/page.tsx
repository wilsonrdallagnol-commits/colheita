// apps/admin/src/app/(dashboard)/produtos/page.tsx
import { createServerClient } from '@colheita/auth';
import { Button } from '@colheita/ui';
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
            PIM · Catálogo
          </p>
          <h1
            className="argho-display"
            style={{
              fontSize: 'clamp(1.875rem, 2.4vw, 2.375rem)',
              color: '#0a0a0a',
              margin: '0 0 8px',
            }}
          >
            Produtos Argho
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--colheita-text-secondary)',
              margin: 0,
              maxWidth: '60ch',
            }}
          >
            {produtos.length} {produtos.length === 1 ? 'produto' : 'produtos'} no catálogo —
            composição, dosagem, registros e mídias num lugar só.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/*
            Catálogo consolidado em PDF — gera 1 documento com TODOS os produtos
            publicados (capa Argho + sumário + 1 página por produto). Usa <a download>
            em vez de <Link> pra forçar download attachment direto do browser.
          */}
          <Button asChild variant="outline" size="sm">
            <a href="/produtos/catalogo" download>
              Baixar catálogo (PDF)
            </a>
          </Button>

          <Button asChild size="sm">
            <Link href="/produtos/novo">+ Novo produto</Link>
          </Button>
        </div>
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
