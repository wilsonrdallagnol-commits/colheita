// apps/admin/src/app/(dashboard)/assistente/historico/page.tsx
//
// Historico de interacoes com o agente IA. Permite revisar respostas ruins,
// identificar perguntas frequentes, debugar problemas de qualidade do RAG.
//
// Padrao: tabela paginada (50/pagina), filtros por status, sumario com
// totais. Cada linha eh expansivel pra ver query + answer + sources count.

import { createServerClient, requireAuth } from '@colheita/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata = { title: 'Histórico do Assistente' };

const PAGE_SIZE = 50;

type LogStatus = 'ok' | 'error' | 'rate_limited' | 'no_context';

interface LogRow {
  id: string;
  created_at: string;
  query: string;
  answer: string;
  context_path: string | null;
  sources: unknown[];
  duration_ms: number | null;
  status: LogStatus;
  user:
    | { email: string | null; full_name: string | null }
    | { email: string | null; full_name: string | null }[]
    | null;
}

function statusStyle(status: LogStatus): { bg: string; color: string; label: string } {
  if (status === 'ok')
    return { bg: 'rgba(52,199,89,0.12)', color: 'var(--colheita-brand-secondary)', label: 'OK' };
  if (status === 'error')
    return { bg: 'rgba(239,68,68,0.1)', color: 'var(--colheita-danger)', label: 'Erro' };
  if (status === 'rate_limited') return { bg: '#fef3c7', color: '#b45309', label: 'Rate limited' };
  return {
    bg: 'var(--colheita-surface-muted)',
    color: 'var(--colheita-text-tertiary)',
    label: 'Sem contexto',
  };
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function userLabel(user: LogRow['user']): string {
  if (!user) return 'desconhecido';
  const u = Array.isArray(user) ? user[0] : user;
  if (!u) return 'desconhecido';
  return u.full_name ?? u.email ?? 'desconhecido';
}

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function HistoricoAssistentePage({ searchParams }: PageProps) {
  const { status, page } = await searchParams;
  const pageNum = Math.max(1, Number(page ?? 1));
  const offset = (pageNum - 1) * PAGE_SIZE;

  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Query principal + agregados em paralelo
  let query = supabase
    .from('conversation_logs')
    .select(
      `id, created_at, query, answer, context_path, sources,
       duration_ms, status,
       user:users(email, full_name)`,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  const validStatuses: LogStatus[] = ['ok', 'error', 'rate_limited', 'no_context'];
  const activeStatus =
    status && (validStatuses as readonly string[]).includes(status) ? (status as LogStatus) : null;
  if (activeStatus) query = query.eq('status', activeStatus);

  const [{ data: rawLogs, count }, { data: aggregateRows }] = await Promise.all([
    query,
    supabase
      .from('conversation_logs')
      .select('status, duration_ms')
      .order('created_at', { ascending: false })
      .limit(1000),
  ]);

  const logs = (rawLogs ?? []) as LogRow[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  // Agregados sobre as ultimas 1k (suficiente pra metricas operacionais)
  const stats = { total: 0, ok: 0, error: 0, rate_limited: 0, no_context: 0 };
  let totalDuration = 0;
  let durationSamples = 0;
  for (const row of aggregateRows ?? []) {
    stats.total++;
    const s = row.status as LogStatus | null;
    if (s && stats[s] !== undefined) stats[s]++;
    if (typeof row.duration_ms === 'number') {
      totalDuration += row.duration_ms;
      durationSamples++;
    }
  }
  const avgDurationMs = durationSamples > 0 ? Math.round(totalDuration / durationSamples) : 0;
  const successRate = stats.total > 0 ? ((stats.ok / stats.total) * 100).toFixed(1) : '0';

  function buildUrl(params: Record<string, string | undefined>): string {
    const merged = { status: activeStatus ?? undefined, page: String(pageNum), ...params };
    const qs = Object.entries(merged)
      .filter((e): e is [string, string] => Boolean(e[1]) && e[1] !== '1')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return `/assistente/historico${qs ? `?${qs}` : ''}`;
  }

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
          Assistente IA · Histórico
        </p>
        <h1
          className="argho-display"
          style={{
            fontSize: 'clamp(1.875rem, 2.4vw, 2.375rem)',
            color: '#0a0a0a',
            margin: '0 0 8px',
          }}
        >
          Conversas com o agente
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--colheita-text-secondary)',
            margin: 0,
            maxWidth: '60ch',
          }}
        >
          Revise as últimas interações: qualidade das respostas, fontes citadas, tempo de geração.
          Útil pra calibrar prompts e identificar gaps de catálogo.
        </p>
      </div>

      {/* KPIs agregados (ultimas 1k) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}
      >
        <Kpi label="Total" value={String(stats.total)} hint="últimas 1.000" />
        <Kpi
          label="Sucesso"
          value={`${successRate}%`}
          hint={`${stats.ok} OK`}
          color="var(--colheita-brand-secondary)"
        />
        <Kpi
          label="Erros"
          value={String(stats.error)}
          hint="falhas no agente"
          color={stats.error > 0 ? 'var(--colheita-danger)' : undefined}
        />
        <Kpi
          label="Sem contexto"
          value={String(stats.no_context)}
          hint="RAG sem match"
          color={stats.no_context > 0 ? '#b45309' : undefined}
        />
        <Kpi label="Tempo médio" value={formatDuration(avgDurationMs)} hint="por turno" />
      </div>

      {/* Filtros */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        {[null, 'ok', 'error', 'no_context', 'rate_limited'].map((s) => {
          const isActive = activeStatus === s || (s === null && activeStatus === null);
          const label = s === null ? 'Todos' : statusStyle(s as LogStatus).label;
          const href = s === null ? '/assistente/historico' : `/assistente/historico?status=${s}`;
          return (
            <Link
              key={s ?? 'all'}
              href={href}
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : 'var(--colheita-text-secondary)',
                backgroundColor: isActive ? 'var(--colheita-brand-primary)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--colheita-brand-primary)' : 'var(--colheita-border)'}`,
                textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Lista */}
      {logs.length === 0 ? (
        <div
          style={{
            padding: '48px',
            textAlign: 'center',
            border: '1px dashed var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            color: 'var(--colheita-text-tertiary)',
          }}
        >
          <p style={{ fontSize: '0.9375rem', margin: '0 0 4px' }}>
            {activeStatus
              ? `Nenhuma conversa com status "${activeStatus}".`
              : 'Nenhuma conversa registrada ainda.'}
          </p>
          <p style={{ fontSize: '0.8125rem', margin: 0 }}>
            Cada interação com o agente (AgentDock ou /assistente) é registrada aqui.
          </p>
        </div>
      ) : (
        <div
          style={{
            border: '1px solid var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            overflow: 'hidden',
            backgroundColor: 'var(--colheita-surface-card)',
          }}
        >
          {logs.map((log, i) => {
            const ss = statusStyle(log.status);
            const sourcesCount = Array.isArray(log.sources) ? log.sources.length : 0;
            return (
              <details
                key={log.id}
                style={{
                  borderBottom:
                    i < logs.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                  backgroundColor: 'var(--colheita-surface-elevated)',
                }}
              >
                <summary
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr 140px 80px 60px',
                    gap: '12px',
                    padding: '12px 16px',
                    alignItems: 'center',
                    cursor: 'pointer',
                    listStyle: 'none',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--colheita-text-tertiary)',
                      fontFamily: 'var(--font-mono)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatDateTime(log.created_at)}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--colheita-text-primary)',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {log.query}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--colheita-text-tertiary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {userLabel(log.user)}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--colheita-text-tertiary)',
                      textAlign: 'right' as const,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatDuration(log.duration_ms)}
                  </span>
                  <span style={{ textAlign: 'right' as const }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        backgroundColor: ss.bg,
                        color: ss.color,
                      }}
                    >
                      {ss.label}
                    </span>
                  </span>
                </summary>

                <div
                  style={{
                    padding: '0 16px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {log.context_path ? (
                    <p
                      style={{
                        fontSize: '0.6875rem',
                        color: 'var(--colheita-text-tertiary)',
                        fontFamily: 'var(--font-mono)',
                        margin: 0,
                      }}
                    >
                      Rota: {log.context_path}
                    </p>
                  ) : null}

                  <div>
                    <p
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: 'var(--colheita-text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        margin: '0 0 4px',
                      }}
                    >
                      Pergunta
                    </p>
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--colheita-text-primary)',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.5,
                      }}
                    >
                      {log.query}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: 'var(--colheita-text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        margin: '0 0 4px',
                      }}
                    >
                      Resposta ({log.answer.length} chars · {sourcesCount} fonte
                      {sourcesCount === 1 ? '' : 's'})
                    </p>
                    {log.answer ? (
                      <p
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--colheita-text-secondary)',
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.5,
                          backgroundColor: 'var(--colheita-surface-muted)',
                          padding: '12px',
                          borderRadius: 'var(--colheita-radius-md)',
                          maxHeight: '300px',
                          overflowY: 'auto',
                        }}
                      >
                        {log.answer}
                      </p>
                    ) : (
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--colheita-text-tertiary)',
                          fontStyle: 'italic',
                          margin: 0,
                        }}
                      >
                        Sem resposta (provavelmente erro durante streaming).
                      </p>
                    )}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}

      {/* Paginacao */}
      {totalPages > 1 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '20px',
          }}
        >
          <span style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-tertiary)' }}>
            Página {pageNum} de {totalPages} · {count?.toLocaleString('pt-BR') ?? 0} total
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {pageNum > 1 ? (
              <Link href={buildUrl({ page: String(pageNum - 1) })} style={paginationStyle}>
                ← Anterior
              </Link>
            ) : null}
            {pageNum < totalPages ? (
              <Link href={buildUrl({ page: String(pageNum + 1) })} style={paginationStyle}>
                Próxima →
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────────

function Kpi({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: string;
  hint: string;
  color?: string;
}) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 'var(--colheita-radius-lg)',
        border: '1px solid var(--colheita-border)',
        backgroundColor: 'var(--colheita-surface-elevated)',
      }}
    >
      <p
        style={{
          fontSize: '0.6875rem',
          fontWeight: 500,
          color: 'var(--colheita-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          margin: '0 0 6px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: color ?? 'var(--colheita-text-primary)',
          letterSpacing: '-0.03em',
          margin: '0 0 2px',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: '0.6875rem',
          color: 'var(--colheita-text-tertiary)',
          margin: 0,
        }}
      >
        {hint}
      </p>
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
