// packages/generator/src/templates/FichaTecnica.tsx
import type { CSSProperties } from 'react';
import type { FichaTecnicaData } from '../types.js';

const MACRO_LABELS: Record<string, string> = {
  N: 'Nitrogênio (N)',
  P2O5: 'Fósforo (P₂O₅)',
  K2O: 'Potássio (K₂O)',
  Ca: 'Cálcio (Ca)',
  Mg: 'Magnésio (Mg)',
  S: 'Enxofre (S)',
};

const MICRO_LABELS: Record<string, string> = {
  B: 'Boro (B)',
  Cu: 'Cobre (Cu)',
  Fe: 'Ferro (Fe)',
  Mn: 'Manganês (Mn)',
  Mo: 'Molibdênio (Mo)',
  Zn: 'Zinco (Zn)',
  Co: 'Cobalto (Co)',
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

// ---------------------------------------------------------------------------
// Shared style tokens
// ---------------------------------------------------------------------------
const GREEN = '#166534';
const TEXT_PRIMARY = '#0f1117';
const TEXT_SECONDARY = '#374151';
const TEXT_TERTIARY = '#6b7280';
const TEXT_MUTED = '#9ca3af';
const BORDER = '#e5e7eb';
const BORDER_SUBTLE = '#f3f4f6';
const SURFACE_SUBTLE = '#f9fafb';
const GREEN_LIGHT_BG = '#f0fdf4';
const GREEN_LIGHT_BORDER = '#bbf7d0';

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
    padding: '16mm 16mm 24mm',
    margin: '0 auto',
    position: 'relative',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: '12pt',
    borderBottom: `2px solid ${GREEN}`,
    marginBottom: '20pt',
  },
  headerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10pt',
  },
  tenantName: {
    fontSize: '11pt',
    fontWeight: 700,
    color: GREEN,
    letterSpacing: '-0.02em',
  },
  docLabel: {
    fontSize: '7.5pt',
    fontWeight: 600,
    color: TEXT_TERTIARY,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    textAlign: 'right',
    lineHeight: 1.6,
  },
  productName: {
    fontSize: '22pt',
    fontWeight: 700,
    color: TEXT_PRIMARY,
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    marginBottom: '4pt',
  },
  productTagline: {
    fontSize: '10.5pt',
    color: TEXT_SECONDARY,
    fontStyle: 'italic',
    marginBottom: '8pt',
  },
  productDescription: {
    fontSize: '9pt',
    color: '#4b5563',
    lineHeight: 1.6,
    maxWidth: '160mm',
    marginBottom: '4pt',
  },
  mapaBadge: {
    display: 'inline-block',
    marginTop: '8pt',
    padding: '2pt 6pt',
    background: GREEN_LIGHT_BG,
    border: `1px solid ${GREEN_LIGHT_BORDER}`,
    borderRadius: '3pt',
    fontSize: '7.5pt',
    fontWeight: 600,
    color: GREEN,
  },
  section: {
    marginBottom: '16pt',
  },
  sectionTitle: {
    fontSize: '7pt',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: GREEN,
    marginBottom: '8pt',
    paddingBottom: '3pt',
    borderBottom: `1px solid #d1fae5`,
  },
  compositionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6pt 20pt',
  },
  compBlockTitle: {
    fontSize: '7pt',
    fontWeight: 700,
    color: TEXT_TERTIARY,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '5pt',
    marginTop: '4pt',
  },
  compRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '2.5pt 0',
    borderBottom: `1px solid ${BORDER_SUBTLE}`,
  },
  compLabel: {
    fontSize: '8.5pt',
    color: TEXT_SECONDARY,
  },
  compValue: {
    fontSize: '8.5pt',
    fontWeight: 600,
    color: TEXT_PRIMARY,
    fontVariantNumeric: 'tabular-nums',
  },
  microbialSpeciesLabel: {
    fontSize: '8.5pt',
    fontStyle: 'italic',
    color: TEXT_PRIMARY,
  },
  microbialNote: {
    marginTop: '8pt',
    fontSize: '7pt',
    color: TEXT_TERTIARY,
    lineHeight: 1.5,
  },
  specsRow: {
    display: 'flex',
    padding: '4pt 0',
    borderBottom: `1px solid ${BORDER_SUBTLE}`,
    gap: '12pt',
  },
  specsKey: {
    fontSize: '8.5pt',
    color: TEXT_SECONDARY,
    fontWeight: 500,
    minWidth: '45%',
    flexShrink: 0,
  },
  specsVal: {
    fontSize: '8.5pt',
    color: TEXT_PRIMARY,
  },
  packagingList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6pt',
  },
  packagingItem: {
    padding: '4pt 10pt',
    border: `1px solid ${BORDER}`,
    borderRadius: '4pt',
    fontSize: '8.5pt',
    color: TEXT_SECONDARY,
  },
  appTableWrap: {
    width: '100%',
  },
  appTableHead: {
    display: 'flex',
    background: SURFACE_SUBTLE,
    padding: '4pt 8pt',
    borderBottom: `1px solid ${BORDER}`,
    gap: '12pt',
  },
  appTableHeadCell: {
    fontSize: '7pt',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    color: TEXT_TERTIARY,
    flex: 1,
  },
  appTableRow: {
    display: 'flex',
    padding: '4pt 8pt',
    borderBottom: `1px solid ${BORDER_SUBTLE}`,
    gap: '12pt',
  },
  appTableCell: {
    fontSize: '8.5pt',
    color: TEXT_SECONDARY,
    flex: 1,
  },
  appTableCellBold: {
    fontSize: '8.5pt',
    fontWeight: 600,
    color: TEXT_PRIMARY,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: '10mm',
    left: '16mm',
    right: '16mm',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '6pt',
    borderTop: `1px solid ${BORDER}`,
  },
  footerText: {
    fontSize: '7pt',
    color: TEXT_MUTED,
  },
};

interface Props {
  data: FichaTecnicaData;
}

export function FichaTecnica({ data }: Props) {
  const hasComposition =
    Object.keys(data.composition.macros ?? {}).length > 0 ||
    Object.keys(data.composition.micros ?? {}).length > 0 ||
    Object.keys(data.composition.others ?? {}).length > 0;

  const hasSpecs = Object.keys(data.technicalSpecs).length > 0;
  const hasPackaging = data.packaging.length > 0;
  const hasApplications = data.applications.length > 0;
  const year = data.year ?? new Date().getFullYear();

  // Biológicos (modelo neutro MAPA): composition.others traz a espécie declarada
  // com valor placeholder 1 — declara-se o nome científico, NUNCA uma porcentagem.
  // Espelha a detecção do portal (apps/portal/.../produtos/[slug]/page.tsx) e as
  // regras de apps/website/docs/biologicos-compliance.md.
  const isMicrobialComplex =
    (data.technicalSpecs?.product_type as string | undefined) === 'Complexo microbiológico';
  const microbialSpecies = isMicrobialComplex
    ? [
        ...Object.keys(data.composition.macros ?? {}),
        ...Object.keys(data.composition.micros ?? {}),
        ...Object.keys(data.composition.others ?? {}),
      ]
    : [];

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`${data.productName} — Ficha Técnica`}</title>
      </head>
      <body style={s.body}>
        <div style={s.page}>
          {/* Header */}
          <header style={s.header}>
            <div style={s.headerBrand}>
              {data.tenantLogoUrl ? (
                <img
                  src={data.tenantLogoUrl}
                  alt={data.tenantName}
                  style={{ height: '32pt', width: 'auto' }}
                />
              ) : null}
              <span style={s.tenantName}>{data.tenantName}</span>
            </div>
            <div style={s.docLabel}>
              Ficha Técnica
              <br />
              {year}
            </div>
          </header>

          {/* Product hero */}
          <section style={{ marginBottom: '18pt' }}>
            <h1 style={s.productName}>{data.productName}</h1>
            {data.tagline ? <p style={s.productTagline}>{data.tagline}</p> : null}
            {data.description ? <p style={s.productDescription}>{data.description}</p> : null}
            {data.mapaRegistration ? (
              <span style={s.mapaBadge}>MAPA N° {data.mapaRegistration}</span>
            ) : null}
          </section>

          {/* Composição — biológicos (modelo neutro) usam renderer alternativo */}
          {hasComposition && isMicrobialComplex && (
            <section style={s.section}>
              <h2 style={s.sectionTitle}>Composição Microbiológica</h2>
              <div>
                {microbialSpecies.map((species) => (
                  <div key={species} style={s.compRow}>
                    <span style={s.microbialSpeciesLabel}>{species}</span>
                  </div>
                ))}
              </div>
              <p style={s.microbialNote}>
                Composição microbiológica declarada conforme padrão Argho de formulação.
              </p>
            </section>
          )}

          {/* Composição garantida — minerais/organominerais com % */}
          {hasComposition && !isMicrobialComplex && (
            <section style={s.section}>
              <h2 style={s.sectionTitle}>Composição Garantida</h2>
              <div style={s.compositionGrid}>
                {Object.keys(data.composition.macros ?? {}).length > 0 && (
                  <div>
                    <p style={s.compBlockTitle}>Macronutrientes (%)</p>
                    {Object.entries(data.composition.macros ?? {}).map(([key, value]) => (
                      <div key={key} style={s.compRow}>
                        <span style={s.compLabel}>{MACRO_LABELS[key] ?? key}</span>
                        <span style={s.compValue}>{value}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {Object.keys(data.composition.micros ?? {}).length > 0 && (
                  <div>
                    <p style={s.compBlockTitle}>Micronutrientes (%)</p>
                    {Object.entries(data.composition.micros ?? {}).map(([key, value]) => (
                      <div key={key} style={s.compRow}>
                        <span style={s.compLabel}>{MICRO_LABELS[key] ?? key}</span>
                        <span style={s.compValue}>{value}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {Object.keys(data.composition.others ?? {}).length > 0 && (
                  <div>
                    <p style={s.compBlockTitle}>Outros (%)</p>
                    {Object.entries(data.composition.others ?? {}).map(([key, value]) => (
                      <div key={key} style={s.compRow}>
                        <span style={s.compLabel}>{key}</span>
                        <span style={s.compValue}>{value}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Especificações técnicas */}
          {hasSpecs && (
            <section style={s.section}>
              <h2 style={s.sectionTitle}>Especificações Técnicas</h2>
              <div>
                {Object.entries(data.technicalSpecs).map(([key, value]) => (
                  <div key={key} style={s.specsRow}>
                    <span style={s.specsKey}>{key}</span>
                    <span style={s.specsVal}>{String(value)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Embalagens */}
          {hasPackaging && (
            <section style={s.section}>
              <h2 style={s.sectionTitle}>Apresentações Comerciais</h2>
              <div style={s.packagingList}>
                {data.packaging.map((pkg, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable positional render
                  <div key={i} style={s.packagingItem}>
                    {PACKAGING_TYPE_LABELS[pkg.type] ?? pkg.type}
                    {pkg.weightKg != null ? ` ${pkg.weightKg} kg` : ''}
                    {pkg.volumeL != null ? ` ${pkg.volumeL} L` : ''}
                    {pkg.sku ? ` — SKU: ${pkg.sku}` : ''}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Indicações */}
          {hasApplications && (
            <section style={s.section}>
              <h2 style={s.sectionTitle}>Indicações por Cultura</h2>
              <div style={s.appTableWrap}>
                <div style={s.appTableHead}>
                  <span style={s.appTableHeadCell}>Cultura</span>
                  <span style={s.appTableHeadCell}>Estádio</span>
                  <span style={s.appTableHeadCell}>Dose</span>
                  <span style={{ ...s.appTableHeadCell, flex: 2 }}>Observações</span>
                </div>
                {data.applications.map((app, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable positional render
                  <div key={i} style={s.appTableRow}>
                    <span style={s.appTableCellBold}>{app.crop}</span>
                    <span style={s.appTableCell}>{app.stage ?? '—'}</span>
                    <span style={s.appTableCell}>
                      {app.dosePerHa} {UNIT_LABELS[app.unit] ?? app.unit}
                    </span>
                    <span style={{ ...s.appTableCell, flex: 2 }}>{app.notes ?? '—'}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer */}
          <footer style={s.footer}>
            <span style={s.footerText}>
              © {year} {data.tenantName} — Documento de uso técnico e comercial.
            </span>
            <span style={s.footerText}>{data.productName} | Ficha Técnica</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
