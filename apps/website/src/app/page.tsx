// apps/website/src/app/page.tsx
// Home — Argho Agrosciences
// Design: Instrumento de Precisão. Dark green profundo. Editorial.

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  DigitalHeartEcosystem,
  ElementBadge,
  ImpuchSoilViz,
  OperateLineGrid,
  StronNpkChart,
} from '@/components/product-visuals';
import type { ProductCategory } from '@/lib/products';
import { CATEGORIES, PRODUCTS } from '@/lib/products';

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

        {/* Floating element badges — periodic table decorations */}
        <ElementBadge symbol="Fe" number="26" top="20%" right="27%" size="md" opacity={0.28} />
        <ElementBadge symbol="Mn" number="25" top="38%" right="13%" size="sm" opacity={0.2} />
        <ElementBadge symbol="Zn" number="30" top="58%" right="21%" size="md" opacity={0.24} />
        <ElementBadge symbol="B" number="5" top="15%" right="9%" size="lg" opacity={0.16} />
        <ElementBadge symbol="K" number="19" bottom="30%" right="32%" size="sm" opacity={0.22} />
        <ElementBadge symbol="Mo" number="42" top="44%" right="6%" size="sm" opacity={0.15} />

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

      {/* ──────────── PRODUTOS EM DESTAQUE ────────────────────────────────── */}
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
              {/* Visual header */}
              <div
                style={{
                  padding: '24px 24px 0',
                  backgroundColor: 'oklch(0.085 0.018 148)',
                  borderBottom: '1px solid oklch(0.155 0.018 148)',
                }}
              >
                <StronNpkChart />
              </div>

              {/* Info panel */}
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

                {/* Key specs */}
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
                }}
              >
                <ImpuchSoilViz />
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
          {/* Header row */}
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

          {/* SVG grid */}
          <OperateLineGrid />
        </div>
      </section>

      {/* ──────────── ECOSSISTEMA ARGHO ──────────────────────────────────── */}
      <section
        style={{
          borderTop: '1px solid oklch(0.155 0.018 148)',
          borderBottom: '1px solid oklch(0.155 0.018 148)',
          padding: '80px 48px',
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.11 0.035 148 / 0.55) 0%, transparent 70%), oklch(0.07 0.018 148)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Scan-line decorative top */}
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

        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Section header */}
          <div style={{ marginBottom: '52px', textAlign: 'center' }}>
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

          {/* The living heart SVG */}
          <div
            style={{
              position: 'relative',
              borderRadius: '16px',
              border: '1px solid oklch(0.18 0.030 148)',
              backgroundColor: 'oklch(0.065 0.016 148)',
              overflow: 'hidden',
            }}
          >
            {/* Corner tech-mark decorations */}
            {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
              <span
                key={pos}
                aria-hidden
                style={{
                  position: 'absolute',
                  width: '12px',
                  height: '12px',
                  borderColor: 'oklch(0.38 0.060 148)',
                  borderStyle: 'solid',
                  borderWidth: pos.includes('t') ? '1px 0 0 1px' : '0 1px 1px 0',
                  top: pos.includes('t') ? '12px' : undefined,
                  bottom: pos.includes('b') ? '12px' : undefined,
                  left: pos.includes('l') ? '12px' : undefined,
                  right: pos.includes('r') ? '12px' : undefined,
                  borderTopRightRadius: pos === 'tr' ? '0' : undefined,
                  borderBottomLeftRadius: pos === 'bl' ? '0' : undefined,
                  opacity: 0.6,
                }}
              />
            ))}
            <DigitalHeartEcosystem />
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
