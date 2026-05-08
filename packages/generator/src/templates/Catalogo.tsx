// packages/generator/src/templates/Catalogo.tsx
// Catálogo consolidado: capa Argho + sumário + 1 página resumida por produto.
//
// Reusa palette/typography do FichaTecnica para consistência de marca.
// CADA produto vira uma página A4 via `pageBreakBefore: 'always'`.
//
// Quem precisa de detalhe técnico completo baixa a ficha técnica individual.
// Este catálogo é a "vitrine" que comercial/marketing entrega pra distribuidores
// e prospects ("manda o catálogo Argho atualizado").

import type { CSSProperties } from 'react';
import type { CatalogoData, CatalogoProduto } from '../types.js';

// ── Tokens compartilhados com FichaTecnica ──────────────────────────────────
const GREEN = '#166534';
const TEXT_PRIMARY = '#0f1117';
const TEXT_SECONDARY = '#374151';
const TEXT_TERTIARY = '#6b7280';
const TEXT_MUTED = '#9ca3af';
const BORDER_SUBTLE = '#f3f4f6';
const GREEN_LIGHT_BG = '#f0fdf4';
const GREEN_LIGHT_BORDER = '#bbf7d0';

// ── Labels (espelha FichaTecnica) ───────────────────────────────────────────
const MACRO_LABELS: Record<string, string> = {
  N: 'N',
  P2O5: 'P₂O₅',
  K2O: 'K₂O',
  Ca: 'Ca',
  Mg: 'Mg',
  S: 'S',
};

const PACKAGING_TYPE_LABELS: Record<string, string> = {
  bag: 'Saco',
  ibc: 'IBC',
  drum: 'Tambor',
  bottle: 'Frasco',
  other: 'Outro',
};

const UNIT_LABELS: Record<string, string> = {
  kg: 'kg/ha',
  l: 'L/ha',
  g: 'g/ha',
  ml: 'mL/ha',
};

function packagingLabel(p: CatalogoProduto['packaging'][number]): string {
  const type = PACKAGING_TYPE_LABELS[p.type] ?? p.type;
  if (p.weightKg) return `${type} ${p.weightKg} kg`;
  if (p.volumeL) return `${type} ${p.volumeL} L`;
  return type;
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
    pageBreakAfter: 'always',
  },

  // ── Capa ──────────────────────────────────────────────────────────────────
  capaWrap: {
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
    fontSize: '52pt',
    fontWeight: 700,
    color: TEXT_PRIMARY,
    letterSpacing: '-0.04em',
    lineHeight: 1.0,
    marginTop: '24pt',
    marginBottom: '16pt',
  },
  capaTituloAccent: {
    color: GREEN,
  },
  capaSubtitulo: {
    fontSize: '14pt',
    color: TEXT_SECONDARY,
    lineHeight: 1.5,
    maxWidth: '140mm',
  },
  capaFooterBlock: {
    borderTop: `2pt solid ${GREEN}`,
    paddingTop: '12pt',
  },
  capaFooterTenant: {
    fontSize: '10pt',
    fontWeight: 700,
    color: GREEN,
    letterSpacing: '-0.01em',
  },
  capaFooterMeta: {
    fontSize: '8pt',
    color: TEXT_TERTIARY,
    marginTop: '4pt',
  },

  // ── Sumário ───────────────────────────────────────────────────────────────
  sumarioH1: {
    fontSize: '7pt',
    fontWeight: 700,
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: '16pt',
  },
  sumarioBigTitle: {
    fontSize: '24pt',
    fontWeight: 700,
    color: TEXT_PRIMARY,
    letterSpacing: '-0.03em',
    marginBottom: '24pt',
  },
  sumarioGrupo: {
    marginBottom: '20pt',
  },
  sumarioGrupoTitulo: {
    fontSize: '8pt',
    fontWeight: 700,
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '8pt',
    paddingBottom: '4pt',
    borderBottom: `1px solid #d1fae5`,
  },
  sumarioItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '5pt 0',
    borderBottom: `1px solid ${BORDER_SUBTLE}`,
    fontSize: '10pt',
  },
  sumarioItemNome: {
    color: TEXT_PRIMARY,
    fontWeight: 500,
  },
  sumarioItemPagina: {
    color: TEXT_TERTIARY,
    fontVariantNumeric: 'tabular-nums',
  },

  // ── Header de página de produto ───────────────────────────────────────────
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: '8pt',
    borderBottom: `1.5pt solid ${GREEN}`,
    marginBottom: '16pt',
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

  // ── Conteúdo da página de produto ─────────────────────────────────────────
  produtoCategoria: {
    fontSize: '7pt',
    fontWeight: 700,
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: '6pt',
  },
  produtoNome: {
    fontSize: '28pt',
    fontWeight: 700,
    color: TEXT_PRIMARY,
    letterSpacing: '-0.03em',
    lineHeight: 1.0,
    marginBottom: '8pt',
  },
  produtoTagline: {
    fontSize: '11pt',
    color: TEXT_SECONDARY,
    fontStyle: 'italic',
    marginBottom: '12pt',
    maxWidth: '160mm',
  },
  produtoDescription: {
    fontSize: '9.5pt',
    color: '#4b5563',
    lineHeight: 1.6,
    marginBottom: '16pt',
    maxWidth: '160mm',
  },
  mapaBadge: {
    display: 'inline-block',
    padding: '3pt 8pt',
    background: GREEN_LIGHT_BG,
    border: `1px solid ${GREEN_LIGHT_BORDER}`,
    borderRadius: '3pt',
    fontSize: '7.5pt',
    fontWeight: 600,
    color: GREEN,
    marginBottom: '20pt',
  },

  section: {
    marginBottom: '16pt',
  },
  sectionTitle: {
    fontSize: '7pt',
    fontWeight: 700,
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '8pt',
    paddingBottom: '3pt',
    borderBottom: `1px solid #d1fae5`,
  },

  // Composição em linha resumida (pra economizar espaço no catálogo)
  compRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4pt 12pt',
  },
  compChip: {
    display: 'inline-flex',
    gap: '4pt',
    padding: '3pt 8pt',
    border: `1px solid ${BORDER_SUBTLE}`,
    borderRadius: '3pt',
    fontSize: '8.5pt',
  },
  compChipLabel: {
    color: TEXT_SECONDARY,
  },
  compChipValue: {
    fontWeight: 700,
    color: TEXT_PRIMARY,
    fontVariantNumeric: 'tabular-nums',
  },

  packagingList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6pt',
  },
  packagingItem: {
    padding: '4pt 10pt',
    border: `1px solid ${BORDER_SUBTLE}`,
    borderRadius: '3pt',
    fontSize: '8.5pt',
    color: TEXT_SECONDARY,
  },

  applicationsTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '8.5pt',
  },
  applicationsTh: {
    textAlign: 'left' as const,
    padding: '4pt 6pt 6pt',
    borderBottom: `1px solid ${BORDER_SUBTLE}`,
    fontSize: '7pt',
    fontWeight: 700,
    color: TEXT_TERTIARY,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  },
  applicationsTd: {
    padding: '4pt 6pt',
    borderBottom: `1px solid ${BORDER_SUBTLE}`,
    color: TEXT_SECONDARY,
  },
  applicationsTdDose: {
    fontWeight: 600,
    color: TEXT_PRIMARY,
    fontVariantNumeric: 'tabular-nums',
  },

  // ── Rodapé página ─────────────────────────────────────────────────────────
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
    borderTop: `1px solid ${BORDER_SUBTLE}`,
  },
};

// ───────────────────────────────────────────────────────────────────────────
// Capa
// ───────────────────────────────────────────────────────────────────────────
function Capa({ data }: { data: CatalogoData }) {
  return (
    <section style={s.capaWrap}>
      <div>
        <p style={s.capaEyebrow}>Catálogo · Safra {data.year ?? new Date().getFullYear()}</p>
        <h1 style={s.capaTitulo}>
          Portfólio
          <br />
          <span style={s.capaTituloAccent}>{data.tenantName}</span>
        </h1>
        {data.subtitle && <p style={s.capaSubtitulo}>{data.subtitle}</p>}
      </div>

      <div style={s.capaFooterBlock}>
        <p style={s.capaFooterTenant}>{data.tenantName}</p>
        <p style={s.capaFooterMeta}>
          {data.produtos.length} produto{data.produtos.length === 1 ? '' : 's'} · gerado em{' '}
          {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Sumário
// ───────────────────────────────────────────────────────────────────────────
function Sumario({ data }: { data: CatalogoData }) {
  // Agrupa por categoria; produtos sem categoria caem em "Outros".
  const grouped = new Map<string, CatalogoProduto[]>();
  for (const produto of data.produtos) {
    const key = produto.categoryName ?? 'Outros';
    const list = grouped.get(key) ?? [];
    list.push(produto);
    grouped.set(key, list);
  }

  // Página inicial após capa (1) + sumário (2) = produtos começam na 3.
  let runningPage = 3;

  return (
    <section style={s.page}>
      <p style={s.sumarioH1}>Sumário</p>
      <h2 style={s.sumarioBigTitle}>Produtos no portfólio</h2>

      {Array.from(grouped.entries()).map(([categoria, produtos]) => (
        <div key={categoria} style={s.sumarioGrupo}>
          <p style={s.sumarioGrupoTitulo}>{categoria}</p>
          {produtos.map((produto) => {
            const pagina = runningPage++;
            return (
              <div key={produto.id} style={s.sumarioItem}>
                <span style={s.sumarioItemNome}>{produto.name}</span>
                <span style={s.sumarioItemPagina}>{pagina}</span>
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Página de produto (1 produto = 1 página)
// ───────────────────────────────────────────────────────────────────────────
function ProdutoPage({ produto, data }: { produto: CatalogoProduto; data: CatalogoData }) {
  const macros = produto.composition.macros ?? {};
  const micros = produto.composition.micros ?? {};
  const others = produto.composition.others ?? {};
  const hasComposition =
    Object.keys(macros).length + Object.keys(micros).length + Object.keys(others).length > 0;

  return (
    <section style={s.page}>
      <header style={s.pageHeader}>
        <span style={s.pageHeaderTenant}>{data.tenantName}</span>
        <span style={s.pageHeaderMeta}>
          Catálogo · Safra {data.year ?? new Date().getFullYear()}
        </span>
      </header>

      {produto.categoryName && <p style={s.produtoCategoria}>{produto.categoryName}</p>}
      <h2 style={s.produtoNome}>{produto.name}</h2>
      {produto.tagline && <p style={s.produtoTagline}>{produto.tagline}</p>}
      {produto.description && <p style={s.produtoDescription}>{produto.description}</p>}

      {produto.mapaRegistration && <span style={s.mapaBadge}>MAPA {produto.mapaRegistration}</span>}

      {hasComposition && (
        <div style={s.section}>
          <p style={s.sectionTitle}>Composição garantida</p>
          <div style={s.compRow}>
            {Object.entries(macros).map(([k, v]) => (
              <span key={`macro-${k}`} style={s.compChip}>
                <span style={s.compChipLabel}>{MACRO_LABELS[k] ?? k}</span>
                <span style={s.compChipValue}>{v}%</span>
              </span>
            ))}
            {Object.entries(micros).map(([k, v]) => (
              <span key={`micro-${k}`} style={s.compChip}>
                <span style={s.compChipLabel}>{k}</span>
                <span style={s.compChipValue}>{v}%</span>
              </span>
            ))}
            {Object.entries(others).map(([k, v]) => (
              <span key={`other-${k}`} style={s.compChip}>
                <span style={s.compChipLabel}>{k}</span>
                <span style={s.compChipValue}>{v}%</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {produto.packaging.length > 0 && (
        <div style={s.section}>
          <p style={s.sectionTitle}>Apresentações</p>
          <div style={s.packagingList}>
            {produto.packaging.map((p, i) => (
              <span key={`pack-${produto.id}-${i}`} style={s.packagingItem}>
                {packagingLabel(p)}
              </span>
            ))}
          </div>
        </div>
      )}

      {produto.applications.length > 0 && (
        <div style={s.section}>
          <p style={s.sectionTitle}>Indicações</p>
          <table style={s.applicationsTable}>
            <thead>
              <tr>
                <th style={s.applicationsTh}>Cultura</th>
                <th style={s.applicationsTh}>Estágio</th>
                <th style={s.applicationsTh}>Dose</th>
              </tr>
            </thead>
            <tbody>
              {produto.applications.map((app, i) => (
                <tr key={`app-${produto.id}-${i}`}>
                  <td style={s.applicationsTd}>{app.crop}</td>
                  <td style={s.applicationsTd}>{app.stage ?? '—'}</td>
                  <td style={{ ...s.applicationsTd, ...s.applicationsTdDose }}>
                    {app.dosePerHa} {UNIT_LABELS[app.unit] ?? app.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer style={s.pageFooter}>
        <span>{data.tenantName}</span>
        <span>
          Catálogo Safra {data.year ?? new Date().getFullYear()} · {produto.slug}
        </span>
      </footer>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Documento completo
// ───────────────────────────────────────────────────────────────────────────
export function Catalogo({ data }: { data: CatalogoData }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <title>{`Catálogo ${data.tenantName} · ${data.year ?? new Date().getFullYear()}`}</title>
        <style>{`
          @page { size: A4; margin: 0; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        `}</style>
      </head>
      <body style={s.body}>
        <Capa data={data} />
        <Sumario data={data} />
        {data.produtos.map((produto) => (
          <ProdutoPage key={produto.id} produto={produto} data={data} />
        ))}
      </body>
    </html>
  );
}
