// apps/admin/src/app/(dashboard)/produtos/[slug]/page.tsx
import { createServerClient, requireAuth } from '@colheita/auth';
import type { ProductComposition, ProductPackaging } from '@colheita/db';
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
import { ProdutoActions } from '@/components/produtos/produto-actions';
import { ProdutoDetail } from '@/components/produtos/produto-detail';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return { title: slug.replace(/-/g, ' ') };
}

export default async function ProdutoPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();

  await requireAuth(cookieStore);

  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      tagline,
      description,
      status,
      composition,
      technical_specs,
      packaging,
      category:product_categories(name),
      registrations:regulatory_registrations(registration_no)
    `)
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    notFound();
  }

  const registration = Array.isArray(data.registrations) ? (data.registrations[0] ?? null) : null;

  const category = Array.isArray(data.category)
    ? (data.category[0] ?? null)
    : (data.category ?? null);

  return (
    <div style={{ padding: '32px' }}>
      <Breadcrumb style={{ marginBottom: '28px' }}>
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
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>{data.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Barra de ações */}
      <div style={{ marginBottom: '28px' }}>
        <ProdutoActions slug={slug} status={data.status} />
      </div>

      <ProdutoDetail
        produto={{
          name: data.name,
          tagline: data.tagline ?? null,
          description: data.description ?? null,
          status: data.status,
          composition: (data.composition ?? {}) as ProductComposition,
          technicalSpecs: (data.technical_specs ?? {}) as Record<string, unknown>,
          packaging: (data.packaging ?? []) as ProductPackaging,
          category,
          registrationNo: registration?.registration_no ?? null,
        }}
      />
    </div>
  );
}
