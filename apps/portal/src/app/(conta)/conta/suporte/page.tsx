// apps/portal/src/app/(conta)/conta/suporte/page.tsx
//
// Distribuidor abre chamado pra agronomo humano da Argho quando IA
// nao basta. Lista chamados ja abertos + form pra novo.

import { createServerClient, requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { SupportForm } from '@/components/conta/support-form';
import { STATUS_LABEL, type TicketStatus, URGENCY_LABEL } from '@/lib/support-labels';

export const metadata: Metadata = {
  title: 'Suporte humano',
};

const STATUS_COLOR: Record<TicketStatus, string> = {
  open: 'var(--colheita-brand-primary)',
  in_progress: 'var(--colheita-brand-secondary)',
  waiting_user: 'var(--colheita-warning, #d97706)',
  resolved: 'var(--colheita-success, rgb(5,150,105))',
  closed: 'var(--colheita-text-tertiary)',
};

interface PageProps {
  searchParams: Promise<{ produto?: string }>;
}

export default async function SuportePage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const params = await searchParams;
  const defaultProductSlug = (params.produto ?? '').trim() || null;

  // Lista os ultimos 10 chamados do distribuidor
  const { data: ticketsData } = await supabase
    .from('support_tickets')
    .select('id, subject, category, urgency, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const tickets = ticketsData ?? [];

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
          href="/conta"
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
          ← Minha conta
        </Link>

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
            Conta · Suporte humano
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
            Falar com um agrônomo
          </h1>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '0.875rem',
              color: 'var(--colheita-text-secondary)',
              lineHeight: 1.55,
            }}
          >
            Pra dúvida rápida, use o{' '}
            <Link
              href="/conta/assistente"
              style={{ color: 'var(--colheita-brand-primary)', textDecoration: 'none' }}
            >
              Agrônomo IA
            </Link>{' '}
            — responde em segundos. Quando o caso for complexo, abrir chamado aqui chama um agrônomo
            humano da Argho (resposta por e-mail).
          </p>
        </header>

        {/* Chamados anteriores (se houver) */}
        {tickets.length > 0 && (
          <section style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '12px',
              }}
            >
              Meus chamados ({tickets.length})
            </h2>
            <div
              style={{
                border: '1px solid var(--colheita-border-subtle)',
                borderRadius: 'var(--colheita-radius-lg)',
                overflow: 'hidden',
              }}
            >
              {tickets.map((t, i) => (
                <Link
                  key={t.id}
                  href={`/conta/suporte/${t.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    gap: '12px',
                    borderBottom:
                      i < tickets.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                    backgroundColor: 'var(--colheita-surface-elevated)',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--colheita-text-primary)',
                        margin: 0,
                        marginBottom: '2px',
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
                      {new Date(t.created_at).toLocaleDateString('pt-BR')} ·{' '}
                      {URGENCY_LABEL[t.urgency as keyof typeof URGENCY_LABEL] ?? t.urgency}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color:
                        STATUS_COLOR[t.status as TicketStatus] ?? 'var(--colheita-text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      flexShrink: 0,
                    }}
                  >
                    {STATUS_LABEL[t.status as TicketStatus] ?? t.status}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Novo chamado */}
        <section>
          <h2
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--colheita-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}
          >
            Novo chamado
          </h2>
          <SupportForm defaultProductSlug={defaultProductSlug} />
        </section>
      </div>
    </div>
  );
}
