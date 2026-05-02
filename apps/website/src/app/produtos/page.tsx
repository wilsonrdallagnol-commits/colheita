// apps/website/src/app/produtos/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORIES, PRODUCTS, type ProductCategory } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Portfólio',
  description:
    'Catálogo completo Argho Agrosciences — fertilizantes minerais, organominerais, biológicos e adjuvantes com registro MAPA.',
};

const CATEGORY_KEYS = Object.keys(CATEGORIES) as ProductCategory[];

const CAT_COLORS: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'var(--cat-mineral)',
  organominerais: 'var(--cat-organo)',
  biologicos: 'var(--cat-bio)',
  adjuvantes: 'var(--cat-adj)',
};

const CAT_BG: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'oklch(0.14 0.045 148 / 0.40)',
  organominerais: 'oklch(0.14 0.040 195 / 0.40)',
  biologicos: 'oklch(0.14 0.048 150 / 0.40)',
  adjuvantes: 'oklch(0.16 0.038 78 / 0.40)',
};

interface PageProps {
  searchParams: Promise<{ categoria?: string }>;
}

function formatCompositionLine(composition: import('@/lib/products').ProductComposition): string {
  const parts: string[] = [];
  const all = {
    ...(composition.macros ?? {}),
    ...(composition.micros ?? {}),
    ...(composition.others ?? {}),
  };
  for (const [k, v] of Object.entries(all).slice(0, 4)) {
    if (typeof v === 'number' && v > 0) {
      parts.push(`${k} ${v >= 1e7 ? `${(v / 1e8).toFixed(0)}×10⁸` : `${v}%`}`);
    } else {
      parts.push(k);
    }
  }
  return parts.join('  ·  ');
}

export default async function ProdutosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeCategory = (params.categoria as ProductCategory | undefined) ?? null;

  const displayed = activeCategory
    ? PRODUCTS.filter((p) => p.category === activeCategory)
    : PRODUCTS;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Page header ── */}
      <div
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          padding: '72px 48px 48px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            letterSpacing: '0.12em',
            color: 'var(--green)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          Portfólio Argho — {PRODUCTS.length} produtos registrados
        </p>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3.25rem)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            color: 'var(--text-primary)',
            marginBottom: '16px',
          }}
        >
          Catálogo completo.
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            maxWidth: '520px',
            lineHeight: 1.65,
          }}
        >
          Nutrição foliar, organoминeral e biológica com origem europeia e registro MAPA — para quem
          exige ciência aplicada ao campo.
        </p>
      </div>

      {/* ── Category filter tabs ── */}
      <div
        style={{
          position: 'sticky',
          top: '64px',
          zIndex: 10,
          backgroundColor: 'oklch(0.07 0.018 148 / 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 48px',
            display: 'flex',
            gap: '4px',
            overflowX: 'auto',
          }}
        >
          {/* All */}
          <Link
            href="/produtos"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '14px 16px',
              borderBottom: !activeCategory
                ? '2px solid var(--text-primary)'
                : '2px solid transparent',
              color: !activeCategory ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.8125rem',
              fontWeight: !activeCategory ? 500 : 400,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s',
            }}
          >
            Todos
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: !activeCategory ? 'var(--text-muted)' : 'var(--text-faint)',
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
                  gap: '6px',
                  padding: '14px 16px',
                  borderBottom: isActive ? `2px solid ${CAT_COLORS[cat]}` : '2px solid transparent',
                  color: isActive ? CAT_COLORS[cat] : 'var(--text-muted)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 500 : 400,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}
              >
                {CATEGORIES[cat].label}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    color: isActive ? CAT_COLORS[cat] : 'var(--text-faint)',
                  }}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Product list ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px 80px' }}>
        {/* If filtered: show category header */}
        {activeCategory && (
          <div style={{ marginBottom: '40px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                background: CAT_BG[activeCategory],
                borderRadius: '6px',
                border: `1px solid ${CAT_COLORS[activeCategory]}26`,
                marginBottom: '16px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: CAT_COLORS[activeCategory],
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8125rem',
                  color: CAT_COLORS[activeCategory],
                  fontWeight: 600,
                }}
              >
                {CATEGORIES[activeCategory].label}
              </span>
            </div>
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                maxWidth: '640px',
              }}
            >
              {CATEGORIES[activeCategory].description}
            </p>
          </div>
        )}

        {/* Product rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {displayed.map((product, i) => {
            const compLine = formatCompositionLine(product.composition);
            return (
              <Link
                key={product.slug}
                href={`/produtos/${product.slug}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '240px 1fr 1fr auto',
                    gap: '0 32px',
                    alignItems: 'center',
                    padding: '24px 0',
                    borderTop: i === 0 ? '1px solid var(--border-subtle)' : 'none',
                    borderBottom: '1px solid var(--border-subtle)',
                    borderLeft: `3px solid ${CAT_COLORS[product.category]}`,
                    paddingLeft: '20px',
                    transition: 'background-color 0.15s',
                  }}
                >
                  {/* Name + category */}
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.0625rem',
                        fontWeight: 600,
                        letterSpacing: '-0.025em',
                        color: 'var(--text-primary)',
                        marginBottom: '4px',
                      }}
                    >
                      {product.name}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: CAT_COLORS[product.category],
                      }}
                    >
                      {CATEGORIES[product.category].label}
                    </p>
                  </div>

                  {/* Tagline */}
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    {product.tagline}
                  </p>

                  {/* Composition */}
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {compLine || '—'}
                  </p>

                  {/* Arrow + MAPA */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '6px',
                    }}
                  >
                    {product.registrationMapa && (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.625rem',
                          color: 'var(--text-faint)',
                          letterSpacing: '0.04em',
                        }}
                      >
                        MAPA
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-faint)',
                      }}
                    >
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {displayed.length === 0 && (
          <div
            style={{
              padding: '80px 0',
              textAlign: 'center',
            }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Nenhum produto encontrado nessa categoria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
