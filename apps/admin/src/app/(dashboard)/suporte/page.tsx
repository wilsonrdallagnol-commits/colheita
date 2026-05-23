// apps/admin/src/app/(dashboard)/suporte/page.tsx
//
// Lista de chamados de suporte abertos por distribuidores.
// Filtra por status e urgencia. Ordenacao default: urgentes/altos
// primeiro, depois mais antigos.

import { createServerClient, requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Suporte' };

type TicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
type TicketUrgency = 'low' | 'normal' | 'high' | 'urgent';

const PAGE_SIZE = 30;

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  waiting_user: 'Aguardando user',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

const STATUS_COLOR: Record<TicketStatus, { bg: string; color: string }> = {
  open: {
    bg: 'color-mix(in oklch, var(--colheita-brand-primary) 12%, transparent)',
    color: 'var(--colheita-brand-primary)',
  },
  in_progress: {
    bg: 'color-mix(in oklch, var(--colheita-brand-secondary) 12%, transparent)',
    color: 'var(--colheita-brand-secondary)',
  },
  waiting_user: {
    bg: 'color-mix(in oklch, var(--colheita-warning) 12%, transparent)',
    color: 'var(--colheita-warning)',
  },
  resolved: {
    bg: 'var(--colheita-success-subtle, rgba(16,185,129,0.08))',
    color: 'var(--colheita-success, rgb(5,150,105))',
  },
  closed: {
    bg: 'var(--colheita-surface-elevated)',
    color: 'var(--colheita-text-tertiary)',
  },
};

const URGENCY_LABEL: Record<TicketUrgency, string> = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
};

const URGENCY_COLOR: Record<TicketUrgency, string> = {
  low: 'var(--colheita-text-tertiary)',
  normal: 'var(--colheita-text-secondary)',
  high: 'var(--colheita-warning, #d97706)',
  urgent: 'var(--colheita-danger, #dc2626)',
};

const CATEGORY_LABEL: Record<string, string> = {
  agronomic: 'Agronômico',
  commercial: 'Comercial',
  product: 'Produto',
  logistics: 'Logística',
  platform: 'Plataforma',
  other: 'Outros',
};

interface PageProps {
  searchParams: Promise<{ status?: string; urgency?: string; page?: string }>;
}

export default async function SuportePage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const params = await searchParams;
  const statusFilter = (params.status ?? '').trim() as TicketStatus | '';
  const urgencyFilter = (params.urgency ?? '').trim() as TicketUrgency | '';
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from('support_tickets')
    .select(
      'id, subject, category, urgency, status, product_slug, created_at, updated_at, users:user_id(email, full_name)',
      { count: 'exact' },
    )
    .order('urgency', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (statusFilter) query = query.eq('status', statusFilter);
  if (urgencyFilter) query = query.eq('urgency', urgencyFilter);

  const { data, count, error } = await query;
  const tickets = data ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Resumo: contadores por status (sem filtro pra dashboard fixo)
  const { data: countsData } = await supabase
    .from('support_tickets')
    .select('status')
    .in('status', ['open', 'in_progress', 'waiting_user']);

  const openCount = countsData?.filter((t) => t.status === 'open').length ?? 0;
  const inProgressCount = countsData?.filter((t) => t.status === 'in_progress').length ?? 0;
  const waitingCount = countsData?.filter((t) => t.status === 'waiting_user').length ?? 0;

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '28px' }}>
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--colheita-brand-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '8px',
          }}
        >
          Atendimento · Suporte humano
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(1.5rem, 2.4vw, 1.875rem)',
            fontWeight: 600,
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.025em',
          }}
        >
          Chamados de distribuidores
        </h1>
      </header>

      {/* Counters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {[
          { label: 'Abertos', value: openCount, color: STATUS_COLOR.open.color },
          {
            label: 'Em andamento',
            value: inProgressCount,
            color: STATUS_COLOR.in_progress.color,
          },
          {
            label: 'Aguardando user',
            value: waitingCount,
            color: STATUS_COLOR.waiting_user.color,
          },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              padding: '16px 18px',
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-lg)',
              backgroundColor: 'var(--colheita-surface-card)',
            }}
          >
            <p style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)', margin: 0 }}>
              {c.label}
            </p>
            <p
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: c.color,
                margin: '4px 0 0',
                letterSpacing: '-0.03em',
              }}
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { value: '', label: 'Todos' },
          { value: 'open', label: 'Abertos' },
          { value: 'in_progress', label: 'Em andamento' },
          { value: 'waiting_user', label: 'Aguardando user' },
          { value: 'resolved', label: 'Resolvidos' },
          { value: 'closed', label: 'Fechados' },
        ].map((f) => {
          const active = statusFilter === f.value;
          const href = f.value
            ? `/suporte?status=${f.value}${urgencyFilter ? `&urgency=${urgencyFilter}` : ''}`
            : urgencyFilter
              ? `/suporte?urgency=${urgencyFilter}`
              : '/suporte';
          return (
            <Link
              key={f.value || 'todos'}
              href={href}
              style={{
                padding: '6px 14px',
                borderRadius: '99px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: active ? '#fff' : 'var(--colheita-text-secondary)',
                backgroundColor: active
                  ? 'var(--colheita-brand-primary)'
                  : 'var(--colheita-surface-elevated)',
                border: '1px solid var(--colheita-border-subtle)',
                textDecoration: 'none',
              }}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Lista */}
      {error && (
        <p style={{ color: 'var(--colheita-danger)' }}>Erro ao carregar: {error.message}</p>
      )}

      {tickets.length > 0 ? (
        <div
          style={{
            border: '1px solid var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            overflow: 'hidden',
          }}
        >
          {tickets.map((t, i) => {
            const status = t.status as TicketStatus;
            const urgency = t.urgency as TicketUrgency;
            const colors = STATUS_COLOR[status];
            const ownerData = Array.isArray(t.users) ? t.users[0] : t.users;
            const ownerEmail = (ownerData as { email?: string } | null)?.email ?? '—';
            const ownerName = (ownerData as { full_name?: string } | null)?.full_name;
            return (
              <Link
                key={t.id}
                href={`/suporte/${t.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 18px',
                  borderBottom:
                    i < tickets.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                  backgroundColor: 'var(--colheita-surface-elevated)',
                  textDecoration: 'none',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: 'var(--colheita-text-primary)',
                      margin: 0,
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t.subject}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--colheita-text-tertiary)',
                      margin: 0,
                    }}
                  >
                    {ownerName ? `${ownerName} · ${ownerEmail}` : ownerEmail}
                    {t.product_slug && ` · ${t.product_slug}`}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'var(--colheita-text-secondary)',
                    backgroundColor: 'var(--colheita-surface)',
                    padding: '3px 8px',
                    borderRadius: '99px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {CATEGORY_LABEL[t.category] ?? t.category}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: URGENCY_COLOR[urgency],
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {URGENCY_LABEL[urgency]}
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '99px',
                    color: colors.color,
                    backgroundColor: colors.bg,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    minWidth: '110px',
                    textAlign: 'center',
                  }}
                >
                  {STATUS_LABEL[status]}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            color: 'var(--colheita-text-tertiary)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            border: '1px solid var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            fontSize: '0.875rem',
          }}
        >
          {statusFilter || urgencyFilter
            ? 'Nenhum chamado com esses filtros.'
            : 'Nenhum chamado aberto. 🎉'}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8125rem',
            color: 'var(--colheita-text-tertiary)',
          }}
        >
          <span>
            Página {page} de {totalPages} · {total} chamados
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {page > 1 && (
              <Link
                href={`/suporte?${statusFilter ? `status=${statusFilter}&` : ''}page=${page - 1}`}
                style={{
                  padding: '6px 14px',
                  border: '1px solid var(--colheita-border)',
                  borderRadius: 'var(--colheita-radius-md)',
                  textDecoration: 'none',
                  color: 'var(--colheita-text-secondary)',
                }}
              >
                ← Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/suporte?${statusFilter ? `status=${statusFilter}&` : ''}page=${page + 1}`}
                style={{
                  padding: '6px 14px',
                  border: '1px solid var(--colheita-border)',
                  borderRadius: 'var(--colheita-radius-md)',
                  textDecoration: 'none',
                  color: 'var(--colheita-text-secondary)',
                }}
              >
                Próxima →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
