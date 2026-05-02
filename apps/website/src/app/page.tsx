// apps/website/src/app/page.tsx
// Home — Argho Agrosciences
// Design: Instrumento de Precisão. Dark green profundo. Editorial.

import type { Metadata } from 'next';
import Link from 'next/link';
import type { ProductCategory } from '@/lib/products';
import { CATEGORIES, getFeaturedProduct, PRODUCTS } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Argho Agrosciences — Nutrição de precisão para o agro brasileiro',
};

// ─── Category accent color lookup ─────────────────────────────────────────────

const CAT_COLOR: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'oklch(0.58 0.165 148)',
  organominerais: 'oklch(0.64 0.13 195)',
  biologicos: 'oklch(0.66 0.150 150)',
  adjuvantes: 'oklch(0.73 0.135 78)',
};

const CAT_BG: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'oklch(0.14 0.045 148)',
  organominerais: 'oklch(0.14 0.040 195)',
  biologicos: 'oklch(0.14 0.044 150)',
  adjuvantes: 'oklch(0.16 0.038 78)',
};

export default function HomePage() {
  const featured = getFeaturedProduct();
  const categoryKeys = Object.keys(CATEGORIES) as ProductCategory[];

  // Group products by category
  const byCategory = categoryKeys.map((cat) => ({
    key: cat,
    ...CATEGORIES[cat],
    products: PRODUCTS.filter((p) => p.category === cat),
  }));

  return (
    <>
      {/* ──────────── HERO ──────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 48px 64px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative: diagonal stripe accent */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40vw',
            height: '100%',
            background:
              'linear-gradient(135deg, transparent 60%, oklch(0.14 0.045 148 / 0.45) 100%)',
            pointerEvents: 'none',
          }}
        />
        {/* Decorative: gold vertical rule */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '40px',
            top: '80px',
            bottom: '64px',
            width: '2px',
            background:
              'linear-gradient(to bottom, transparent, oklch(0.73 0.135 78 / 0.5) 30%, oklch(0.73 0.135 78 / 0.5) 70%, transparent)',
          }}
        />

        <div style={{ maxWidth: '1200px', position: 'relative' }}>
          {/* Eyebrow */}
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              color: 'oklch(0.73 0.135 78)',
              textTransform: 'uppercase',
              marginBottom: '28px',
            }}
          >
            Origem europeia · Registro MAPA · Ciência aplicada ao campo
          </p>

          {/* Main headline */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 7vw, 6.5rem)',
              fontWeight: 600,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              color: 'oklch(0.96 0.004 148)',
              marginBottom: '12px',
            }}
          >
            Nutrição de
          </h1>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 7vw, 6.5rem)',
              fontWeight: 600,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              color: 'oklch(0.58 0.165 148)',
              marginBottom: '36px',
            }}
          >
            precisão.
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
              fontWeight: 400,
              color: 'oklch(0.62 0.022 148)',
              lineHeight: 1.6,
              maxWidth: '520px',
              marginBottom: '48px',
            }}
          >
            Fertilizantes minerais, organominerais, biológicos e adjuvantes de alta performance —
            formulados na Europa, registrados pelo MAPA, pensados para o produtor e distribuidor
            técnico brasileiro.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '72px' }}>
            <Link
              href="/produtos"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: 'oklch(0.73 0.135 78)',
                color: 'oklch(0.10 0 0)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              Ver portfólio →
            </Link>
            <Link
              href="/sobre"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: 'oklch(0.72 0.025 148)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                border: '1px solid oklch(0.22 0.025 148)',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              Sobre a Argho
            </Link>
          </div>

          {/* Stats strip */}
          <div
            style={{
              display: 'flex',
              gap: '0',
              borderTop: '1px solid oklch(0.22 0.025 148)',
              paddingTop: '28px',
            }}
          >
            {[
              { value: '18', label: 'Produtos registrados' },
              { value: '4', label: 'Linhas de solução' },
              { value: 'MAPA', label: 'Todos registrados' },
              { value: 'ES', label: 'Origem europeia' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  flex: 1,
                  paddingRight: '32px',
                  borderRight: i < 3 ? '1px solid oklch(0.18 0.020 148)' : 'none',
                  paddingLeft: i > 0 ? '32px' : '0',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.75rem',
                    fontWeight: 600,
                    letterSpacing: '-0.04em',
                    color: 'oklch(0.96 0.004 148)',
                    marginBottom: '2px',
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    color: 'oklch(0.52 0.018 148)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── CATEGORIAS ───────────────────────────────────────────── */}
      <section
        style={{
          borderTop: '1px solid oklch(0.155 0.018 148)',
          borderBottom: '1px solid oklch(0.155 0.018 148)',
        }}
      >
        {byCategory.map((cat) => (
          <Link
            key={cat.key}
            href={`/produtos?categoria=${cat.key}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr auto',
              alignItems: 'center',
              gap: '48px',
              padding: '28px 48px',
              borderBottom: '1px solid oklch(0.12 0.016 148)',
              textDecoration: 'none',
              transition: 'background-color 0.15s',
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: CAT_COLOR[cat.key],
                  marginRight: '10px',
                  verticalAlign: 'middle',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  letterSpacing: '-0.025em',
                  color: 'oklch(0.96 0.004 148)',
                  verticalAlign: 'middle',
                }}
              >
                {cat.label}
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                color: 'oklch(0.55 0.018 148)',
                lineHeight: 1.5,
              }}
            >
              {cat.description}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: CAT_COLOR[cat.key],
                  backgroundColor: CAT_BG[cat.key],
                  padding: '4px 10px',
                  borderRadius: '4px',
                }}
              >
                {cat.products.length} produtos
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1.125rem',
                  color: 'oklch(0.40 0.015 148)',
                }}
              >
                →
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* ──────────── DESTAQUE — XCENSIS ──────────────────────────────────── */}
      <section
        style={{
          padding: '80px 48px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Section label */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            color: 'oklch(0.52 0.018 148)',
            marginBottom: '40px',
          }}
        >
          Produto em destaque
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
          }}
        >
          {/* Left: identity */}
          <div>
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
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'oklch(0.73 0.135 78)',
                  backgroundColor: 'oklch(0.16 0.038 78)',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  letterSpacing: '0.04em',
                }}
              >
                {featured.registrationMapa}
              </span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(3rem, 5vw, 5rem)',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: 0.95,
                color: 'oklch(0.96 0.004 148)',
                marginBottom: '16px',
              }}
            >
              {featured.name}
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'oklch(0.58 0.165 148)',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                marginBottom: '20px',
              }}
            >
              {featured.tagline}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                color: 'oklch(0.62 0.022 148)',
                lineHeight: 1.7,
                marginBottom: '36px',
              }}
            >
              {featured.description}
            </p>
            <Link
              href={`/produtos/${featured.slug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                border: '1px solid oklch(0.58 0.165 148)',
                color: 'oklch(0.58 0.165 148)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: 500,
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              Ficha técnica completa →
            </Link>
          </div>

          {/* Right: composition data */}
          <div
            style={{
              backgroundColor: 'oklch(0.105 0.020 148)',
              border: '1px solid oklch(0.22 0.025 148)',
              borderRadius: '12px',
              padding: '36px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                color: 'oklch(0.52 0.018 148)',
                marginBottom: '24px',
              }}
            >
              Composição garantida
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {featured.composition.micros &&
                Object.entries(featured.composition.micros).map(([element, value]) => (
                  <div
                    key={element}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: '12px',
                      borderBottom: '1px solid oklch(0.155 0.018 148)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: 'oklch(0.96 0.004 148)',
                      }}
                    >
                      {element}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9375rem',
                        color: 'oklch(0.58 0.165 148)',
                        fontWeight: 600,
                      }}
                    >
                      {value}%
                    </span>
                  </div>
                ))}
              {featured.composition.macros &&
                Object.entries(featured.composition.macros).map(([element, value]) => (
                  <div
                    key={element}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: '12px',
                      borderBottom: '1px solid oklch(0.155 0.018 148)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: 'oklch(0.96 0.004 148)',
                      }}
                    >
                      {element}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9375rem',
                        color: 'oklch(0.73 0.135 78)',
                        fontWeight: 600,
                      }}
                    >
                      {value}%
                    </span>
                  </div>
                ))}
            </div>
            <div
              style={{
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid oklch(0.22 0.025 148)',
                display: 'flex',
                gap: '16px',
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'oklch(0.52 0.018 148)',
                    marginBottom: '4px',
                    letterSpacing: '0.04em',
                  }}
                >
                  ESTADO
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'oklch(0.78 0.020 148)',
                    textTransform: 'capitalize',
                  }}
                >
                  {featured.physicalState}
                </p>
              </div>
              <div style={{ marginLeft: '32px' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'oklch(0.52 0.018 148)',
                    marginBottom: '4px',
                    letterSpacing: '0.04em',
                  }}
                >
                  ORIGEM
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'oklch(0.78 0.020 148)',
                  }}
                >
                  {featured.originCountry}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── PORTFÓLIO COMPLETO ──────────────────────────────────── */}
      <section
        style={{
          backgroundColor: 'oklch(0.06 0.016 148)',
          borderTop: '1px solid oklch(0.155 0.018 148)',
          padding: '80px 48px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '48px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: 600,
                letterSpacing: '-0.035em',
                color: 'oklch(0.96 0.004 148)',
              }}
            >
              Portfólio completo
            </h2>
            <Link
              href="/produtos"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                color: 'oklch(0.62 0.022 148)',
              }}
            >
              Ver todos com filtros →
            </Link>
          </div>

          {/* Products: catalog strip list */}
          <div>
            {PRODUCTS.map((product, i) => (
              <Link
                key={product.slug}
                href={`/produtos/${product.slug}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '200px 1fr auto',
                  alignItems: 'center',
                  gap: '32px',
                  padding: '20px 0',
                  borderBottom:
                    i < PRODUCTS.length - 1 ? '1px solid oklch(0.12 0.016 148)' : 'none',
                  textDecoration: 'none',
                  borderLeft: `3px solid ${CAT_COLOR[product.category]}`,
                  paddingLeft: '20px',
                  marginLeft: '-20px',
                  transition: 'background-color 0.1s',
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      letterSpacing: '-0.025em',
                      color: 'oklch(0.96 0.004 148)',
                      marginBottom: '2px',
                    }}
                  >
                    {product.name}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: CAT_COLOR[product.category],
                      letterSpacing: '0.04em',
                    }}
                  >
                    {CATEGORIES[product.category].label}
                  </p>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'oklch(0.55 0.018 148)',
                    lineHeight: 1.5,
                  }}
                >
                  {product.tagline}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {product.registrationMapa && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                        color: 'oklch(0.45 0.014 148)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {product.registrationMapa}
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                      color: 'oklch(0.35 0.012 148)',
                    }}
                  >
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── FILOSOFIA ──────────────────────────────────────────── */}
      <section
        style={{
          padding: '100px 48px',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              color: 'oklch(0.73 0.135 78)',
              marginBottom: '28px',
            }}
          >
            Nossa filosofia
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 600,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              color: 'oklch(0.96 0.004 148)',
            }}
          >
            Ciência europeia.
            <br />
            <span style={{ color: 'oklch(0.58 0.165 148)' }}>Solo brasileiro.</span>
          </h2>
        </div>
        <div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.0625rem',
              color: 'oklch(0.62 0.022 148)',
              lineHeight: 1.75,
              marginBottom: '24px',
            }}
          >
            A Argho nasceu da convicção de que o produtor brasileiro merece acesso às formulações
            mais avançadas do mundo — sem abrir mão da segurança regulatória e da praticidade no
            campo.
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.0625rem',
              color: 'oklch(0.62 0.022 148)',
              lineHeight: 1.75,
            }}
          >
            Cada produto do nosso portfólio é desenvolvido com o rigor técnico europeu, registrado
            no MAPA e validado por agrônomos e distribuidores técnicos ao longo de ciclos reais de
            produção.
          </p>
          <Link
            href="/sobre"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '32px',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              color: 'oklch(0.73 0.135 78)',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Conheça a Argho →
          </Link>
        </div>
      </section>

      {/* ──────────── CTA FINAL ──────────────────────────────────────────── */}
      <section
        style={{
          margin: '0 48px 80px',
          backgroundColor: 'oklch(0.14 0.045 148)',
          border: '1px solid oklch(0.22 0.055 148)',
          borderRadius: '16px',
          padding: '64px 56px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '40px',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.875rem',
              fontWeight: 600,
              letterSpacing: '-0.035em',
              color: 'oklch(0.96 0.004 148)',
              marginBottom: '8px',
            }}
          >
            Pronto para elevar a nutrição da sua lavoura?
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'oklch(0.62 0.022 148)',
            }}
          >
            Explore o portfólio completo — 18 produtos, 4 linhas, todos registrados.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
          <Link
            href="/produtos"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              backgroundColor: 'oklch(0.73 0.135 78)',
              color: 'oklch(0.10 0 0)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              borderRadius: '8px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Ver portfólio →
          </Link>
          <Link
            href="/sobre"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: 'oklch(0.72 0.025 148)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              fontWeight: 400,
              border: '1px solid oklch(0.30 0.040 148)',
              borderRadius: '8px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Sobre a Argho
          </Link>
        </div>
      </section>
    </>
  );
}
