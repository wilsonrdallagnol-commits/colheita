// apps/admin/src/app/(dashboard)/compliance/novo/page.tsx
//
// Form de criacao de registro regulatorio (MAPA/ANVISA/IBAMA).

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
import { RegistroForm } from '@/components/compliance/registro-form';
import { createRegistro } from '@/lib/actions/regulatorio';

export const metadata = { title: 'Novo registro regulatório' };

export default async function NovoRegistroPage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Lista de produtos pro dropdown
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug')
    .is('deleted_at', null)
    .order('name');

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
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Novo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div style={{ marginBottom: '24px' }}>
        <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
          Compliance · Novo registro
        </p>
        <h1
          className="argho-display"
          style={{
            fontSize: 'clamp(1.875rem, 2.4vw, 2.375rem)',
            color: '#0a0a0a',
            margin: '0 0 8px',
          }}
        >
          Cadastrar registro regulatório
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--colheita-text-secondary)',
            margin: 0,
            maxWidth: '60ch',
          }}
        >
          MAPA, ANVISA, IBAMA ou autoridade estadual. Sem registro válido, o produto não pode ser
          comercializado.
        </p>
      </div>

      <RegistroForm
        action={createRegistro}
        cancelHref="/compliance"
        submitLabel="Cadastrar registro"
        products={(products ?? []).map((p) => ({
          id: p.id as string,
          name: p.name as string,
          slug: p.slug as string,
        }))}
      />
    </div>
  );
}
