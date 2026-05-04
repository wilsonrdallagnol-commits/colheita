// apps/website/src/app/page.tsx
// Home — Argho Agrosciences (Redesign 2026)
// Coração digital como ponto focal escultural. Editorial. Branco.
// Aesthetic base: wis.digital. Mood: resn.co.nz. Identidade: Argho.

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeroHeart } from '@/components/hero-heart';
import { RootDivider } from '@/components/root-divider';

export const metadata: Metadata = {
  title: 'Argho Agrosciences — Tecnologia viva para o agro brasileiro',
  description:
    'Fertilizantes minerais, organominerais, biológicos e adjuvantes desenvolvidos com ciência de ponta. Origem europeia. Registro MAPA.',
};

// Marquee de produtos para tira inferior do hero
const MARQUEE_PRODUCTS = [
  'Xcensis',
  'Stron',
  'Operate Plus',
  'Grow Filling',
  'Troian',
  'Defon',
  'Algen',
  'Grow MoB',
  'Grow Calcium',
  'Grow Sulfur',
  'Impuch',
  'Life On',
  'Grow Nitro P',
  'Up Soil',
  'Biovas',
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
        }}
      >
        {/* Grid técnico de fundo (sutilíssimo) */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(var(--border-subtle) 1px, transparent 1px),
              linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
            `,
            backgroundSize: '88px 88px',
            opacity: 0.6,
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%)',
            pointerEvents: 'none',
          }}
        />

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
                  background: 'var(--green)',
                }}
              />
              <span
                className="mono"
                style={{
                  fontSize: '0.6875rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                  fontWeight: 500,
                }}
              >
                Argho Agrosciences · Linha completa 2026
              </span>
            </div>

            {/* Headline editorial */}
            <h1
              className="anim-fade-in-up delay-1"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 6vw, 5.25rem)',
                fontWeight: 500,
                color: 'var(--text-primary)',
                letterSpacing: '-0.045em',
                lineHeight: 0.98,
                margin: '0 0 28px',
              }}
            >
              Tecnologia viva
              <br />
              para o{' '}
              <span
                style={{
                  background: 'linear-gradient(110deg, var(--green) 0%, var(--teal) 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
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
              18 produtos. 4 linhas. Uma ciência cultivada na fronteira entre microbiologia, química
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
                  backgroundColor: 'var(--text-primary)',
                  textDecoration: 'none',
                  padding: '15px 32px',
                  borderRadius: '8px',
                  letterSpacing: '-0.01em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                Ver portfólio completo
                <span style={{ fontSize: '1.1em', lineHeight: 1 }}>→</span>
              </Link>
              <Link
                href="https://colheita.app.br"
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
                { value: '18', label: 'Produtos ativos' },
                { value: '4', label: 'Linhas especializadas' },
                { value: '100%', label: 'Tech nacional' },
              ].map((m) => (
                <div key={m.label}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '2rem',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                      marginBottom: '4px',
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
                  fontSize: '1rem',
                  color: 'var(--text-tertiary)',
                  letterSpacing: '-0.01em',
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

      {/* Divisor de raízes — eco do coração propagando */}
      <RootDivider variant="split" accent="oklch(0.58 0.125 195)" weight={1} />

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
              fontWeight: 500,
              color: 'var(--text-primary)',
              letterSpacing: '-0.045em',
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
        description="Proteína específica com precursores vegetais. Melhora arquitetura e ativação fisiológica da planta, potencializando o enraizamento e a absorção de nutrientes."
        tags={['Enraizamento', 'Ativação fisiológica', 'V5 → 100 mL/ha']}
        image="/mockups/stron.png"
        imageAlt="Stron 1L — Argho Agrosciences"
        href="/produtos/stron"
        reverse={false}
      />

      {/* Operate */}
      <Spotlight
        eyebrow="03 / Destaque · Adjuvante"
        name="Operate Plus"
        accent="var(--cat-adj)"
        description="Adjuvante de alta performance para potencialização de caldas. Reduz a tensão superficial, aumenta a cobertura foliar e melhora a absorção dos ativos aplicados."
        tags={['Cobertura foliar', 'Anti-deriva', '50–100 mL/100L']}
        image="/mockups/operate.png"
        imageAlt="Operate Plus 20L — Argho Agrosciences"
        href="/produtos/operate-plus"
        reverse={true}
      />

      {/* Divisor — raiz vertical descendo (transição para plataforma) */}
      <RootDivider variant="single" accent="oklch(0.52 0.155 148)" weight={2} />

      {/* ═══════════════════════════════════════════════════════════════════
          PLATAFORMA COLHEITA
      ══════════════════════════════════════════════════════════════════════ */}
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
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                fontWeight: 500,
                color: 'var(--text-primary)',
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
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
              Catálogo, recomendação por cultura, certificação e assistente IA em um único ambiente.
            </p>
            <Link
              href="https://colheita.app.br"
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
                  colheita.app.br
                </div>
              </div>
            </div>

            {/* Métricas mock */}
            {[
              { label: 'Safra Soja 24/25', value: 'Em andamento', color: 'var(--green)' },
              { label: 'Último relatório', value: '2 dias atrás', color: 'var(--text-secondary)' },
              { label: 'Produtos aplicados', value: '4 recomendações', color: 'var(--gold-deep)' },
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
              fontSize: 'clamp(1.4rem, 3vw, 2.25rem)',
              fontWeight: 400,
              color: 'var(--text-primary)',
              letterSpacing: '-0.035em',
              lineHeight: 1.25,
              margin: '0 0 40px',
            }}
          >
            Ciência agrícola desenvolvida no Brasil, para o Brasil.
            <br />
            <span style={{ color: 'var(--text-tertiary)' }}>
              Cada fórmula nasce de pesquisa aplicada com{' '}
            </span>
            <em
              style={{
                fontStyle: 'normal',
                background: 'linear-gradient(110deg, var(--green) 0%, var(--teal) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
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
              fontWeight: 500,
              color: 'var(--text-primary)',
              textDecoration: 'none',
              letterSpacing: '-0.005em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid var(--text-primary)',
              paddingBottom: '4px',
            }}
          >
            Sobre a Argho
            <span style={{ color: 'var(--green)' }}>→</span>
          </Link>
        </div>
      </section>

      {/* Divisor leque — abre pro CTA final */}
      <RootDivider variant="fan" accent="oklch(0.66 0.130 78)" weight={1} />

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
              'radial-gradient(ellipse 50% 70% at 50% 100%, oklch(0.52 0.155 148 / 0.08) 0%, transparent 70%)',
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
              fontWeight: 500,
              color: 'var(--text-primary)',
              letterSpacing: '-0.045em',
              lineHeight: 1.0,
              margin: '0 0 24px',
            }}
          >
            Conheça os{' '}
            <span
              style={{
                background: 'linear-gradient(110deg, var(--green) 0%, var(--teal) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              18 produtos
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
              backgroundColor: 'var(--text-primary)',
              textDecoration: 'none',
              padding: '17px 40px',
              borderRadius: '8px',
              letterSpacing: '-0.01em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
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
          fontWeight: 500,
          color: 'var(--text-primary)',
          letterSpacing: '-0.025em',
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
          padding: '0 48px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'center',
          gap: '80px',
          minHeight: '560px',
          direction: reverse ? 'rtl' : 'ltr',
        }}
        className="spotlight-grid"
      >
        {/* Texto */}
        <div style={{ direction: 'ltr', padding: '80px 0' }}>
          <span className="label" style={{ display: 'block', marginBottom: '20px' }}>
            {eyebrow}
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              fontWeight: 500,
              color: 'var(--text-primary)',
              letterSpacing: '-0.045em',
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
              lineHeight: 1.6,
              margin: '0 0 32px',
              maxWidth: '440px',
              letterSpacing: '-0.005em',
            }}
          >
            {description}
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.75rem',
                  color: accent,
                  border: '1px solid currentColor',
                  borderRadius: '4px',
                  padding: '5px 12px',
                  letterSpacing: '-0.005em',
                  opacity: 0.85,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <Link
            href={href}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              fontWeight: 600,
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
            Ver ficha técnica
            <span style={{ color: accent }}>→</span>
          </Link>
        </div>

        {/* Imagem */}
        <div
          style={{
            direction: 'ltr',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            position: 'relative',
            padding: '60px 0 0',
          }}
        >
          {/* Glow accent */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              width: '380px',
              height: '380px',
              borderRadius: '50%',
              background: `radial-gradient(ellipse, ${accent.replace('var(--', 'oklch(').replace(')', '')} / 0.15) 0%, transparent 70%)`,
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              filter: 'blur(40px)',
            }}
          />
          <Image
            src={image}
            alt={imageAlt}
            width={340}
            height={420}
            style={{
              objectFit: 'contain',
              position: 'relative',
              zIndex: 1,
              filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.10))',
            }}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 968px) {
          .spotlight-grid {
            grid-template-columns: 1fr !important;
            direction: ltr !important;
            min-height: auto !important;
            gap: 32px !important;
            padding-top: 64px !important;
            padding-bottom: 64px !important;
          }
          .spotlight-grid > div {
            padding: 0 !important;
          }
        }
      `}</style>
    </section>
  );
}
