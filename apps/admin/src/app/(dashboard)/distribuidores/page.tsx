// apps/admin/src/app/(dashboard)/distribuidores/page.tsx
//
// Lista de distribuidores (usuários autenticados do tenant).
// RSC: busca server-side com busca textual e filtro por status.
// URL params: ?q=&status=&page=N

import { createServerClient, requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Distribuidores | Argho Admin' };

// ── Tipos ─────────────────────────────────────────────────────────────────────

type UserStatus = 'active' | 'invited' | 'suspended';

interface Distribuidor {
  id: string;
  email: string;
  full_name: string | null;
  status: UserStatus;
  last_seen_at: string | null;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
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

function statusLabel(status: UserStatus): string {
  const map: Record<UserStatus, string> = {
    active: 'Ativo',
    invited: 'Convidado',
    suspended: 'Suspenso',
  };
  return map[status];
}

function statusColor(status: UserStatus): { bg: string; color: string; border: string } {
  if (status === 'active')
    return {
      bg: 'rgba(52,199,89,0.12)',
      color: 'var(--colheita-brand-green)',
      border: 'rgba(52,199,89,0.25)',
    };
  if (status === 'invited')
    return {
      bg: 'rgba(212,175,55,0.12)',
      color: 'var(--colheita-brand-gold)',
      border: 'rgba(212,175,55,0.25)',
    };
  return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' };
}

// ── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function DistribuidoresPage({ searchParams }: PageProps) {
  const { q, status, page } = await searchParams;
  const pageNum = Math.max(1, Number(page ?? 1));
  const offset = (pageNum - 1) * PAGE_SIZE;

  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // ── Query ─────────────────────────────────────────────────────────────────
  let query = supabase
    .from('users')
    .select('id, email, full_name, status, last_seen_at, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (status && ['active', 'invited', 'suspended'].includes(status)) {
    query = query.eq('status', status);
  }

  if (q) {
    query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);
  }

  const { data: rows, count, error } = await query;

  const distribuidores = (rows ?? []) as Distribuidor[];
  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── URL helpers ────────────────────────────────────────────────────────────
  function buildUrl(params: Record<string, string | undefined>): string {
    const base = { q, status, page: String(pageNum) };
    const merged = { ...base, ...params };
    const qs = Object.entries(merged)
      .filter((entry): entry is [string, string] => Boolean(entry[1]) && entry[1] !== '1')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return `/distribuidores${qs ? `?${qs}` : ''}`;
  }

  const statusOptions: { value: UserStatus | ''; label: string }[] = [
    { value: '', label: 'Todos os status' },
    { value: 'active', label: 'Ativos' },
    { value: 'invited', label: 'Convidados' },
    { value: 'suspended', label: 'Suspensos' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '1.375rem',
            fontWeight: '600',
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '4px',
          }}
        >
          Distribuidores
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-tertiary)', margin: 0 }}>
          {total.toLocaleString('pt-BR')} distribuidor{total !== 1 ? 'es' : ''} cadastrado
          {total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtros */}
      <form
        method="get"
        action="/distribuidores"
        style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}
      >
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por e-mail ou nome..."
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            color: 'var(--colheita-text-primary)',
            fontSize: '0.875rem',
            width: '240px',
          }}
        />
        <select
          name="status"
          defaultValue={status ?? ''}
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
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
        {(q || status) && (
          <Link
            href="/distribuidores"
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

      {/* Conteúdo */}
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
          Erro ao carregar distribuidores: {error.message}
        </div>
      ) : distribuidores.length === 0 ? (
        <div
          style={{
            padding: '64px 48px',
            textAlign: 'center',
            border: '1px dashed var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>👥</div>
          <p
            style={{
              fontSize: '0.9375rem',
              fontWeight: '500',
              color: 'var(--colheita-text-secondary)',
              margin: '0 0 6px',
            }}
          >
            {q || status
              ? 'Nenhum distribuidor encontrado com esses filtros.'
              : 'Nenhum distribuidor cadastrado ainda.'}
          </p>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-tertiary)',
              margin: 0,
            }}
          >
            {q || status
              ? 'Tente ajustar os filtros de busca.'
              : 'Os distribuidores aparecerão aqui após acessar o Portal.'}
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
                {(['E-mail', 'Nome', 'Status', 'Último acesso', 'Cadastrado em'] as const).map(
                  (col) => (
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
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {distribuidores.map((d, idx) => {
                const colors = statusColor(d.status);
                return (
                  <tr
                    key={d.id}
                    style={{
                      borderBottom:
                        idx < distribuidores.length - 1
                          ? '1px solid var(--colheita-border-subtle)'
                          : 'none',
                    }}
                  >
                    {/* E-mail */}
                    <td style={{ padding: '12px 16px' }}>
                      <Link
                        href={`/distribuidores/${d.id}`}
                        style={{
                          color: 'var(--colheita-brand-teal)',
                          fontWeight: '500',
                          fontSize: '0.8125rem',
                          textDecoration: 'none',
                        }}
                      >
                        {d.email}
                      </Link>
                    </td>

                    {/* Nome */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          color: d.full_name
                            ? 'var(--colheita-text-secondary)'
                            : 'var(--colheita-text-tertiary)',
                          fontStyle: d.full_name ? 'normal' : 'italic',
                          fontSize: '0.8125rem',
                        }}
                      >
                        {d.full_name ?? 'Não informado'}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          backgroundColor: colors.bg,
                          color: colors.color,
                          border: `1px solid ${colors.border}`,
                          fontSize: '0.75rem',
                          fontWeight: '500',
                        }}
                      >
                        {statusLabel(d.status)}
                      </span>
                    </td>

                    {/* Último acesso */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          color: d.last_seen_at
                            ? 'var(--colheita-text-secondary)'
                            : 'var(--colheita-text-tertiary)',
                          fontFamily: d.last_seen_at ? 'inherit' : 'inherit',
                          fontSize: '0.8125rem',
                          fontStyle: d.last_seen_at ? 'normal' : 'italic',
                        }}
                      >
                        {d.last_seen_at ? formatDateTime(d.last_seen_at) : 'Nunca'}
                      </span>
                    </td>

                    {/* Cadastrado em */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          color: 'var(--colheita-text-tertiary)',
                          fontSize: '0.8125rem',
                        }}
                      >
                        {formatDate(d.created_at)}
                      </span>
                    </td>
                  </tr>
                );
              })}
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
