// apps/website/src/app/produtos/[slug]/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORIES, getProductBySlug, PRODUCTS, type ProductCategory } from '@/lib/products';

const CAT_COLORS: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'var(--cat-mineral)',
  organominerais: 'var(--cat-organo)',
  biologicos: 'var(--cat-bio)',
  adjuvantes: 'var(--cat-adj)',
};

// Raw oklch values for gradient construction
const CAT_RAW: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'oklch(0.58 0.165 148)',
  organominerais: 'oklch(0.64 0.13 195)',
  biologicos: 'oklch(0.66 0.150 150)',
  adjuvantes: 'oklch(0.73 0.135 78)',
};

const CAT_BG: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'oklch(0.14 0.045 148)',
  organominerais: 'oklch(0.14 0.040 195)',
  biologicos: 'oklch(0.14 0.048 150)',
  adjuvantes: 'oklch(0.16 0.038 78)',
};

const APP_MODE_LABELS: Record<string, string> = {
  'Via Foliar': 'Foliar',
  'Via Fertirrigação': 'Fertirrigação',
  'Via Solo': 'Solo',
};

// Max scale for composition bars per type
const MAX_SCALE = { macro: 40, micro: 10, other: 10 };

// Product mockup images mapping
const PRODUCT_MOCKUP: Record<string, string> = {
  stron: '/products/stron.png',
  impuch: '/products/impuch.png',
  'life-on': '/products/lifeon.png',
  troian: '/products/troian.png',
  biovas: '/products/biovas.png',
  'operate-plus': '/products/operate.png',
  'operate-citronela': '/products/operate.png',
  'operate-4em1': '/products/operate.png',
  'operate-orange': '/products/operate.png',
  bovex: '/products/bovex.png',
  nemax: '/products/nemax.png',
  'n-import': '/products/n-import.png',
  titan: '/products/titan.png',
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Produto não encontrado' };
  return {
    title: product.name,
    description: product.tagline,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const catColor = CAT_COLORS[product.category];
  const catRaw = CAT_RAW[product.category];
  const catBg = CAT_BG[product.category];
  const catLabel = CATEGORIES[product.category].label;
  const mockupSrc: string | undefined = PRODUCT_MOCKUP[product.slug];

  // Composition rows with bar gauge data
  const compRows: {
    label: string;
    value: string;
    numValue: number;
    maxScale: number;
    type: 'macro' | 'micro' | 'other';
  }[] = [];

  if (product.composition.macros) {
    for (const [k, v] of Object.entries(product.composition.macros)) {
      compRows.push({
        label: k,
        value: `${v}%`,
        numValue: v,
        maxScale: MAX_SCALE.macro,
        type: 'macro',
      });
    }
  }
  if (product.composition.micros) {
    for (const [k, v] of Object.entries(product.composition.micros)) {
      compRows.push({
        label: k,
        value: `${v}%`,
        numValue: v,
        maxScale: MAX_SCALE.micro,
        type: 'micro',
      });
    }
  }
  if (product.composition.others) {
    for (const [k, v] of Object.entries(product.composition.others)) {
      const isUFC = typeof v === 'number' && v >= 1e7;
      const numV = isUFC ? 100 : typeof v === 'number' ? v : 0;
      const fmt = isUFC ? `${(v / 1e8).toFixed(0)}×10⁸ UFC/g` : `${v}%`;
      compRows.push({
        label: k,
        value: fmt,
        numValue: numV,
        maxScale: isUFC ? 100 : MAX_SCALE.other,
        type: 'other',
      });
    }
  }

  // Related products
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  ).slice(0, 4);

  const isBio = product.category === 'biologicos';

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Breadcrumb ── */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 48px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Link
          href="/produtos"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}
        >
          Portfólio
        </Link>
        <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>›</span>
        <Link
          href={`/produtos?categoria=${product.category}`}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            color: catColor,
            textDecoration: 'none',
          }}
        >
          {catLabel}
        </Link>
        <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>›</span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
          }}
        >
          {product.name}
        </span>
      </div>

      {/* ── Hero ── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: `radial-gradient(ellipse 55% 80% at 10% 50%, ${catRaw.replace(')', ' / 0.07)')} 0%, transparent 65%)`,
        }}
      >
        {/* Decorative circuit trace — top accent bar */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${catRaw.replace(')', ' / 0.6)')} 0%, transparent 60%)`,
          }}
        />
        {/* Subtle grid bg */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${catRaw.replace(')', ' / 0.04)')} 1px, transparent 1px), linear-gradient(90deg, ${catRaw.replace(')', ' / 0.04)')} 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
          }}
        />
        {/* Product mockup — floating right-center */}
        {mockupSrc && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              right: '440px',
              bottom: 0,
              width: '220px',
              display: 'flex',
              alignItems: 'flex-end',
              pointerEvents: 'none',
            }}
          >
            <Image
              src={mockupSrc}
              alt=""
              width={220}
              height={300}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                objectPosition: 'bottom center',
                filter: `drop-shadow(0 16px 48px ${catRaw.replace(')', ' / 0.45)')})`,
              }}
              priority
            />
          </div>
        )}

        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '48px 48px 64px',
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '80px',
            alignItems: 'start',
            position: 'relative',
          }}
        >
          {/* Left: Product identity */}
          <div>
            {/* Category badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: catColor,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${catRaw.replace(')', ' / 0.6)')}`,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: catColor,
                }}
              >
                {catLabel}
              </span>
              {product.registrationMapa && (
                <>
                  <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>·</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: 'var(--text-faint)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    MAPA {product.registrationMapa}
                  </span>
                </>
              )}
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.75rem, 6vw, 4.5rem)',
                fontWeight: 700,
                letterSpacing: '-0.045em',
                lineHeight: 0.95,
                color: 'var(--text-primary)',
                marginBottom: '20px',
              }}
            >
              {product.name}
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.0625rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                marginBottom: '32px',
                maxWidth: '520px',
              }}
            >
              {product.tagline}
            </p>

            {/* Application mode chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
              {product.applicationModes.map((mode) => (
                <span
                  key={mode}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    color: catColor,
                    backgroundColor: catBg,
                    border: `1px solid ${catRaw.replace(')', ' / 0.20)')}`,
                    padding: '5px 12px',
                    borderRadius: '4px',
                  }}
                >
                  {APP_MODE_LABELS[mode] ?? mode}
                </span>
              ))}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: 'oklch(0.52 0.018 148)',
                  backgroundColor: 'oklch(0.12 0.018 148)',
                  border: '1px solid oklch(0.20 0.018 148)',
                  padding: '5px 12px',
                  borderRadius: '4px',
                }}
              >
                {product.physicalState}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: 'oklch(0.52 0.018 148)',
                  backgroundColor: 'oklch(0.12 0.018 148)',
                  border: '1px solid oklch(0.20 0.018 148)',
                  padding: '5px 12px',
                  borderRadius: '4px',
                }}
              >
                {product.originCountry}
              </span>
            </div>

            {/* Full description */}
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.78,
                maxWidth: '580px',
                borderLeft: `2px solid ${catRaw.replace(')', ' / 0.25)')}`,
                paddingLeft: '20px',
              }}
            >
              {product.description}
            </p>
          </div>

          {/* Right: Precision Instrument Panel */}
          <div
            style={{
              position: 'sticky',
              top: '80px',
              backgroundColor: 'oklch(0.075 0.016 148)',
              border: `1px solid ${catRaw.replace(')', ' / 0.30)')}`,
              borderTop: `2px solid ${catColor}`,
              borderRadius: '8px',
              overflow: 'hidden',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {/* Panel header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid oklch(0.14 0.022 148)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'oklch(0.065 0.014 148)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Blinking status dot */}
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: catColor,
                    display: 'inline-block',
                    animation: 'pulseRing 2s ease-out infinite',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    color: 'var(--text-muted)',
                  }}
                >
                  Ficha Técnica
                </span>
              </div>
              {product.registrationMapa && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    color: 'oklch(0.58 0.165 148)',
                    letterSpacing: '0.04em',
                    backgroundColor: 'oklch(0.12 0.038 148)',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    border: '1px solid oklch(0.22 0.045 148)',
                  }}
                >
                  ✓ MAPA
                </span>
              )}
            </div>

            {/* Metadata rows */}
            <div>
              {[
                { label: 'Tipo', value: product.productType },
                { label: 'Origem', value: product.originCountry },
                { label: 'Estado', value: product.physicalState },
                ...(product.registrationMapa
                  ? [{ label: 'Reg. MAPA', value: product.registrationMapa }]
                  : []),
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 24px',
                    borderBottom: '1px solid oklch(0.11 0.018 148)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-faint)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      textAlign: 'right',
                      maxWidth: '200px',
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Composition bar gauges ── */}
            {compRows.length > 0 && (
              <div>
                <div
                  style={{
                    padding: '12px 24px 8px',
                    borderTop: '1px solid oklch(0.14 0.022 148)',
                    borderBottom: '1px solid oklch(0.11 0.018 148)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.14em',
                      color: 'var(--text-faint)',
                    }}
                  >
                    Composição Garantida
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.55rem',
                      color: 'oklch(0.35 0.012 148)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    g/100g ou g/100mL
                  </span>
                </div>

                {/* Bar gauges */}
                <div style={{ padding: '6px 0 10px' }}>
                  {compRows.map(({ label, value, numValue, maxScale, type }) => {
                    const fillPct = maxScale > 0 ? Math.min((numValue / maxScale) * 100, 100) : 0;
                    const barColor =
                      type === 'macro'
                        ? catColor
                        : type === 'micro'
                          ? 'oklch(0.73 0.135 78)'
                          : 'oklch(0.46 0.016 148)';
                    const barBgColor =
                      type === 'macro'
                        ? catBg
                        : type === 'micro'
                          ? 'oklch(0.13 0.030 78)'
                          : 'oklch(0.11 0.016 148)';
                    return (
                      <div key={label} style={{ padding: '7px 24px 5px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            marginBottom: '5px',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.8125rem',
                              color: barColor,
                              fontWeight: type === 'macro' ? 600 : 400,
                              letterSpacing: '0.02em',
                            }}
                          >
                            {label}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.875rem',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {value}
                          </span>
                        </div>
                        {/* Gauge bar */}
                        <div
                          style={{
                            height: '3px',
                            backgroundColor: barBgColor,
                            borderRadius: '2px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${fillPct}%`,
                              backgroundColor: barColor,
                              borderRadius: '2px',
                              opacity: type === 'micro' ? 0.75 : 1,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Packaging ── */}
            <div
              style={{
                padding: '12px 24px 16px',
                borderTop: '1px solid oklch(0.14 0.022 148)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--text-faint)',
                  marginBottom: '10px',
                }}
              >
                Embalagens
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {product.packaging.map((pkg) => {
                  const desc = pkg.weightKg ? `${pkg.weightKg} kg` : `${pkg.volumeL} L`;
                  return (
                    <span
                      key={pkg.sku}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        backgroundColor: 'oklch(0.10 0.016 148)',
                        border: '1px solid oklch(0.18 0.020 148)',
                        padding: '4px 10px',
                        borderRadius: '4px',
                      }}
                    >
                      {desc}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Panel footer — legal note */}
            <div
              style={{
                padding: '10px 24px',
                borderTop: '1px solid oklch(0.11 0.016 148)',
                backgroundColor: 'oklch(0.06 0.012 148)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.65rem',
                  color: 'oklch(0.35 0.010 148)',
                  lineHeight: 1.5,
                }}
              >
                Composição conforme Certificado de Análise MAPA.
                {isBio && ' Produto biológico registrado sob legislação específica (IN MAPA).'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Applications table ── */}
      {product.applications && product.applications.length > 0 && (
        <div
          style={{
            borderTop: '1px solid oklch(0.14 0.022 148)',
            backgroundColor: 'oklch(0.075 0.016 148)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 48px' }}>
            {/* Section label */}
            <div
              style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.12em',
                  color: catColor,
                  textTransform: 'uppercase',
                }}
              >
                Recomendações Agronômicas
              </p>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  color: 'oklch(0.40 0.012 148)',
                  letterSpacing: '0.06em',
                }}
              >
                · orientativo
              </span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 700,
                letterSpacing: '-0.035em',
                color: 'var(--text-primary)',
                marginBottom: '32px',
              }}
            >
              Protocolo de Aplicação
            </h2>

            {/* Table */}
            <div
              style={{
                border: `1px solid ${catRaw.replace(')', ' / 0.20)')}`,
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 200px 140px 1fr',
                  gap: '0',
                  backgroundColor: 'oklch(0.065 0.014 148)',
                  borderBottom: `1px solid ${catRaw.replace(')', ' / 0.20)')}`,
                  padding: '12px 24px',
                }}
              >
                {['Cultura', 'Fase fenológica', 'Dose / ha', 'Observações'].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: 'var(--text-faint)',
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {product.applications.map((app, i) => (
                <div
                  key={`${app.crop}-${i}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '160px 200px 140px 1fr',
                    gap: '0',
                    padding: '16px 24px',
                    borderBottom:
                      i < (product.applications?.length ?? 0) - 1
                        ? '1px solid oklch(0.11 0.016 148)'
                        : 'none',
                    borderLeft: `2px solid ${catRaw.replace(')', ' / 0.18)')}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {app.crop}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {app.stage}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.9375rem',
                      color: catColor,
                      fontWeight: 700,
                    }}
                  >
                    {app.dosePerHa}
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 400,
                        marginLeft: '3px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {app.unit}
                    </span>
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                    }}
                  >
                    {app.notes ?? '—'}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Legal disclaimer ── */}
            <div
              style={{
                marginTop: '20px',
                padding: '14px 20px',
                backgroundColor: 'oklch(0.065 0.012 148)',
                border: '1px solid oklch(0.13 0.018 148)',
                borderRadius: '6px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <span
                aria-hidden
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'oklch(0.40 0.014 148)',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                ⚠
              </span>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.75rem',
                  color: 'oklch(0.42 0.012 148)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                <strong style={{ color: 'oklch(0.52 0.014 148)', fontWeight: 600 }}>
                  Recomendações orientativas.
                </strong>{' '}
                O uso de fertilizantes requer acompanhamento de Engenheiro Agrônomo ou Engenheiro
                Florestal habilitado, conforme a Lei 5.194/66. Realize teste de compatibilidade
                antes de misturar com outros produtos.
                {isBio && (
                  <>
                    {' '}
                    Produto biológico registrado no MAPA — consulte a bula oficial para protocolo de
                    armazenamento e viabilidade microbiológica.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Related products ── */}
      {related.length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 48px 80px' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              marginBottom: '24px',
            }}
          >
            Outros em {catLabel}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {related.map((p, i) => (
              <Link
                key={p.slug}
                href={`/produtos/${p.slug}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '200px 1fr auto',
                    gap: '0 32px',
                    alignItems: 'center',
                    padding: '18px 20px',
                    borderTop: i === 0 ? '1px solid oklch(0.14 0.022 148)' : 'none',
                    borderBottom: '1px solid oklch(0.14 0.022 148)',
                    borderLeft: `2px solid ${catColor}`,
                    transition: 'background-color 0.15s',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      letterSpacing: '-0.025em',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {p.name}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {p.tagline}
                  </p>
                  <span style={{ color: catColor, fontSize: '0.875rem' }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
