// apps/admin/src/app/(dashboard)/auditoria/page.tsx
//
// Log de auditoria — exibe eventos registrados em audit_events.
// RSC: busca server-side com paginação por cursor (created_at DESC).
// Filtros por URL params: ?acao=&recurso=&page=N

import { createServerClient, requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Auditoria | Argho Admin' };

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface AuditEvent {
  id: string;
  actor_id: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50;

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function actionColor(action: string): string {
  if (action.startsWith('create')) return 'var(--colheita-brand-green)';
  if (action.startsWith('update') || action.startsWith('publish') || action.startsWith('archive'))
    return 'var(--colheita-brand-gold)';
  if (action.startsWith('delete')) return '#ef4444';
  return 'var(--colheita-text-secondary)';
}

function resourceBadge(resource: string): string {
  const map: Record<string, string> = {
    product: 'Produto',
    category: 'Categoria',
    asset: 'Mídia',
    learning_track: 'Trilha',
    learning_module: 'Módulo',
    learning_lesson: 'Lição',
    certification: 'Certificado',
    tenant: 'Tenant',
    user: 'Usuário',
  };
  return map[resource] ?? resource;
}

// ── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    acao?: string;
    recurso?: string;
    page?: string;
  }>;
}

export default async function AuditoriaPage({ searchParams }: PageProps) {
  const { acao, recurso, page } = await searchParams;
  const pageNum = Math.max(1, Number(page ?? 1));
  const offset = (pageNum - 1) * PAGE_SIZE;

  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // ── Query base ─────────────────────────────────────────────────────────────
  let query = supabase
    .from('audit_events')
    .select('id, actor_id, action, resource, resource_id, payload, created_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (acao) query = query.ilike('action', `%${acao}%`);
  if (recurso) query = query.eq('resource', recurso);

  const { data: events, count, error } = await query;

  const totalEvents = count ?? 0;
  const totalPages = Math.ceil(totalEvents / PAGE_SIZE);
  const auditEvents = (events ?? []) as AuditEvent[];

  // ── Distinct resources para filtro ────────────────────────────────────────
  const { data: resourceRows } = await supabase
    .from('audit_events')
    .select('resource')
    .order('resource');

  const distinctResources = [...new Set((resourceRows ?? []).map((r) => r.resource as string))];

  // ── URL helpers ────────────────────────────────────────────────────────────
  function buildUrl(params: Record<string, string | undefined>): string {
    const base = { acao, recurso, page: String(pageNum) };
    const merged = { ...base, ...params };
    const q = Object.entries(merged)
      .filter((entry): entry is [string, string] => Boolean(entry[1]) && entry[1] !== '1')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return `/auditoria${q ? `?${q}` : ''}`;
  }

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)' }}>
      <div style={{ marginBottom: '32px' }}>
        <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
          Identity & Access
        </p>
        <h1
          className="argho-display"
          style={{
            fontSize: 'clamp(1.875rem, 2.4vw, 2.375rem)',
            color: '#0a0a0a',
            margin: '0 0 8px',
          }}
        >
          Log de auditoria
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--colheita-text-secondary)',
            margin: 0,
            maxWidth: '60ch',
          }}
        >
          {totalEvents.toLocaleString('pt-BR')} evento{totalEvents !== 1 ? 's' : ''} registrado
          {totalEvents !== 1 ? 's' : ''} — trilha imutável de toda ação sensível.
        </p>
      </div>

      {/* Filtros */}
      <form
        method="get"
        action="/auditoria"
        style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}
      >
        <input
          type="text"
          name="acao"
          defaultValue={acao}
          placeholder="Filtrar por ação..."
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            color: 'var(--colheita-text-primary)',
            fontSize: '0.875rem',
            width: '200px',
          }}
        />
        <select
          name="recurso"
          defaultValue={recurso ?? ''}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            color: 'var(--colheita-text-primary)',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <option value="">Todos os recursos</option>
          {distinctResources.map((r) => (
            <option key={r} value={r}>
              {resourceBadge(r)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: 'var(--colheita-brand-green)',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Filtrar
        </button>
        {(acao || recurso) && (
          <Link
            href="/auditoria"
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--colheita-radius-md)',
              border: '1px solid var(--colheita-border)',
              fontSize: '0.875rem',
              color: 'var(--colheita-text-secondary)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Limpar filtros
          </Link>
        )}
      </form>

      {/* Tabela */}
      {error ? (
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'rgba(239,68,68,0.1)',
            color: '#ef4444',
            fontSize: '0.875rem',
          }}
        >
          Erro ao carregar eventos: {error.message}
        </div>
      ) : auditEvents.length === 0 ? (
        <div
          style={{
            padding: '48px',
            textAlign: 'center',
            border: '1px dashed var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
          }}
        >
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--colheita-text-tertiary)',
              margin: 0,
            }}
          >
            Nenhum evento encontrado{acao || recurso ? ' com esses filtros' : ''}.
          </p>
        </div>
      ) : (
        <div
          style={{
            borderRadius: 'var(--colheita-radius-lg)',
            border: '1px solid var(--colheita-border)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--colheita-border)',
                  backgroundColor: 'var(--colheita-surface-elevated)',
                }}
              >
                {(['Data/Hora', 'Ação', 'Recurso', 'ID do Recurso', 'Ator'] as const).map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontWeight: '500',
                      color: 'var(--colheita-text-tertiary)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditEvents.map((event, idx) => (
                <tr
                  key={event.id}
                  style={{
                    borderBottom:
                      idx < auditEvents.length - 1
                        ? '1px solid var(--colheita-border-subtle)'
                        : 'none',
                  }}
                >
                  {/* Data/Hora */}
                  <td
                    style={{
                      padding: '10px 16px',
                      color: 'var(--colheita-text-tertiary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDateTime(event.created_at)}
                  </td>

                  {/* Ação */}
                  <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        fontWeight: '500',
                        color: actionColor(event.action),
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                      }}
                    >
                      {event.action}
                    </span>
                  </td>

                  {/* Recurso */}
                  <td style={{ padding: '10px 16px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 'var(--colheita-radius-sm)',
                        backgroundColor: 'var(--colheita-surface-sunken)',
                        color: 'var(--colheita-text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        border: '1px solid var(--colheita-border-subtle)',
                      }}
                    >
                      {resourceBadge(event.resource)}
                    </span>
                  </td>

                  {/* ID do Recurso */}
                  <td style={{ padding: '10px 16px' }}>
                    <span
                      style={{
                        color: 'var(--colheita-text-tertiary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                      }}
                    >
                      {event.resource_id ? `${event.resource_id.slice(0, 8)}…` : '—'}
                    </span>
                  </td>

                  {/* Ator */}
                  <td style={{ padding: '10px 16px' }}>
                    <span
                      style={{
                        color: 'var(--colheita-text-tertiary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                      }}
                    >
                      {event.actor_id ? `${event.actor_id.slice(0, 8)}…` : 'sistema'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '20px',
          }}
        >
          <span style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-tertiary)' }}>
            Página {pageNum} de {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {pageNum > 1 && (
              <Link
                href={buildUrl({ page: String(pageNum - 1) })}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--colheita-radius-md)',
                  border: '1px solid var(--colheita-border)',
                  fontSize: '0.8125rem',
                  color: 'var(--colheita-text-secondary)',
                  textDecoration: 'none',
                  backgroundColor: 'var(--colheita-surface-elevated)',
                }}
              >
                ← Anterior
              </Link>
            )}
            {pageNum < totalPages && (
              <Link
                href={buildUrl({ page: String(pageNum + 1) })}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--colheita-radius-md)',
                  border: '1px solid var(--colheita-border)',
                  fontSize: '0.8125rem',
                  color: 'var(--colheita-text-secondary)',
                  textDecoration: 'none',
                  backgroundColor: 'var(--colheita-surface-elevated)',
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
