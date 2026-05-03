// apps/website/src/app/page.tsx
// Home — Argho Agrosciences
// Design: Editorial de precisão. Embalagens reais como hero. Plataforma Colheita integrada.

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  DigitalHeartEcosystem,
  ElementBadge,
  HeroBioBackground,
  ImpuchSoilViz,
  OperateLineGrid,
  StronNpkChart,
} from '@/components/product-visuals';
import type { ProductCategory } from '@/lib/products';
import { CATEGORIES, PRODUCTS } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Argho Agrosciences — Nutrição de precisão para o agro brasileiro',
};

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
  const categoryKeys = Object.keys(CATEGORIES) as ProductCategory[];
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
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'center',
          padding: '80px 64px 64px',
          position: 'relative',
          overflow: 'hidden',
          gap: '40px',
        }}
      >
        {/* Background: bio-circuit SVG */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '60vw',
            height: '100%',
            pointerEvents: 'none',
            opacity: 0.22,
          }}
        >
          <HeroBioBackground />
        </div>

        {/* Background: radial gradient atmosphere */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 80% 80% at 75% 50%, oklch(0.58 0.165 148 / 0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        {/* Gold vertical rule */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '40px',
            top: '80px',
            bottom: '64px',
            width: '2px',
            background:
              'linear-gradient(to bottom, transparent, oklch(0.73 0.135 78 / 0.45) 30%, oklch(0.73 0.135 78 / 0.45) 70%, transparent)',
          }}
        />

        {/* ── Left: Editorial Text ── */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              fontWeight: 500,
              letterSpacing: '0.16em',
              color: 'oklch(0.73 0.135 78)',
              textTransform: 'uppercase',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '24px',
                height: '1px',
                backgroundColor: 'oklch(0.73 0.135 78 / 0.6)',
              }}
            />
            Origem europeia · Registro MAPA · Ciência aplicada ao campo
          </p>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3.5rem, 6.5vw, 7rem)',
              fontWeight: 700,
              letterSpacing: '-0.05em',
              lineHeight: 0.92,
              color: 'oklch(0.96 0.004 148)',
              marginBottom: '8px',
            }}
          >
            Nutrição
          </h1>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3.5rem, 6.5vw, 7rem)',
              fontWeight: 700,
              letterSpacing: '-0.05em',
              lineHeight: 0.92,
              color: 'oklch(0.96 0.004 148)',
              marginBottom: '8px',
            }}
          >
            de{' '}
            <span
              style={{
                color: 'oklch(0.58 0.165 148)',
                WebkitTextStroke: '0px',
              }}
            >
              precisão
            </span>
          </h1>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3.5rem, 6.5vw, 7rem)',
              fontWeight: 700,
              letterSpacing: '-0.05em',
              lineHeight: 0.92,
              color: 'oklch(0.73 0.135 78)',
              marginBottom: '48px',
            }}
          >
            para o campo.
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(0.9375rem, 1.3vw, 1.125rem)',
              fontWeight: 400,
              color: 'oklch(0.60 0.022 148)',
              lineHeight: 1.7,
              maxWidth: '460px',
              marginBottom: '48px',
            }}
          >
            Fertilizantes minerais, organominerais, biológicos e adjuvantes de alta performance —
            formulados na Europa, registrados pelo MAPA.
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '64px' }}>
            <Link
              href="/produtos"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 28px',
                backgroundColor: 'oklch(0.73 0.135 78)',
                color: 'oklch(0.08 0 0)',
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
                padding: '13px 24px',
                backgroundColor: 'transparent',
                color: 'oklch(0.68 0.025 148)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                border: '1px solid oklch(0.20 0.025 148)',
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
              borderTop: '1px solid oklch(0.18 0.022 148)',
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
                  paddingRight: '24px',
                  borderRight: i < 3 ? '1px solid oklch(0.16 0.018 148)' : 'none',
                  paddingLeft: i > 0 ? '24px' : '0',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.625rem',
                    fontWeight: 700,
                    letterSpacing: '-0.045em',
                    color: 'oklch(0.96 0.004 148)',
                    marginBottom: '3px',
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.6875rem',
                    color: 'oklch(0.48 0.016 148)',
                    letterSpacing: '-0.005em',
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Product Cluster ── */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '520px',
            zIndex: 2,
          }}
        >
          {/* Atmospheric glow behind products */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '360px',
              height: '360px',
              background:
                'radial-gradient(circle, oklch(0.58 0.165 148 / 0.18) 0%, oklch(0.64 0.13 195 / 0.10) 40%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Element badges floating */}
          <ElementBadge symbol="Fe" number="26" top="12%" right="8%" size="md" opacity={0.55} />
          <ElementBadge symbol="Zn" number="30" top="65%" right="4%" size="sm" opacity={0.48} />
          <ElementBadge symbol="B" number="5" top="22%" right="68%" size="lg" opacity={0.42} />
          <ElementBadge symbol="K" number="19" bottom="20%" right="72%" size="sm" opacity={0.5} />

          {/* Product cluster — 3 bottles arranged with depth */}

          {/* Back-left: Impuch (teal/organomineral) */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '30px',
              transform: 'rotate(-8deg) translateY(10px)',
              zIndex: 1,
            }}
          >
            <div
              style={{
                filter:
                  'drop-shadow(0 24px 60px oklch(0.64 0.13 195 / 0.50)) drop-shadow(0 4px 12px oklch(0.64 0.13 195 / 0.30))',
                animation: 'float 7.5s ease-in-out infinite',
                animationDelay: '1.2s',
              }}
            >
              <Image
                src="/products/impuch.png"
                alt="Impuch — fertilizante organomineral"
                width={130}
                height={190}
                style={{ objectFit: 'contain', display: 'block' }}
              />
            </div>
            <div
              style={{
                textAlign: 'center',
                marginTop: '8px',
                padding: '4px 12px',
                backgroundColor: 'oklch(0.64 0.13 195 / 0.12)',
                border: '1px solid oklch(0.64 0.13 195 / 0.22)',
                borderRadius: '4px',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5625rem',
                  letterSpacing: '0.10em',
                  color: 'oklch(0.64 0.13 195)',
                  textTransform: 'uppercase',
                }}
              >
                Organomineral
              </p>
            </div>
          </div>

          {/* Front-center: Stron (green/fertilizante mineral) — main product */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 3,
            }}
          >
            <div
              style={{
                filter:
                  'drop-shadow(0 32px 80px oklch(0.58 0.165 148 / 0.60)) drop-shadow(0 8px 20px oklch(0.58 0.165 148 / 0.35))',
                animation: 'float 6.0s ease-in-out infinite',
                animationDelay: '0s',
              }}
            >
              <Image
                src="/products/stron.png"
                alt="Stron — fertilizante NPK foliar"
                width={180}
                height={260}
                style={{ objectFit: 'contain', display: 'block' }}
                priority
              />
            </div>
            <div
              style={{
                textAlign: 'center',
                marginTop: '12px',
                padding: '5px 16px',
                backgroundColor: 'oklch(0.58 0.165 148 / 0.12)',
                border: '1px solid oklch(0.58 0.165 148 / 0.28)',
                borderRadius: '4px',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5625rem',
                  letterSpacing: '0.10em',
                  color: 'oklch(0.58 0.165 148)',
                  textTransform: 'uppercase',
                }}
              >
                Fertilizante Mineral
              </p>
            </div>
          </div>

          {/* Back-right: Operate (gold/adjuvante) */}
          <div
            style={{
              position: 'absolute',
              bottom: '36px',
              right: '20px',
              transform: 'rotate(7deg) translateY(8px)',
              zIndex: 2,
            }}
          >
            <div
              style={{
                filter:
                  'drop-shadow(0 20px 50px oklch(0.73 0.135 78 / 0.45)) drop-shadow(0 4px 10px oklch(0.73 0.135 78 / 0.25))',
                animation: 'float 5.5s ease-in-out infinite',
                animationDelay: '2.4s',
              }}
            >
              <Image
                src="/products/operate.png"
                alt="Operate — adjuvante espalhante"
                width={120}
                height={175}
                style={{ objectFit: 'contain', display: 'block' }}
              />
            </div>
            <div
              style={{
                textAlign: 'center',
                marginTop: '8px',
                padding: '4px 12px',
                backgroundColor: 'oklch(0.73 0.135 78 / 0.10)',
                border: '1px solid oklch(0.73 0.135 78 / 0.22)',
                borderRadius: '4px',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5625rem',
                  letterSpacing: '0.10em',
                  color: 'oklch(0.73 0.135 78)',
                  textTransform: 'uppercase',
                }}
              >
                Adjuvante
              </p>
            </div>
          </div>

          {/* Top product: Lifeon (smaller, floating at top) */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '120px',
              zIndex: 2,
            }}
          >
            <div
              style={{
                filter: 'drop-shadow(0 16px 40px oklch(0.66 0.150 150 / 0.40))',
                animation: 'float 8.0s ease-in-out infinite',
                animationDelay: '0.8s',
              }}
            >
              <Image
                src="/products/lifeon.png"
                alt="Life On — bioestimulante organomineral"
                width={90}
                height={130}
                style={{ objectFit: 'contain', display: 'block' }}
              />
            </div>
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
              padding: '28px 64px',
              borderBottom: '1px solid oklch(0.12 0.016 148)',
              textDecoration: 'none',
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
              style={{ display: 'flex', alignItems: 'center', gap: '16px', whiteSpace: 'nowrap' }}
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

      {/* ──────────── PRODUTOS EM DESTAQUE ────────────────────────────────── */}
      <section
        style={{
          padding: '80px 64px',
          maxWidth: '1440px',
          margin: '0 auto',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            fontWeight: 500,
            letterSpacing: '0.12em',
            color: 'oklch(0.52 0.018 148)',
            textTransform: 'uppercase',
            marginBottom: '48px',
          }}
        >
          Produtos em destaque
        </p>

        {/* 2-column: Stron + Impuch */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px',
          }}
        >
          {/* ── Stron card ── */}
          <Link
            href="/produtos/stron"
            style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
          >
            <div
              style={{
                backgroundColor: 'oklch(0.10 0.020 148)',
                border: '1px solid oklch(0.22 0.025 148)',
                borderTop: '2px solid oklch(0.58 0.165 148)',
                borderRadius: '12px',
                overflow: 'hidden',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '24px 24px 0',
                  backgroundColor: 'oklch(0.085 0.018 148)',
                  borderBottom: '1px solid oklch(0.155 0.018 148)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '0',
                }}
              >
                <div style={{ flex: 1 }}>
                  <StronNpkChart />
                </div>
                <div
                  style={{
                    width: '100px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    src="/products/stron.png"
                    alt="Stron 1L"
                    width={100}
                    height={140}
                    style={{
                      objectFit: 'contain',
                      display: 'block',
                      filter: 'drop-shadow(0 8px 24px oklch(0.58 0.165 148 / 0.40))',
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  padding: '28px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.5875rem',
                      fontWeight: 600,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      color: 'oklch(0.58 0.165 148)',
                      backgroundColor: 'oklch(0.14 0.045 148)',
                      padding: '3px 9px',
                      borderRadius: '4px',
                    }}
                  >
                    Fertilizante Mineral
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.5875rem',
                      color: 'oklch(0.40 0.014 148)',
                    }}
                  >
                    Via Foliar
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2rem, 3.5vw, 3.25rem)',
                    fontWeight: 700,
                    letterSpacing: '-0.045em',
                    lineHeight: 0.92,
                    color: 'oklch(0.96 0.004 148)',
                  }}
                >
                  Stron
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    color: 'oklch(0.62 0.022 148)',
                    lineHeight: 1.6,
                    flex: 1,
                  }}
                >
                  NPK foliar de alta solubilidade com complexo de aminoácidos e ácidos carboxílicos
                  — máxima absorção foliar em aplicação única.
                </p>
                <div style={{ display: 'flex', gap: '24px' }}>
                  {[
                    ['N', '4,5%'],
                    ['P₂O₅', '2,0%'],
                    ['K₂O', '7,2%'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.5875rem',
                          color: 'oklch(0.40 0.014 148)',
                          letterSpacing: '0.08em',
                          marginBottom: '3px',
                        }}
                      >
                        {k}
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '1.0625rem',
                          fontWeight: 700,
                          color: 'oklch(0.58 0.165 148)',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {v}
                      </p>
                    </div>
                  ))}
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '4px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8125rem',
                    color: 'oklch(0.58 0.165 148)',
                    fontWeight: 500,
                  }}
                >
                  Ficha técnica completa →
                </span>
              </div>
            </div>
          </Link>

          {/* ── Impuch card ── */}
          <Link
            href="/produtos/impuch"
            style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
          >
            <div
              style={{
                backgroundColor: 'oklch(0.10 0.020 148)',
                border: '1px solid oklch(0.22 0.025 148)',
                borderTop: '2px solid oklch(0.64 0.13 195)',
                borderRadius: '12px',
                overflow: 'hidden',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '24px 24px 0',
                  backgroundColor: 'oklch(0.085 0.018 148)',
                  borderBottom: '1px solid oklch(0.155 0.018 148)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <ImpuchSoilViz />
                </div>
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-end' }}>
                  <Image
                    src="/products/impuch.png"
                    alt="Impuch 1L"
                    width={100}
                    height={140}
                    style={{
                      objectFit: 'contain',
                      display: 'block',
                      filter: 'drop-shadow(0 8px 24px oklch(0.64 0.13 195 / 0.40))',
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  padding: '28px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.5875rem',
                      fontWeight: 600,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      color: 'oklch(0.64 0.13 195)',
                      backgroundColor: 'oklch(0.14 0.040 195)',
                      padding: '3px 9px',
                      borderRadius: '4px',
                    }}
                  >
                    Organomineral
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.5875rem',
                      color: 'oklch(0.40 0.014 148)',
                    }}
                  >
                    Fertirrigação · Solo
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2rem, 3.5vw, 3.25rem)',
                    fontWeight: 700,
                    letterSpacing: '-0.045em',
                    lineHeight: 0.92,
                    color: 'oklch(0.96 0.004 148)',
                  }}
                >
                  Impuch
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    color: 'oklch(0.62 0.022 148)',
                    lineHeight: 1.6,
                    flex: 1,
                  }}
                >
                  Organomineral de solo com vinhaça concentrada, ácidos húmicos e fúlvicos —
                  melhoria estrutural e estímulo biológico para o sistema radicular.
                </p>
                <div style={{ display: 'flex', gap: '24px' }}>
                  {[
                    ['M.O.', '8,0%'],
                    ['Húm.', '2,0%'],
                    ['K₂O', '2,5%'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.5875rem',
                          color: 'oklch(0.40 0.014 148)',
                          letterSpacing: '0.08em',
                          marginBottom: '3px',
                        }}
                      >
                        {k}
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '1.0625rem',
                          fontWeight: 700,
                          color: 'oklch(0.64 0.13 195)',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {v}
                      </p>
                    </div>
                  ))}
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '4px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8125rem',
                    color: 'oklch(0.64 0.13 195)',
                    fontWeight: 500,
                  }}
                >
                  Ficha técnica completa →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Linha Operate — full width ── */}
        <div
          style={{
            backgroundColor: 'oklch(0.10 0.020 148)',
            border: '1px solid oklch(0.22 0.025 148)',
            borderTop: '2px solid oklch(0.73 0.135 78)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: '24px',
              padding: '28px 32px 24px',
              borderBottom: '1px solid oklch(0.155 0.018 148)',
            }}
          >
            <div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5875rem',
                    fontWeight: 600,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    color: 'oklch(0.73 0.135 78)',
                    backgroundColor: 'oklch(0.16 0.038 78)',
                    padding: '3px 9px',
                    borderRadius: '4px',
                  }}
                >
                  Adjuvantes
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5875rem',
                    color: 'oklch(0.40 0.014 148)',
                  }}
                >
                  4 produtos · Linha completa
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.0,
                  color: 'oklch(0.96 0.004 148)',
                  marginBottom: '8px',
                }}
              >
                Linha Operate
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  color: 'oklch(0.62 0.022 148)',
                  lineHeight: 1.55,
                }}
              >
                Espalhantes adesivos premium com óleos essenciais, condicionamento de pH e ação
                antideriva — para potencializar qualquer calda agrícola.
              </p>
            </div>
            <Link
              href="/produtos?categoria=adjuvantes"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                whiteSpace: 'nowrap',
                border: '1px solid oklch(0.73 0.135 78 / 0.45)',
                color: 'oklch(0.73 0.135 78)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: 500,
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              Ver linha completa →
            </Link>
          </div>
          <OperateLineGrid />
        </div>
      </section>

      {/* ──────────── PRODUTO EM FOCO — IMPUCH ─────────────────────────────── */}
      <section
        style={{
          borderTop: '1px solid oklch(0.155 0.018 148)',
          padding: '80px 64px',
          background:
            'linear-gradient(180deg, oklch(0.07 0.018 148) 0%, oklch(0.095 0.030 148 / 0.50) 50%, oklch(0.07 0.018 148) 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: '45vw',
            height: '80%',
            background:
              'radial-gradient(ellipse 70% 65% at 60% 40%, oklch(0.64 0.13 195 / 0.12) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '52px',
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  color: 'oklch(0.64 0.13 195)',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                Linha Organomineral
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                  color: 'oklch(0.96 0.004 148)',
                }}
              >
                Impuch —{' '}
                <span style={{ color: 'oklch(0.64 0.13 195)' }}>vinhaça + húmus + solo vivo</span>
              </h2>
            </div>
            <a
              href="/produtos/impuch"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                whiteSpace: 'nowrap',
                border: '1px solid oklch(0.64 0.13 195 / 0.45)',
                color: 'oklch(0.64 0.13 195)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: 500,
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              Ficha técnica →
            </a>
          </div>

          {/* Mockup showcase grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.8fr 0.8fr 0.8fr',
              gap: '20px',
              alignItems: 'end',
            }}
          >
            <div
              style={{
                backgroundColor: 'oklch(0.10 0.025 195)',
                border: '1px solid oklch(0.64 0.13 195 / 0.35)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '32px 24px 0',
                position: 'relative',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: '20%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '200px',
                  height: '200px',
                  background:
                    'radial-gradient(circle, oklch(0.64 0.13 195 / 0.25) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <Image
                src="/products/impuch.png"
                alt="Impuch — fertilizante organomineral líquido 1L"
                width={220}
                height={280}
                style={{
                  width: '100%',
                  maxWidth: '220px',
                  objectFit: 'contain',
                  position: 'relative',
                  zIndex: 1,
                  filter: 'drop-shadow(0 12px 40px oklch(0.64 0.13 195 / 0.45))',
                  animation: 'float 6s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  width: '100%',
                  paddingTop: '20px',
                  paddingBottom: '20px',
                  borderTop: '1px solid oklch(0.64 0.13 195 / 0.20)',
                  marginTop: '12px',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    letterSpacing: '0.10em',
                    color: 'oklch(0.64 0.13 195)',
                    textTransform: 'uppercase',
                  }}
                >
                  Linha base · 1L
                </p>
              </div>
            </div>

            {[
              { src: '/products/impuch-1.png', label: 'Impuch 1L', sub: 'Fertirrigação' },
              { src: '/products/impuch-5l.png', label: 'Impuch 5L', sub: 'Granel técnico' },
              { src: '/products/impuch-20l.png', label: 'Impuch 20L', sub: 'Aplicação ampla' },
            ].map((item) => (
              <div
                key={item.src}
                style={{
                  backgroundColor: 'oklch(0.09 0.022 195)',
                  border: '1px solid oklch(0.64 0.13 195 / 0.22)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '24px 16px 0',
                  position: 'relative',
                }}
              >
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: '15%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '120px',
                    height: '120px',
                    background:
                      'radial-gradient(circle, oklch(0.64 0.13 195 / 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />
                <Image
                  src={item.src}
                  alt={item.label}
                  width={150}
                  height={150}
                  style={{
                    width: '100%',
                    maxWidth: '150px',
                    objectFit: 'contain',
                    position: 'relative',
                    zIndex: 1,
                    filter: 'drop-shadow(0 8px 24px oklch(0.64 0.13 195 / 0.35))',
                    animation: 'float 7s ease-in-out infinite',
                    animationDelay: '0.8s',
                  }}
                />
                <div
                  style={{
                    width: '100%',
                    paddingTop: '16px',
                    paddingBottom: '16px',
                    borderTop: '1px solid oklch(0.64 0.13 195 / 0.15)',
                    marginTop: '12px',
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      color: 'oklch(0.86 0.012 148)',
                      marginBottom: '2px',
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.5875rem',
                      color: 'oklch(0.64 0.13 195)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Key specs strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              marginTop: '40px',
              border: '1px solid oklch(0.64 0.13 195 / 0.22)',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            {[
              { k: 'M.O.', v: '8,0%', label: 'Matéria Orgânica' },
              { k: 'Húm.', v: '2,0%', label: 'Ác. Húmicos' },
              { k: 'Fúlv.', v: '1,2%', label: 'Ác. Fúlvicos' },
              { k: 'K₂O', v: '2,5%', label: 'Potássio' },
              { k: 'pH', v: '7,8', label: 'Neutro' },
            ].map((s, i) => (
              <div
                key={s.k}
                style={{
                  padding: '20px 24px',
                  borderLeft: i > 0 ? '1px solid oklch(0.64 0.13 195 / 0.18)' : 'none',
                  backgroundColor: 'oklch(0.09 0.022 195)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5625rem',
                    color: 'oklch(0.48 0.018 148)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                  }}
                >
                  {s.label}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    letterSpacing: '-0.04em',
                    color: 'oklch(0.64 0.13 195)',
                    lineHeight: 1,
                    marginBottom: '2px',
                  }}
                >
                  {s.v}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5875rem',
                    color: 'oklch(0.40 0.014 148)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {s.k}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── ECOSSISTEMA ARGHO ──────────────────────────────────── */}
      <section
        style={{
          borderTop: '1px solid oklch(0.155 0.018 148)',
          borderBottom: '1px solid oklch(0.155 0.018 148)',
          padding: '80px 0 0',
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.11 0.035 148 / 0.55) 0%, transparent 70%), oklch(0.07 0.018 148)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background:
              'linear-gradient(90deg, transparent 0%, oklch(0.58 0.165 148 / 0.4) 30%, oklch(0.73 0.135 78 / 0.6) 50%, oklch(0.58 0.165 148 / 0.4) 70%, transparent 100%)',
          }}
        />
        <div style={{ marginBottom: '52px', textAlign: 'center', padding: '0 64px' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: 'oklch(0.58 0.165 148)',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Ecossistema Argho
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              color: 'oklch(0.96 0.004 148)',
              marginBottom: '16px',
            }}
          >
            Tecnologia que compreende
            <br />
            <span style={{ color: 'oklch(0.73 0.135 78)' }}>a vida do solo</span>
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              color: 'oklch(0.60 0.022 148)',
              lineHeight: 1.65,
              maxWidth: '540px',
              margin: '0 auto',
            }}
          >
            Inteligência artificial fundida com fisiologia vegetal, biologia do solo e química de
            precisão — tudo interligado como um ecossistema vivo.
          </p>
        </div>
        <DigitalHeartEcosystem />
      </section>

      {/* ──────────── PORTFÓLIO COMPLETO ──────────────────────────────────── */}
      <section
        style={{
          backgroundColor: 'oklch(0.06 0.016 148)',
          borderTop: '1px solid oklch(0.155 0.018 148)',
          padding: '80px 64px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            right: '-80px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '520px',
            pointerEvents: 'none',
            opacity: 0.06,
            mixBlendMode: 'screen',
          }}
        >
          <Image
            src="/argho-line-concept.png"
            alt=""
            width={520}
            height={400}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
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
          padding: '100px 64px',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            right: '-60px',
            bottom: '-80px',
            width: '320px',
            pointerEvents: 'none',
            opacity: 0.18,
            mixBlendMode: 'screen',
          }}
        >
          <Image
            src="/argho-folha.png"
            alt=""
            width={320}
            height={320}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
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

      {/* ──────────── PLATAFORMA COLHEITA ────────────────────────────────── */}
      <section
        style={{
          padding: '0 64px 80px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            background: 'oklch(0.05 0.012 148)',
            border: '1px solid oklch(0.73 0.135 78 / 0.25)',
          }}
        >
          {/* Gold shimmer top border */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background:
                'linear-gradient(90deg, transparent 0%, oklch(0.73 0.135 78 / 0.6) 25%, oklch(0.73 0.135 78) 50%, oklch(0.73 0.135 78 / 0.6) 75%, transparent 100%)',
            }}
          />

          {/* Atmospheric glow */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse 60% 80% at 80% 50%, oklch(0.73 0.135 78 / 0.06) 0%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />

          {/* Circuit pattern overlay */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '50%',
              height: '100%',
              opacity: 0.04,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M10 30 H50 M30 10 V50 M10 10 L20 10 L20 20 M40 10 L50 10 L50 20 M10 50 L20 50 L20 40 M40 50 L50 50 L50 40' stroke='%23a8d5a2' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: '48px',
              padding: '64px 64px',
            }}
          >
            {/* Left: Content */}
            <div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    border: '1px solid oklch(0.73 0.135 78 / 0.35)',
                    borderRadius: '20px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5625rem',
                    letterSpacing: '0.14em',
                    color: 'oklch(0.73 0.135 78)',
                    textTransform: 'uppercase',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'oklch(0.73 0.135 78)',
                      animation: 'pulseRing 2.5s ease-out infinite',
                    }}
                  />
                  Área exclusiva · Distribuidores e parceiros
                </span>
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.045em',
                  lineHeight: 1.0,
                  color: 'oklch(0.96 0.004 148)',
                  marginBottom: '8px',
                }}
              >
                Plataforma <span style={{ color: 'oklch(0.73 0.135 78)' }}>Colheita</span>
              </h2>

              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  color: 'oklch(0.60 0.022 148)',
                  lineHeight: 1.7,
                  maxWidth: '500px',
                  marginBottom: '36px',
                  marginTop: '16px',
                }}
              >
                Gestão agronômica integrada com inteligência artificial — lavouras, recomendações
                técnicas personalizadas, rastreabilidade e análise de solo em tempo real. O sistema
                central da Argho para distribuidores técnicos e produtores parceiros.
              </p>

              {/* Feature bullets */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: '40px',
                }}
              >
                {[
                  'Recomendações de nutrição por IA com base em análise de solo',
                  'Rastreabilidade completa de produtos e aplicações',
                  'Dashboard de performance por talhão e safra',
                  'Integração direta com o portfólio Argho',
                ].map((feature) => (
                  <div
                    key={feature}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'oklch(0.73 0.135 78 / 0.15)',
                        border: '1px solid oklch(0.73 0.135 78 / 0.35)',
                        flexShrink: 0,
                        marginTop: '2px',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        style={{
                          display: 'block',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'oklch(0.73 0.135 78)',
                        }}
                      />
                    </span>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        color: 'oklch(0.65 0.022 148)',
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {feature}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href="https://colheita.app.br"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 32px',
                  backgroundColor: 'oklch(0.73 0.135 78)',
                  color: 'oklch(0.08 0 0)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  borderRadius: '8px',
                  textDecoration: 'none',
                }}
              >
                Acessar Plataforma →
              </Link>
            </div>

            {/* Right: Platform mockup visual */}
            <div
              style={{
                flexShrink: 0,
                width: '320px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Mini dashboard cards */}
              {[
                {
                  label: 'Recomendação ativa',
                  value: 'Stron + Xcensis',
                  sub: 'Soja · R3 · 500 g/ha + 400 g/ha',
                  color: 'oklch(0.58 0.165 148)',
                  bg: 'oklch(0.14 0.045 148)',
                },
                {
                  label: 'Análise de solo',
                  value: 'pH 5.8 · CTC 12.4',
                  sub: 'Talhão Sul · Atualizado hoje',
                  color: 'oklch(0.64 0.13 195)',
                  bg: 'oklch(0.12 0.040 195)',
                },
                {
                  label: 'Rastreabilidade',
                  value: '3 aplicações registradas',
                  sub: 'Última: 2 dias atrás',
                  color: 'oklch(0.73 0.135 78)',
                  bg: 'oklch(0.14 0.038 78)',
                },
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    padding: '16px 20px',
                    backgroundColor: card.bg,
                    border: `1px solid ${card.color}30`,
                    borderLeft: `3px solid ${card.color}`,
                    borderRadius: '10px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.5625rem',
                      letterSpacing: '0.10em',
                      color: card.color,
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                    }}
                  >
                    {card.label}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      letterSpacing: '-0.025em',
                      color: 'oklch(0.96 0.004 148)',
                      marginBottom: '3px',
                    }}
                  >
                    {card.value}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      color: 'oklch(0.52 0.018 148)',
                    }}
                  >
                    {card.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── CTA FINAL ──────────────────────────────────────────── */}
      <section
        style={{
          margin: '0 64px 80px',
          backgroundColor: 'oklch(0.14 0.045 148)',
          border: '1px solid oklch(0.22 0.055 148)',
          borderRadius: '16px',
          padding: '64px 56px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            right: '120px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '200px',
            pointerEvents: 'none',
            opacity: 0.12,
            mixBlendMode: 'screen',
          }}
        >
          <Image
            src="/argho-ball.png"
            alt=""
            width={200}
            height={200}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
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
