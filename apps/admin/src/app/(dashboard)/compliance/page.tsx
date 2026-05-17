// apps/admin/src/app/(dashboard)/compliance/page.tsx
//
// Painel de compliance regulatório — acompanha registros MAPA/ANVISA/IBAMA
// com alertas de vencimento e filtros por status/autoridade.
// RSC: queries server-side, ordenadas por expires_at (mais urgente primeiro).

import { createServerClient, requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Compliance Regulatório' };

// ── Tipos ─────────────────────────────────────────────────────────────────────

type RegStatus = 'active' | 'expired' | 'pending' | 'revoked';
type Authority = 'MAPA' | 'ANVISA' | 'IBAMA' | 'STATE' | 'OTHER';

interface RegRow {
  id: string;
  registration_no: string;
  authority: Authority;
  status: RegStatus;
  issued_at: string | null;
  expires_at: string | null;
  notes: string | null;
  product:
    | { id: string; name: string; slug: string }
    | { id: string; name: string; slug: string }[]
    | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function productInfo(
  product: RegRow['product'],
): { id: string; name: string; slug: string } | null {
  if (!product) return null;
  if (Array.isArray(product)) return product[0] ?? null;
  return product;
}

function statusStyle(status: RegStatus): {
  bg: string;
  color: string;
  border: string;
  label: string;
} {
  if (status === 'active')
    return {
      bg: 'rgba(52,199,89,0.12)',
      color: 'var(--colheita-brand-green)',
      border: 'rgba(52,199,89,0.25)',
      label: 'Ativo',
    };
  if (status === 'expired')
    return {
      bg: 'rgba(239,68,68,0.1)',
      color: '#ef4444',
      border: 'rgba(239,68,68,0.25)',
      label: 'Expirado',
    };
  if (status === 'pending')
    return {
      bg: 'rgba(212,175,55,0.12)',
      color: 'var(--colheita-brand-gold)',
      border: 'rgba(212,175,55,0.25)',
      label: 'Pendente',
    };
  return {
    bg: 'rgba(120,120,130,0.1)',
    color: 'var(--colheita-text-tertiary)',
    border: 'rgba(120,120,130,0.2)',
    label: 'Revogado',
  };
}

function expiryAlert(
  expiresAt: string | null,
  status: RegStatus,
): { color: string; label: string } | null {
  if (status !== 'active' || !expiresAt) return null;
  const now = Date.now();
  const exp = new Date(expiresAt).getTime();
  const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { color: '#ef4444', label: 'Expirado' };
  if (daysLeft <= 30) return { color: '#f97316', label: `Expira em ${daysLeft}d` };
  if (daysLeft <= 90)
    return { color: 'var(--colheita-brand-gold)', label: `Expira em ${daysLeft}d` };
  return null;
}

// ── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    status?: string;
    authority?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 50;

const AUTHORITY_LABELS: Record<Authority, string> = {
  MAPA: 'MAPA',
  ANVISA: 'ANVISA',
  IBAMA: 'IBAMA',
  STATE: 'Estadual',
  OTHER: 'Outro',
};

export default async function CompliancePage({ searchParams }: PageProps) {
  const { status, authority, page } = await searchParams;
  const pageNum = Math.max(1, Number(page ?? 1));
  const offset = (pageNum - 1) * PAGE_SIZE;

  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // ── Query ─────────────────────────────────────────────────────────────────
  let query = supabase
    .from('regulatory_registrations')
    .select(
      'id, registration_no, authority, status, issued_at, expires_at, notes, product:products(id, name, slug)',
      { count: 'exact' },
    )
    // Ativos com vencimento próximo primeiro; sem data depois; expirados/revogados por último
    .order('status', { ascending: true })
    .order('expires_at', { ascending: true, nullsFirst: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (status && ['active', 'expired', 'pending', 'revoked'].includes(status)) {
    query = query.eq('status', status);
  }
  if (authority && ['MAPA', 'ANVISA', 'IBAMA', 'STATE', 'OTHER'].includes(authority)) {
    query = query.eq('authority', authority);
  }

  const { data: rows, count, error } = await query;

  const registrations = (rows ?? []) as RegRow[];
  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── Sumário por status ────────────────────────────────────────────────────
  const { data: summaryRows } = await supabase
    .from('regulatory_registrations')
    .select('status, expires_at');

  const now = Date.now();
  const summary = {
    active: 0,
    expiringSoon: 0, // active + expires_at <= 30 dias
    expired: 0,
    pending: 0,
    revoked: 0,
  };
  for (const r of summaryRows ?? []) {
    if (r.status === 'active') {
      summary.active++;
      if (r.expires_at) {
        const daysLeft = Math.ceil(
          (new Date(r.expires_at as string).getTime() - now) / (1000 * 60 * 60 * 24),
        );
        if (daysLeft <= 30) summary.expiringSoon++;
      }
    } else if (r.status === 'expired') {
      summary.expired++;
    } else if (r.status === 'pending') {
      summary.pending++;
    } else if (r.status === 'revoked') {
      summary.revoked++;
    }
  }

  // ── URL helpers ────────────────────────────────────────────────────────────
  function buildUrl(params: Record<string, string | undefined>): string {
    const base = { status, authority, page: String(pageNum) };
    const merged = { ...base, ...params };
    const qs = Object.entries(merged)
      .filter((entry): entry is [string, string] => Boolean(entry[1]) && entry[1] !== '1')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return `/compliance${qs ? `?${qs}` : ''}`;
  }

  const hasFilters = Boolean(status || authority);

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)' }}>
      <div
        style={{
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
            PIM · Compliance regulatório
          </p>
          <h1
            className="argho-display"
            style={{
              fontSize: 'clamp(1.875rem, 2.4vw, 2.375rem)',
              color: '#0a0a0a',
              margin: '0 0 8px',
            }}
          >
            Registros MAPA, ANVISA, IBAMA
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--colheita-text-secondary)',
              margin: 0,
              maxWidth: '60ch',
            }}
          >
            Vencimentos, status e dossiê auditável — sem registro válido, sem comercialização.
          </p>
        </div>

        {/* Dossiê PDF compilado pra auditoria externa. <a download> força
            download attachment direto. Camada 9 — uso típico: auditoria MAPA
            presencial, renovação de processo, diligência B2B. */}
        <a
          href="/compliance/dossie"
          download
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-brand-green)',
            backgroundColor: 'var(--colheita-brand-green)',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}
        >
          📄 Baixar dossiê (PDF)
        </a>
      </div>

      {/* Sumário */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}
      >
        {[
          {
            label: 'Ativos',
            value: summary.active,
            color: 'var(--colheita-brand-green)',
            href: buildUrl({ status: 'active', page: undefined }),
          },
          {
            label: 'Vencem em 30d',
            value: summary.expiringSoon,
            color: summary.expiringSoon > 0 ? '#f97316' : 'var(--colheita-text-tertiary)',
            href: buildUrl({ status: 'active', page: undefined }),
          },
          {
            label: 'Expirados',
            value: summary.expired,
            color: summary.expired > 0 ? '#ef4444' : 'var(--colheita-text-tertiary)',
            href: buildUrl({ status: 'expired', page: undefined }),
          },
          {
            label: 'Pendentes',
            value: summary.pending,
            color: 'var(--colheita-brand-gold)',
            href: buildUrl({ status: 'pending', page: undefined }),
          },
        ].map((card) => (
          <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--colheita-radius-lg)',
                border: '1px solid var(--colheita-border)',
                backgroundColor: 'var(--colheita-surface-elevated)',
                cursor: 'pointer',
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
                {card.label}
              </p>
              <p
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: card.color,
                  letterSpacing: '-0.03em',
                  margin: 0,
                }}
              >
                {card.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Filtros */}
      <form
        method="get"
        action="/compliance"
        style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}
      >
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
          <option value="">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="expired">Expirados</option>
          <option value="pending">Pendentes</option>
          <option value="revoked">Revogados</option>
        </select>

        <select
          name="authority"
          defaultValue={authority ?? ''}
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
          <option value="">Todas as autoridades</option>
          {(Object.entries(AUTHORITY_LABELS) as [Authority, string][]).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
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

        {hasFilters && (
          <Link
            href="/compliance"
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
          Erro ao carregar registros: {error.message}
        </div>
      ) : registrations.length === 0 ? (
        <div
          style={{
            padding: '64px 48px',
            textAlign: 'center',
            border: '1px dashed var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📋</div>
          <p
            style={{
              fontSize: '0.9375rem',
              fontWeight: '500',
              color: 'var(--colheita-text-secondary)',
              margin: '0 0 6px',
            }}
          >
            {hasFilters
              ? 'Nenhum registro encontrado com esses filtros.'
              : 'Nenhum registro regulatório cadastrado ainda.'}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-tertiary)', margin: 0 }}>
            {hasFilters
              ? 'Tente ajustar os filtros.'
              : 'Registros aparecerão aqui após serem adicionados via seed ou API.'}
          </p>
        </div>
      ) : (
        <>
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
                  {(
                    [
                      'Produto',
                      'Autoridade',
                      'Registro',
                      'Emissão',
                      'Vencimento',
                      'Status',
                    ] as const
                  ).map((col) => (
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
                {registrations.map((reg, idx) => {
                  const ss = statusStyle(reg.status);
                  const alert = expiryAlert(reg.expires_at, reg.status);
                  const prod = productInfo(reg.product);
                  return (
                    <tr
                      key={reg.id}
                      style={{
                        borderBottom:
                          idx < registrations.length - 1
                            ? '1px solid var(--colheita-border-subtle)'
                            : 'none',
                        backgroundColor:
                          alert && alert.label === 'Expirado'
                            ? 'rgba(239,68,68,0.03)'
                            : alert
                              ? 'rgba(249,115,22,0.03)'
                              : 'transparent',
                      }}
                    >
                      {/* Produto */}
                      <td style={{ padding: '12px 16px' }}>
                        {prod ? (
                          <Link
                            href={`/produtos/${prod.slug}`}
                            style={{
                              color: 'var(--colheita-brand-teal)',
                              fontWeight: '500',
                              fontSize: '0.8125rem',
                              textDecoration: 'none',
                            }}
                          >
                            {prod.name}
                          </Link>
                        ) : (
                          <span
                            style={{ color: 'var(--colheita-text-tertiary)', fontStyle: 'italic' }}
                          >
                            Produto removido
                          </span>
                        )}
                      </td>

                      {/* Autoridade */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 'var(--colheita-radius-sm)',
                            backgroundColor: 'var(--colheita-surface-sunken)',
                            color: 'var(--colheita-text-secondary)',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            border: '1px solid var(--colheita-border-subtle)',
                            letterSpacing: '0.03em',
                          }}
                        >
                          {AUTHORITY_LABELS[reg.authority]}
                        </span>
                      </td>

                      {/* Número do registro */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            color: 'var(--colheita-text-secondary)',
                          }}
                        >
                          {reg.registration_no}
                        </span>
                      </td>

                      {/* Emissão */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{ color: 'var(--colheita-text-tertiary)', fontSize: '0.8125rem' }}
                        >
                          {formatDate(reg.issued_at)}
                        </span>
                      </td>

                      {/* Vencimento */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span
                            style={{
                              color: alert ? alert.color : 'var(--colheita-text-secondary)',
                              fontSize: '0.8125rem',
                              fontWeight: alert ? '500' : '400',
                            }}
                          >
                            {formatDate(reg.expires_at)}
                          </span>
                          {alert && (
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                color: alert.color,
                                fontWeight: '500',
                              }}
                            >
                              ⚠ {alert.label}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            backgroundColor: ss.bg,
                            color: ss.color,
                            border: `1px solid ${ss.border}`,
                            fontSize: '0.75rem',
                            fontWeight: '500',
                          }}
                        >
                          {ss.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-tertiary)',
              marginTop: '12px',
              marginBottom: 0,
            }}
          >
            {total.toLocaleString('pt-BR')} registro{total !== 1 ? 's' : ''}
            {hasFilters ? ' (filtrado)' : ''}
          </p>
        </>
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
