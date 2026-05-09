// apps/admin/src/app/(dashboard)/leads/[id]/page.tsx
//
// Camada 7 (CRM) — detalhe do lead com:
//   - Header com nome + status pill + ações de transição
//   - Bloco de identificação (empresa, contatos, doc)
//   - Bloco de localização + cultura + área
//   - Timeline simples (created_at, qualified_at, proposal_sent_at, closed_at)
//   - Notas
//   - CTA "Editar"

import { createServerClient, requireAuth } from '@colheita/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
} from '@colheita/ui';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LeadActivities } from '@/components/leads/lead-activities';
import { LeadStatusActions } from '@/components/leads/lead-status-actions';
import type { LeadActivityKind, LeadStatus } from '@/lib/actions/leads';

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABEL: Record<string, string> = {
  novo: 'Novo',
  qualificado: 'Qualificado',
  proposta: 'Proposta',
  ganho: 'Ganho',
  perdido: 'Perdido',
};

const STATUS_COLOR: Record<string, string> = {
  novo: 'var(--colheita-text-tertiary)',
  qualificado: 'var(--colheita-brand-primary)',
  proposta: 'var(--colheita-brand-gold)',
  ganho: 'var(--colheita-success)',
  perdido: 'var(--colheita-danger)',
};

const SOURCE_LABEL: Record<string, string> = {
  website: 'Site institucional',
  whatsapp: 'WhatsApp',
  evento: 'Evento',
  feira: 'Feira',
  indicacao: 'Indicação',
  distribuidor: 'Distribuidor',
  'cold-outreach': 'Cold outreach',
  other: 'Outro',
};

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data } = await supabase
    .from('leads')
    .select('name')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!data) return { title: 'Lead' };
  return { title: `Lead — ${data.name}` };
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Carrega lead + activities em paralelo. RLS filtra por tenant automaticamente.
  const [{ data: lead, error }, { data: rawActivities }] = await Promise.all([
    supabase
      .from('leads')
      .select(
        `id, name, company, email, phone, cpf_cnpj, source, status, lost_reason,
         state, city, cultura, area_hectares, notes,
         qualified_at, proposal_sent_at, closed_at, next_followup_at,
         created_at, updated_at`,
      )
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle(),
    supabase
      .from('lead_activities')
      .select(
        `id, kind, body, created_at,
         author:users!created_by(full_name, email)`,
      )
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  if (error || !lead) {
    notFound();
  }

  const activities = (rawActivities ?? []).map((a) => {
    const author = Array.isArray(a.author) ? a.author[0] : a.author;
    return {
      id: a.id as string,
      kind: a.kind as LeadActivityKind,
      body: a.body as string,
      created_at: a.created_at as string,
      author: (author as { full_name: string | null; email: string | null } | null) ?? null,
    };
  });

  const status = lead.status as LeadStatus;
  const ssColor = STATUS_COLOR[status] ?? 'var(--colheita-text-tertiary)';
  const location = [lead.city, lead.state].filter(Boolean).join('/') || '—';

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
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>{lead.name as string}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header — nome + status + edit */}
      <div
        style={{
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
              flexWrap: 'wrap',
            }}
          >
            <p className="argho-eyebrow" style={{ display: 'inline-block', margin: 0 }}>
              Comercial · Lead
            </p>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: ssColor,
                backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)',
                border: `1px solid color-mix(in srgb, ${ssColor} 30%, transparent)`,
              }}
            >
              {STATUS_LABEL[status] ?? status}
            </span>
          </div>
          <h1
            className="argho-display"
            style={{
              fontSize: 'clamp(1.875rem, 2.4vw, 2.375rem)',
              color: '#0a0a0a',
              margin: '0 0 4px',
            }}
          >
            {lead.name as string}
          </h1>
          {lead.company && (
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--colheita-text-secondary)',
                margin: 0,
              }}
            >
              {lead.company as string}
              {lead.cultura ? ` · ${lead.cultura as string}` : ''}
              {location !== '—' ? ` · ${location}` : ''}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button asChild variant="outline" size="sm">
            <Link href={`/leads/${id}/editar`}>Editar</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/leads/${id}/proposta`}>Gerar proposta</Link>
          </Button>
        </div>
      </div>

      {/* Status actions */}
      <div
        style={{
          marginBottom: '28px',
          padding: '16px',
          borderRadius: 'var(--colheita-radius-lg)',
          border: '1px solid var(--colheita-border-subtle)',
          backgroundColor: 'var(--colheita-surface-elevated)',
        }}
      >
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'var(--colheita-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px',
          }}
        >
          Pipeline
        </p>
        <LeadStatusActions leadId={id} currentStatus={status} />
        {status === 'perdido' && lead.lost_reason && (
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--colheita-danger)',
              marginTop: '12px',
              marginBottom: 0,
            }}
          >
            <strong>Razão da perda:</strong> {lead.lost_reason as string}
          </p>
        )}
      </div>

      {/* Grid 2-col: identificação + localização */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <DetailBlock title="Contato">
          <DetailRow label="Email" value={lead.email as string | null} />
          <DetailRow label="Telefone" value={lead.phone as string | null} mono />
          <DetailRow label="CPF/CNPJ" value={lead.cpf_cnpj as string | null} mono />
          <DetailRow label="Origem" value={SOURCE_LABEL[lead.source as string] ?? null} />
        </DetailBlock>

        <DetailBlock title="Localização & cultura">
          <DetailRow label="Cidade/UF" value={location} />
          <DetailRow label="Cultura" value={lead.cultura as string | null} />
          <DetailRow label="Área" value={lead.area_hectares ? `${lead.area_hectares} ha` : null} />
          <DetailRow
            label="Próximo follow-up"
            value={lead.next_followup_at ? formatDateTime(lead.next_followup_at as string) : null}
          />
        </DetailBlock>
      </div>

      {/* Timeline */}
      <DetailBlock title="Linha do tempo">
        <DetailRow label="Criado em" value={formatDateTime(lead.created_at as string)} />
        <DetailRow
          label="Qualificado em"
          value={lead.qualified_at ? formatDateTime(lead.qualified_at as string) : null}
        />
        <DetailRow
          label="Proposta enviada"
          value={lead.proposal_sent_at ? formatDateTime(lead.proposal_sent_at as string) : null}
        />
        <DetailRow
          label="Fechado em"
          value={lead.closed_at ? formatDateTime(lead.closed_at as string) : null}
        />
        <DetailRow label="Última atualização" value={formatDateTime(lead.updated_at as string)} />
      </DetailBlock>

      {/* Notas */}
      {lead.notes && (
        <div style={{ marginTop: '20px' }}>
          <DetailBlock title="Notas">
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--colheita-text-primary)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap' as const,
                margin: 0,
              }}
            >
              {lead.notes as string}
            </p>
          </DetailBlock>
        </div>
      )}

      {/* Activities — timeline append-only */}
      <div style={{ marginTop: '20px' }}>
        <DetailBlock title={`Atividades (${activities.length})`}>
          <LeadActivities leadId={id} activities={activities} />
        </DetailBlock>
      </div>
    </div>
  );
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: 'var(--colheita-radius-lg)',
        border: '1px solid var(--colheita-border-subtle)',
        backgroundColor: 'var(--colheita-surface-elevated)',
      }}
    >
      <p
        style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          color: 'var(--colheita-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '12px',
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        padding: '6px 0',
        borderBottom: '1px solid var(--colheita-border-subtle)',
        fontSize: '0.8125rem',
      }}
    >
      <span
        style={{
          color: 'var(--colheita-text-tertiary)',
          minWidth: '120px',
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: value ? 'var(--colheita-text-primary)' : 'var(--colheita-text-tertiary)',
          fontFamily: mono ? 'var(--font-mono)' : 'inherit',
          wordBreak: 'break-all' as const,
        }}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}
