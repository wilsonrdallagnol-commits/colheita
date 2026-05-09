// apps/admin/src/app/(dashboard)/categorias/[id]/editar/page.tsx
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
import { CategoriaForm } from '@/components/categorias/categoria-form';
import { updateCategoria } from '@/lib/actions/categorias';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'Editar categoria' };

export default async function EditarCategoriaPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { data: categoria, error } = await supabase
    .from('product_categories')
    .select('id, name, description')
    .eq('id', id)
    .single();

  if (error || !categoria) {
    notFound();
  }

  const updateAction = updateCategoria.bind(null, id);

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '560px' }}>
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span style={{ color: 'var(--colheita-text-tertiary)', fontSize: '0.8125rem' }}>
              Argho
            </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/categorias" style={{ fontSize: '0.8125rem' }}>
              Categorias
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Editar</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'var(--colheita-text-primary)',
          letterSpacing: '-0.025em',
          marginBottom: '32px',
        }}
      >
        Editar: {categoria.name}
      </h1>

      <CategoriaForm
        action={updateAction}
        submitLabel="Salvar alterações"
        defaultValues={{
          name: categoria.name,
          description: categoria.description,
        }}
      />
    </div>
  );
}
