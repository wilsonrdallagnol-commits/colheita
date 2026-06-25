// apps/website/src/app/produtos/page.tsx
// Catálogo — Argho Agrosciences (Redesign 2026)
// White-first. Lista editorial. Filtros sticky. Paleta oficial Argho.

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES, PRODUCTS, type ProductCategory } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Portfólio',
  description:
    'Catálogo completo Argho Agrosciences — fertilizantes minerais, organominerais, biológicos e adjuvantes desenvolvidos para a agricultura brasileira.',
};

const CATEGORY_KEYS = Object.keys(CATEGORIES) as ProductCategory[];

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

// Arte premium (rotulo real fiel + swirl categorico) — thumbnail do catalogo.
// Cobre os 20 produtos (ver .tmp-renders/compose2.py).
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
  searchParams: Promise<{ categoria?: string }>;
}

function getNutrientLabels(product: import('@/lib/products').Product): string[] {
  const labels: string[] = [];
  const all = {
    ...(product.composition.macros ?? {}),
    ...(product.composition.micros ?? {}),
    ...(product.composition.others ?? {}),
  };
  for (const [k, v] of Object.entries(all).slice(0, 5)) {
    if (v) labels.push(k);
  }
  return labels;
}

export default async function ProdutosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeCategory = (params.categoria as ProductCategory | undefined) ?? null;

  const displayed = activeCategory
    ? PRODUCTS.filter((p) => p.category === activeCategory)
    : PRODUCTS;

  const mapaCount = PRODUCTS.filter((p) => p.registrationMapa).length;

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER — eyebrow + headline editorial bold + meta inline
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          padding: '40px 48px 64px',
          borderBottom: '1px solid var(--border-subtle)',
          overflow: 'hidden',
        }}
      >
        {/* Top scan-line bar (paleta oficial) */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background:
              'linear-gradient(90deg, var(--argho-blue) 0%, var(--argho-green) 35%, var(--gold) 70%, transparent 100%)',
          }}
        />

        {/* Faint editorial grid (mesmo padrão da home) */}
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
            opacity: 0.5,
            maskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, black 30%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 80% at 50% 50%, black 30%, transparent 80%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Eyebrow + meta inline */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              alignItems: 'center',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: '28px',
                  height: '1px',
                  background: 'var(--argho-green)',
                }}
              />
              <span
                className="mono"
                style={{
                  fontSize: '0.6875rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--argho-blue)',
                  fontWeight: 600,
                }}
              >
                Portfólio Argho · Linha 2026
              </span>
            </div>
            <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>·</span>
            <span
              className="mono"
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-tertiary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {PRODUCTS.length} produtos
            </span>
            <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>·</span>
            <span
              className="mono"
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-tertiary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {mapaCount} registros MAPA
            </span>
            <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>·</span>
            <span
              className="mono"
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-tertiary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Origem Espanha e Brasil
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 700,
              letterSpacing: '-0.055em',
              lineHeight: 0.95,
              color: 'var(--argho-blue)',
              marginBottom: '24px',
              maxWidth: '900px',
            }}
          >
            Catálogo <span style={{ color: 'var(--argho-green)' }}>completo</span>.
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.0625rem',
              color: 'var(--text-secondary)',
              maxWidth: '580px',
              lineHeight: 1.65,
            }}
          >
            Nutrição foliar, organomineral e biológica — fertilizantes de origem europeia com
            registro MAPA e linhas biológica e de adjuvantes nacionais, para quem exige ciência
            aplicada ao campo.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          STICKY FILTER TABS — light, blur, accent por categoria
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: 'sticky',
          top: '88px',
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            padding: '0 48px',
            display: 'flex',
            gap: '0',
            overflowX: 'auto',
          }}
        >
          {/* All */}
          <Link
            href="/produtos"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 20px',
              borderBottom: !activeCategory
                ? '2px solid var(--argho-blue)'
                : '2px solid transparent',
              color: !activeCategory ? 'var(--argho-blue)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: !activeCategory ? 700 : 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s ease, border-color 0.15s ease',
            }}
          >
            Todos
            <span
              style={{
                fontSize: '0.625rem',
                color: !activeCategory ? 'var(--argho-blue)' : 'var(--text-faint)',
                backgroundColor: !activeCategory ? 'var(--argho-blue-soft)' : 'var(--bg-soft)',
                padding: '2px 7px',
                borderRadius: '999px',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              {PRODUCTS.length}
            </span>
          </Link>

          {CATEGORY_KEYS.map((cat) => {
            const count = PRODUCTS.filter((p) => p.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <Link
                key={cat}
                href={`/produtos?categoria=${cat}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 20px',
                  borderBottom: isActive ? `2px solid ${CAT_COLORS[cat]}` : '2px solid transparent',
                  color: isActive ? CAT_COLORS[cat] : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease, border-color 0.15s ease',
                }}
              >
                {CATEGORIES[cat].label}
                <span
                  style={{
                    fontSize: '0.625rem',
                    color: isActive ? CAT_COLORS[cat] : 'var(--text-faint)',
                    backgroundColor: isActive ? CAT_BG_SOFT[cat] : 'var(--bg-soft)',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          PRODUCT LIST — editorial rows, accent colorido por categoria
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: '1320px', margin: '0 auto', padding: '56px 48px 96px' }}>
        {/* Category description if filtered */}
        {activeCategory && (
          <div style={{ marginBottom: '40px', maxWidth: '720px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 14px',
                background: CAT_BG_SOFT[activeCategory],
                borderRadius: '999px',
                border: `1px solid ${CAT_LINE[activeCategory]}`,
                marginBottom: '16px',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: CAT_COLORS[activeCategory],
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${CAT_RAW[activeCategory].replace(')', ' / 0.4)')}`,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: CAT_COLORS[activeCategory],
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {CATEGORIES[activeCategory].label}
              </span>
            </div>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
              }}
            >
              {CATEGORIES[activeCategory].description}
            </p>
          </div>
        )}

        {/* Product rows */}
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
          {displayed.map((product, i) => {
            const nutrients = getNutrientLabels(product);
            const color = CAT_COLORS[product.category];
            const bgSoft = CAT_BG_SOFT[product.category];
            const line = CAT_LINE[product.category];
            const premiumSrc: string | undefined = PRODUCT_PREMIUM[product.slug];
            return (
              <Link
                key={product.slug}
                href={`/produtos/${product.slug}`}
                style={{ textDecoration: 'none', display: 'block' }}
                className="product-row"
              >
                <article
                  className="produto-row-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '160px minmax(0, 220px) minmax(0, 1fr) auto',
                    gap: '0 28px',
                    alignItems: 'center',
                    padding: '24px 28px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                    borderLeft: `3px solid ${color}`,
                    transition: 'background-color 0.18s ease, transform 0.18s ease',
                    backgroundColor: 'var(--bg)',
                  }}
                >
                  {/* Thumbnail premium — mockup real fiel sobre swirl categorico */}
                  <div
                    style={{
                      width: '160px',
                      height: '160px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: `1px solid ${line}`,
                      backgroundColor: 'var(--bg)',
                      flexShrink: 0,
                    }}
                  >
                    {premiumSrc ? (
                      <Image
                        src={premiumSrc}
                        alt={`Embalagem de ${product.name} — ${CATEGORIES[product.category].label} Argho Agrosciences`}
                        width={160}
                        height={160}
                        quality={85}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          display: 'flex',
                          width: '100%',
                          height: '100%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.875rem',
                          fontWeight: 700,
                          letterSpacing: '-0.04em',
                          color: color,
                          opacity: 0.85,
                        }}
                      >
                        {product.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Name + category */}
                  <div>
                    <h2
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.125rem',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                        color: 'var(--text-primary)',
                        marginBottom: '6px',
                        lineHeight: 1.05,
                      }}
                    >
                      {product.name}
                    </h2>
                    <p
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        color: color,
                      }}
                    >
                      {CATEGORIES[product.category].label}
                    </p>
                  </div>

                  {/* Tagline + nutrient badges */}
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9375rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.55,
                        marginBottom: '10px',
                      }}
                    >
                      {product.tagline}
                    </p>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {nutrients.map((n) => (
                        <span
                          key={n}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            color: color,
                            backgroundColor: bgSoft,
                            border: `1px solid ${line}`,
                            padding: '3px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {n}
                        </span>
                      ))}
                      {product.registrationMapa && (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            color: 'var(--argho-blue)',
                            backgroundColor: 'var(--argho-blue-soft)',
                            border: '1px solid var(--cat-organo-line)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          ✓ MAPA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <span
                    aria-hidden
                    style={{
                      fontSize: '1.125rem',
                      color: color,
                      opacity: 0.7,
                      transition: 'transform 0.18s ease, opacity 0.18s ease',
                    }}
                    className="product-arrow"
                  >
                    →
                  </span>
                </article>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {displayed.length === 0 && (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Nenhum produto encontrado nessa categoria.
            </p>
          </div>
        )}

        {/* Legal footer */}
        <div
          style={{
            marginTop: '48px',
            padding: '20px 24px',
            backgroundColor: 'var(--bg-soft)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <span
            aria-hidden
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
              color: 'var(--argho-blue)',
              flexShrink: 0,
              fontWeight: 700,
              marginTop: '1px',
            }}
          >
            §
          </span>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Os fertilizantes minerais e organominerais possuem Registro no MAPA (Ministério da
            Agricultura, Pecuária e Abastecimento) e exibem a composição garantida conforme
            Certificado de Análise. Os produtos biológicos têm composição microbiológica
            declarada. Os adjuvantes da linha Operate são isentos de registro no MAPA, nos termos
            da legislação vigente. O uso de fertilizantes requer acompanhamento de Engenheiro
            Agrônomo ou Florestal habilitado, conforme Lei 5.194/66. As recomendações de dose são
            orientativas.
          </p>
        </div>
      </section>

      {/* Hover styling + responsive overrides */}
      <style>{`
        .product-row:hover article {
          background-color: var(--bg-warm) !important;
        }
        .product-row:hover .product-arrow {
          transform: translateX(4px);
          opacity: 1 !important;
        }
        @media (max-width: 768px) {
          .produto-row-grid {
            grid-template-columns: 88px minmax(0, 1fr) auto !important;
            grid-template-areas: "thumb name arrow" "thumb tag tag" !important;
            gap: 8px 16px !important;
            padding: 16px !important;
            align-items: start !important;
          }
          .produto-row-grid h2 {
            font-size: 1rem !important;
            line-height: 1.15 !important;
          }
          .produto-row-grid p {
            font-size: 0.8125rem !important;
            line-height: 1.45 !important;
          }
          .produto-row-grid > div:nth-child(1) {
            grid-area: thumb;
            width: 88px !important;
            height: 88px !important;
            align-self: start;
          }
          .produto-row-grid > div:nth-child(2) { grid-area: name; align-self: center; }
          .produto-row-grid > div:nth-child(3) { grid-area: tag; }
          .produto-row-grid > span:last-child { grid-area: arrow; }
          .produto-row-grid img { max-width: 100% !important; max-height: 100% !important; }
        }
      `}</style>
    </main>
  );
}
