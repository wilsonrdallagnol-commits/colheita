// apps/admin/src/app/(dashboard)/suporte/[id]/page.tsx
//
// Detalhe + thread de um chamado de suporte. Mostra:
//   - Header com subject + meta (user/categoria/urgencia/criado)
//   - Body original do ticket
//   - Thread de mensagens (publicas + internas)
//   - StatusSelect pra mudar status inline
//   - ReplyForm pra responder

import { createServerClient, requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReplyForm } from '@/components/suporte/reply-form';
import { StatusSelect } from '@/components/suporte/status-select';

interface PageProps {
  params: Promise<{ id: string }>;
}

type TicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
type TicketUrgency = 'low' | 'normal' | 'high' | 'urgent';

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
  agronomic: 'Recomendação agronômica',
  commercial: 'Comercial / pedido',
  product: 'Produto específico',
  logistics: 'Logística / entrega',
  platform: 'Plataforma Colheita',
  other: 'Outros',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data } = await supabase
    .from('support_tickets')
    .select('subject')
    .eq('id', id)
    .maybeSingle();
  return { title: data?.subject ? `Suporte · ${data.subject}` : 'Chamado' };
}

export default async function TicketDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Paralelo: ticket + mensagens
  const [{ data: ticket, error }, { data: messagesData }] = await Promise.all([
    supabase
      .from('support_tickets')
      .select(
        `id, subject, body, category, urgency, status, product_slug,
         created_at, updated_at, resolved_at, closed_at,
         users:user_id(id, email, full_name),
         assignee:assigned_to(id, email, full_name)`,
      )
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('support_ticket_messages')
      .select(
        'id, body, is_internal, is_from_staff, created_at, author:author_id(id, email, full_name)',
      )
      .eq('ticket_id', id)
      .order('created_at', { ascending: true }),
  ]);

  if (error || !ticket) notFound();

  const status = ticket.status as TicketStatus;
  const urgency = ticket.urgency as TicketUrgency;
  const ownerData = Array.isArray(ticket.users) ? ticket.users[0] : ticket.users;
  const messages = messagesData ?? [];

  return (
    <div style={{ padding: '32px 24px', maxWidth: '900px', margin: '0 auto' }}>
      <Link
        href="/suporte"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--colheita-text-tertiary)',
          textDecoration: 'none',
          marginBottom: '20px',
        }}
      >
        ← Chamados
      </Link>

      {/* Header */}
      <header style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '12px',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--colheita-brand-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '6px',
              }}
            >
              {CATEGORY_LABEL[ticket.category] ?? ticket.category}
            </p>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
                fontWeight: 600,
                color: 'var(--colheita-text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              {ticket.subject}
            </h1>
          </div>
          <StatusSelect ticketId={ticket.id} currentStatus={status} />
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            fontSize: '0.8125rem',
            color: 'var(--colheita-text-tertiary)',
          }}
        >
          <span>
            <strong style={{ color: 'var(--colheita-text-secondary)' }}>De:</strong>{' '}
            {(ownerData as { full_name?: string } | null)?.full_name ??
              (ownerData as { email?: string } | null)?.email ??
              '—'}
          </span>
          <span>·</span>
          <span style={{ color: URGENCY_COLOR[urgency], fontWeight: 600 }}>
            {URGENCY_LABEL[urgency]}
          </span>
          <span>·</span>
          <span>Aberto em {new Date(ticket.created_at).toLocaleString('pt-BR')}</span>
          {ticket.product_slug && (
            <>
              <span>·</span>
              <span>Produto: {ticket.product_slug}</span>
            </>
          )}
        </div>
      </header>

      {/* Mensagem inicial */}
      <article
        style={{
          padding: '20px 22px',
          backgroundColor: 'var(--colheita-surface-card)',
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
          marginBottom: '20px',
        }}
      >
        <header
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--colheita-text-tertiary)',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Mensagem inicial
        </header>
        <pre
          style={{
            margin: 0,
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            color: 'var(--colheita-text-primary)',
            fontFamily: 'inherit',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {ticket.body}
        </pre>
      </article>

      {/* Thread */}
      {messages.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((m) => {
            const author = Array.isArray(m.author) ? m.author[0] : m.author;
            const authorLabel =
              (author as { full_name?: string } | null)?.full_name ??
              (author as { email?: string } | null)?.email ??
              '—';
            const isInternal = m.is_internal;
            const isStaff = m.is_from_staff;
            return (
              <article
                key={m.id}
                style={{
                  padding: '16px 18px',
                  backgroundColor: isInternal
                    ? 'rgba(245, 158, 11, 0.06)'
                    : isStaff
                      ? 'color-mix(in oklch, var(--colheita-brand-primary) 5%, var(--colheita-surface-elevated))'
                      : 'var(--colheita-surface-elevated)',
                  border: isInternal
                    ? '1px dashed rgba(245, 158, 11, 0.4)'
                    : '1px solid var(--colheita-border-subtle)',
                  borderRadius: 'var(--colheita-radius-md)',
                }}
              >
                <header
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'var(--colheita-text-tertiary)',
                    marginBottom: '8px',
                  }}
                >
                  <span>
                    <strong style={{ color: 'var(--colheita-text-secondary)' }}>
                      {authorLabel}
                    </strong>
                    {isStaff && (
                      <span style={{ marginLeft: '6px', color: 'var(--colheita-brand-primary)' }}>
                        · Argho
                      </span>
                    )}
                    {isInternal && (
                      <span style={{ marginLeft: '6px', color: 'rgb(180, 120, 20)' }}>
                        · NOTA INTERNA
                      </span>
                    )}
                  </span>
                  <span>{new Date(m.created_at).toLocaleString('pt-BR')}</span>
                </header>
                <pre
                  style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    lineHeight: 1.55,
                    color: 'var(--colheita-text-primary)',
                    fontFamily: 'inherit',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {m.body}
                </pre>
              </article>
            );
          })}
        </section>
      )}

      {/* Reply form */}
      <section style={{ marginTop: '24px' }}>
        <h2
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--colheita-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '10px',
          }}
        >
          Responder
        </h2>
        <ReplyForm ticketId={ticket.id} ticketStatus={status} />
      </section>
    </div>
  );
}
