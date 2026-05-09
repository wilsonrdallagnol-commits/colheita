// apps/admin/src/app/(dashboard)/distribuidores/[id]/page.tsx
//
// Perfil do distribuidor: informações, certificações e atividade recente.
// RSC: queries paralelas em user, certifications e audit_events.

import { createServerClient, requireAuth } from '@colheita/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@colheita/ui';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StatusActions } from './status-actions';

// ── Tipos ─────────────────────────────────────────────────────────────────────

type UserStatus = 'active' | 'invited' | 'suspended';
type CertStatus = 'active' | 'expired' | 'revoked';

interface DistribuidorUser {
  id: string;
  email: string;
  full_name: string | null;
  status: UserStatus;
  last_seen_at: string | null;
  created_at: string;
}

interface CertRow {
  id: string;
  certificate_no: string;
  status: CertStatus;
  issued_at: string;
  expires_at: string | null;
  track: { name: string } | { name: string }[] | null;
}

interface AuditRow {
  id: string;
  action: string;
  resource: string;
  resource_id: string | null;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function userStatusStyle(status: UserStatus) {
  if (status === 'active')
    return {
      bg: 'rgba(52,199,89,0.12)',
      color: 'var(--colheita-brand-green)',
      border: 'rgba(52,199,89,0.25)',
      label: 'Ativo',
    };
  if (status === 'invited')
    return {
      bg: 'rgba(212,175,55,0.12)',
      color: 'var(--colheita-brand-gold)',
      border: 'rgba(212,175,55,0.25)',
      label: 'Convidado',
    };
  return {
    bg: 'rgba(239,68,68,0.1)',
    color: '#ef4444',
    border: 'rgba(239,68,68,0.25)',
    label: 'Suspenso',
  };
}

function certStatusStyle(status: CertStatus) {
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

function trackName(track: CertRow['track']): string {
  if (!track) return '—';
  if (Array.isArray(track)) return track[0]?.name ?? '—';
  return track.name;
}

function actionColor(action: string): string {
  if (action.startsWith('create')) return 'var(--colheita-brand-green)';
  if (action.startsWith('update') || action.startsWith('publish') || action.startsWith('archive'))
    return 'var(--colheita-brand-gold)';
  if (action.startsWith('delete')) return '#ef4444';
  return 'var(--colheita-text-secondary)';
}

// ── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data } = await supabase.from('users').select('email').eq('id', id).single();
  return { title: data?.email ?? 'Distribuidor' };
}

export default async function DistribuidorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // ── Queries paralelas ──────────────────────────────────────────────────────
  const [{ data: userData }, { data: certsData }, { data: auditData }] = await Promise.all([
    supabase
      .from('users')
      .select('id, email, full_name, status, last_seen_at, created_at')
      .eq('id', id)
      .single(),

    supabase
      .from('certifications')
      .select('id, certificate_no, status, issued_at, expires_at, track:learning_tracks(name)')
      .eq('user_id', id)
      .order('issued_at', { ascending: false }),

    supabase
      .from('audit_events')
      .select('id, action, resource, resource_id, created_at')
      .eq('actor_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  if (!userData) notFound();

  const user = userData as DistribuidorUser;
  const certs = (certsData ?? []) as CertRow[];
  const auditEvents = (auditData ?? []) as AuditRow[];
  const userStyle = userStatusStyle(user.status);

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '900px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px' }}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link
                href="/distribuidores"
                style={{
                  color: 'var(--colheita-text-tertiary)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                }}
              >
                Distribuidores
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage style={{ fontSize: '0.875rem' }}>{user.email}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Profile card */}
      <div
        style={{
          padding: '24px',
          borderRadius: 'var(--colheita-radius-lg)',
          border: '1px solid var(--colheita-border)',
          backgroundColor: 'var(--colheita-surface-elevated)',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--colheita-text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '4px',
              }}
            >
              {user.full_name ?? user.email}
            </h1>
            {user.full_name && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--colheita-text-tertiary)',
                  margin: '0 0 12px',
                }}
              >
                {user.email}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '999px',
                backgroundColor: userStyle.bg,
                color: userStyle.color,
                border: `1px solid ${userStyle.border}`,
                fontSize: '0.8125rem',
                fontWeight: '500',
              }}
            >
              {userStyle.label}
            </span>
            <StatusActions id={user.id} status={user.status} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginTop: '4px' }}>
          <div>
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: '500',
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '4px',
              }}
            >
              Cadastrado em
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)', margin: 0 }}>
              {formatDate(user.created_at)}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: '500',
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '4px',
              }}
            >
              Último acesso
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)', margin: 0 }}>
              {user.last_seen_at ? formatDateTime(user.last_seen_at) : 'Nunca'}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: '500',
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '4px',
              }}
            >
              Certificações
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)', margin: 0 }}>
              {certs.length}
            </p>
          </div>
        </div>
      </div>

      {/* Certificações */}
      <section style={{ marginBottom: '32px' }}>
        <h2
          style={{
            fontSize: '0.75rem',
            fontWeight: '500',
            color: 'var(--colheita-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '12px',
          }}
        >
          Certificações ({certs.length})
        </h2>

        {certs.length === 0 ? (
          <div
            style={{
              padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)',
              textAlign: 'center',
              border: '1px dashed var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-lg)',
            }}
          >
            <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-tertiary)', margin: 0 }}>
              Nenhuma certificação emitida ainda.
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
                  {(['Trilha', 'Número', 'Emitido em', 'Expira em', 'Status'] as const).map(
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
                {certs.map((cert, idx) => {
                  const cs = certStatusStyle(cert.status);
                  return (
                    <tr
                      key={cert.id}
                      style={{
                        borderBottom:
                          idx < certs.length - 1
                            ? '1px solid var(--colheita-border-subtle)'
                            : 'none',
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ color: 'var(--colheita-text-primary)', fontWeight: '500' }}>
                          {trackName(cert.track)}
                        </span>
                      </td>
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
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{ color: 'var(--colheita-text-secondary)', fontSize: '0.8125rem' }}
                        >
                          {formatDate(cert.issued_at)}
                        </span>
                      </td>
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
                          {cert.expires_at ? formatDate(cert.expires_at) : 'Sem expiração'}
                        </span>
                      </td>
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
        )}
      </section>

      {/* Atividade recente */}
      <section>
        <h2
          style={{
            fontSize: '0.75rem',
            fontWeight: '500',
            color: 'var(--colheita-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '12px',
          }}
        >
          Atividade recente (últimas 20 ações)
        </h2>

        {auditEvents.length === 0 ? (
          <div
            style={{
              padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)',
              textAlign: 'center',
              border: '1px dashed var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-lg)',
            }}
          >
            <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-tertiary)', margin: 0 }}>
              Nenhuma atividade registrada ainda.
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
                  {(['Data/Hora', 'Ação', 'Recurso', 'ID'] as const).map((col) => (
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
                        {event.resource}
                      </span>
                    </td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
