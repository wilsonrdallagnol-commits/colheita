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

const CAT_RAW: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'oklch(0.58 0.165 148)',
  organominerais: 'oklch(0.64 0.13 195)',
  biologicos: 'oklch(0.66 0.150 150)',
  adjuvantes: 'oklch(0.73 0.135 78)',
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

// Get the key nutrients present in a product, capped at 5 items
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
    <div style={{ minHeight: '100vh' }}>
      {/* ── Page header ── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid oklch(0.14 0.022 148)',
        }}
      >
        {/* Top scan-line bar */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background:
              'linear-gradient(90deg, oklch(0.58 0.165 148 / 0.5) 0%, oklch(0.73 0.135 78 / 0.7) 40%, oklch(0.64 0.13 195 / 0.4) 70%, transparent 100%)',
          }}
        />
        {/* Faint circuit grid */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(oklch(0.22 0.025 148 / 0.06) 1px, transparent 1px), linear-gradient(90deg, oklch(0.22 0.025 148 / 0.06) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '72px 48px 48px',
            position: 'relative',
          }}
        >
          {/* Top stat row */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              marginBottom: '20px',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.12em',
                color: 'oklch(0.58 0.165 148)',
                textTransform: 'uppercase',
              }}
            >
              Portfólio Argho
            </span>
            <span style={{ color: 'oklch(0.22 0.025 148)', fontSize: '0.75rem' }}>·</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'oklch(0.45 0.014 148)',
                letterSpacing: '0.06em',
              }}
            >
              {PRODUCTS.length} produtos
            </span>
            <span style={{ color: 'oklch(0.22 0.025 148)', fontSize: '0.75rem' }}>·</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'oklch(0.45 0.014 148)',
                letterSpacing: '0.06em',
              }}
            >
              {mapaCount} registros MAPA
            </span>
            <span style={{ color: 'oklch(0.22 0.025 148)', fontSize: '0.75rem' }}>·</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'oklch(0.45 0.014 148)',
                letterSpacing: '0.06em',
              }}
            >
              Origem Espanha
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
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
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              maxWidth: '520px',
              lineHeight: 1.65,
            }}
          >
            Nutrição foliar, organomineral e biológica com origem europeia e registro MAPA — para
            quem exige ciência aplicada ao campo.
          </p>
        </div>
      </div>

      {/* ── Category filter tabs ── */}
      <div
        style={{
          position: 'sticky',
          top: '64px',
          zIndex: 10,
          backgroundColor: 'oklch(0.07 0.018 148 / 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid oklch(0.14 0.022 148)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
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
              gap: '6px',
              padding: '14px 18px',
              borderBottom: !activeCategory
                ? '2px solid var(--text-primary)'
                : '2px solid transparent',
              color: !activeCategory ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: !activeCategory ? 600 : 400,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s',
            }}
          >
            TODOS
            <span
              style={{
                fontSize: '0.625rem',
                color: !activeCategory ? 'oklch(0.58 0.165 148)' : 'var(--text-faint)',
                backgroundColor: !activeCategory
                  ? 'oklch(0.14 0.045 148)'
                  : 'oklch(0.10 0.016 148)',
                padding: '1px 6px',
                borderRadius: '3px',
                fontWeight: 700,
              }}
            >
              {PRODUCTS.length}
            </span>
          </Link>

          {CATEGORY_KEYS.map((cat) => {
            const count = PRODUCTS.filter((p) => p.category === cat).length;
            const isActive = activeCategory === cat;
            const raw = CAT_RAW[cat];
            return (
              <Link
                key={cat}
                href={`/produtos?categoria=${cat}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '14px 18px',
                  borderBottom: isActive ? `2px solid ${CAT_COLORS[cat]}` : '2px solid transparent',
                  color: isActive ? CAT_COLORS[cat] : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: '0.04em',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                  ...(isActive && {
                    textShadow: `0 0 12px ${raw.replace(')', ' / 0.4)')}`,
                  }),
                }}
              >
                {CATEGORIES[cat].label.toUpperCase()}
                <span
                  style={{
                    fontSize: '0.625rem',
                    color: isActive ? CAT_COLORS[cat] : 'var(--text-faint)',
                    backgroundColor: isActive ? CAT_BG[cat] : 'oklch(0.10 0.016 148)',
                    padding: '1px 6px',
                    borderRadius: '3px',
                    fontWeight: 700,
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
        {/* Category description if filtered */}
        {activeCategory && (
          <div style={{ marginBottom: '40px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 16px',
                background: CAT_BG[activeCategory],
                borderRadius: '6px',
                border: `1px solid ${CAT_RAW[activeCategory].replace(')', ' / 0.20)')}`,
                marginBottom: '14px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: CAT_COLORS[activeCategory],
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: CAT_COLORS[activeCategory],
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                }}
              >
                {CATEGORIES[activeCategory].label.toUpperCase()}
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {displayed.map((product, i) => {
            const nutrients = getNutrientLabels(product);
            const color = CAT_COLORS[product.category];
            const raw = CAT_RAW[product.category];
            return (
              <Link
                key={product.slug}
                href={`/produtos/${product.slug}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '220px 1fr auto',
                    gap: '0 32px',
                    alignItems: 'center',
                    padding: '22px 20px 22px 20px',
                    borderTop: i === 0 ? '1px solid oklch(0.14 0.022 148)' : 'none',
                    borderBottom: '1px solid oklch(0.14 0.022 148)',
                    borderLeft: `3px solid ${color}`,
                    transition: 'background-color 0.15s',
                  }}
                >
                  {/* Name + category */}
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.0625rem',
                        fontWeight: 700,
                        letterSpacing: '-0.03em',
                        color: 'var(--text-primary)',
                        marginBottom: '4px',
                      }}
                    >
                      {product.name}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.10em',
                        color: color,
                      }}
                    >
                      {CATEGORIES[product.category].label}
                    </p>
                  </div>

                  {/* Center: tagline + nutrient badges */}
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        marginBottom: '8px',
                      }}
                    >
                      {product.tagline}
                    </p>
                    {/* Nutrient element badges */}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {nutrients.map((n) => (
                        <span
                          key={n}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.5875rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            color: color,
                            backgroundColor: raw.replace(')', ' / 0.10)'),
                            border: `1px solid ${raw.replace(')', ' / 0.16)')}`,
                            padding: '2px 6px',
                            borderRadius: '3px',
                          }}
                        >
                          {n}
                        </span>
                      ))}
                      {product.registrationMapa && (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.5875rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            color: 'oklch(0.58 0.165 148)',
                            backgroundColor: 'oklch(0.12 0.038 148)',
                            border: '1px solid oklch(0.20 0.045 148)',
                            padding: '2px 6px',
                            borderRadius: '3px',
                          }}
                        >
                          ✓ MAPA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: color,
                      opacity: 0.6,
                    }}
                  >
                    →
                  </span>
                </div>
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
            padding: '16px 20px',
            backgroundColor: 'oklch(0.065 0.012 148)',
            border: '1px solid oklch(0.13 0.018 148)',
            borderRadius: '6px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              color: 'oklch(0.38 0.010 148)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Todos os produtos exibem a composição garantida conforme Certificado de Análise e
            Registro no MAPA (Ministério da Agricultura, Pecuária e Abastecimento). O uso de
            fertilizantes requer acompanhamento de Engenheiro Agrônomo ou Florestal habilitado,
            conforme Lei 5.194/66. As recomendações de dose são orientativas.
          </p>
        </div>
      </div>
    </div>
  );
}
