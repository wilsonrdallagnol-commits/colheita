// apps/website/src/app/produtos/[slug]/page.tsx
// Detalhe de produto — Argho Agrosciences (Redesign 2026)
// White-first. Ficha técnica como instrumento de precisão (light panel).
// Espelho da home: tipografia editorial bold + paleta oficial Argho.

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

const CAT_RAW: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'oklch(0.586 0.150 138.8)',
  organominerais: 'oklch(0.362 0.160 266.7)',
  biologicos: 'oklch(0.55 0.150 145)',
  adjuvantes: 'oklch(0.62 0.130 78)',
};

const CAT_BG_SOFT: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'var(--cat-mineral-soft)',
  organominerais: 'var(--cat-organo-soft)',
  biologicos: 'var(--cat-bio-soft)',
  adjuvantes: 'var(--cat-adj-soft)',
};

const CAT_LINE: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'var(--cat-mineral-line)',
  organominerais: 'var(--cat-organo-line)',
  biologicos: 'var(--cat-bio-line)',
  adjuvantes: 'var(--cat-adj-line)',
};

const APP_MODE_LABELS: Record<string, string> = {
  'Via Foliar': 'Foliar',
  'Via Fertirrigação': 'Fertirrigação',
  'Via Solo': 'Solo',
};

// Max scale for composition bars per type
const MAX_SCALE = { macro: 40, micro: 10, other: 10 };

// Arte premium (rotulo fiel + swirl categorico) — usada no showcase do produto.
// Mockup real composto sobre swirl da categoria/campo (1024², ver .tmp-renders/compose2.py).
const PRODUCT_PREMIUM: Record<string, string> = {
  xcensis: '/products/premium/xcensis.jpg',
  stron: '/products/premium/stron.jpg',
  'grow-calcium': '/products/premium/grow-calcium.jpg',
  defon: '/products/premium/defon.jpg',
  'grow-mob': '/products/premium/grow-mob.jpg',
  'grow-filling': '/products/premium/grow-filling.jpg',
  troian: '/products/premium/troian.jpg',
  biovas: '/products/premium/biovas.jpg',
  bovex: '/products/premium/bovex.jpg',
  controx: '/products/premium/controx.jpg',
  nemax: '/products/premium/nemax.jpg',
  titan: '/products/premium/titan.jpg',
  'n-import': '/products/premium/n-import.jpg',
  impuch: '/products/premium/impuch.jpg',
  'life-on': '/products/premium/life-on.jpg',
  'grow-nitrop': '/products/premium/grow-nitrop.jpg',
  'up-soil': '/products/premium/up-soil.jpg',
  'operate-plus': '/products/premium/operate-plus.jpg',
  'operate-citronela': '/products/premium/operate-citronela.jpg',
  'operate-4em1': '/products/premium/operate-4em1.jpg',
  'operate-orange': '/products/premium/operate-orange.jpg',
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
  const premiumSrc = PRODUCT_PREMIUM[product.slug];
  return {
    title: product.name,
    description: product.tagline,
    alternates: { canonical: `/produtos/${product.slug}` },
    openGraph: {
      title: `${product.name} | Argho Agrosciences`,
      description: product.tagline,
      url: `/produtos/${product.slug}`,
      type: 'website',
      ...(premiumSrc
        ? { images: [{ url: premiumSrc, width: 1024, height: 1024, alt: product.name }] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Argho Agrosciences`,
      description: product.tagline,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const catColor = CAT_COLORS[product.category];
  const catRaw = CAT_RAW[product.category];
  const catBgSoft = CAT_BG_SOFT[product.category];
  const catLine = CAT_LINE[product.category];
  const catLabel = CATEGORIES[product.category].label;
  const premiumSrc: string | undefined = PRODUCT_PREMIUM[product.slug];

  // Produto "complexo microbiologico": modelo neutro (sem valores quantitativos
  // nem claims). Renderiza so a lista de especies declaradas + diferenciais
  // tecnicos da composicao. Ver doc apps/website/docs/biologicos-compliance.md.
  const isMicrobialComplex =
    !!product.technicalDifferentials && product.technicalDifferentials.length > 0;

  // Composition rows with bar gauge data — populated apenas para produtos
  // com composicao quantificada (minerais, organominerais, biologico Troian legado).
  const compRows: {
    label: string;
    value: string;
    numValue: number;
    maxScale: number;
    type: 'macro' | 'micro' | 'other';
  }[] = [];

  if (!isMicrobialComplex) {
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
  }

  // Lista de especies declaradas — usada apenas em produtos "complexo microbiologico".
  const microbialSpecies: string[] = isMicrobialComplex
    ? Object.keys(product.composition.others ?? {})
    : [];

  // Related products
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  ).slice(0, 4);

  const isBio = product.category === 'biologicos';

  // JSON-LD Product — dados estruturados para buscadores
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.tagline,
    ...(premiumSrc ? { image: `https://arghoagrosciences.com${premiumSrc}` } : {}),
    brand: { '@type': 'Brand', name: 'Argho Agrosciences' },
    category: catLabel,
    ...(product.packaging[0]?.sku ? { sku: product.packaging[0].sku } : {}),
    url: `https://arghoagrosciences.com/produtos/${product.slug}`,
  };

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
      {/* ═══════════════════════════════════════════════════════════════════
          BREADCRUMB — minimal mono
      ══════════════════════════════════════════════════════════════════════ */}
      <nav
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '32px 48px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
        }}
        aria-label="Breadcrumb"
      >
        <Link
          href="/produtos"
          style={{
            color: 'var(--text-muted)',
            textDecoration: 'none',
            letterSpacing: '0.04em',
          }}
        >
          Portfólio
        </Link>
        <span aria-hidden style={{ color: 'var(--text-faint)' }}>
          ›
        </span>
        <Link
          href={`/produtos?categoria=${product.category}`}
          style={{
            color: catColor,
            textDecoration: 'none',
            letterSpacing: '0.04em',
            fontWeight: 600,
          }}
        >
          {catLabel}
        </Link>
        <span aria-hidden style={{ color: 'var(--text-faint)' }}>
          ›
        </span>
        <span
          style={{
            color: 'var(--text-primary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          {product.name}
        </span>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — copy editorial à esquerda + ficha técnica light à direita
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingBottom: '24px',
        }}
      >
        {/* Top accent bar (categoria) */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${catRaw} 0%, ${catRaw.replace(')', ' / 0.4)')} 50%, transparent 100%)`,
          }}
        />

        {/* Subtle radial halo da cor da categoria */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 60% 70% at 12% 40%, ${catRaw.replace(')', ' / 0.05)')} 0%, transparent 65%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Editorial grid bg */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(var(--border-subtle) 1px, transparent 1px),
              linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            opacity: 0.35,
            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)',
            pointerEvents: 'none',
          }}
        />

        <div
          className="slug-hero-grid"
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            padding: '56px 48px 72px',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 460px)',
            gap: '80px',
            alignItems: 'start',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* ── Lado esquerdo: identidade do produto ── */}
          <div>
            {/* Category badge */}
            <div
              className="anim-fade-in-up"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '28px',
                padding: '7px 14px',
                backgroundColor: catBgSoft,
                border: `1px solid ${catLine}`,
                borderRadius: '999px',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: catColor,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${catRaw.replace(')', ' / 0.5)')}`,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: catColor,
                }}
              >
                {catLabel}
              </span>
              {product.registrationMapa && (
                <>
                  <span
                    aria-hidden
                    style={{
                      width: '1px',
                      height: '10px',
                      backgroundColor: catLine,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    MAPA {product.registrationMapa}
                  </span>
                </>
              )}
            </div>

            <h1
              className="anim-fade-in-up delay-1"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.75rem, 6.5vw, 5.25rem)',
                fontWeight: 700,
                letterSpacing: '0.005em',
                textTransform: 'uppercase',
                lineHeight: 0.95,
                color: 'var(--text-primary)',
                marginBottom: '24px',
              }}
            >
              {product.name}
            </h1>

            <p
              className="anim-fade-in-up delay-2"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.125rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '36px',
                maxWidth: '560px',
                letterSpacing: '-0.005em',
              }}
            >
              {product.tagline}
            </p>

            {/* Application mode chips — apenas quando ha modos declarados */}
            <div
              className="anim-fade-in-up delay-3"
              style={{
                display: product.applicationModes.length > 0 ? 'flex' : 'none',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '40px',
              }}
            >
              {product.applicationModes.map((mode) => (
                <span
                  key={mode}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    color: catColor,
                    backgroundColor: catBgSoft,
                    border: `1px solid ${catLine}`,
                    padding: '6px 12px',
                    borderRadius: '6px',
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
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-soft)',
                  border: '1px solid var(--border-subtle)',
                  padding: '6px 12px',
                  borderRadius: '6px',
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
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-soft)',
                  border: '1px solid var(--border-subtle)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                }}
              >
                {product.originCountry}
              </span>
            </div>

            {/* Full description com border-left de categoria */}
            <p
              className="anim-fade-in-up delay-4"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.78,
                maxWidth: '600px',
                borderLeft: `2px solid ${catLine}`,
                paddingLeft: '20px',
              }}
            >
              {product.description}
            </p>

            {/* Stat strip — origem, lote, MAPA */}
            <div
              className="anim-fade-in-up delay-4"
              style={{
                marginTop: '40px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '0',
                borderTop: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
                maxWidth: '560px',
              }}
            >
              {[
                { label: 'Origem', value: product.originCountry },
                { label: 'Estado', value: product.physicalState },
                // Reg. MAPA: mostra apenas para produtos com registro real OU produtos
                // que NÃO sao complexo microbiologico (onde MAPA nao se aplica)
                ...(isMicrobialComplex
                  ? [{ label: 'Classe', value: 'Complexo microbiológico' }]
                  : [
                      {
                        label: 'Reg. MAPA',
                        value: product.registrationMapa ? '✓ Ativo' : 'N/A',
                      },
                    ]),
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    padding: '20px 4px 20px 0',
                  }}
                >
                  <p
                    className="mono"
                    style={{
                      fontSize: '0.625rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--text-tertiary)',
                      marginBottom: '6px',
                    }}
                  >
                    {s.label}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      letterSpacing: '-0.025em',
                      color: 'var(--argho-blue)',
                      lineHeight: 1.1,
                    }}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Lado direito: ficha técnica como instrumento de precisão (light) ── */}
          <aside
            className="anim-fade-in-up delay-3"
            style={{
              position: 'sticky',
              top: '120px',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border-subtle)',
              borderTop: `3px solid ${catColor}`,
              borderRadius: '12px',
              overflow: 'hidden',
              fontVariantNumeric: 'tabular-nums',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Panel header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-mist)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  aria-hidden
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: catColor,
                    display: 'inline-block',
                    boxShadow: `0 0 0 3px ${catRaw.replace(')', ' / 0.18)')}`,
                  }}
                  className="anim-pulse-ring"
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                    color: 'var(--text-secondary)',
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
                    color: 'var(--argho-blue)',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                    backgroundColor: 'var(--argho-blue-soft)',
                    padding: '4px 9px',
                    borderRadius: '4px',
                    border: '1px solid var(--cat-organo-line)',
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
                ...(product.concentrationUfc
                  ? [{ label: 'Concentração', value: product.concentrationUfc }]
                  : []),
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
                    padding: '12px 24px',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      textAlign: 'right',
                      maxWidth: '220px',
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Composição microbiológica (modelo neutro: lista de espécies declaradas) ── */}
            {isMicrobialComplex && microbialSpecies.length > 0 && (
              <div>
                <div
                  style={{
                    padding: '14px 24px 10px',
                    borderTop: '1px solid var(--border-subtle)',
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-mist)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.16em',
                      color: 'var(--argho-blue)',
                    }}
                  >
                    Composição microbiológica
                  </span>
                </div>
                <div style={{ padding: '12px 0 8px' }}>
                  {microbialSpecies.map((sp) => (
                    <div
                      key={sp}
                      style={{
                        padding: '10px 24px',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '12px',
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          display: 'inline-block',
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
                          fontSize: '0.9375rem',
                          fontStyle: 'italic',
                          color: 'var(--text-primary)',
                          letterSpacing: '-0.005em',
                        }}
                      >
                        {sp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Diferenciais técnicos (apenas para complexo microbiológico) ── */}
            {isMicrobialComplex && product.technicalDifferentials && (
              <div>
                <div
                  style={{
                    padding: '14px 24px 10px',
                    borderTop: '1px solid var(--border-subtle)',
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-mist)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.16em',
                      color: 'var(--argho-blue)',
                    }}
                  >
                    Diferenciais técnicos
                  </span>
                </div>
                <div style={{ padding: '12px 24px 16px' }}>
                  {product.technicalDifferentials.map((diff) => (
                    <div
                      key={diff}
                      style={{
                        padding: '6px 0',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '10px',
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          color: catColor,
                          fontWeight: 700,
                          flexShrink: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        ·
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          letterSpacing: '-0.005em',
                          lineHeight: 1.5,
                        }}
                      >
                        {diff}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Composition bar gauges (apenas para produtos quantificados — minerais/organominerais) ── */}
            {compRows.length > 0 && (
              <div>
                <div
                  style={{
                    padding: '14px 24px 10px',
                    borderTop: '1px solid var(--border-subtle)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-mist)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.16em',
                      color: 'var(--argho-blue)',
                    }}
                  >
                    Composição Garantida
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.5875rem',
                      color: 'var(--text-tertiary)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    g/100g ou g/100mL
                  </span>
                </div>

                <div style={{ padding: '8px 0 12px' }}>
                  {compRows.map(({ label, value, numValue, maxScale, type }) => {
                    const fillPct = maxScale > 0 ? Math.min((numValue / maxScale) * 100, 100) : 0;
                    const barColor =
                      type === 'macro' ? catColor : type === 'micro' ? 'var(--gold)' : catColor;
                    const barTrack =
                      type === 'macro'
                        ? catBgSoft
                        : type === 'micro'
                          ? 'var(--gold-soft)'
                          : 'var(--bg-soft)';
                    return (
                      <div key={label} style={{ padding: '8px 24px 6px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            marginBottom: '6px',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.8125rem',
                              color: 'var(--text-primary)',
                              fontWeight: type === 'macro' ? 700 : 500,
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
                              color: barColor,
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {value}
                          </span>
                        </div>
                        <div
                          style={{
                            height: '4px',
                            backgroundColor: barTrack,
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
                              opacity: type === 'micro' ? 0.85 : 1,
                              transition: 'width 0.6s var(--ease-out-expo)',
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
                padding: '16px 24px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  color: 'var(--argho-blue)',
                  marginBottom: '12px',
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
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--bg-soft)',
                        border: '1px solid var(--border-subtle)',
                        padding: '5px 10px',
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
                padding: '12px 24px',
                borderTop: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-mist)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-tertiary)',
                  lineHeight: 1.55,
                }}
              >
                {isMicrobialComplex
                  ? 'Composição microbiológica declarada conforme padrão Argho de formulação e controle de qualidade.'
                  : 'Composição conforme Certificado de Análise MAPA.'}
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SHOWCASE — mockup dramático centralizado (apenas se tiver mockup)
      ══════════════════════════════════════════════════════════════════════ */}
      {premiumSrc && (
        <section
          style={{
            position: 'relative',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-soft)',
            overflow: 'hidden',
          }}
        >

          <div
            className="slug-showcase-grid"
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: '1320px',
              margin: '0 auto',
              padding: '88px 48px',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: '64px',
              alignItems: 'center',
            }}
          >
            {/* Arte premium do produto (rotulo real fiel + swirl categorico) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '560px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '540px',
                  aspectRatio: '1 / 1',
                  borderRadius: '16px',
                  border: '1px solid var(--border-subtle)',
                  borderTop: `3px solid ${catColor}`,
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <Image
                  src={premiumSrc}
                  alt={`Embalagem de ${product.name} — ${CATEGORIES[product.category].label} Argho Agrosciences`}
                  width={1024}
                  height={1024}
                  quality={85}
                  sizes="(max-width: 968px) 100vw, 540px"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </div>

            {/* Copy ao lado */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: '24px',
                    height: '1px',
                    background: catColor,
                  }}
                />
                <span
                  className="mono"
                  style={{
                    fontSize: '0.6875rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: catColor,
                    fontWeight: 700,
                  }}
                >
                  Embalagem oficial · {product.physicalState}
                </span>
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                  fontWeight: 700,
                  lineHeight: 0.95,
                  marginBottom: '24px',
                }}
              >
                <span
                  style={{
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.01em',
                    display: 'inline-block',
                  }}
                >
                  {product.name}.
                </span>
                <br />
                <span
                  style={{
                    color: catColor,
                    letterSpacing: '-0.05em',
                  }}
                >
                  {isMicrobialComplex ? 'Composição declarada.' : 'Pronto para o campo.'}
                </span>
              </h2>

              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1.0625rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  marginBottom: '32px',
                  maxWidth: '480px',
                }}
              >
                {product.tagline}
              </p>

              {/* Embalagens disponíveis */}
              <div>
                <p
                  className="mono"
                  style={{
                    fontSize: '0.625rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--text-tertiary)',
                    fontWeight: 700,
                    marginBottom: '12px',
                  }}
                >
                  Disponível em
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.packaging.map((pkg) => {
                    const desc = pkg.weightKg ? `${pkg.weightKg} kg` : `${pkg.volumeL} L`;
                    return (
                      <span
                        key={pkg.sku}
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.125rem',
                          fontWeight: 700,
                          letterSpacing: '-0.025em',
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--bg)',
                          border: `1px solid ${catLine}`,
                          borderTop: `2px solid ${catColor}`,
                          padding: '12px 20px',
                          borderRadius: '6px',
                          minWidth: '72px',
                          textAlign: 'center',
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
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          APPLICATIONS — protocolo de aplicação por cultura
      ══════════════════════════════════════════════════════════════════════ */}
      {product.applications && product.applications.length > 0 && (
        <section
          style={{
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-soft)',
          }}
        >
          <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '80px 48px' }}>
            <div style={{ marginBottom: '48px', maxWidth: '720px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: '24px',
                    height: '1px',
                    background: catColor,
                  }}
                />
                <span
                  className="mono"
                  style={{
                    fontSize: '0.6875rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: catColor,
                    fontWeight: 700,
                  }}
                >
                  Recomendações Agronômicas · orientativo
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.05em',
                  color: 'var(--argho-blue)',
                  lineHeight: 0.95,
                }}
              >
                Protocolo de Aplicação.
              </h2>
            </div>

            {/* Table */}
            <div
              style={{
                border: '1px solid var(--border-subtle)',
                borderTop: `2px solid ${catColor}`,
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'var(--bg)',
              }}
            >
              {/* Header */}
              <div
                className="slug-app-grid slug-app-header"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 220px 160px 1fr',
                  gap: '0',
                  backgroundColor: 'var(--bg-mist)',
                  borderBottom: '1px solid var(--border-subtle)',
                  padding: '14px 28px',
                }}
              >
                {['Cultura', 'Fase fenológica', 'Dose / ha', 'Observações'].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.14em',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {product.applications.map((app, i) => (
                <div
                  key={`${app.crop}-${i}`}
                  className="slug-app-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '180px 220px 160px 1fr',
                    gap: '0',
                    padding: '20px 28px',
                    borderBottom:
                      i < (product.applications?.length ?? 0) - 1
                        ? '1px solid var(--border-subtle)'
                        : 'none',
                    borderLeft: `2px solid ${catLine}`,
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.025em',
                    }}
                  >
                    {app.crop}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    {app.stage}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1rem',
                      color: catColor,
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {app.dosePerHa}
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        marginLeft: '4px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {app.unit}
                    </span>
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.55,
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
                marginTop: '24px',
                padding: '18px 24px',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border-subtle)',
                borderLeft: `3px solid ${catColor}`,
                borderRadius: '6px',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
              }}
            >
              <span
                aria-hidden
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  color: catColor,
                  flexShrink: 0,
                  fontWeight: 700,
                  marginTop: '-2px',
                }}
              >
                ⚠
              </span>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  Recomendações orientativas.
                </strong>{' '}
                O uso de fertilizantes requer acompanhamento de Engenheiro Agrônomo ou Engenheiro
                Florestal habilitado, conforme a Lei 5.194/66. Realize teste de compatibilidade
                antes de misturar com outros produtos.
                {isBio && !isMicrobialComplex && (
                  <>
                    {' '}
                    Produto biológico — composição declarada conforme padrão Argho; consulte a
                    ficha técnica para protocolo de armazenamento e viabilidade microbiológica.
                  </>
                )}
                {isMicrobialComplex && (
                  <>
                    {' '}
                    Complexo microbiológico — informações de composição declarada conforme padrão
                    Argho de formulação. Para condições de armazenamento e manuseio, consulte a
                    ficha técnica do produto via canal comercial.
                  </>
                )}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          RELATED PRODUCTS — outros da mesma categoria
      ══════════════════════════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section style={{ maxWidth: '1320px', margin: '0 auto', padding: '80px 48px' }}>
          <div style={{ marginBottom: '40px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: '24px',
                  height: '1px',
                  background: 'var(--argho-green)',
                }}
              />
              <span
                className="mono"
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: 'var(--argho-blue)',
                }}
              >
                Outros em {catLabel}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: 'var(--bg)',
            }}
          >
            {related.map((p, i) => (
              <Link
                key={p.slug}
                href={`/produtos/${p.slug}`}
                style={{ textDecoration: 'none', display: 'block' }}
                className="related-row"
              >
                <article
                  className="slug-related-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 220px) minmax(0, 1fr) auto',
                    gap: '32px',
                    alignItems: 'center',
                    padding: '20px 24px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                    borderLeft: `3px solid ${catColor}`,
                    transition: 'background-color 0.18s ease',
                    backgroundColor: 'var(--bg)',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      color: 'var(--text-primary)',
                      lineHeight: 1.05,
                    }}
                  >
                    {p.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9375rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    {p.tagline}
                  </p>
                  <span
                    aria-hidden
                    style={{
                      color: catColor,
                      fontSize: '1.125rem',
                      opacity: 0.7,
                    }}
                    className="related-arrow"
                  >
                    →
                  </span>
                </article>
              </Link>
            ))}
          </div>

          {/* Back to portfolio */}
          <div style={{ marginTop: '48px' }}>
            <Link
              href="/produtos"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                borderBottom: '1px solid var(--text-primary)',
                paddingBottom: '4px',
                letterSpacing: '-0.005em',
              }}
            >
              <span aria-hidden style={{ fontSize: '1.1em', lineHeight: 1 }}>
                ←
              </span>
              Voltar ao portfólio completo
            </Link>
          </div>
        </section>
      )}

      <style>{`
        .related-row:hover article {
          background-color: var(--bg-warm) !important;
        }
        .related-row:hover .related-arrow {
          transform: translateX(4px);
          opacity: 1 !important;
        }
        @media (max-width: 968px) {
          .slug-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          .slug-showcase-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
        @media (max-width: 768px) {
          .slug-app-grid {
            grid-template-columns: 1fr 1fr !important;
            grid-template-areas: "crop dose" "stage stage" "notes notes" !important;
            gap: 8px 16px !important;
            padding: 16px !important;
          }
          .slug-app-grid > span:nth-child(1) { grid-area: crop; }
          .slug-app-grid > span:nth-child(2) { grid-area: stage; }
          .slug-app-grid > span:nth-child(3) { grid-area: dose; text-align: right; }
          .slug-app-grid > span:nth-child(4) { grid-area: notes; }
          .slug-app-header {
            display: none !important;
          }
          .slug-related-grid {
            grid-template-columns: 1fr auto !important;
            gap: 8px 16px !important;
          }
          .slug-related-grid > p { grid-column: 1 / -1; }
        }
      `}</style>
    </main>
  );
}
