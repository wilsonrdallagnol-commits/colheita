// apps/website/src/app/sobre/page.tsx
// Sobre — Argho Agrosciences (Redesign 2026)
// White-first editorial. Paleta oficial Argho. Tipografia bold.
// Espelho da home: assimetria, eyebrows azuis, headlines bold, dividers de raiz.

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { RootDivider } from '@/components/root-divider';

export const metadata: Metadata = {
  title: 'Sobre',
  description:
    'Argho Agrosciences — distribuição de insumos de origem europeia com registro MAPA para a agricultura brasileira.',
};

const VALUES = [
  {
    id: 'v1',
    number: '01',
    title: 'Ciência aplicada',
    body: 'Cada produto nasce de pesquisa agronômica séria. Nenhuma promessa sem laudo. Toda eficácia sustentada por dados de campo.',
  },
  {
    id: 'v2',
    number: '02',
    title: 'Transparência regulatória',
    body: 'Registro MAPA é pré-requisito, não diferencial. Atuamos com rastreabilidade total da origem europeia ao agricultor brasileiro.',
  },
  {
    id: 'v3',
    number: '03',
    title: 'Parceria de longo prazo',
    body: 'Desenvolvemos relações com distribuidores e agrônomos que entendem nutrição de precisão — não vendemos commodities, construímos resultados.',
  },
  {
    id: 'v4',
    number: '04',
    title: 'Inovação contínua',
    body: 'Conectamos o pipeline de P&D europeu à realidade dos solos tropicais brasileiros, trazendo formulações que o mercado ainda não conhece.',
  },
];

const EXPERTISE_ITEMS = [
  {
    id: 'e1',
    label: 'Fertilizantes Minerais',
    accent: 'var(--cat-mineral)',
    detail:
      'Micronutrientes quelados com EDTA e Lignossulfonatos, formulações potássicas para enchimento de grãos, cálcio de alta mobilidade foliar.',
  },
  {
    id: 'e2',
    label: 'Organominerais',
    accent: 'var(--cat-organo)',
    detail:
      'Vinhaça fermentada, substâncias húmicas de leonardita, aminoácidos de origem vegetal e torta de mamona hidrolisada para microbiota e CTC.',
  },
  {
    id: 'e3',
    label: 'Biológicos',
    accent: 'var(--cat-bio)',
    detail:
      'Consórcios de Trichoderma harzianum e Bacillus spp. (5 espécies) com alta viabilidade celular para controle biológico e promoção de crescimento.',
  },
  {
    id: 'e4',
    label: 'Adjuvantes',
    accent: 'var(--cat-adj)',
    detail:
      'Família Operate: espalhantes com óleos essenciais, condicionamento de pH, antideriva — formulados para compatibilidade com biológicos.',
  },
];

const HERO_METRICS = [
  { value: '16', label: 'Produtos no portfólio' },
  { value: '4', label: 'Linhas de atuação' },
  { value: 'ES', label: 'Origem Espanha' },
  { value: 'MAPA', label: 'Registro brasileiro' },
];

export default function SobrePage() {
  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ═══════════════════════════════════════════════════════════════════
          HERO — assimétrico, eyebrow azul, headline bold split blue/green
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          padding: '40px 48px 96px',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Grid técnico de fundo (mesmo padrão da home) */}
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
            opacity: 0.55,
            maskImage: 'radial-gradient(ellipse 80% 60% at 30% 50%, black 30%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 60% at 30% 50%, black 30%, transparent 80%)',
            pointerEvents: 'none',
          }}
        />

        {/* Decorative leaf — organic identity, multiply blend para fundo branco */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-80px',
            width: '440px',
            pointerEvents: 'none',
            opacity: 0.07,
            mixBlendMode: 'multiply',
            transform: 'rotate(-15deg)',
            zIndex: 1,
          }}
        >
          <Image
            src="/argho-folha.png"
            alt=""
            width={440}
            height={440}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        <div
          className="sobre-hero-grid"
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1320px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
            gap: '64px',
            alignItems: 'center',
            minHeight: 'calc(100vh - 240px)',
          }}
        >
          {/* ── Lado esquerdo: copy editorial ── */}
          <div style={{ position: 'relative' }}>
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
                aria-hidden
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
                Argho Agrosciences · Quem somos
              </span>
            </div>

            {/* Headline editorial — split blue/green espelhando home */}
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
              Origem europeia.
              <br />
              <span style={{ color: 'var(--argho-green)' }}>Solo brasileiro.</span>
            </h1>

            <p
              className="anim-fade-in-up delay-2"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.0625rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                margin: '0 0 40px',
                maxWidth: '520px',
                letterSpacing: '-0.005em',
              }}
            >
              A Argho Agrosciences distribui insumos agrícolas desenvolvidos na Europa com registro
              MAPA para o Brasil — conectando a ciência de nutrição de precisão ao agro nacional.
            </p>

            {/* Métricas inline (mesmo padrão da home) */}
            <div
              className="anim-fade-in-up delay-3 sobre-metrics-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '32px',
                paddingTop: '32px',
                borderTop: '1px solid var(--border-subtle)',
                maxWidth: '640px',
              }}
            >
              {HERO_METRICS.map((m) => (
                <div key={m.label}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '2.25rem',
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
                      fontSize: '0.625rem',
                      color: 'var(--text-tertiary)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      lineHeight: 1.3,
                    }}
                  >
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Lado direito: identidade tipográfica + dados regionais ── */}
          <div
            className="sobre-hero-right"
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
              minHeight: '480px',
              padding: '40px 0',
              overflow: 'hidden',
            }}
          >
            {/* Vertical accent line — eco da home */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: '0',
                bottom: '0',
                left: '40px',
                width: '1px',
                background:
                  'linear-gradient(to bottom, transparent, var(--argho-blue-soft) 25%, var(--argho-green-soft) 75%, transparent)',
                pointerEvents: 'none',
              }}
            />

            <div
              className="anim-fade-in-up delay-2"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                marginBottom: '20px',
                alignSelf: 'flex-start',
                marginLeft: '64px',
              }}
            >
              EST. 2024 · BRASIL × ESPANHA
            </div>

            {/* Logo Argho oficial (color para fundo branco) */}
            <div
              className="anim-fade-in-up delay-3"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <Image
                src="/argho-logo-color.png"
                alt="Argho Agrosciences"
                width={520}
                height={193}
                priority
                style={{
                  width: 'clamp(280px, 38vw, 520px)',
                  height: 'auto',
                }}
              />
            </div>

            {/* Mini stats card abaixo */}
            <div
              className="anim-fade-in-up delay-4"
              style={{
                marginTop: '40px',
                width: '100%',
                maxWidth: '440px',
                border: '1px solid var(--border-subtle)',
                borderTop: '2px solid var(--argho-green)',
                borderRadius: '8px',
                padding: '20px 24px',
                backgroundColor: 'var(--bg)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <p
                className="mono"
                style={{
                  fontSize: '0.625rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--argho-blue)',
                  fontWeight: 700,
                  marginBottom: '12px',
                }}
              >
                Sobre nós · em síntese
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                Distribuidor brasileiro de fertilizantes europeus de alta performance, com
                regularização MAPA completa e suporte agronômico técnico.
              </p>
            </div>
          </div>
        </div>
      </section>

      <RootDivider variant="single" accent="var(--argho-blue-soft)" />

      {/* ═══════════════════════════════════════════════════════════════════
          MISSÃO — duas colunas, sticky title à esquerda
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '120px 48px' }}>
        <div
          className="sobre-mission-grid"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 360px) 1fr',
            gap: '96px',
            alignItems: 'start',
          }}
        >
          <div style={{ position: 'sticky', top: '120px' }}>
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
                Nossa missão
              </span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 700,
                letterSpacing: '-0.045em',
                color: 'var(--argho-blue)',
                lineHeight: 1.0,
              }}
            >
              Nutrição de
              <br />
              precisão para
              <br />o <span style={{ color: 'var(--argho-green)' }}>agro brasileiro</span>.
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '28px',
              maxWidth: '640px',
              fontFamily: 'var(--font-body)',
              fontSize: '1.0625rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
            }}
          >
            <p>
              O agricultor brasileiro produz em solos tropicais únicos — alta precipitação, acidez,
              lixiviação intensa — e exige soluções que respeitem essa realidade. A Argho nasceu
              para preencher a lacuna entre a sofisticação técnica europeia e a exigência prática do
              campo nacional.
            </p>
            <p>
              Não somos importadores de catálogo. Selecionamos produtos com base em desempenho
              comprovado, garantimos regularização MAPA completa e desenvolvemos recomendações
              agronômicas adaptadas às culturas e safras brasileiras.
            </p>
            <p>
              Do micronutriente quelado ao bioinsumo com consórcio certificado, cada produto do
              portfólio Argho tem um propósito claro e uma ficha técnica honesta.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PRINCÍPIOS — grid 2x2, cards com numeração editorial
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: 'var(--bg-soft)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '96px 48px' }}>
          <div style={{ marginBottom: '64px', maxWidth: '720px' }}>
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
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--argho-blue)',
                  fontWeight: 600,
                }}
              >
                Princípios
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
              O que nos guia.
            </h2>
          </div>

          <div
            className="sobre-values-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1px',
              backgroundColor: 'var(--border-subtle)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {VALUES.map((v) => (
              <article
                key={v.id}
                style={{
                  backgroundColor: 'var(--bg)',
                  padding: '48px 40px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  position: 'relative',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.14em',
                    color: 'var(--argho-blue)',
                    fontWeight: 600,
                  }}
                >
                  {v.number}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    letterSpacing: '-0.04em',
                    color: 'var(--text-primary)',
                    lineHeight: 1.05,
                  }}
                >
                  {v.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9375rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.65,
                  }}
                >
                  {v.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          EXPERTISE — lista editorial com accent colorido por categoria
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '120px 48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '64px', maxWidth: '720px' }}>
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
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--argho-blue)',
                  fontWeight: 600,
                }}
              >
                Portfólio técnico
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
              Nossa expertise.
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {EXPERTISE_ITEMS.map((item, i) => (
              <div
                key={item.id}
                className="sobre-expertise-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 280px) 1fr',
                  gap: '64px',
                  padding: '40px 0',
                  borderTop: i === 0 ? '1px solid var(--border-subtle)' : 'none',
                  borderBottom: '1px solid var(--border-subtle)',
                  alignItems: 'baseline',
                  position: 'relative',
                }}
              >
                {/* Left accent bar */}
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: '-16px',
                    top: '40px',
                    width: '4px',
                    height: '24px',
                    backgroundColor: item.accent,
                    borderRadius: '0 2px 2px 0',
                  }}
                />
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.375rem',
                    fontWeight: 700,
                    letterSpacing: '-0.035em',
                    color: 'var(--text-primary)',
                    lineHeight: 1.1,
                  }}
                >
                  {item.label}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7,
                    maxWidth: '640px',
                  }}
                >
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RootDivider variant="fan" accent="var(--argho-green-soft)" />

      {/* ═══════════════════════════════════════════════════════════════════
          CIÊNCIA APLICADA — laboratório IA no sul da Espanha
          Detalha o pipeline de descoberta e as 4 disciplinas integradas.
          Sem mencionar o nome do laboratório parceiro.
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: '120px 48px',
          backgroundColor: 'var(--bg)',
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Halo radial sutil */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 50% 50% at 80% 20%, var(--argho-blue-soft) 0%, transparent 65%), radial-gradient(ellipse 40% 50% at 10% 80%, var(--argho-green-soft) 0%, transparent 65%)',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '64px', maxWidth: '800px' }}>
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
                Ciência aplicada · Centro de P&D
              </span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                fontWeight: 700,
                letterSpacing: '-0.055em',
                color: 'var(--argho-blue)',
                lineHeight: 0.95,
                marginBottom: '32px',
              }}
            >
              A próxima era da
              <br />
              <span style={{ color: 'var(--argho-green)' }}>biotecnologia agrícola</span>.
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.0625rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                marginBottom: '20px',
              }}
            >
              Cada formulação Argho nasce em um centro de pesquisa com mais de{' '}
              <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                5.000m² de laboratórios
              </strong>{' '}
              no sul da Espanha, dedicado a substituir química sintética por alternativas
              biotecnológicas — sem comprometer produtividade.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'var(--text-muted)',
                lineHeight: 1.7,
              }}
            >
              Mais de 60 pesquisadores combinam botânica, microbiologia, microalgas e química verde
              em uma cadeia única de descoberta — da identificação de cepas até a planta piloto de
              produção microbiana com capacidade de 500 mil litros por ano.
            </p>
          </div>

          {/* Métricas */}
          <div
            className="ciencia-metrics-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '0',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-soft)',
              marginBottom: '80px',
            }}
          >
            {[
              { value: '60+', label: 'Pesquisadores em cadeia única' },
              { value: '5.000m²', label: 'Laboratórios + 2.000m² estufas' },
              { value: '500k L', label: 'Probióticos / ano em planta piloto' },
              { value: '4', label: 'Disciplinas em sinergia' },
            ].map((m, i) => (
              <div
                key={m.label}
                style={{
                  padding: '40px 32px',
                  borderRight: i < 3 ? '1px solid var(--border-subtle)' : 'none',
                  backgroundColor: 'var(--bg)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                    fontWeight: 700,
                    color: 'var(--argho-blue)',
                    letterSpacing: '-0.05em',
                    lineHeight: 1,
                    marginBottom: '12px',
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
                    lineHeight: 1.4,
                  }}
                >
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          {/* 4 disciplinas em detalhe */}
          <div style={{ marginBottom: '80px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: '24px',
                marginBottom: '40px',
                flexWrap: 'wrap',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.045em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.05,
                  maxWidth: '640px',
                }}
              >
                Quatro disciplinas naturais. <br />
                <span style={{ color: 'var(--argho-blue)' }}>Uma única cadeia de descoberta.</span>
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.65,
                  maxWidth: '420px',
                }}
              >
                A sinergia entre os quatro laboratórios é o que torna possível identificar
                combinações que isoladamente não emergiriam.
              </p>
            </div>

            <div
              className="ciencia-disciplines-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
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
                  title: 'Botânica',
                  body: 'Triagem de extratos de plantas medicinais e agrícolas para identificar princípios ativos com função biopesticida e bioestimulante. Cromatografia flash, destilação Soxhlet, rotavapor e extração em cascata.',
                  techniques: [
                    'HPLC semipreparativa',
                    'Cromatografia gasosa-MS',
                    'Extração Soxhlet',
                  ],
                  accent: 'var(--argho-green)',
                },
                {
                  num: '02',
                  title: 'Microbiologia',
                  body: 'Isolamento, seleção e caracterização de cepas bacterianas e fúngicas com propriedades antifúngicas, antibacterianas e probióticas para o solo. Foco em consórcios sinérgicos de Trichoderma, Bacillus e similares.',
                  techniques: [
                    'Fermentação líquida e sólida',
                    'Bioensaios de letalidade',
                    'Probióticos de solo',
                  ],
                  accent: 'var(--argho-blue)',
                },
                {
                  num: '03',
                  title: 'Microalgas',
                  body: 'Produção de metabólitos secundários e bioestimulantes em fotobiorreatores tubulares de 140L. Cepas selecionadas para alto rendimento de polissacarídeos, betaínas e aminoácidos vegetais.',
                  techniques: [
                    'Fotobiorreatores tubulares',
                    'Cultivo controlado',
                    'Bioestimulantes naturais',
                  ],
                  accent: 'var(--cat-bio)',
                },
                {
                  num: '04',
                  title: 'Química verde',
                  body: 'Caracterização molecular via HPLC acoplada a espectrometria de massas, formulação de ativos estáveis e otimização do processo de extração para escala piloto. Onde a hipótese vira produto.',
                  techniques: ['HPLC-MS', 'Espectrometria de massas', 'Formulação estável'],
                  accent: 'var(--gold)',
                },
              ].map((d) => (
                <article
                  key={d.num}
                  style={{
                    backgroundColor: 'var(--bg)',
                    padding: '40px 36px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    position: 'relative',
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '3px',
                      height: '64px',
                      backgroundColor: d.accent,
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                    <span
                      className="mono"
                      style={{
                        fontSize: '0.75rem',
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
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        letterSpacing: '-0.04em',
                        color: 'var(--text-primary)',
                        lineHeight: 1.05,
                      }}
                    >
                      {d.title}
                    </h4>
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9375rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.65,
                    }}
                  >
                    {d.body}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      gap: '6px',
                      flexWrap: 'wrap',
                      marginTop: 'auto',
                      paddingTop: '12px',
                    }}
                  >
                    {d.techniques.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: d.accent,
                          backgroundColor: 'var(--bg-soft)',
                          border: '1px solid var(--border-subtle)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Pipeline de descoberta */}
          <div>
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
                Da hipótese ao campo
              </span>
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                fontWeight: 700,
                letterSpacing: '-0.045em',
                color: 'var(--text-primary)',
                lineHeight: 1.05,
                marginBottom: '40px',
                maxWidth: '720px',
              }}
            >
              Pipeline de descoberta em{' '}
              <span style={{ color: 'var(--argho-green)' }}>seis etapas</span>.
            </h3>

            <div
              className="ciencia-pipeline"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                gap: '1px',
                position: 'relative',
              }}
            >
              {/* Linha conectiva */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: '32px',
                  left: '40px',
                  right: '40px',
                  height: '2px',
                  background:
                    'linear-gradient(90deg, var(--argho-green), var(--argho-blue) 60%, var(--gold))',
                  opacity: 0.35,
                  zIndex: 0,
                }}
                className="ciencia-pipeline-line"
              />
              {[
                {
                  step: '01',
                  title: 'Isolamento',
                  body: 'Seleção de cepas e extração de princípios ativos a partir de fontes naturais.',
                },
                {
                  step: '02',
                  title: 'Caracterização',
                  body: 'Análise molecular por HPLC-MS e cromatografia gasosa para mapear estrutura química.',
                },
                {
                  step: '03',
                  title: 'Bioensaios',
                  body: 'Testes de letalidade, repelência e atividade antifúngica contra pragas e patógenos-alvo.',
                },
                {
                  step: '04',
                  title: 'Validação',
                  body: 'Cultivo em fitotrons (-5 a 35°C, 0–100% umidade) e estufas controladas com 2.000m².',
                },
                {
                  step: '05',
                  title: 'Escala piloto',
                  body: 'Fermentadores e fotobiorreatores produzindo lotes pré-industriais para estabilização.',
                },
                {
                  step: '06',
                  title: 'Campo brasileiro',
                  body: 'Registro MAPA, validação agronômica em culturas tropicais e entrega ao distribuidor.',
                },
              ].map((p) => (
                <div
                  key={p.step}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '0 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    backgroundColor: 'transparent',
                  }}
                >
                  {/* Circle indicator */}
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--argho-blue)',
                      letterSpacing: '-0.04em',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    {p.step}
                  </div>
                  <h4
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: 'var(--text-primary)',
                      lineHeight: 1.1,
                    }}
                  >
                    {p.title}
                  </h4>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.55,
                    }}
                  >
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Closing card — manifesto */}
          <div
            style={{
              marginTop: '80px',
              padding: '48px',
              backgroundColor: 'var(--argho-blue)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-blue-glow-lg)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: '-40%',
                right: '-10%',
                width: '60%',
                height: '180%',
                background:
                  'radial-gradient(circle, oklch(0.586 0.150 138.8 / 0.25), transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <p
              style={{
                position: 'relative',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.25rem, 2.4vw, 1.875rem)',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '-0.035em',
                lineHeight: 1.3,
                margin: 0,
                maxWidth: '900px',
              }}
            >
              <span style={{ color: 'oklch(0.94 0.040 138)' }}>Substituir química sintética</span>{' '}
              por alternativas biotecnológicas, sem comprometer produtividade. É essa convicção que
              conecta cada lote em planta piloto ao agrônomo brasileiro que recomenda o produto na
              fazenda.
            </p>
          </div>
        </div>

        {/* Responsive overrides */}
        <style>{`
          @media (max-width: 968px) {
            .ciencia-metrics-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .ciencia-metrics-grid > div:nth-child(2) { border-right: none !important; }
            .ciencia-metrics-grid > div:nth-child(1),
            .ciencia-metrics-grid > div:nth-child(2) {
              border-bottom: 1px solid var(--border-subtle) !important;
            }
            .ciencia-disciplines-grid {
              grid-template-columns: 1fr !important;
            }
            .ciencia-pipeline {
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 32px 16px !important;
            }
            .ciencia-pipeline-line { display: none !important; }
          }
          @media (max-width: 640px) {
            .ciencia-metrics-grid {
              grid-template-columns: 1fr !important;
            }
            .ciencia-metrics-grid > div { border-right: none !important; }
            .ciencia-pipeline {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
        `}</style>
      </section>

      <RootDivider variant="single" accent="var(--argho-blue-soft)" />

      {/* ═══════════════════════════════════════════════════════════════════
          REGULATÓRIO — duas colunas, card destacado à direita
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: 'var(--bg-soft)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          className="sobre-regulatory-grid"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '96px 48px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
          }}
        >
          <div>
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
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--argho-blue)',
                  fontWeight: 600,
                }}
              >
                Regulatório
              </span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 700,
                letterSpacing: '-0.045em',
                color: 'var(--argho-blue)',
                marginBottom: '24px',
                lineHeight: 1.0,
              }}
            >
              Tudo registrado.
              <br />
              <span style={{ color: 'var(--argho-green)' }}>Sem atalhos.</span>
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                maxWidth: '480px',
              }}
            >
              Todos os produtos do portfólio Argho possuem registro válido no Ministério da
              Agricultura, Pecuária e Abastecimento (MAPA). Origem europeia com cadeia logística
              rastreável e documentação disponível para distribuidores e agrônomos.
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              borderTop: '3px solid var(--argho-blue)',
              borderRadius: '8px',
              padding: '40px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--argho-green)',
                  boxShadow: '0 0 8px oklch(0.586 0.150 138.8 / 0.5)',
                }}
              />
              <span
                className="mono"
                style={{
                  fontSize: '0.625rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--argho-blue)',
                  fontWeight: 600,
                }}
              >
                Conformidade
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.9,
                marginBottom: '24px',
              }}
            >
              CNPJ 00.000.000/0001-00
              <br />
              Inscrição Estadual — ES
              <br />
              Registro MAPA — Revendedor
            </p>
            <div
              style={{
                height: '1px',
                backgroundColor: 'var(--border-subtle)',
                marginBottom: '24px',
              }}
            />
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--text-tertiary)',
                lineHeight: 1.7,
                letterSpacing: '0.04em',
              }}
            >
              ORIGEM EUROPEIA · REGISTRO MAPA
              <br />
              FORMULAÇÃO TÉCNICA CERTIFICADA
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA FINAL — primário azul, espelhando home
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '120px 48px' }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '40px',
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
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--argho-blue)',
                fontWeight: 600,
              }}
            >
              Próximo passo
            </span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.25rem, 5vw, 4rem)',
              fontWeight: 700,
              letterSpacing: '-0.055em',
              color: 'var(--argho-blue)',
              lineHeight: 0.95,
              maxWidth: '900px',
            }}
          >
            Conheça o portfólio. <span style={{ color: 'var(--argho-green)' }}>16 produtos</span>{' '}
            com ficha técnica completa.
          </h2>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
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
                boxShadow: 'var(--shadow-blue-glow)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
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
                padding: '15px 0',
                letterSpacing: '-0.005em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                borderBottom: '1px solid var(--text-primary)',
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
          </div>
        </div>
      </section>

      {/* ── Responsive overrides ── */}
      <style>{`
        @media (max-width: 968px) {
          .sobre-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
            min-height: auto !important;
          }
          .sobre-hero-right {
            min-height: auto !important;
            align-items: flex-start !important;
            padding: 0 !important;
          }
          .sobre-hero-right > div:nth-child(1) { display: none !important; }
          .sobre-mission-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          .sobre-regulatory-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          .sobre-expertise-row {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
        @media (max-width: 640px) {
          .sobre-metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px !important;
          }
          .sobre-values-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
