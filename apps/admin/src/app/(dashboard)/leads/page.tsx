// apps/admin/src/app/(dashboard)/leads/page.tsx
//
// Camada 7 (CRM) — listagem de leads com filtros + estatística do pipeline.
// Mostra contagens por status no topo + tabela com nome/empresa/origem/contato/follow-up.

import { createServerClient, requireAuth } from '@colheita/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
} from '@colheita/ui';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata = { title: 'Leads' };

const PAGE_LIMIT = 100;

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
  website: 'Site',
  whatsapp: 'WhatsApp',
  evento: 'Evento',
  indicacao: 'Indicação',
  'cold-outreach': 'Cold outreach',
  distribuidor: 'Distribuidor',
  feira: 'Feira',
  other: 'Outro',
};

interface SearchParams {
  status?: string;
  q?: string;
}

interface LeadRow {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  city: string | null;
  state: string | null;
  cultura: string | null;
  area_hectares: number | null;
  next_followup_at: string | null;
  updated_at: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

function formatRelativeFollowup(iso: string | null): { text: string; color: string } {
  if (!iso) return { text: '—', color: 'var(--colheita-text-tertiary)' };
  const target = new Date(iso).getTime();
  const now = Date.now();
  const daysDiff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  if (daysDiff < 0) return { text: `Atrasado há ${Math.abs(daysDiff)}d`, color: '#ef4444' };
  if (daysDiff === 0) return { text: 'Hoje', color: '#f97316' };
  if (daysDiff === 1) return { text: 'Amanhã', color: '#f97316' };
  if (daysDiff <= 7) return { text: `Em ${daysDiff}d`, color: 'var(--colheita-brand-primary)' };
  return { text: formatDate(iso), color: 'var(--colheita-text-tertiary)' };
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { status, q } = await searchParams;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const validStatuses = ['novo', 'qualificado', 'proposta', 'ganho', 'perdido'];
  const activeStatus = status && validStatuses.includes(status) ? status : undefined;

  // Query principal + sumário em paralelo
  let query = supabase
    .from('leads')
    .select(
      `id, name, company, email, phone, source, status,
       city, state, cultura, area_hectares,
       next_followup_at, updated_at`,
    )
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(PAGE_LIMIT);

  if (activeStatus) {
    query = query.eq('status', activeStatus);
  }

  if (q) {
    const term = q.replace(/[,*()]/g, '').slice(0, 100);
    query = query.or(`name.ilike.%${term}%,company.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const [{ data: rawLeads }, { data: summaryRows }] = await Promise.all([
    query,
    supabase.from('leads').select('status').is('deleted_at', null),
  ]);

  const leads = (rawLeads ?? []) as LeadRow[];
  const counts: Record<string, number> = {
    novo: 0,
    qualificado: 0,
    proposta: 0,
    ganho: 0,
    perdido: 0,
  };
  for (const r of summaryRows ?? []) {
    const s = r.status as string | null;
    if (s && counts[s] !== undefined) {
      counts[s] = (counts[s] ?? 0) + 1;
    }
  }

  const totalAtivos = (counts.novo ?? 0) + (counts.qualificado ?? 0) + (counts.proposta ?? 0);

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)' }}>
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span style={{ color: 'var(--colheita-text-tertiary)', fontSize: '0.8125rem' }}>
              Argho
            </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Leads</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'var(--colheita-text-primary)',
              letterSpacing: '-0.025em',
              marginBottom: '4px',
            }}
          >
            Leads
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
            {leads.length} {leads.length === 1 ? 'lead' : 'leads'}
            {activeStatus ? ` · ${STATUS_LABEL[activeStatus]}` : ''}
            {q ? ` · busca "${q}"` : ''}
            {' · '}
            <span style={{ color: 'var(--colheita-text-tertiary)' }}>
              {totalAtivos} ativos no pipeline
            </span>
          </p>
        </div>

        <Button asChild size="sm">
          <Link href="/leads/novo">+ Novo lead</Link>
        </Button>
      </div>

      {/* Pipeline summary cards (5 status) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}
      >
        {validStatuses.map((s) => {
          const isActive = activeStatus === s;
          const href = isActive ? '/leads' : `/leads?status=${s}`;
          return (
            <Link key={s} href={href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--colheita-radius-lg)',
                  border: `1px solid ${isActive ? STATUS_COLOR[s] : 'var(--colheita-border)'}`,
                  backgroundColor: isActive
                    ? 'color-mix(in srgb, var(--colheita-brand-primary) 6%, var(--colheita-surface-elevated))'
                    : 'var(--colheita-surface-elevated)',
                }}
              >
                <p
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: '500',
                    color: 'var(--colheita-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    margin: '0 0 6px',
                  }}
                >
                  {STATUS_LABEL[s]}
                </p>
                <p
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: STATUS_COLOR[s],
                    letterSpacing: '-0.03em',
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {counts[s] ?? 0}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Search */}
      <form
        method="GET"
        action="/leads"
        style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar por nome, empresa ou email…"
          style={{
            flex: 1,
            maxWidth: '400px',
            height: '36px',
            padding: '0 12px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
        <Button type="submit" variant="outline" size="sm">
          Buscar
        </Button>
        {q && (
          <Link
            href={activeStatus ? `/leads?status=${activeStatus}` : '/leads'}
            style={{
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-tertiary)',
              textDecoration: 'none',
              padding: '0 4px',
            }}
          >
            Limpar
          </Link>
        )}
      </form>

      {/* List */}
      {leads.length === 0 ? (
        <div
          style={{
            padding: '64px 32px',
            textAlign: 'center',
            border: '1px dashed var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            color: 'var(--colheita-text-tertiary)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎯</div>
          <p
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--colheita-text-secondary)',
              marginBottom: '6px',
            }}
          >
            {activeStatus || q ? 'Nenhum lead bate com esses filtros.' : 'Nenhum lead ainda.'}
          </p>
          <p style={{ fontSize: '0.8125rem', margin: 0 }}>
            {activeStatus || q ? (
              'Tente ajustar os filtros.'
            ) : (
              <>
                Capture o primeiro lead em{' '}
                <Link
                  href="/leads/novo"
                  style={{ color: 'var(--colheita-brand-primary)', textDecoration: 'none' }}
                >
                  /leads/novo
                </Link>
                .
              </>
            )}
          </p>
        </div>
      ) : (
        <div
          style={{
            border: '1px solid var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            overflow: 'hidden',
          }}
        >
          {leads.map((lead, i) => {
            const followup = formatRelativeFollowup(lead.next_followup_at);
            const location = [lead.city, lead.state].filter(Boolean).join('/');

            return (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 200px 140px 120px',
                  gap: '12px',
                  padding: '14px 16px',
                  alignItems: 'center',
                  textDecoration: 'none',
                  borderBottom:
                    i < leads.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                  backgroundColor: 'var(--colheita-surface-elevated)',
                }}
              >
                {/* Nome + empresa + cultura */}
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: 'var(--colheita-text-primary)',
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {lead.name}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--colheita-text-tertiary)',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {[lead.company, location, lead.cultura].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>

                {/* Contato */}
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--colheita-text-secondary)',
                      margin: '0 0 2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {lead.email ?? '—'}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--colheita-text-tertiary)',
                      margin: 0,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {lead.phone ?? ' '}
                  </p>
                </div>

                {/* Origem + follow-up */}
                <div>
                  <p
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--colheita-text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 600,
                      margin: '0 0 4px',
                    }}
                  >
                    {SOURCE_LABEL[lead.source] ?? lead.source}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: followup.color,
                      fontWeight: 500,
                      margin: 0,
                    }}
                  >
                    {followup.text}
                  </p>
                </div>

                {/* Status pill */}
                <div style={{ textAlign: 'right' as const }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: STATUS_COLOR[lead.status],
                      backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)',
                      border: `1px solid color-mix(in srgb, ${STATUS_COLOR[lead.status]} 30%, transparent)`,
                    }}
                  >
                    {STATUS_LABEL[lead.status] ?? lead.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
