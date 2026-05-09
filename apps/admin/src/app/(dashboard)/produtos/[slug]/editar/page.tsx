// apps/admin/src/app/(dashboard)/produtos/[slug]/editar/page.tsx
import { createAdminClient, createServerClient, requireAuth } from '@colheita/auth';
import type { ProductApplication } from '@colheita/db';
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
import type { PickableAsset } from '@/components/produtos/asset-picker';
import { ProdutoForm } from '@/components/produtos/produto-form';
import { updateProduto } from '@/lib/actions/produtos';

// Limite alto pra cobrir ~50 assets de imagem da Argho. Quando passar de 500,
// refatorar o AssetPicker pra modal com busca server-side paginada.
const MAX_ASSETS_FOR_PICKER = 500;

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

  // Busca produto + categorias + lista de imagens disponíveis em paralelo.
  // Imagens vêm com tags pra busca rápida no AssetPicker.
  const [{ data: produto, error }, { data: categorias }, { data: rawAssets }] = await Promise.all([
    supabase
      .from('products')
      .select(
        `id, name, tagline, description, status, category_id, safra_codigo,
         composition, technical_specs, packaging, applications,
         hero_asset_id, packshot_asset_id`,
      )
      .eq('slug', slug)
      .is('deleted_at', null)
      .single(),
    supabase.from('product_categories').select('id, slug, name').order('name'),
    supabase
      .from('assets')
      .select('id, title, original_name, storage_path, width, height, tags')
      .eq('type', 'image')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(MAX_ASSETS_FOR_PICKER),
  ]);

  if (error || !produto) {
    notFound();
  }

  // Resolve URL pública via Storage admin (RLS já filtrou por tenant).
  const adminClient = createAdminClient();
  const availableAssets: PickableAsset[] = (rawAssets ?? []).map((a) => {
    const storagePath = a.storage_path as string;
    const { data: urlData } = adminClient.storage.from('assets').getPublicUrl(storagePath);
    return {
      id: a.id as string,
      title: a.title as string | null,
      originalName: a.original_name as string,
      publicUrl: urlData?.publicUrl ?? null,
      width: a.width as number | null,
      height: a.height as number | null,
      tags: ((a.tags as string[] | null) ?? []) as string[],
    };
  });

  // Vincula o slug ao updateProduto para ser usado como server action
  const updateAction = updateProduto.bind(null, slug);

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '720px' }}>
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
        availableAssets={availableAssets}
        defaultValues={{
          name: produto.name,
          tagline: produto.tagline,
          description: produto.description,
          category_id: produto.category_id,
          safra_codigo: produto.safra_codigo,
          composition: produto.composition as Record<string, unknown> | null,
          technical_specs: produto.technical_specs as Record<string, unknown> | null,
          packaging: produto.packaging as unknown[] | null,
          applications: (produto.applications ?? []) as ProductApplication[],
          hero_asset_id: produto.hero_asset_id as string | null,
          packshot_asset_id: produto.packshot_asset_id as string | null,
        }}
      />
    </div>
  );
}
