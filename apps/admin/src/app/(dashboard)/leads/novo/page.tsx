// apps/admin/src/app/(dashboard)/leads/novo/page.tsx
//
// Camada 7 (CRM) — captura inicial de lead.

import { requireAuth } from '@colheita/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@colheita/ui';
import { cookies } from 'next/headers';
import { LeadForm } from '@/components/leads/lead-form';
import { createLead } from '@/lib/actions/leads';

export const metadata = { title: 'Novo lead' };

export default async function NovoLeadPage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span style={{ color: 'var(--colheita-text-tertiary)', fontSize: '0.8125rem' }}>
              Argho
            </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/leads" style={{ fontSize: '0.8125rem' }}>
              Leads
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Novo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.025em',
            marginBottom: '4px',
          }}
        >
          Novo lead
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
          Captura inicial. Status começa em &ldquo;novo&rdquo; — mova no pipeline depois pela página
          de detalhe.
        </p>
      </div>

      <LeadForm action={createLead} cancelHref="/leads" submitLabel="Criar lead" />
    </div>
  );
}
