// apps/admin/src/app/(dashboard)/produtos/novo/page.tsx
import { createServerClient, requireAuth } from '@colheita/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@colheita/ui';
import { cookies } from 'next/headers';
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
    <div style={{ padding: '32px', maxWidth: '720px' }}>
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span style={{ color: 'var(--colheita-text-tertiary)', fontSize: '0.8125rem' }}>
              Argho
            </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/produtos" style={{ fontSize: '0.8125rem' }}>
              Produtos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Novo produto</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.025em',
            marginBottom: '4px',
          }}
        >
          Novo produto
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
          Cria um rascunho. Você poderá publicar depois de preencher os detalhes.
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
