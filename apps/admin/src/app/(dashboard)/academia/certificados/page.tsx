// apps/admin/src/app/(dashboard)/academia/certificados/page.tsx
//
// Relatório de certificações emitidas — BI academia.
// Mostra quem certificou, em qual trilha, com filtros por trilha e período.
// RSC: queries paralelas (certifications + tracks para filtro).

import { createServerClient, requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Certificações | Academia | Argho Admin' };

// ── Tipos ─────────────────────────────────────────────────────────────────────

type CertStatus = 'active' | 'expired' | 'revoked';

interface CertificationRow {
  id: string;
  certificate_no: string;
  status: CertStatus;
  issued_at: string;
  expires_at: string | null;
  final_score: number | null;
  user:
    | { id: string; email: string; full_name: string | null }
    | null
    | { id: string; email: string; full_name: string | null }[];
  track:
    | { id: string; name: string; slug: string }
    | null
    | { id: string; name: string; slug: string }[];
}

interface TrackOption {
  id: string;
  name: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Sem expiração';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function userInfo(
  user: CertificationRow['user'],
): { id: string; email: string; full_name: string | null } | null {
  if (!user) return null;
  if (Array.isArray(user)) return user[0] ?? null;
  return user;
}

function trackInfo(
  track: CertificationRow['track'],
): { id: string; name: string; slug: string } | null {
  if (!track) return null;
  if (Array.isArray(track)) return track[0] ?? null;
  return track;
}

function certStatusStyle(status: CertStatus): {
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
      bg: 'rgba(212,175,55,0.12)',
      color: 'var(--colheita-brand-gold)',
      border: 'rgba(212,175,55,0.25)',
      label: 'Expirado',
    };
  return {
    bg: 'rgba(239,68,68,0.1)',
    color: '#ef4444',
    border: 'rgba(239,68,68,0.25)',
    label: 'Revogado',
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50;

interface PageProps {
  searchParams: Promise<{
    track?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function CertificadosPage({ searchParams }: PageProps) {
  const { track, status, page } = await searchParams;
  const pageNum = Math.max(1, Number(page ?? 1));
  const offset = (pageNum - 1) * PAGE_SIZE;

  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // ── Queries paralelas ──────────────────────────────────────────────────────
  const [certResult, tracksResult, summaryResult] = await Promise.all([
    // Certificações com filtros
    (() => {
      let q = supabase
        .from('certifications')
        .select(
          'id, certificate_no, status, issued_at, expires_at, final_score, user:users(id, email, full_name), track:learning_tracks(id, name, slug)',
          { count: 'exact' },
        )
        .order('issued_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);
      if (track) q = q.eq('track_id', track);
      if (status && ['active', 'expired', 'revoked'].includes(status)) {
        q = q.eq('status', status);
      }
      return q;
    })(),

    // Trilhas para o filtro
    supabase
      .from('learning_tracks')
      .select('id, name')
      .order('name'),

    // Sumário total sem filtros
    supabase
      .from('certifications')
      .select('status, issued_at')
      .gte('issued_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const certifications = (certResult.data ?? []) as CertificationRow[];
  const total = certResult.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const tracks = (tracksResult.data ?? []) as TrackOption[];

  // Certifications emitidas nos últimos 30 dias
  const recentCerts = summaryResult.data ?? [];
  const last30dCount = recentCerts.length;
  const activeCount = recentCerts.filter((c) => c.status === 'active').length;

  // ── URL helpers ────────────────────────────────────────────────────────────
  function buildUrl(params: Record<string, string | undefined>): string {
    const base = { track, status, page: String(pageNum) };
    const merged = { ...base, ...params };
    const qs = Object.entries(merged)
      .filter((entry): entry is [string, string] => Boolean(entry[1]) && entry[1] !== '1')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return `/academia/certificados${qs ? `?${qs}` : ''}`;
  }

  const hasFilters = Boolean(track || status);

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '0.875rem' }}>
          <Link
            href="/academia"
            style={{ color: 'var(--colheita-text-tertiary)', textDecoration: 'none' }}
          >
            Academia
          </Link>
          <span style={{ color: 'var(--colheita-text-tertiary)', margin: '0 6px' }}>/</span>
          <span style={{ color: 'var(--colheita-text-secondary)' }}>Certificações</span>
        </span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontSize: '1.375rem',
            fontWeight: '600',
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '4px',
          }}
        >
          Certificações emitidas
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-tertiary)', margin: 0 }}>
          Histórico de certificados por distribuidor e trilha
        </p>
      </div>

      {/* Sumário */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}
      >
        {[
          {
            label: 'Total emitidos',
            value: total,
            color: 'var(--colheita-text-primary)',
          },
          {
            label: 'Últimos 30 dias',
            value: last30dCount,
            color: 'var(--colheita-brand-teal)',
          },
          {
            label: 'Ativos (30d)',
            value: activeCount,
            color: 'var(--colheita-brand-green)',
          },
          {
            label: 'Trilhas',
            value: tracks.length,
            color: 'var(--colheita-text-secondary)',
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              padding: '16px',
              borderRadius: 'var(--colheita-radius-lg)',
              border: '1px solid var(--colheita-border)',
              backgroundColor: 'var(--colheita-surface-elevated)',
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
        ))}
      </div>

      {/* Filtros */}
      <form
        method="get"
        action="/academia/certificados"
        style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}
      >
        <select
          name="track"
          defaultValue={track ?? ''}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            color: 'var(--colheita-text-primary)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            maxWidth: '260px',
          }}
        >
          <option value="">Todas as trilhas</option>
          {tracks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

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
          <option value="revoked">Revogados</option>
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
            href="/academia/certificados"
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
      {certifications.length === 0 ? (
        <div
          style={{
            padding: '64px 48px',
            textAlign: 'center',
            border: '1px dashed var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎓</div>
          <p
            style={{
              fontSize: '0.9375rem',
              fontWeight: '500',
              color: 'var(--colheita-text-secondary)',
              margin: '0 0 6px',
            }}
          >
            {hasFilters
              ? 'Nenhuma certificação encontrada com esses filtros.'
              : 'Nenhuma certificação emitida ainda.'}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-tertiary)', margin: 0 }}>
            {hasFilters
              ? 'Tente ajustar os filtros.'
              : 'Certificações aparecerão aqui conforme os distribuidores concluem as trilhas.'}
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
                      'Distribuidor',
                      'Trilha',
                      'Certificado',
                      'Emitido em',
                      'Expira em',
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
                {certifications.map((cert, idx) => {
                  const cs = certStatusStyle(cert.status);
                  const u = userInfo(cert.user);
                  const t = trackInfo(cert.track);
                  return (
                    <tr
                      key={cert.id}
                      style={{
                        borderBottom:
                          idx < certifications.length - 1
                            ? '1px solid var(--colheita-border-subtle)'
                            : 'none',
                      }}
                    >
                      {/* Distribuidor */}
                      <td style={{ padding: '12px 16px' }}>
                        {u ? (
                          <Link
                            href={`/distribuidores/${u.id}`}
                            style={{
                              color: 'var(--colheita-brand-teal)',
                              fontWeight: '500',
                              fontSize: '0.8125rem',
                              textDecoration: 'none',
                            }}
                          >
                            {u.full_name ?? u.email}
                          </Link>
                        ) : (
                          <span
                            style={{
                              color: 'var(--colheita-text-tertiary)',
                              fontStyle: 'italic',
                            }}
                          >
                            Usuário removido
                          </span>
                        )}
                        {u?.full_name && (
                          <p
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--colheita-text-tertiary)',
                              margin: '2px 0 0',
                            }}
                          >
                            {u.email}
                          </p>
                        )}
                      </td>

                      {/* Trilha */}
                      <td style={{ padding: '12px 16px' }}>
                        {t ? (
                          <Link
                            href={`/academia/${t.slug}`}
                            style={{
                              color: 'var(--colheita-text-secondary)',
                              fontSize: '0.8125rem',
                              textDecoration: 'none',
                              fontWeight: '500',
                            }}
                          >
                            {t.name}
                          </Link>
                        ) : (
                          <span
                            style={{ color: 'var(--colheita-text-tertiary)', fontStyle: 'italic' }}
                          >
                            Trilha removida
                          </span>
                        )}
                      </td>

                      {/* Nº Certificado */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            color: 'var(--colheita-text-secondary)',
                          }}
                        >
                          {cert.certificate_no}
                        </span>
                      </td>

                      {/* Emitido em */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            color: 'var(--colheita-text-tertiary)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                          }}
                        >
                          {formatDateTime(cert.issued_at)}
                        </span>
                      </td>

                      {/* Expira em */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            color: cert.expires_at
                              ? 'var(--colheita-text-secondary)'
                              : 'var(--colheita-text-tertiary)',
                            fontStyle: cert.expires_at ? 'normal' : 'italic',
                            fontSize: '0.8125rem',
                          }}
                        >
                          {formatDate(cert.expires_at)}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            backgroundColor: cs.bg,
                            color: cs.color,
                            border: `1px solid ${cs.border}`,
                            fontSize: '0.75rem',
                            fontWeight: '500',
                          }}
                        >
                          {cs.label}
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
            {total.toLocaleString('pt-BR')} certificação{total !== 1 ? 'ões' : ''}
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
