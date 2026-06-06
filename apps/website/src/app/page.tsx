// apps/website/src/app/page.tsx
// Home — Argho Agrosciences (Redesign 2026)
// Coração digital como ponto focal escultural. Editorial. Branco.
// Aesthetic base: wis.digital. Mood: resn.co.nz. Identidade: Argho.

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeroHeart } from '@/components/hero-heart';
import { RootDivider } from '@/components/root-divider';
import { FEATURES } from '@/lib/features';

export const metadata: Metadata = {
  title: 'Argho Agrosciences — Tecnologia viva para o agro brasileiro',
  description:
    'Fertilizantes minerais, organominerais, biológicos e adjuvantes desenvolvidos com ciência de ponta. Origem europeia. Registro MAPA.',
};

// Marquee de produtos para tira inferior do hero — portfólio vigente
const MARQUEE_PRODUCTS = [
  'Xcensis',
  'Stron',
  'Grow Calcium',
  'Defon',
  'Grow MoB',
  'Impuch',
  'Life On',
  'Troian',
  'Biovas',
  'Bovex',
  'Controx',
  'Nemax',
  'Operate Plus',
  'Operate Citronela',
  'Operate 4 em 1',
  'Operate Orange',
];

export default function Home() {
  return (
    <main style={{ backgroundColor: 'var(--bg)', overflowX: 'hidden' }}>
      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Coração digital. Layout assimétrico. White editorial.
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          minHeight: 'calc(100vh - 88px)',
          padding: '40px 48px 80px',
          overflow: 'hidden',
          // Bg branco default. O video tem bg #ffffff puro (forcado via filtro
          // geq que so substitui pixels grayscale uniformes >= 250 — preserva
          // pipes coloridos do heart, mas remove bg off-white original).
        }}
      >
        {/* Grid tecnico de fundo removido — estava criando padrao checkerboard
            visivel atras do retangulo do video (que tem fundo branco solido).
            Decisao editorial: heart limpo > grid decorativo. */}

        <div
          style={{
            position: 'relative',
            maxWidth: '1320px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
            gap: '64px',
            alignItems: 'center',
            minHeight: 'calc(100vh - 168px)',
          }}
          className="hero-grid"
        >
          {/* ── Lado esquerdo: copy editorial ── */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Eyebrow */}
            <div
              className="anim-fade-in-up"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '32px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
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
                Argho Agrosciences · Linha completa 2026
              </span>
            </div>

            {/* Headline editorial — bold + paleta Argho oficial */}
            <h1
              className="anim-fade-in-up delay-1"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.75rem, 6.5vw, 5.75rem)',
                fontWeight: 700,
                color: 'var(--argho-blue)',
                letterSpacing: '-0.055em',
                lineHeight: 0.95,
                margin: '0 0 28px',
              }}
            >
              Tecnologia viva
              <br />
              para o{' '}
              <span
                style={{
                  color: 'var(--argho-green)',
                  fontStyle: 'normal',
                }}
              >
                agro brasileiro
              </span>
              .
            </h1>

            {/* Sub-copy */}
            <p
              className="anim-fade-in-up delay-2"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.0625rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                margin: '0 0 44px',
                maxWidth: '480px',
                letterSpacing: '-0.005em',
              }}
            >
              16 produtos. 4 linhas. Uma ciência cultivada na fronteira entre microbiologia, química
              mineral e a realidade do campo brasileiro.
            </p>

            {/* CTA cluster */}
            <div
              className="anim-fade-in-up delay-3"
              style={{
                display: 'flex',
                gap: '14px',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: '64px',
              }}
            >
              <Link
                href="/produtos"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: 'var(--argho-blue)',
                  textDecoration: 'none',
                  padding: '15px 32px',
                  borderRadius: '8px',
                  letterSpacing: '-0.01em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px -8px oklch(0.362 0.160 266.7 / 0.45)',
                }}
              >
                Ver portfólio completo
                <span style={{ fontSize: '1.1em', lineHeight: 1 }}>→</span>
              </Link>
              {/* CTA Plataforma Colheita escondido via FEATURES.colheitaPlatform */}
              {FEATURES.colheitaPlatform && (
                <Link
                  href="https://colheita.arghoagrosciences.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    padding: '15px 24px',
                    letterSpacing: '-0.005em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderBottom: '1px solid var(--text-primary)',
                    paddingLeft: 0,
                    paddingRight: 0,
                    marginLeft: '12px',
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--gold)',
                      boxShadow: '0 0 8px oklch(0.66 0.130 78 / 0.6)',
                    }}
                  />
                  Plataforma Colheita
                </Link>
              )}
            </div>

            {/* Métricas inline */}
            <div
              className="anim-fade-in-up delay-4"
              style={{
                display: 'flex',
                gap: '48px',
                paddingTop: '32px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              {[
                { value: '16', label: 'Produtos ativos' },
                { value: '4', label: 'Linhas especializadas' },
                { value: '100%', label: 'Tech nacional' },
              ].map((m) => (
                <div key={m.label}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '2.25rem',
                      fontWeight: 700,
                      color: 'var(--argho-blue)',
                      letterSpacing: '-0.05em',
                      lineHeight: 1,
                      marginBottom: '6px',
                    }}
                  >
                    {m.value}
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--text-tertiary)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Lado direito: coração digital ── */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '600px',
            }}
            className="hero-heart-wrap"
          >
            <HeroHeart />
          </div>
        </div>

        {/* Marquee inferior — produtos */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            overflow: 'hidden',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-warm)',
            padding: '20px 0',
            zIndex: 1,
          }}
        >
          <div
            className="anim-marquee"
            style={{
              display: 'flex',
              gap: '64px',
              whiteSpace: 'nowrap',
              width: 'max-content',
            }}
          >
            {[...MARQUEE_PRODUCTS, ...MARQUEE_PRODUCTS].map((name, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: marquee duplicates intentionally
                key={`${name}-${i}`}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '64px',
                }}
              >
                {name}
                <span
                  aria-hidden
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--green)',
                    opacity: 0.5,
                    flexShrink: 0,
                  }}
                />
              </span>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 968px) {
            .hero-grid {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
              min-height: auto !important;
            }
            .hero-heart-wrap {
              order: -1;
              min-height: 420px !important;
            }
          }
        `}</style>
      </section>

      {/* Divisor de raízes — eco do coração propagando (azul Argho) */}
      <RootDivider variant="split" accent="var(--argho-blue)" weight={2} />

      {/* ═══════════════════════════════════════════════════════════════════
          PORTFÓLIO — 4 linhas em cards leves
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: '60px 48px 120px',
          maxWidth: '1320px',
          margin: '0 auto',
        }}
      >
        {/* Cabeçalho da seção */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr)',
            gap: '64px',
            alignItems: 'end',
            marginBottom: '72px',
          }}
          className="section-head"
        >
          <span className="label" style={{ alignSelf: 'flex-start' }}>
            01 / Portfólio
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4.5vw, 3.75rem)',
              fontWeight: 700,
              color: 'var(--argho-blue)',
              letterSpacing: '-0.055em',
              lineHeight: 1.0,
              margin: 0,
              maxWidth: '720px',
            }}
          >
            Quatro linhas.{' '}
            <span style={{ color: 'var(--text-tertiary)' }}>
              Cada uma com um propósito claro no campo.
            </span>
          </h2>
        </div>

        {/* Grid de linhas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '0',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: 'var(--bg)',
          }}
        >
          <LineCard
            number="01"
            name="Fertilizantes Minerais"
            accent="var(--cat-mineral)"
            description="Macronutrientes e micronutrientes em formulações de alta eficiência para suprimento direto da planta."
            products={[
              'Xcensis',
              'Stron',
              'Grow Filling',
              'Grow Calcium',
              'Defon',
              'Algen',
              'Grow MoB',
              'Grow Sulfur',
            ]}
            href="/produtos?categoria=fertilizantes-minerais"
          />
          <LineCard
            number="02"
            name="Organominerais"
            accent="var(--cat-organo)"
            description="Minerais associados a fontes orgânicas para melhora do solo e eficiência de absorção radicular."
            products={['Impuch', 'Life On', 'Grow Nitro P', 'Up Soil']}
            href="/produtos?categoria=organominerais"
          />
          <LineCard
            number="03"
            name="Biológicos"
            accent="var(--cat-bio)"
            description="Inoculantes e compostos bioativos que estimulam a microbiologia do solo e a resistência da planta."
            products={['Troian', 'Biovas']}
            href="/produtos?categoria=biologicos"
          />
          <LineCard
            number="04"
            name="Adjuvantes"
            accent="var(--cat-adj)"
            description="Potencializadores de caldas e pulverização para maximizar a absorção e cobertura foliar."
            products={['Operate Plus', 'Operate Citronela', 'Operate 4 em 1', 'Operate Orange']}
            href="/produtos?categoria=adjuvantes"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          DESTAQUE — Stron + Operate
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Stron */}
      <Spotlight
        eyebrow="02 / Destaque · Fertilizante Mineral"
        name="Stron"
        accent="var(--cat-mineral)"
        accentRaw="oklch(0.586 0.150 138.8)"
        description="Fertilizante NPK foliar com aminoácidos e ácidos carboxílicos. Melhora arquitetura e ativação fisiológica da planta, potencializando enraizamento e absorção de nutrientes."
        tags={['NPK 4,5-2-7,2', 'Foliar', '500 g/ha · V3–V5']}
        image="/products/stron.png"
        imageAlt="Stron 1L — Argho Agrosciences"
        href="/produtos/stron"
        reverse={false}
      />

      {/* Operate Plus */}
      <Spotlight
        eyebrow="03 / Destaque · Adjuvante"
        name="Operate Plus"
        accent="var(--cat-adj)"
        accentRaw="oklch(0.62 0.130 78)"
        description="Adjuvante espalhante adesivo premium com surfactante não-iônico, condicionador de pH e antiespumante. Cobertura foliar uniforme e proteção contra hidrólise alcalina."
        tags={['Espalhante adesivo', 'Buffer pH 4,5–5,5', '50–100 mL/100L']}
        image="/products/operate-plus.png"
        imageAlt="Operate Plus 1L — Argho Agrosciences"
        href="/produtos/operate-plus"
        reverse={true}
      />

      {/* Divisor — raiz vertical descendo (verde Argho) */}
      <RootDivider variant="single" accent="var(--argho-green)" weight={2} />

      {/* ═══════════════════════════════════════════════════════════════════
          P&D — Laboratório IA no sul da Espanha
          Diferenciação técnica: fenotipagem computacional + IA para
          desenvolver novas formulações. Onde a magia acontece.
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          padding: '120px 48px',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg)',
          overflow: 'hidden',
        }}
      >
        {/* Halo radial sutil ao fundo */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 50% 60% at 80% 30%, var(--argho-blue-soft) 0%, transparent 60%), radial-gradient(ellipse 40% 50% at 15% 75%, var(--argho-green-soft) 0%, transparent 60%)',
            opacity: 0.7,
            pointerEvents: 'none',
          }}
        />

        {/* Grid técnico mascarado */}
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
            opacity: 0.4,
            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)',
            pointerEvents: 'none',
          }}
        />

        <div
          className="lab-section-grid"
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1320px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
            gap: '80px',
            alignItems: 'center',
            marginBottom: '80px',
          }}
        >
          {/* Lado esquerdo: copy editorial */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '28px',
              }}
            >
              <span
                aria-hidden
                style={{ width: '28px', height: '1px', background: 'var(--argho-green)' }}
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
                Pesquisa & Desenvolvimento · Sul da Espanha
              </span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
                fontWeight: 700,
                color: 'var(--argho-blue)',
                letterSpacing: '-0.055em',
                lineHeight: 0.95,
                marginBottom: '32px',
              }}
            >
              Onde a <span style={{ color: 'var(--argho-green)' }}>ciência</span>
              <br />
              encontra o campo.
            </h2>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.0625rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                marginBottom: '24px',
                maxWidth: '560px',
              }}
            >
              Nosso laboratório no sul da Espanha combina{' '}
              <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                fenotipagem computacional
              </strong>{' '}
              e{' '}
              <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                inteligência artificial
              </strong>{' '}
              para identificar quais moléculas — e em quais combinações — ativam as rotas
              metabólicas que o agro brasileiro precisa.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'var(--text-muted)',
                lineHeight: 1.7,
                maxWidth: '560px',
              }}
            >
              A IA recebe milhares de combinações de estímulos químicos aplicados em plantas-modelo
              e mede simultaneamente a resposta de quatro vetores fisiológicos. Botânica,
              microbiologia, microalgas e química verde trabalham na mesma cadeia — substituindo
              química sintética por alternativas biotecnológicas sem comprometer produtividade.
            </p>
          </div>

          {/* Lado direito: visualização "fenotipagem" — 4 leaf scans */}
          <div
            aria-hidden
            style={{
              position: 'relative',
              padding: '32px',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Header da viz */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '14px',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  className="anim-pulse-ring"
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--argho-green)',
                    boxShadow: '0 0 0 3px oklch(0.586 0.150 138.8 / 0.18)',
                  }}
                />
                <span
                  className="mono"
                  style={{
                    fontSize: '0.625rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                  }}
                >
                  Fenotipagem · captura ao vivo
                </span>
              </div>
              <span
                className="mono"
                style={{
                  fontSize: '0.625rem',
                  color: 'var(--text-tertiary)',
                  letterSpacing: '0.06em',
                }}
              >
                Planta-modelo · ID 0247
              </span>
            </div>

            {/* Subtítulo explicativo */}
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                marginBottom: '16px',
              }}
            >
              Cada folha-modelo é escaneada simultaneamente em{' '}
              <strong style={{ color: 'var(--text-primary)' }}>4 dimensões fisiológicas</strong>. A
              IA correlaciona as leituras pra inferir como cada combinação de moléculas afeta a
              planta.
            </p>

            {/* Grid 2x2 de leituras (light-first, instrumentos científicos legíveis) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              {[
                {
                  label: 'Temperatura',
                  unit: 'Δ vs baseline',
                  metric: '+0.8',
                  metricUnit: '°C',
                  hint: 'Termografia infravermelha',
                  fill: 65, // % do bar
                  accent: 'var(--argho-green)',
                  accentRaw: 'oklch(0.586 0.150 138.8)',
                },
                {
                  label: 'Fotossíntese',
                  unit: 'PSII · rendimento',
                  metric: '0.78',
                  metricUnit: 'Φ',
                  hint: 'Fluorescência de clorofila',
                  fill: 78,
                  accent: 'var(--argho-blue)',
                  accentRaw: 'oklch(0.362 0.160 266.7)',
                },
                {
                  label: 'NPQ',
                  unit: 'Quenching não-fotoquímico',
                  metric: '2.4',
                  metricUnit: '',
                  hint: 'Proteção fotossintética',
                  fill: 60,
                  accent: 'var(--argho-blue)',
                  accentRaw: 'oklch(0.362 0.160 266.7)',
                },
                {
                  label: 'Defesa',
                  unit: 'Fluorescência relativa',
                  metric: '240',
                  metricUnit: 'RFU',
                  hint: 'Compostos defensivos',
                  fill: 80,
                  accent: 'var(--argho-green)',
                  accentRaw: 'oklch(0.586 0.150 138.8)',
                },
              ].map((vec) => (
                <div
                  key={vec.label}
                  style={{
                    position: 'relative',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border-subtle)',
                    borderTop: `2px solid ${vec.accent}`,
                    borderRadius: '8px',
                    padding: '14px 14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        fontSize: '0.625rem',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: vec.accent,
                        fontWeight: 700,
                      }}
                    >
                      {vec.label}
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: '0.5625rem',
                        letterSpacing: '0.04em',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      {vec.unit}
                    </span>
                  </div>

                  {/* Centro: folha SVG verde + métrica grande */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      paddingTop: '4px',
                    }}
                  >
                    {/* Folha clara, literal (verde Argho com veias) */}
                    <svg
                      aria-hidden="true"
                      role="presentation"
                      viewBox="0 0 60 60"
                      style={{ width: '40px', height: '40px', flexShrink: 0 }}
                    >
                      <path
                        d="M30 55 C 12 55, 5 38, 8 22 C 11 8, 22 4, 30 8 C 38 4, 49 8, 52 22 C 55 38, 48 55, 30 55 Z"
                        fill="var(--argho-green-soft)"
                        stroke="var(--argho-green)"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M30 8 L30 55 M30 22 L18 32 M30 22 L42 32 M30 36 L20 44 M30 36 L40 44"
                        stroke="var(--argho-green)"
                        strokeWidth="0.8"
                        fill="none"
                        opacity="0.6"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Métrica display grande */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '4px',
                        marginLeft: 'auto',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.625rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          letterSpacing: '-0.045em',
                          lineHeight: 1,
                        }}
                      >
                        {vec.metric}
                      </span>
                      {vec.metricUnit && (
                        <span
                          className="mono"
                          style={{
                            fontSize: '0.6875rem',
                            color: vec.accent,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                          }}
                        >
                          {vec.metricUnit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bar gauge */}
                  <div>
                    <div
                      style={{
                        height: '4px',
                        backgroundColor: 'var(--bg-soft)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        marginBottom: '6px',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${vec.fill}%`,
                          backgroundColor: vec.accent,
                          borderRadius: '2px',
                          transition: 'width 0.6s var(--ease-out-expo)',
                        }}
                      />
                    </div>
                    <span
                      className="mono"
                      style={{
                        fontSize: '0.5625rem',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.02em',
                        lineHeight: 1.3,
                      }}
                    >
                      {vec.hint}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              style={{
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: '0.625rem',
                  letterSpacing: '0.10em',
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                }}
              >
                4 leituras simultâneas · 1 planta-modelo
              </span>
              <span
                className="mono"
                style={{
                  fontSize: '0.625rem',
                  color: 'var(--argho-green)',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  className="anim-pulse-ring"
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--argho-green)',
                    boxShadow: '0 0 0 3px oklch(0.586 0.150 138.8 / 0.18)',
                  }}
                />
                IA aprendendo
              </span>
            </div>
          </div>
        </div>

        {/* 4 cards de "o que a IA mede" */}
        <div
          className="lab-vectors-grid"
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1320px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '1px',
            backgroundColor: 'var(--border-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {[
            {
              num: '01',
              title: 'Alteração metabólica',
              body: 'Quais rotas bioquímicas a planta ativa em resposta a cada combinação de moléculas.',
            },
            {
              num: '02',
              title: 'Resposta fotossintética',
              body: 'Eficiência do fotossistema II e capacidade fotossintética sob estresse aplicado.',
            },
            {
              num: '03',
              title: 'Ativação de defesas',
              body: 'Acúmulo de compostos de defesa e indução de resistência sistêmica adquirida.',
            },
            {
              num: '04',
              title: 'Mudanças fisiológicas',
              body: 'NPQ (proteção contra dano fotossintético), temperatura e fluorescência foliar.',
            },
          ].map((v) => (
            <div
              key={v.num}
              style={{
                backgroundColor: 'var(--bg)',
                padding: '40px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: '0.6875rem',
                  letterSpacing: '0.16em',
                  color: 'var(--argho-blue)',
                  fontWeight: 700,
                }}
              >
                {v.num}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  letterSpacing: '-0.035em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.1,
                }}
              >
                {v.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                {v.body}
              </p>
            </div>
          ))}
        </div>

        {/* Métricas do laboratório + 4 disciplinas */}
        <div
          className="lab-metrics-row"
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1320px',
            margin: '48px auto 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '32px',
            paddingTop: '40px',
            paddingBottom: '40px',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {[
            { value: '60+', label: 'Pesquisadores' },
            { value: '5.000m²', label: 'Laboratório' },
            { value: '4', label: 'Disciplinas integradas' },
            { value: '500k L/ano', label: 'Produção microbiana' },
          ].map((m) => (
            <div key={m.label}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  fontWeight: 700,
                  color: 'var(--argho-blue)',
                  letterSpacing: '-0.05em',
                  lineHeight: 1,
                  marginBottom: '8px',
                }}
              >
                {m.value}
              </div>
              <div
                className="mono"
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-tertiary)',
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  lineHeight: 1.3,
                }}
              >
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* 4 disciplinas integradas */}
        <div
          className="lab-disciplines-row"
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1320px',
            margin: '48px auto 0',
          }}
        >
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
              style={{ width: '24px', height: '1px', background: 'var(--argho-green)' }}
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
              4 disciplinas em sinergia
            </span>
          </div>
          <div
            className="lab-disciplines-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '16px',
            }}
          >
            {[
              {
                num: '01',
                title: 'Botânica',
                body: 'Triagem de extratos vegetais para identificação de princípios ativos com função biopesticida e bioestimulante.',
                accent: 'var(--argho-green)',
              },
              {
                num: '02',
                title: 'Microbiologia',
                body: 'Isolamento e seleção de cepas com potencial antifúngico, antibacteriano e probiótico para o solo.',
                accent: 'var(--argho-blue)',
              },
              {
                num: '03',
                title: 'Microalgas',
                body: 'Produção em fotorreatores de metabólitos secundários e bioestimulantes a partir de cepas selecionadas.',
                accent: 'var(--cat-bio)',
              },
              {
                num: '04',
                title: 'Química verde',
                body: 'Caracterização molecular via HPLC-MS, formulação estável e otimização de extração em escala piloto.',
                accent: 'var(--gold)',
              },
            ].map((d) => (
              <div
                key={d.num}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderTop: `2px solid ${d.accent}`,
                  borderRadius: '8px',
                  padding: '24px 20px',
                  backgroundColor: 'var(--bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: '0.6875rem',
                    letterSpacing: '0.16em',
                    color: d.accent,
                    fontWeight: 700,
                  }}
                >
                  {d.num}
                </span>
                <h4
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    letterSpacing: '-0.035em',
                    color: 'var(--text-primary)',
                    lineHeight: 1.05,
                  }}
                >
                  {d.title}
                </h4>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                  }}
                >
                  {d.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline de descoberta — Da hipótese ao campo */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1320px',
            margin: '64px auto 0',
            padding: '40px 32px',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '24px',
              marginBottom: '32px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span
                aria-hidden
                style={{ width: '24px', height: '1px', background: 'var(--argho-green)' }}
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
                Pipeline · Da hipótese ao campo
              </span>
            </div>
            <Link
              href="/sobre"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--argho-blue)',
                textDecoration: 'none',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Pipeline completo
              <span style={{ fontSize: '1.05em', lineHeight: 1 }}>→</span>
            </Link>
          </div>

          <div
            className="lab-pipeline-mini"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
              gap: '12px',
              position: 'relative',
            }}
          >
            {/* Linha conectiva entre os 6 círculos */}
            <div
              aria-hidden
              className="lab-pipeline-line"
              style={{
                position: 'absolute',
                top: '24px',
                left: '12%',
                right: '12%',
                height: '2px',
                background:
                  'linear-gradient(90deg, var(--argho-green) 0%, var(--argho-blue) 60%, var(--gold) 100%)',
                opacity: 0.35,
                zIndex: 0,
              }}
            />

            {[
              { step: '01', title: 'Isolamento', body: 'Seleção de cepas e princípios ativos.' },
              {
                step: '02',
                title: 'Caracterização',
                body: 'HPLC-MS e cromatografia gasosa.',
              },
              { step: '03', title: 'Bioensaios', body: 'Letalidade, repelência e antifúngico.' },
              { step: '04', title: 'Validação', body: 'Fitotrons e estufas controladas.' },
              {
                step: '05',
                title: 'Escala piloto',
                body: 'Fermentadores e fotobiorreatores.',
              },
              {
                step: '06',
                title: 'Campo brasileiro',
                body: 'Registro MAPA + agronomia tropical.',
              },
            ].map((p) => (
              <div
                key={p.step}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '12px',
                }}
              >
                {/* Circle */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    color: 'var(--argho-blue)',
                    letterSpacing: '-0.04em',
                    boxShadow: '0 2px 6px oklch(0 0 0 / 0.04)',
                  }}
                >
                  {p.step}
                </div>
                <h4
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    letterSpacing: '-0.025em',
                    color: 'var(--text-primary)',
                    lineHeight: 1.1,
                  }}
                >
                  {p.title}
                </h4>
                <p
                  className="mono"
                  style={{
                    fontSize: '0.625rem',
                    color: 'var(--text-tertiary)',
                    letterSpacing: '0.04em',
                    lineHeight: 1.45,
                    margin: 0,
                  }}
                >
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Closing — síntese */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1320px',
            margin: '64px auto 0',
            padding: '40px 48px',
            backgroundColor: 'var(--argho-blue)',
            borderRadius: '12px',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: '40px',
            alignItems: 'center',
            boxShadow: 'var(--shadow-blue-glow-lg)',
          }}
          className="lab-closing-card"
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.25rem, 2.4vw, 1.75rem)',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-0.035em',
              lineHeight: 1.25,
              margin: 0,
            }}
          >
            A IA aprende{' '}
            <span style={{ color: 'oklch(0.94 0.040 138)' }}>
              quais moléculas ativam quais rotas metabólicas
            </span>{' '}
            — antes de o produto chegar ao campo brasileiro com registro MAPA.
          </p>
          <Link
            href="/sobre"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--argho-blue)',
              backgroundColor: '#ffffff',
              textDecoration: 'none',
              padding: '14px 28px',
              borderRadius: '8px',
              letterSpacing: '-0.01em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Sobre a Argho
            <span style={{ fontSize: '1.1em', lineHeight: 1 }}>→</span>
          </Link>
        </div>

        <style>{`
          @media (max-width: 968px) {
            .lab-section-grid {
              grid-template-columns: 1fr !important;
              gap: 48px !important;
            }
            .lab-vectors-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .lab-metrics-row {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 24px !important;
            }
            .lab-disciplines-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .lab-pipeline-mini {
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 32px 16px !important;
            }
            .lab-pipeline-line { display: none !important; }
            .lab-closing-card {
              grid-template-columns: 1fr !important;
              gap: 24px !important;
            }
          }
          @media (max-width: 640px) {
            .lab-vectors-grid {
              grid-template-columns: 1fr !important;
            }
            .lab-disciplines-grid {
              grid-template-columns: 1fr !important;
            }
            .lab-pipeline-mini {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
        `}</style>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PLATAFORMA COLHEITA — escondida ate plataforma estar pronta
          (ver lib/features.ts). Inclui RootDivider + secao inteira.
      ══════════════════════════════════════════════════════════════════════ */}
      {FEATURES.colheitaPlatform && (
        <>
          {/* Divisor — fan azul (eco da nova seção IA) */}
          <RootDivider variant="fan" accent="var(--argho-blue-soft)" weight={2} />
          <section
            style={{
              borderTop: '1px solid var(--border-subtle)',
              padding: '120px 48px',
              backgroundColor: 'var(--bg-soft)',
            }}
          >
            <div
              style={{
                maxWidth: '1320px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                gap: '80px',
                alignItems: 'center',
              }}
              className="platform-grid"
            >
              {/* Copy */}
              <div>
                <span
                  className="label"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '24px',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--gold)',
                      boxShadow: '0 0 0 4px oklch(0.66 0.130 78 / 0.15)',
                    }}
                    className="anim-pulse-ring"
                  />
                  04 / Plataforma · Acesso restrito
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.85rem, 3.6vw, 3rem)',
                    fontWeight: 700,
                    color: 'var(--argho-blue)',
                    letterSpacing: '-0.05em',
                    lineHeight: 1.0,
                    margin: '0 0 24px',
                  }}
                >
                  Colheita: a inteligência
                  <br />
                  da Argho no campo.
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.65,
                    margin: '0 0 36px',
                    maxWidth: '460px',
                    letterSpacing: '-0.005em',
                  }}
                >
                  Plataforma de gestão agronômica para distribuidores e equipes técnicas Argho.
                  Catálogo, recomendação por cultura, certificação e assistente IA em um único
                  ambiente.
                </p>
                <Link
                  href="https://colheita.arghoagrosciences.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    backgroundColor: 'var(--gold-deep)',
                    textDecoration: 'none',
                    padding: '14px 28px',
                    borderRadius: '8px',
                    letterSpacing: '-0.005em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  Acessar plataforma
                  <span style={{ fontSize: '1.1em', lineHeight: 1 }}>→</span>
                </Link>
              </div>

              {/* Mock card preview */}
              <div
                style={{
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow:
                    '0 24px 60px -20px oklch(0.66 0.130 78 / 0.18), 0 4px 16px -4px rgba(0,0,0,0.04)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Glow gold */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: '-100px',
                    right: '-80px',
                    width: '320px',
                    height: '320px',
                    borderRadius: '50%',
                    background:
                      'radial-gradient(ellipse, oklch(0.66 0.130 78 / 0.16) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Header card */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '28px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--gold-soft)',
                      border: '1px solid oklch(0.66 0.130 78 / 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '15px' }}>🌾</span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      Colheita Dashboard
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: '0.6875rem',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      colheita.arghoagrosciences.com
                    </div>
                  </div>
                </div>

                {/* Métricas mock */}
                {[
                  { label: 'Safra Soja 24/25', value: 'Em andamento', color: 'var(--green)' },
                  {
                    label: 'Último relatório',
                    value: '2 dias atrás',
                    color: 'var(--text-secondary)',
                  },
                  {
                    label: 'Produtos aplicados',
                    value: '4 recomendações',
                    color: 'var(--gold-deep)',
                  },
                ].map((item, i, arr) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 0',
                      borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        color: 'var(--text-tertiary)',
                        letterSpacing: '-0.005em',
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: item.color,
                        letterSpacing: '-0.005em',
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: '20px',
                    padding: '12px 16px',
                    backgroundColor: 'var(--gold-soft)',
                    borderRadius: '8px',
                    border: '1px solid oklch(0.66 0.130 78 / 0.18)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.75rem',
                      color: 'var(--gold-deep)',
                      margin: 0,
                      lineHeight: 1.5,
                      letterSpacing: '-0.005em',
                    }}
                  >
                    🔒 Acesso exclusivo para distribuidores Argho credenciados.
                  </p>
                </div>
              </div>
            </div>

            <style>{`
          @media (max-width: 968px) {
            .platform-grid {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
            }
          }
        `}</style>
          </section>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MANIFESTO — quote editorial
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: '120px 48px',
          textAlign: 'center',
          backgroundColor: 'var(--bg)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <span className="label" style={{ display: 'block', marginBottom: '32px' }}>
            05 / Manifesto
          </span>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 3.2vw, 2.5rem)',
              fontWeight: 600,
              color: 'var(--argho-blue)',
              letterSpacing: '-0.04em',
              lineHeight: 1.2,
              margin: '0 0 40px',
            }}
          >
            Ciência agrícola desenvolvida no Brasil, para o Brasil.
            <br />
            <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>
              Cada fórmula nasce de pesquisa aplicada com{' '}
            </span>
            <em
              style={{
                fontStyle: 'normal',
                color: 'var(--argho-green)',
                fontWeight: 700,
              }}
            >
              foco em resultado real no campo.
            </em>
          </p>
          <Link
            href="/sobre"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--argho-blue)',
              textDecoration: 'none',
              letterSpacing: '-0.005em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid var(--argho-blue)',
              paddingBottom: '4px',
            }}
          >
            Sobre a Argho
            <span style={{ color: 'var(--argho-green)' }}>→</span>
          </Link>
        </div>
      </section>

      {/* Divisor leque — abre pro CTA final (azul Argho) */}
      <RootDivider variant="fan" accent="var(--argho-blue)" weight={2} />

      {/* ═══════════════════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: '60px 48px 120px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-soft)',
          borderTop: 'none',
        }}
      >
        {/* Glow ambient */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 50% 70% at 50% 100%, oklch(0.362 0.160 266.7 / 0.10) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto' }}>
          <span className="label" style={{ display: 'block', marginBottom: '24px' }}>
            06 / Catálogo completo
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 700,
              color: 'var(--argho-blue)',
              letterSpacing: '-0.055em',
              lineHeight: 1.0,
              margin: '0 0 24px',
            }}
          >
            Conheça os{' '}
            <span
              style={{
                color: 'var(--argho-green)',
              }}
            >
              16 produtos
            </span>
            .
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.0625rem',
              color: 'var(--text-secondary)',
              margin: '0 auto 44px',
              maxWidth: '480px',
              lineHeight: 1.65,
              letterSpacing: '-0.005em',
            }}
          >
            Da nutrição mineral aos biológicos. Encontre a solução certa para cada estágio da sua
            lavoura.
          </p>
          <Link
            href="/produtos"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: 'var(--argho-blue)',
              textDecoration: 'none',
              padding: '17px 40px',
              borderRadius: '8px',
              letterSpacing: '-0.01em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 12px 32px -10px oklch(0.362 0.160 266.7 / 0.5)',
            }}
          >
            Ver portfólio completo
            <span style={{ fontSize: '1.1em', lineHeight: 1 }}>→</span>
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 968px) {
          .section-head {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </main>
  );
}

// ─── Componente: card de linha de produto ────────────────────────────────────
function LineCard({
  number,
  name,
  accent,
  description,
  products,
  href,
}: {
  number: string;
  name: string;
  accent: string;
  description: string;
  products: string[];
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        backgroundColor: 'var(--bg)',
        padding: '40px 36px',
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
        borderRight: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        transition: 'background-color 0.25s var(--ease-out-expo)',
      }}
    >
      {/* Número decorativo */}
      <span
        aria-hidden
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '4.5rem',
          fontWeight: 600,
          color: accent,
          opacity: 0.08,
          position: 'absolute',
          top: '12px',
          right: '20px',
          lineHeight: 1,
          letterSpacing: '-0.06em',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {number}
      </span>

      {/* Accent bar */}
      <div
        style={{
          width: '32px',
          height: '3px',
          borderRadius: '2px',
          backgroundColor: accent,
          marginBottom: '24px',
        }}
      />

      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          margin: '0 0 12px',
        }}
      >
        {name}
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          color: 'var(--text-tertiary)',
          lineHeight: 1.6,
          margin: '0 0 28px',
          letterSpacing: '-0.005em',
        }}
      >
        {description}
      </p>

      {/* Lista de produtos */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '28px' }}>
        {products.map((p) => (
          <span
            key={p}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.6875rem',
              color: accent,
              backgroundColor: 'transparent',
              border: '1px solid currentColor',
              borderRadius: '4px',
              padding: '3px 9px',
              letterSpacing: '-0.005em',
              opacity: 0.85,
            }}
          >
            {p}
          </span>
        ))}
      </div>

      {/* CTA */}
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: accent,
          letterSpacing: '-0.005em',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        Ver linha
        <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

// ─── Componente: spotlight de produto ────────────────────────────────────────
function Spotlight({
  eyebrow,
  name,
  accent,
  accentRaw,
  description,
  tags,
  image,
  imageAlt,
  href,
  reverse,
}: {
  eyebrow: string;
  name: string;
  accent: string;
  accentRaw: string;
  description: string;
  tags: string[];
  image: string;
  imageAlt: string;
  href: string;
  reverse: boolean;
}) {
  return (
    <section
      style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg)',
      }}
    >
      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '96px 48px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'stretch',
          gap: '64px',
          direction: reverse ? 'rtl' : 'ltr',
        }}
        className="spotlight-grid"
      >
        {/* Texto */}
        <div
          style={{
            direction: 'ltr',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: '24px',
            paddingBottom: '24px',
          }}
        >
          {/* Eyebrow with accent dot */}
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
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: accent,
                boxShadow: `0 0 0 3px ${accentRaw.replace(')', ' / 0.18)')}`,
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
              {eyebrow}
            </span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '0.01em',
              textTransform: 'uppercase',
              lineHeight: 1.0,
              margin: '0 0 24px',
            }}
          >
            {name}
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.0625rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              margin: '0 0 32px',
              maxWidth: '480px',
              letterSpacing: '-0.005em',
            }}
          >
            {description}
          </p>

          {/* Linha decorativa azul→categoria */}
          <div
            aria-hidden
            style={{
              width: '60px',
              height: '2px',
              background: `linear-gradient(90deg, var(--argho-blue), ${accent})`,
              marginBottom: '36px',
            }}
          />

          <Link
            href={href}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: 'var(--argho-blue)',
              textDecoration: 'none',
              padding: '14px 28px',
              borderRadius: '8px',
              letterSpacing: '-0.005em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              alignSelf: 'flex-start',
              boxShadow: 'var(--shadow-blue-glow)',
            }}
          >
            Ver ficha técnica
            <span style={{ fontSize: '1.05em', lineHeight: 1 }}>→</span>
          </Link>
        </div>

        {/* Card categórico ÓBVIO ancorando o mockup */}
        <div
          style={{
            direction: 'ltr',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-soft)',
            border: '1px solid var(--border-subtle)',
            borderTop: `4px solid ${accent}`,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)',
            minHeight: '600px',
          }}
        >
          {/* Header do card — eyebrow + selo categórico */}
          <div
            style={{
              padding: '20px 28px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                aria-hidden
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: accent,
                  boxShadow: `0 0 0 3px ${accentRaw.replace(')', ' / 0.18)')}`,
                }}
              />
              <span
                className="mono"
                style={{
                  fontSize: '0.625rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: accent,
                  fontWeight: 700,
                }}
              >
                Embalagem oficial · 1L
              </span>
            </div>
            <span
              className="mono"
              style={{
                fontSize: '0.625rem',
                letterSpacing: '0.10em',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
              }}
            >
              Origem · Espanha
            </span>
          </div>

          {/* Palco do mockup */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              padding: '40px 32px 60px',
              minHeight: '460px',
              overflow: 'hidden',
            }}
          >
            {/* Halo radial categórico */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(ellipse 60% 65% at 50% 75%, ${accentRaw.replace(')', ' / 0.20)')} 0%, ${accentRaw.replace(')', ' / 0.05)')} 45%, transparent 75%)`,
                pointerEvents: 'none',
              }}
            />

            {/* Grid técnico mascarado */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                  linear-gradient(${accentRaw.replace(')', ' / 0.06)')} 1px, transparent 1px),
                  linear-gradient(90deg, ${accentRaw.replace(')', ' / 0.06)')} 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                opacity: 0.7,
                maskImage:
                  'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)',
                pointerEvents: 'none',
              }}
            />

            {/* Sombra de chão sob o produto */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                bottom: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '55%',
                height: '28px',
                background: `radial-gradient(ellipse 50% 50%, ${accentRaw.replace(')', ' / 0.55)')} 0%, transparent 70%)`,
                filter: 'blur(18px)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            {/* Mockup */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                height: '400px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              <Image
                src={image}
                alt={imageAlt}
                width={500}
                height={750}
                quality={95}
                style={{
                  width: 'auto',
                  height: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  objectPosition: 'bottom center',
                  filter: `drop-shadow(0 28px 40px ${accentRaw.replace(')', ' / 0.35)')}) drop-shadow(0 8px 16px ${accentRaw.replace(')', ' / 0.20)')})`,
                }}
              />
            </div>
          </div>

          {/* Footer do card — métricas pequenas */}
          <div
            style={{
              padding: '14px 28px',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-mist)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            {tags.slice(0, 3).map((tag, idx) => (
              <div
                key={tag}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  borderLeft: idx > 0 ? '1px solid var(--border-subtle)' : 'none',
                  paddingLeft: idx > 0 ? '16px' : 0,
                }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: '0.5625rem',
                    letterSpacing: '0.10em',
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                  }}
                >
                  {idx === 0 ? 'Composição' : idx === 1 ? 'Modo' : 'Dose'}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: accent,
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}
                >
                  {tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 968px) {
          .spotlight-grid {
            grid-template-columns: 1fr !important;
            direction: ltr !important;
            gap: 48px !important;
            padding: 64px 48px !important;
          }
          .spotlight-grid > div:nth-child(2) {
            min-height: 480px !important;
          }
        }
      `}</style>
    </section>
  );
}
