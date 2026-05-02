// apps/website/src/app/produtos/[slug]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORIES, getProductBySlug, PRODUCTS, type ProductCategory } from '@/lib/products';

const CAT_COLORS: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'var(--cat-mineral)',
  organominerais: 'var(--cat-organo)',
  biologicos: 'var(--cat-bio)',
  adjuvantes: 'var(--cat-adj)',
};

const APP_MODE_LABELS: Record<string, string> = {
  'Via Foliar': 'Foliar',
  'Via Fertirrigação': 'Fertirrigação',
  'Via Solo': 'Solo',
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
  const catLabel = CATEGORIES[product.category].label;

  // Build composition table rows
  const compRows: { label: string; value: string; type: 'macro' | 'micro' | 'other' }[] = [];
  if (product.composition.macros) {
    for (const [k, v] of Object.entries(product.composition.macros)) {
      compRows.push({ label: k, value: `${v}%`, type: 'macro' });
    }
  }
  if (product.composition.micros) {
    for (const [k, v] of Object.entries(product.composition.micros)) {
      compRows.push({ label: k, value: `${v}%`, type: 'micro' });
    }
  }
  if (product.composition.others) {
    for (const [k, v] of Object.entries(product.composition.others)) {
      const fmt = typeof v === 'number' && v >= 1e7 ? `${(v / 1e8).toFixed(0)}×10⁸ UFC/g` : `${v}%`;
      compRows.push({ label: k, value: fmt, type: 'other' });
    }
  }

  // Related products in same category (exclude self, max 4)
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  ).slice(0, 4);

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
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 48px 56px',
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '80px',
          alignItems: 'start',
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
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: catColor,
              }}
            >
              {catLabel}
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              color: 'var(--text-primary)',
              marginBottom: '16px',
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
              maxWidth: '540px',
            }}
          >
            {product.tagline}
          </p>

          {/* Application modes */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
            {product.applicationModes.map((mode) => (
              <span
                key={mode}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: catColor,
                  backgroundColor: `${catColor.replace('var(--cat-', 'oklch(').replace(')', ' / 0.12)')}`,
                  border: `1px solid ${catColor}33`,
                  padding: '4px 10px',
                  borderRadius: '4px',
                }}
              >
                {APP_MODE_LABELS[mode] ?? mode}
              </span>
            ))}
          </div>

          {/* Full description */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.75,
              maxWidth: '600px',
            }}
          >
            {product.description}
          </p>
        </div>

        {/* Right: Technical card */}
        <div
          style={{
            position: 'sticky',
            top: '80px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {/* Card header */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                color: 'var(--text-muted)',
              }}
            >
              Ficha técnica
            </p>
            {product.registrationMapa && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--green)',
                  letterSpacing: '0.02em',
                }}
              >
                ✓ MAPA
              </span>
            )}
          </div>

          {/* Metadata rows */}
          <div style={{ padding: '4px 0' }}>
            {[
              { label: 'Origem', value: product.originCountry },
              { label: 'Tipo', value: product.productType },
              { label: 'Estado físico', value: product.physicalState },
              ...(product.registrationMapa
                ? [{ label: 'Registro MAPA', value: product.registrationMapa }]
                : []),
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 24px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    textAlign: 'right',
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Composition */}
          {compRows.length > 0 && (
            <div>
              <div
                style={{
                  padding: '14px 24px 10px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.10em',
                    color: 'var(--text-muted)',
                  }}
                >
                  Composição garantida
                </p>
              </div>
              <div style={{ padding: '4px 0 8px' }}>
                {compRows.map(({ label, value, type }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 24px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8125rem',
                        color:
                          type === 'macro'
                            ? 'var(--text-primary)'
                            : type === 'micro'
                              ? catColor
                              : 'var(--text-secondary)',
                        fontWeight: type === 'macro' ? 500 : 400,
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Packaging */}
          <div
            style={{
              padding: '14px 24px 10px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                color: 'var(--text-muted)',
                marginBottom: '10px',
              }}
            >
              Embalagens disponíveis
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {product.packaging.map((pkg) => {
                const desc = pkg.weightKg ? `${pkg.weightKg} kg` : `${pkg.volumeL} L`;
                return (
                  <span
                    key={pkg.sku}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--surface-raised)',
                      border: '1px solid var(--border)',
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
        </div>
      </div>

      {/* ── Applications table ── */}
      {product.applications && product.applications.length > 0 && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 48px' }}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.12em',
                color: catColor,
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Recomendações agronômicas
            </p>
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
              Como aplicar
            </h2>

            {/* Table */}
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 200px 160px 1fr',
                  gap: '0',
                  backgroundColor: 'var(--surface-raised)',
                  borderBottom: '1px solid var(--border)',
                  padding: '12px 24px',
                }}
              >
                {['Cultura', 'Fase fenológica', 'Dose / ha', 'Observações'].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--text-muted)',
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
                    gridTemplateColumns: '160px 200px 160px 1fr',
                    gap: '0',
                    padding: '16px 24px',
                    borderBottom:
                      i < (product.applications?.length ?? 0) - 1
                        ? '1px solid var(--border-subtle)'
                        : 'none',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.9375rem',
                      fontWeight: 500,
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
                      fontSize: '0.875rem',
                      color: catColor,
                      fontWeight: 600,
                    }}
                  >
                    {app.dosePerHa} {app.unit}
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
          </div>
        </div>
      )}

      {/* ── Related products ── */}
      {related.length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 48px 80px' }}>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              color: 'var(--text-muted)',
              marginBottom: '24px',
            }}
          >
            Outros produtos em {catLabel}
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
                    padding: '20px 0',
                    borderTop: i === 0 ? '1px solid var(--border-subtle)' : 'none',
                    borderBottom: '1px solid var(--border-subtle)',
                    borderLeft: `3px solid ${catColor}`,
                    paddingLeft: '20px',
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
                  <span style={{ color: 'var(--text-faint)', fontSize: '0.875rem' }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
