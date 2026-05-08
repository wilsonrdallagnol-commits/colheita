// packages/generator/src/templates/Proposta.tsx
//
// Camada 7 mov 3 — Proposta Comercial em PDF.
//
// Documento que liga CRM (lead) ao PIM (produtos selecionados) e ao Generator.
// Estrutura:
//   - Capa: numero da proposta + cliente + emissor + data + cultura/area
//   - Tabela de itens: produto + dose + qty + preco unit + total + MAPA
//   - Sumario financeiro: subtotal + desconto + total liquido
//   - Termos de pagamento + observacoes
//   - Validade + assinatura do vendedor

import type { CSSProperties } from 'react';
import type { PropostaData, PropostaItem } from '../types.js';

const GREEN = '#166534';
const TEXT_PRIMARY = '#0f1117';
const TEXT_SECONDARY = '#374151';
const TEXT_TERTIARY = '#6b7280';
const TEXT_MUTED = '#9ca3af';
const BORDER_SUBTLE = '#f3f4f6';
const GREEN_LIGHT_BG = '#f0fdf4';

function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcSubtotal(items: PropostaItem[]): number {
  return items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
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
  page: {
    width: '210mm',
    minHeight: '297mm',
    padding: '20mm 18mm 26mm',
    margin: '0 auto',
    position: 'relative',
    boxSizing: 'border-box',
  },

  // Header com numero + tenant + emissao
  topbar: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '16pt',
    paddingBottom: '12pt',
    borderBottom: `2pt solid ${GREEN}`,
    marginBottom: '20pt',
  },
  tenantBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  tenantName: {
    fontSize: '13pt',
    fontWeight: 700,
    color: GREEN,
    letterSpacing: '-0.02em',
  },
  proposalLabel: {
    fontSize: '8pt',
    fontWeight: 700,
    color: TEXT_TERTIARY,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginTop: '2pt',
  },
  proposalNumber: {
    textAlign: 'right' as const,
    fontSize: '11pt',
    fontWeight: 700,
    color: TEXT_PRIMARY,
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
  },
  issuedAt: {
    textAlign: 'right' as const,
    fontSize: '8.5pt',
    color: TEXT_TERTIARY,
    marginTop: '2pt',
  },

  // Hero — cliente + cultura/area
  hero: {
    background: GREEN_LIGHT_BG,
    border: `1pt solid ${BORDER_SUBTLE}`,
    borderRadius: '4pt',
    padding: '14pt 16pt',
    marginBottom: '20pt',
  },
  heroEyebrow: {
    fontSize: '7pt',
    fontWeight: 700,
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '6pt',
  },
  heroClientName: {
    fontSize: '16pt',
    fontWeight: 700,
    color: TEXT_PRIMARY,
    letterSpacing: '-0.02em',
    marginBottom: '2pt',
  },
  heroClientMeta: {
    fontSize: '9pt',
    color: TEXT_SECONDARY,
    marginBottom: '8pt',
  },
  heroContext: {
    display: 'flex',
    gap: '24pt',
    paddingTop: '8pt',
    borderTop: `1pt solid ${BORDER_SUBTLE}`,
    marginTop: '8pt',
  },
  contextBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  contextLabel: {
    fontSize: '7pt',
    fontWeight: 700,
    color: TEXT_TERTIARY,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '3pt',
  },
  contextValue: {
    fontSize: '11pt',
    fontWeight: 600,
    color: TEXT_PRIMARY,
    fontVariantNumeric: 'tabular-nums',
  },

  // Section
  sectionTitle: {
    fontSize: '7pt',
    fontWeight: 700,
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '8pt',
    paddingBottom: '3pt',
    borderBottom: `1pt solid #d1fae5`,
  },

  // Tabela de itens
  itemsTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '8.5pt',
    marginBottom: '16pt',
  },
  th: {
    textAlign: 'left' as const,
    padding: '6pt 8pt',
    borderBottom: `1.5pt solid ${GREEN}`,
    fontSize: '7pt',
    fontWeight: 700,
    color: TEXT_TERTIARY,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  },
  thRight: {
    textAlign: 'right' as const,
    padding: '6pt 8pt',
    borderBottom: `1.5pt solid ${GREEN}`,
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
  tdRight: {
    padding: '8pt',
    borderBottom: `1pt solid ${BORDER_SUBTLE}`,
    color: TEXT_PRIMARY,
    textAlign: 'right' as const,
    fontVariantNumeric: 'tabular-nums',
    verticalAlign: 'top' as const,
  },
  tdProduct: {
    fontWeight: 600,
    color: TEXT_PRIMARY,
    marginBottom: '2pt',
  },
  tdMeta: {
    fontSize: '7.5pt',
    color: TEXT_TERTIARY,
  },

  // Totals
  totalsBlock: {
    width: '50%',
    marginLeft: 'auto',
    marginBottom: '20pt',
  },
  totalRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    padding: '4pt 8pt',
    fontSize: '9pt',
    color: TEXT_SECONDARY,
  },
  totalGrand: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    padding: '8pt',
    fontSize: '12pt',
    fontWeight: 700,
    color: TEXT_PRIMARY,
    background: GREEN_LIGHT_BG,
    borderRadius: '3pt',
    marginTop: '4pt',
  },

  // Termos
  termsBlock: {
    marginBottom: '16pt',
  },
  paragraph: {
    fontSize: '9pt',
    color: TEXT_SECONDARY,
    lineHeight: 1.6,
    margin: 0,
  },

  // Footer
  signature: {
    marginTop: '36pt',
    paddingTop: '12pt',
    borderTop: `1pt solid ${BORDER_SUBTLE}`,
    fontSize: '8.5pt',
    color: TEXT_SECONDARY,
  },
  signatureName: {
    fontSize: '10pt',
    fontWeight: 600,
    color: TEXT_PRIMARY,
    marginBottom: '2pt',
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

export function Proposta({ data }: { data: PropostaData }) {
  const subtotal = calcSubtotal(data.items);
  const discountPct = data.discountPercent ?? 0;
  const discount = (subtotal * discountPct) / 100;
  const total = subtotal - discount;

  const clientLocation = [data.clientCity, data.clientState].filter(Boolean).join('/');
  const clientMetaParts = [data.clientCompany, clientLocation || null, data.clientCpfCnpj].filter(
    Boolean,
  );

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <title>{`Proposta ${data.proposalNumber} — ${data.tenantName}`}</title>
        <style>{`
          @page { size: A4; margin: 0; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        `}</style>
      </head>
      <body style={s.body}>
        <section style={s.page}>
          {/* Topbar */}
          <header style={s.topbar}>
            <div style={s.tenantBlock}>
              <span style={s.tenantName}>{data.tenantName}</span>
              <span style={s.proposalLabel}>Proposta comercial</span>
            </div>
            <div>
              <p style={s.proposalNumber}>{data.proposalNumber}</p>
              <p style={s.issuedAt}>
                Emitida em {data.issuedAtLabel}
                {data.validUntilLabel ? ` · ${data.validUntilLabel}` : ''}
              </p>
            </div>
          </header>

          {/* Hero — cliente */}
          <section style={s.hero}>
            <p style={s.heroEyebrow}>Cliente</p>
            <h1 style={s.heroClientName}>{data.clientName}</h1>
            {clientMetaParts.length > 0 && (
              <p style={s.heroClientMeta}>{clientMetaParts.join(' · ')}</p>
            )}

            {(data.cultura || data.areaHectares) && (
              <div style={s.heroContext}>
                {data.cultura && (
                  <div style={s.contextBlock}>
                    <span style={s.contextLabel}>Cultura</span>
                    <span style={s.contextValue}>{data.cultura}</span>
                  </div>
                )}
                {data.areaHectares != null && (
                  <div style={s.contextBlock}>
                    <span style={s.contextLabel}>Área</span>
                    <span style={s.contextValue}>
                      {data.areaHectares.toLocaleString('pt-BR')} ha
                    </span>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Itens */}
          <h2 style={s.sectionTitle}>Itens da proposta</h2>
          <table style={s.itemsTable}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: '46%' }}>Produto</th>
                <th style={{ ...s.thRight, width: '14%' }}>Quantidade</th>
                <th style={{ ...s.thRight, width: '18%' }}>Preço unit.</th>
                <th style={{ ...s.thRight, width: '22%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice;
                const metaParts = [
                  item.npkLabel,
                  item.packaging,
                  item.dose ? `Dose: ${item.dose}` : null,
                  item.mapaRegistration ? `MAPA ${item.mapaRegistration}` : null,
                ].filter(Boolean);
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable list within proposta
                  <tr key={idx}>
                    <td style={s.td}>
                      <div style={s.tdProduct}>{item.productName}</div>
                      {item.tagline && (
                        <div style={{ ...s.tdMeta, fontStyle: 'italic', marginBottom: '2pt' }}>
                          {item.tagline}
                        </div>
                      )}
                      {metaParts.length > 0 && <div style={s.tdMeta}>{metaParts.join(' · ')}</div>}
                    </td>
                    <td style={s.tdRight}>
                      {item.quantity.toLocaleString('pt-BR')}
                      {item.unit ? ` ${item.unit}` : ''}
                    </td>
                    <td style={s.tdRight}>{formatBRL(item.unitPrice)}</td>
                    <td style={{ ...s.tdRight, fontWeight: 600 }}>{formatBRL(lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div style={s.totalsBlock}>
            <div style={s.totalRow}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: TEXT_PRIMARY }}>{formatBRL(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div style={s.totalRow}>
                <span>Desconto ({discountPct}%)</span>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>− {formatBRL(discount)}</span>
              </div>
            )}
            <div style={s.totalGrand}>
              <span>Total</span>
              <span>{formatBRL(total)}</span>
            </div>
          </div>

          {/* Termos */}
          {data.paymentTerms && (
            <div style={s.termsBlock}>
              <h2 style={s.sectionTitle}>Condições de pagamento</h2>
              <p style={s.paragraph}>{data.paymentTerms}</p>
            </div>
          )}

          {data.notes && (
            <div style={s.termsBlock}>
              <h2 style={s.sectionTitle}>Observações</h2>
              <p style={{ ...s.paragraph, whiteSpace: 'pre-wrap' as const }}>{data.notes}</p>
            </div>
          )}

          {/* Assinatura */}
          {(data.salesPersonName || data.salesPersonEmail) && (
            <div style={s.signature}>
              {data.salesPersonName && <p style={s.signatureName}>{data.salesPersonName}</p>}
              <p style={{ margin: 0, fontSize: '8.5pt', color: TEXT_TERTIARY }}>
                {data.salesPersonEmail ? `${data.salesPersonEmail} · ` : ''}
                {data.tenantName}
              </p>
            </div>
          )}

          {/* Footer */}
          <footer style={s.pageFooter}>
            <span>
              {data.tenantName} · Proposta {data.proposalNumber}
            </span>
            <span>{data.issuedAtLabel}</span>
          </footer>
        </section>
      </body>
    </html>
  );
}
