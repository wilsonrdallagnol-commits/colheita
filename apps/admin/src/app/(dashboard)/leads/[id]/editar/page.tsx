// apps/admin/src/app/(dashboard)/leads/[id]/editar/page.tsx

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
import { LeadForm } from '@/components/leads/lead-form';
import { updateLead } from '@/lib/actions/leads';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'Editar lead' };

export default async function EditarLeadPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { data: lead, error } = await supabase
    .from('leads')
    .select(
      `id, name, company, email, phone, cpf_cnpj, source, state, city,
       cultura, area_hectares, notes, next_followup_at`,
    )
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error || !lead) {
    notFound();
  }

  // bind do id no action
  const updateAction = updateLead.bind(null, id);

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '900px' }}>
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
            <BreadcrumbLink href={`/leads/${id}`} style={{ fontSize: '0.8125rem' }}>
              {lead.name as string}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Editar</BreadcrumbPage>
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
          Editar lead
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
          Para mudar o status do pipeline, use os botões na página de detalhe.
        </p>
      </div>

      <LeadForm
        action={updateAction}
        cancelHref={`/leads/${id}`}
        submitLabel="Salvar alterações"
        defaultValues={{
          name: lead.name as string,
          company: lead.company as string | null,
          email: lead.email as string | null,
          phone: lead.phone as string | null,
          cpf_cnpj: lead.cpf_cnpj as string | null,
          source: lead.source as never,
          state: lead.state as string | null,
          city: lead.city as string | null,
          cultura: lead.cultura as string | null,
          area_hectares: lead.area_hectares as number | null,
          notes: lead.notes as string | null,
          next_followup_at: lead.next_followup_at as string | null,
        }}
      />
    </div>
  );
}
