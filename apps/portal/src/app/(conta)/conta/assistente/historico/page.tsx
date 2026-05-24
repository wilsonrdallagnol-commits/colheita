// apps/portal/src/app/(conta)/conta/assistente/historico/page.tsx
//
// Distribuidor revisa as proprias conversas com o Agronomo IA.
// Filtra por user_id = auth.uid() + source = 'portal' (excluir
// turnos do admin /assistente). Mostra so OK + no_context (sem
// KPIs operacionais — distribuidor nao precisa ver rate_limited
// ou error de back-end).

import { createServerClient, requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { formatDateTime } from '@/lib/format-date';

export const metadata: Metadata = { title: 'Histórico do Agrônomo IA' };

const PAGE_SIZE = 30;

type LogStatus = 'ok' | 'error' | 'rate_limited' | 'no_context';

interface LogRow {
  id: string;
  created_at: string;
  query: string;
  answer: string;
  context_path: string | null;
  sources: unknown[];
  status: LogStatus;
}

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HistoricoAssistentePortalPage({ searchParams }: PageProps) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, Number(page ?? 1));
  const offset = (pageNum - 1) * PAGE_SIZE;

  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Soma user_id + source='portal' como filtros explicitos (alem de RLS)
  const { data, count } = await supabase
    .from('conversation_logs')
    .select('id, created_at, query, answer, context_path, sources, status', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('source', 'portal')
    .in('status', ['ok', 'no_context'])
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  const logs = (data ?? []) as LogRow[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--colheita-surface-background)',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Link
          href="/conta/assistente"
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
          ← Voltar ao chat
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
            Conta · Agrônomo IA
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
            Minhas conversas
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: '0.875rem',
              color: 'var(--colheita-text-secondary)',
              lineHeight: 1.55,
            }}
          >
            {total > 0
              ? `${total} pergunta${total === 1 ? '' : 's'} ao Agrônomo IA. Clique pra ver resposta completa e fontes.`
              : 'Nenhuma conversa ainda. Comece falando com o Agrônomo IA.'}
          </p>
        </header>

        {logs.length === 0 ? (
          <div
            style={{
              padding: '40px 24px',
              textAlign: 'center',
              color: 'var(--colheita-text-tertiary)',
              backgroundColor: 'var(--colheita-surface-elevated)',
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-lg)',
            }}
          >
            <p style={{ fontSize: '0.875rem', margin: 0, marginBottom: '12px' }}>
              Você ainda não usou o Agrônomo IA.
            </p>
            <Link
              href="/conta/assistente"
              style={{
                display: 'inline-flex',
                padding: '8px 18px',
                borderRadius: 'var(--colheita-radius-md)',
                backgroundColor: 'var(--colheita-brand-secondary)',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              ✨ Começar uma conversa
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {logs.map((log) => {
              const sourcesCount = Array.isArray(log.sources) ? log.sources.length : 0;
              const isNoContext = log.status === 'no_context';
              return (
                <details
                  key={log.id}
                  style={{
                    border: '1px solid var(--colheita-border-subtle)',
                    borderRadius: 'var(--colheita-radius-lg)',
                    backgroundColor: 'var(--colheita-surface-card)',
                    overflow: 'hidden',
                  }}
                >
                  <summary
                    style={{
                      padding: '14px 18px',
                      cursor: 'pointer',
                      listStyle: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '14px',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.9375rem',
                          fontWeight: 500,
                          color: 'var(--colheita-text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.4,
                        }}
                      >
                        {log.query}
                      </p>
                      <p
                        style={{
                          margin: '6px 0 0',
                          fontSize: '0.6875rem',
                          color: 'var(--colheita-text-tertiary)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {formatDateTime(log.created_at)} ·{' '}
                        {isNoContext
                          ? 'sem contexto'
                          : `${sourcesCount} fonte${sourcesCount === 1 ? '' : 's'}`}
                      </p>
                    </div>
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: '0.75rem',
                        color: 'var(--colheita-text-tertiary)',
                      }}
                    >
                      ▾
                    </span>
                  </summary>

                  <div
                    style={{
                      padding: '0 18px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    {log.answer ? (
                      <div>
                        <p
                          style={{
                            margin: '0 0 6px',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: 'var(--colheita-text-tertiary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                          }}
                        >
                          Resposta
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.875rem',
                            color: 'var(--colheita-text-primary)',
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.55,
                            backgroundColor: 'var(--colheita-surface-elevated)',
                            padding: '14px 16px',
                            borderRadius: 'var(--colheita-radius-md)',
                          }}
                        >
                          {log.answer}
                        </p>
                      </div>
                    ) : (
                      <p
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--colheita-text-tertiary)',
                          fontStyle: 'italic',
                          margin: 0,
                        }}
                      >
                        Sem resposta registrada.
                      </p>
                    )}
                    {isNoContext && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.75rem',
                          color: 'var(--colheita-warning, #d97706)',
                          backgroundColor: 'rgba(245, 158, 11, 0.06)',
                          border: '1px dashed rgba(245, 158, 11, 0.3)',
                          padding: '10px 14px',
                          borderRadius: 'var(--colheita-radius-md)',
                        }}
                      >
                        O Agrônomo IA não encontrou contexto suficiente pra essa pergunta. Tente
                        reformular ou{' '}
                        <Link
                          href="/conta/suporte"
                          style={{ color: 'var(--colheita-brand-primary)' }}
                        >
                          fale com um agrônomo humano
                        </Link>
                        .
                      </p>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-tertiary)',
            }}
          >
            <span>
              Página {pageNum} de {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {pageNum > 1 && (
                <Link
                  href={`/conta/assistente/historico?page=${pageNum - 1}`}
                  style={paginationStyle}
                >
                  ← Anterior
                </Link>
              )}
              {pageNum < totalPages && (
                <Link
                  href={`/conta/assistente/historico?page=${pageNum + 1}`}
                  style={paginationStyle}
                >
                  Próxima →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const paginationStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 'var(--colheita-radius-md)',
  border: '1px solid var(--colheita-border)',
  fontSize: '0.8125rem',
  color: 'var(--colheita-text-secondary)',
  textDecoration: 'none',
  backgroundColor: 'var(--colheita-surface-elevated)',
};
