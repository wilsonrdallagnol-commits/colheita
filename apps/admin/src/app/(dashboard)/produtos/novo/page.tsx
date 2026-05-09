// apps/admin/src/app/(dashboard)/produtos/novo/page.tsx
import { createServerClient, requireAuth } from '@colheita/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ProdutoForm } from '@/components/produtos/produto-form';
import { createProduto } from '@/lib/actions/produtos';

export const metadata = { title: 'Novo produto' };

export default async function NovoProdutoPage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { data: categorias } = await supabase
    .from('product_categories')
    .select('id, slug, name')
    .order('name');

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '720px' }}>
      <Link
        href="/produtos"
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
        ← Catálogo de produtos
      </Link>

      <div style={{ marginBottom: '32px' }}>
        <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
          PIM · Novo produto
        </p>
        <h1
          className="argho-display"
          style={{
            fontSize: 'clamp(1.875rem, 2.4vw, 2.375rem)',
            color: '#0a0a0a',
            margin: '0 0 8px',
          }}
        >
          Adicionar produto Argho
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--colheita-text-secondary)',
            margin: 0,
            maxWidth: '60ch',
          }}
        >
          Cria um rascunho. Composição, dosagem e mídias podem ser preenchidos depois — publicar
          quando estiver pronto.
        </p>
      </div>

      <ProdutoForm
        action={createProduto}
        categorias={categorias ?? []}
        cancelHref="/produtos"
        submitLabel="Criar rascunho"
      />
    </div>
  );
}
