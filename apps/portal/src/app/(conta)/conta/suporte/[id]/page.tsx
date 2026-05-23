// apps/portal/src/app/(conta)/conta/suporte/[id]/page.tsx
//
// Distribuidor ve detalhe + thread de um chamado proprio + responde.
// Mensagens internas (is_internal=true) ficam ocultas via RLS — query
// nao retorna nem se distribuidor souber o ID da mensagem.

import { createServerClient, requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SupportReplyForm } from '@/components/conta/support-reply-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

type TicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  waiting_user: 'Aguardando você',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

const STATUS_COLOR: Record<TicketStatus, string> = {
  open: 'var(--colheita-brand-primary)',
  in_progress: 'var(--colheita-brand-secondary)',
  waiting_user: 'var(--colheita-warning, #d97706)',
  resolved: 'var(--colheita-success, rgb(5,150,105))',
  closed: 'var(--colheita-text-tertiary)',
};

const URGENCY_LABEL: Record<string, string> = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
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
  return { title: data?.subject ? `Chamado · ${data.subject}` : 'Chamado' };
}

export default async function MeuChamadoPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const [{ data: ticket, error }, { data: messagesData }] = await Promise.all([
    supabase
      .from('support_tickets')
      .select('id, subject, body, category, urgency, status, product_slug, created_at, resolved_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('support_ticket_messages')
      .select('id, body, is_from_staff, created_at, author:author_id(email, full_name)')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true }),
  ]);

  if (error || !ticket) notFound();

  const status = ticket.status as TicketStatus;
  const messages = messagesData ?? [];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--colheita-surface-background)',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Link
          href="/conta/suporte"
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
          ← Suporte
        </Link>

        <header style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px',
              marginBottom: '10px',
              flexWrap: 'wrap',
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
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: STATUS_COLOR[status],
                padding: '6px 12px',
                borderRadius: '99px',
                backgroundColor: 'var(--colheita-surface-elevated)',
                border: '1px solid var(--colheita-border-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                flexShrink: 0,
              }}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-tertiary)',
              margin: 0,
            }}
          >
            Aberto em {new Date(ticket.created_at).toLocaleString('pt-BR')} · Urgência{' '}
            {URGENCY_LABEL[ticket.urgency]?.toLowerCase() ?? ticket.urgency}
            {ticket.product_slug && ` · Produto: ${ticket.product_slug}`}
          </p>
        </header>

        {/* Mensagem inicial */}
        <article
          style={{
            padding: '18px 20px',
            backgroundColor: 'var(--colheita-surface-card)',
            border: '1px solid var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            marginBottom: '16px',
          }}
        >
          <header
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--colheita-text-tertiary)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Sua mensagem
          </header>
          <pre
            style={{
              margin: 0,
              fontSize: '0.9375rem',
              lineHeight: 1.55,
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
              const isStaff = m.is_from_staff;
              const authorLabel = isStaff
                ? 'Argho — Agrônomo'
                : ((author as { full_name?: string } | null)?.full_name ?? 'Você');
              return (
                <article
                  key={m.id}
                  style={{
                    padding: '16px 18px',
                    backgroundColor: isStaff
                      ? 'color-mix(in oklch, var(--colheita-brand-primary) 4%, var(--colheita-surface-elevated))'
                      : 'var(--colheita-surface-elevated)',
                    border: isStaff
                      ? '1px solid color-mix(in oklch, var(--colheita-brand-primary) 30%, var(--colheita-border-subtle))'
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
                    <strong
                      style={{
                        color: isStaff
                          ? 'var(--colheita-brand-primary)'
                          : 'var(--colheita-text-secondary)',
                      }}
                    >
                      {authorLabel}
                    </strong>
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

        {/* Reply */}
        <section style={{ marginTop: '20px' }}>
          <SupportReplyForm ticketId={ticket.id} ticketStatus={status} />
        </section>
      </div>
    </div>
  );
}
