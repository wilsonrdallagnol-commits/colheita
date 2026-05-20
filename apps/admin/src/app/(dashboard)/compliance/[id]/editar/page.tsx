// apps/admin/src/app/(dashboard)/compliance/[id]/editar/page.tsx
//
// Form de edicao de registro regulatorio. Product_id eh imutavel (se quiser
// mudar o produto, apaga e cria de novo).

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
import { RegistroForm } from '@/components/compliance/registro-form';
import { type RegStatus, updateRegistro } from '@/lib/actions/regulatorio';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'Editar registro' };

export default async function EditarRegistroPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Carrega registro + lista de produtos em paralelo
  const [{ data: registro, error }, { data: products }] = await Promise.all([
    supabase
      .from('regulatory_registrations')
      .select(
        `id, product_id, authority, registration_no, issued_at, expires_at,
         status, document_url, notes,
         product:products(id, name, slug)`,
      )
      .eq('id', id)
      .maybeSingle(),
    supabase.from('products').select('id, name, slug').is('deleted_at', null).order('name'),
  ]);

  if (error || !registro) notFound();

  const product = Array.isArray(registro.product) ? registro.product[0] : registro.product;
  const productLabel = (product as { name?: string } | null)?.name ?? 'Produto removido';

  const updateAction = updateRegistro.bind(null, id);

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
            <BreadcrumbLink href="/compliance" style={{ fontSize: '0.8125rem' }}>
              Compliance
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Editar</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div style={{ marginBottom: '24px' }}>
        <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
          Compliance · Editar registro
        </p>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.025em',
            marginBottom: '4px',
          }}
        >
          {registro.authority} {registro.registration_no}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
          Produto: {productLabel}
        </p>
      </div>

      <RegistroForm
        action={updateAction}
        cancelHref="/compliance"
        submitLabel="Salvar alterações"
        products={(products ?? []).map((p) => ({
          id: p.id as string,
          name: p.name as string,
          slug: p.slug as string,
        }))}
        productLocked
        defaultValues={{
          product_id: registro.product_id as string,
          authority: registro.authority as string,
          registration_no: registro.registration_no as string,
          issued_at: registro.issued_at as string | null,
          expires_at: registro.expires_at as string | null,
          status: registro.status as RegStatus,
          document_url: registro.document_url as string | null,
          notes: registro.notes as string | null,
        }}
      />
    </div>
  );
}
