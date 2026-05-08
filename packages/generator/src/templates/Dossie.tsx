// packages/generator/src/templates/Dossie.tsx
// Dossiê de Compliance Regulatório — PDF compilado para auditoria externa.
//
// Camada 9 — uso típico:
//   - Auditoria MAPA presencial: regulatório imprime o dossiê, leva à reunião
//   - Renovação de processo: comprovação de status atual de todo portfólio
//   - Diligência de cliente B2B grande: comprova compliance contínuo
//   - Backup mensal arquivado: snapshot do estado regulatório do tenant
//
// Estrutura:
//   - Capa institucional (tenant + data + stats agregadas)
//   - Tabela completa de registros agrupada por autoridade (MAPA, ANVISA, ...)
//   - Linha por registro: produto, categoria, número, emissão, vencimento,
//     status com pill colorido
//   - Rodapé com paginação implícita (Playwright @page)
//
// Paleta consistente com FichaTecnica/Catalogo. Sem assets externos.

import type { CSSProperties } from 'react';
import type { DossieData, DossieRegistration } from '../types.js';

const GREEN = '#166534';
const TEXT_PRIMARY = '#0f1117';
const TEXT_SECONDARY = '#374151';
const TEXT_TERTIARY = '#6b7280';
const TEXT_MUTED = '#9ca3af';
const BORDER_SUBTLE = '#f3f4f6';
const GREEN_LIGHT_BG = '#f0fdf4';
const GREEN_LIGHT_BORDER = '#bbf7d0';
const ORANGE = '#f97316';
const ORANGE_BG = '#fff7ed';
const ORANGE_BORDER = '#fed7aa';
const RED = '#ef4444';
const RED_BG = '#fef2f2';
const RED_BORDER = '#fecaca';
const GREY_BG = '#f3f4f6';

const AUTHORITY_LABELS: Record<DossieRegistration['authority'], string> = {
  MAPA: 'MAPA — Ministério da Agricultura',
  ANVISA: 'ANVISA',
  IBAMA: 'IBAMA',
  STATE: 'Órgãos Estaduais',
  OTHER: 'Outros',
};

const STATUS_LABELS: Record<DossieRegistration['status'], string> = {
  active: 'Ativo',
  expired: 'Expirado',
  pending: 'Pendente',
  revoked: 'Revogado',
};

function statusColors(status: DossieRegistration['status']): {
  bg: string;
  border: string;
  color: string;
} {
  if (status === 'active') return { bg: GREEN_LIGHT_BG, border: GREEN_LIGHT_BORDER, color: GREEN };
  if (status === 'expired') return { bg: RED_BG, border: RED_BORDER, color: RED };
  if (status === 'pending') return { bg: ORANGE_BG, border: ORANGE_BORDER, color: ORANGE };
  return { bg: GREY_BG, border: BORDER_SUBTLE, color: TEXT_TERTIARY };
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const s: Record<string, CSSProperties> = {
  body: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    background: '#ffffff',
    color: TEXT_PRIMARY,
    lineHeight: 1.5,
    fontSize: '10pt',
    margin: 0,
    padding: 0,
  },

  // ── Capa ─────────────────────────────────────────────────────────────────
  capa: {
    width: '210mm',
    height: '297mm',
    background: `linear-gradient(180deg, #ffffff 0%, ${GREEN_LIGHT_BG} 100%)`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '40mm 24mm',
    boxSizing: 'border-box',
    pageBreakAfter: 'always',
  },
  capaEyebrow: {
    fontSize: '9pt',
    fontWeight: 700,
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
  },
  capaTitulo: {
    fontSize: '46pt',
    fontWeight: 700,
    color: TEXT_PRIMARY,
    letterSpacing: '-0.03em',
    lineHeight: 1.0,
    marginTop: '24pt',
    marginBottom: '12pt',
  },
  capaSubtitle: {
    fontSize: '14pt',
    color: TEXT_SECONDARY,
    lineHeight: 1.5,
    maxWidth: '140mm',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14pt',
    marginTop: '36pt',
    marginBottom: '12pt',
  },
  statBox: {
    padding: '14pt 16pt',
    border: `1pt solid ${GREEN_LIGHT_BORDER}`,
    background: '#ffffff',
    borderRadius: '4pt',
  },
  statLabel: {
    fontSize: '8pt',
    fontWeight: 700,
    color: TEXT_TERTIARY,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '6pt',
  },
  statValue: {
    fontSize: '24pt',
    fontWeight: 700,
    color: TEXT_PRIMARY,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.0,
  },
  statValueAlert: {
    fontSize: '24pt',
    fontWeight: 700,
    color: ORANGE,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.0,
  },
  statValueDanger: {
    fontSize: '24pt',
    fontWeight: 700,
    color: RED,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.0,
  },

  capaFooter: {
    borderTop: `2pt solid ${GREEN}`,
    paddingTop: '12pt',
  },
  capaFooterTenant: {
    fontSize: '11pt',
    fontWeight: 700,
    color: GREEN,
    letterSpacing: '-0.01em',
  },
  capaFooterMeta: {
    fontSize: '8.5pt',
    color: TEXT_TERTIARY,
    marginTop: '4pt',
    lineHeight: 1.5,
  },

  // ── Páginas de conteúdo ──────────────────────────────────────────────────
  page: {
    width: '210mm',
    minHeight: '297mm',
    padding: '20mm 18mm 26mm',
    margin: '0 auto',
    position: 'relative',
    boxSizing: 'border-box',
    pageBreakAfter: 'always',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: '8pt',
    borderBottom: `1.5pt solid ${GREEN}`,
    marginBottom: '20pt',
  },
  pageHeaderTenant: {
    fontSize: '9pt',
    fontWeight: 700,
    color: GREEN,
    letterSpacing: '-0.01em',
  },
  pageHeaderMeta: {
    fontSize: '7pt',
    fontWeight: 600,
    color: TEXT_TERTIARY,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    textAlign: 'right',
  },

  authorityBlock: {
    marginBottom: '20pt',
  },
  authorityTitle: {
    fontSize: '14pt',
    fontWeight: 700,
    color: TEXT_PRIMARY,
    letterSpacing: '-0.02em',
    marginBottom: '4pt',
  },
  authorityCount: {
    fontSize: '8.5pt',
    fontWeight: 600,
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '14pt',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '8pt',
  },
  th: {
    textAlign: 'left' as const,
    padding: '6pt 8pt',
    borderBottom: `1pt solid ${BORDER_SUBTLE}`,
    fontSize: '7pt',
    fontWeight: 700,
    color: TEXT_TERTIARY,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  },
  td: {
    padding: '8pt',
    borderBottom: `1pt solid ${BORDER_SUBTLE}`,
    color: TEXT_SECONDARY,
    verticalAlign: 'top' as const,
  },
  tdProductName: {
    fontWeight: 600,
    color: TEXT_PRIMARY,
  },
  tdCategory: {
    fontSize: '7pt',
    color: TEXT_TERTIARY,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  },
  tdRegNo: {
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    color: TEXT_PRIMARY,
    fontVariantNumeric: 'tabular-nums',
  },
  tdDate: {
    fontVariantNumeric: 'tabular-nums',
    color: TEXT_SECONDARY,
  },
  tdNotes: {
    fontSize: '7.5pt',
    fontStyle: 'italic',
    color: TEXT_TERTIARY,
    marginTop: '3pt',
  },

  statusPill: {
    display: 'inline-block',
    padding: '2pt 8pt',
    borderRadius: '999pt',
    fontSize: '7pt',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },

  pageFooter: {
    position: 'absolute',
    bottom: '14mm',
    left: '18mm',
    right: '18mm',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '7pt',
    color: TEXT_MUTED,
    paddingTop: '8pt',
    borderTop: `1pt solid ${BORDER_SUBTLE}`,
  },
};

function StatBox({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: number;
  emphasis?: 'alert' | 'danger';
}) {
  const valueStyle =
    emphasis === 'danger'
      ? s.statValueDanger
      : emphasis === 'alert'
        ? s.statValueAlert
        : s.statValue;
  return (
    <div style={s.statBox}>
      <p style={s.statLabel}>{label}</p>
      <p style={valueStyle}>{value}</p>
    </div>
  );
}

function Capa({ data }: { data: DossieData }) {
  const stats = data.stats;
  const generatedLabel = data.generatedAtLabel ?? new Date().toLocaleDateString('pt-BR');

  return (
    <section style={s.capa}>
      <div>
        <p style={s.capaEyebrow}>Compliance regulatório</p>
        <h1 style={s.capaTitulo}>
          Dossiê
          <br />
          regulatório
        </h1>
        <p style={s.capaSubtitle}>
          Snapshot completo dos registros MAPA, ANVISA, IBAMA e estaduais — para auditoria externa,
          renovação e diligência B2B.
        </p>

        {stats && (
          <div style={s.statsGrid}>
            <StatBox label="Total de registros" value={stats.total} />
            <StatBox label="Ativos" value={stats.active} />
            <StatBox
              label="Vencem em 30 dias"
              value={stats.expiringIn30d}
              emphasis={stats.expiringIn30d > 0 ? 'alert' : undefined}
            />
            <StatBox
              label="Expirados"
              value={stats.expired}
              emphasis={stats.expired > 0 ? 'danger' : undefined}
            />
          </div>
        )}
      </div>

      <div style={s.capaFooter}>
        <p style={s.capaFooterTenant}>{data.tenantName}</p>
        <p style={s.capaFooterMeta}>
          Gerado em {generatedLabel}
          <br />
          Documento interno · Versão de auditoria
        </p>
      </div>
    </section>
  );
}

function AuthorityBlock({
  data,
  authority,
  registrations,
}: {
  data: DossieData;
  authority: DossieRegistration['authority'];
  registrations: DossieRegistration[];
}) {
  return (
    <section style={s.page}>
      <header style={s.pageHeader}>
        <span style={s.pageHeaderTenant}>{data.tenantName}</span>
        <span style={s.pageHeaderMeta}>Dossiê regulatório · {AUTHORITY_LABELS[authority]}</span>
      </header>

      <div style={s.authorityBlock}>
        <h2 style={s.authorityTitle}>{AUTHORITY_LABELS[authority]}</h2>
        <p style={s.authorityCount}>
          {registrations.length} registro{registrations.length === 1 ? '' : 's'}
        </p>

        <table style={s.table}>
          <thead>
            <tr>
              <th style={{ ...s.th, width: '32%' }}>Produto</th>
              <th style={{ ...s.th, width: '20%' }}>Registro</th>
              <th style={{ ...s.th, width: '14%' }}>Emissão</th>
              <th style={{ ...s.th, width: '14%' }}>Vencimento</th>
              <th style={{ ...s.th, width: '20%' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg, idx) => {
              const sc = statusColors(reg.status);
              return (
                <tr key={`${authority}-${reg.registrationNo}-${idx}`}>
                  <td style={s.td}>
                    <div style={s.tdProductName}>{reg.productName}</div>
                    {reg.productCategory && <div style={s.tdCategory}>{reg.productCategory}</div>}
                    {reg.notes && <div style={s.tdNotes}>{reg.notes}</div>}
                  </td>
                  <td style={{ ...s.td, ...s.tdRegNo }}>{reg.registrationNo}</td>
                  <td style={{ ...s.td, ...s.tdDate }}>{formatDate(reg.issuedAt)}</td>
                  <td style={{ ...s.td, ...s.tdDate }}>{formatDate(reg.expiresAt)}</td>
                  <td style={s.td}>
                    <span
                      style={{
                        ...s.statusPill,
                        background: sc.bg,
                        border: `1pt solid ${sc.border}`,
                        color: sc.color,
                      }}
                    >
                      {STATUS_LABELS[reg.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer style={s.pageFooter}>
        <span>{data.tenantName} · Dossiê regulatório</span>
        <span>{AUTHORITY_LABELS[authority]}</span>
      </footer>
    </section>
  );
}

export function Dossie({ data }: { data: DossieData }) {
  // Agrupa registros por autoridade.
  const byAuthority = new Map<DossieRegistration['authority'], DossieRegistration[]>();
  for (const reg of data.registrations) {
    const list = byAuthority.get(reg.authority) ?? [];
    list.push(reg);
    byAuthority.set(reg.authority, list);
  }

  // Ordem fixa de autoridades — MAPA primeiro (mais comum em fertilizantes).
  const orderedAuthorities: DossieRegistration['authority'][] = [
    'MAPA',
    'ANVISA',
    'IBAMA',
    'STATE',
    'OTHER',
  ];

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <title>{`Dossiê regulatório — ${data.tenantName}`}</title>
        <style>{`
          @page { size: A4; margin: 0; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        `}</style>
      </head>
      <body style={s.body}>
        <Capa data={data} />
        {orderedAuthorities.map((authority) => {
          const regs = byAuthority.get(authority);
          if (!regs || regs.length === 0) return null;
          return (
            <AuthorityBlock
              key={authority}
              data={data}
              authority={authority}
              registrations={regs}
            />
          );
        })}
      </body>
    </html>
  );
}
