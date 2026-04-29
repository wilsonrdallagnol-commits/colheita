// apps/admin/src/app/(dashboard)/produtos/[slug]/editar/page.tsx
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
import { notFound } from 'next/navigation';
import { ProdutoForm } from '@/components/produtos/produto-form';
import { updateProduto } from '@/lib/actions/produtos';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ created?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data } = await supabase
    .from('products')
    .select('name')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (!data) return { title: `Editar — ${slug.replace(/-/g, ' ')}` };
  return { title: `Editar — ${data.name}` };
}

export default async function EditarProdutoPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { created } = await searchParams;

  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Busca produto e categorias em paralelo
  const [{ data: produto, error }, { data: categorias }] = await Promise.all([
    supabase
      .from('products')
      .select(
        'id, name, tagline, description, status, category_id, composition, technical_specs, packaging',
      )
      .eq('slug', slug)
      .is('deleted_at', null)
      .single(),
    supabase.from('product_categories').select('id, slug, name').order('name'),
  ]);

  if (error || !produto) {
    notFound();
  }

  // Vincula o slug ao updateProduto para ser usado como server action
  const updateAction = updateProduto.bind(null, slug);

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
            <BreadcrumbLink href={`/produtos/${slug}`} style={{ fontSize: '0.8125rem' }}>
              {produto.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Editar</BreadcrumbPage>
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
          Editar produto
        </h1>

        {/* Banner "produto criado" */}
        {created && (
          <div
            style={{
              marginTop: '12px',
              padding: '10px 14px',
              backgroundColor: 'color-mix(in srgb, var(--colheita-success) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--colheita-success) 30%, transparent)',
              borderRadius: 'var(--colheita-radius-md)',
              fontSize: '0.875rem',
              color: 'var(--colheita-success)',
            }}
          >
            ✓ Produto criado como rascunho. Preencha os detalhes abaixo e salve.
          </div>
        )}
      </div>

      <ProdutoForm
        action={updateAction}
        categorias={categorias ?? []}
        cancelHref={`/produtos/${slug}`}
        submitLabel="Salvar alterações"
        defaultValues={{
          name: produto.name,
          tagline: produto.tagline,
          description: produto.description,
          category_id: produto.category_id,
          composition: produto.composition as Record<string, unknown> | null,
          technical_specs: produto.technical_specs as Record<string, unknown> | null,
          packaging: produto.packaging as unknown[] | null,
        }}
      />
    </div>
  );
}
