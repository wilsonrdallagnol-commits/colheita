// apps/website/src/app/sobre/page.tsx
// Sobre — Argho Agrosciences (Redesign 2026)
// White-first editorial. Paleta oficial Argho. Tipografia bold.
// Espelho da home: assimetria, eyebrows azuis, headlines bold, dividers de raiz.

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { RootDivider } from '@/components/root-divider';
import { FEATURES } from '@/lib/features';
import { CATEGORIES, ENQUADRAMENTO, PRODUCTS, type ProductCategory } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Sobre',
  description:
    'Argho Agrosciences — fertilizantes de origem europeia com registro MAPA e linhas biológica e de adjuvantes nacionais para a agricultura brasileira.',
};

// Acento por categoria — mesma correspondencia da ficha de produto.
const CAT_ACCENT: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'var(--cat-mineral)',
  organominerais: 'var(--cat-organo)',
  biologicos: 'var(--cat-bio)',
  adjuvantes: 'var(--cat-adj)',
};

// Canais e condicoes da fenotipagem — mesma ordem e mesmos rotulos do catalogo
// (build/gerar-catalogo.mjs, pgMaavi) e da home. Imagens em public/maavi/.
const FENOTIPAGEM_CANAIS = [
  { chave: 'rgb', rotulo: 'Imagem real' },
  { chave: 'temperatura', rotulo: 'Temperatura' },
  { chave: 'fotossintese', rotulo: 'Fotossíntese' },
  { chave: 'psii', rotulo: 'Fotossistema II' },
  { chave: 'npq', rotulo: 'Energia dissipada' },
  { chave: 'defesa', rotulo: 'Compostos de defesa' },
] as const;

const FENOTIPAGEM_CONDICOES = [
  { chave: 'sadia', rotulo: 'Sem doença', alt: 'sadia' },
  { chave: 'doente', rotulo: 'Com doença fúngica', alt: 'com doença fúngica' },
] as const;

const VALUES = [
  // Reescrito em 17/08/2026. A versão anterior era marketês — "pesquisa agronômica séria",
  // "nenhuma promessa sem laudo", "construímos resultados": frases que servem para qualquer
  // empresa e não se pode conferir. Wilson: "não temos nada no site sobre isso".
  // Cada item abaixo carrega um número ou um mecanismo que o próprio site publica, e a
  // pessoa pode ir conferir na página do produto.
  {
    id: 'v1',
    number: '01',
    title: 'Identidade de cepa declarada',
    body: 'Cada microrganismo da linha biológica vai ao rótulo com espécie, código de coleção e fração na formulação — 20 identidades declaradas em 8 inóculos. Sem "consórcio de Bacillus" genérico: cepa com nome e sobrenome.',
  },
  {
    id: 'v2',
    number: '02',
    title: 'Garantia é do laudo',
    body: 'Nos minerais e organominerais, a composição publicada é a do Certificado de Análise, não a do folheto. Dez produtos com número de registro MAPA exibido na ficha, aberto para conferência.',
  },
  {
    id: 'v3',
    number: '03',
    title: 'Cada linha no seu regime',
    body: 'Registro para fertilizante, dispensa para o inóculo de bioinsumo, isenção para o adjuvante. Nenhum produto anunciado sob classificação que não é a dele — e nenhuma classe de defensivo atribuída a quem não a tem.',
  },
  {
    id: 'v4',
    number: '04',
    title: 'Pesquisa que se mede',
    body: 'Fenotipagem por imagem em seis canais no centro parceiro: termografia, fluorescência da clorofila, ΦPSII, NPQ. O estresse aparece nos dados antes do sintoma visível — e é o dado que decide a formulação, não a observação.',
  },
];

const EXPERTISE_ITEMS = [
  // Cada linha agora abre com o QUE ELA É no plano regulatório e traz a arte de mecanismo
  // que o catálogo usa. Antes eram quatro frases soltas, sem número, sem produto e sem
  // imagem — o que o Wilson leu, com razão, como "não tem nada".
  {
    id: 'e1',
    categoria: 'fertilizantes-minerais' as const,
    label: 'Fertilizantes Minerais',
    accent: 'var(--cat-mineral)',
    arte: '/products/modo-acao/xcensis.jpg',
    detail:
      'Micronutrientes quelados com EDTA e lignossulfonatos, formulações potássicas para enchimento de grãos e cálcio de alta mobilidade foliar. Composição garantida por Certificado de Análise.',
  },
  {
    id: 'e2',
    categoria: 'organominerais' as const,
    label: 'Organominerais',
    accent: 'var(--cat-organo)',
    arte: '/products/modo-acao/impuch.jpg',
    detail:
      'Vinhaça fermentada, substâncias húmicas de leonardita, aminoácidos de origem vegetal e torta de mamona hidrolisada. Carbono orgânico e minerais na mesma matriz, para microbiota e CTC.',
  },
  {
    id: 'e3',
    categoria: 'biologicos' as const,
    label: 'Biológicos',
    accent: 'var(--cat-bio)',
    arte: '/products/modo-acao/biotas.jpg',
    detail:
      'Inóculos de Bacillus, Priestia, Trichoderma, Metarhizium e outros gêneros, com cepa identificada e concentração declarada em UFC/mL e UFC/L. Multiplicados em unidade de produção para uso próprio.',
  },
  {
    id: 'e4',
    categoria: 'adjuvantes' as const,
    label: 'Adjuvantes',
    accent: 'var(--cat-adj)',
    arte: '/products/modo-acao/operate-plus.jpg',
    detail:
      'Família Operate: surfactantes com óleos essenciais, sequestrante de cátions, ajuste de pH da calda e ação antideriva. Dose publicada em dois regimes — mL/L de calda e mL/ha em baixa vazão.',
  },
];

const HERO_METRICS = [
  { value: String(PRODUCTS.length), label: 'Produtos no portfólio' },
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
              className="anim-fade-in-up delay-2 sobre-eyebrow"
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
        id="valores"
        style={{
          backgroundColor: 'var(--bg-soft)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          scrollMarginTop: '88px',
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
      <section id="expertise" style={{ padding: '120px 48px', scrollMarginTop: '88px' }}>
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
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.375rem',
                      fontWeight: 700,
                      letterSpacing: '-0.035em',
                      color: 'var(--text-primary)',
                      lineHeight: 1.1,
                      marginBottom: '10px',
                    }}
                  >
                    {item.label}
                  </h3>
                  {/* Classificação + contagem: o card dizia só o nome da linha. Os dois
                      valores saem de lib/products.ts, a mesma fonte da ficha de produto. */}
                  <div
                    className="mono"
                    style={{
                      fontSize: '0.6875rem',
                      letterSpacing: '0.08em',
                      color: item.accent,
                      fontWeight: 700,
                      marginBottom: '4px',
                    }}
                  >
                    {ENQUADRAMENTO[item.categoria].classificacao}
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: '0.6875rem',
                      letterSpacing: '0.06em',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {PRODUCTS.filter((pr) => pr.category === item.categoria).length} produtos ·{' '}
                    {ENQUADRAMENTO[item.categoria].base}
                  </div>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 200px)',
                    gap: '32px',
                    alignItems: 'center',
                  }}
                  className="sobre-expertise-corpo"
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7,
                    }}
                  >
                    {item.detail}
                  </p>
                  {/* Arte de mecanismo do catálogo — a seção não tinha imagem nenhuma. */}
                  <Image
                    src={item.arte}
                    alt={`${item.label} — arte técnica da linha`}
                    width={200}
                    height={200}
                    sizes="(max-width: 968px) 40vw, 200px"
                    style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                  />
                </div>
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
              {/* "centro de pesquisa PARCEIRO": a estrutura não é da Argho. E 5.000m² virou
                  10.000m², número do catálogo, conferido na fonte primária em 13/08. */}
              Cada formulação Argho nasce em um centro de pesquisa parceiro com mais de{' '}
              <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                10.000m² dedicados à pesquisa
              </strong>{' '}
              no sul da Espanha, voltado a substituir química sintética por alternativas
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
              {/* Sem contagem de pesquisadores (ordem do Wilson, 13/08) e sem o "500 mil
                  litros/ano", que o catálogo — conferido na fonte primária — não traz.
                  O trajeto abaixo é o do catálogo: laboratório → estufa → planta-piloto. */}
              Botânica, microbiologia, microalgas e química verde combinam-se numa cadeia única
              de descoberta, organizada em seis áreas — biocontrole, bioestimulantes, saúde do
              solo, química analítica, fitopatologia e entomologia. O percurso vai do
              laboratório à estufa e da planta-piloto à escala industrial.
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
              // Mesma correção da faixa da home (17/08): sai o número de pesquisadores
              // (ordem do Wilson em 13/08 — equipe encolheu, fontes públicas desatualizadas)
              // e o 5.000m² vira 10.000m², que é o número verificado no catálogo. O "500k L"
              // saiu por não constar do catálogo, que foi conferido em fonte primária.
              { value: '10.000m²', label: 'Área dedicada à pesquisa' },
              { value: '2019', label: 'Centro inaugurado' },
              { value: '6', label: 'Áreas de pesquisa' },
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
                  // "funcao biopesticida" saiu em 17/08: e termo de classe de defensivo, e o
                  // catalogo descreve as quatro frentes sem atribuir finalidade sobre praga.
                  body: 'Triagem de extratos de plantas medicinais e agrícolas para identificar moléculas de interesse e caracterizar sua estrutura química. Cromatografia flash, destilação Soxhlet, rotavapor e extração em cascata.',
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
                  body: 'Isolamento, seleção e caracterização de cepas bacterianas e fúngicas com identidade genética declarada e código de coleção rastreável. Foco em consórcios de Trichoderma, Bacillus e gêneros correlatos.',
                  techniques: [
                    'Fermentação líquida e sólida',
                    'Identificação de cepa',
                    'Consórcios microbianos',
                  ],
                  accent: 'var(--argho-blue)',
                },
                {
                  num: '03',
                  title: 'Microalgas',
                  // Saiu o "de 140L" dos fotobiorreatores — último número do centro que vinha
                  // das fontes públicas antigas e que o catálogo não confirma. A técnica fica;
                  // o volume, que ninguém verificou, não.
                  body: 'Produção de metabólitos secundários e bioestimulantes em fotobiorreatores tubulares. Cepas selecionadas para alto rendimento de polissacarídeos, betaínas e aminoácidos vegetais.',
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

          {/* ═══════════════════════════════════════════════════════════════
              FENOTIPAGEM POR IMAGEM — leituras REAIS do centro parceiro.
              A seção de ciência do /sobre não tinha uma única imagem técnica: falava
              de fenotipagem computacional só em texto. Estas são as 12 leituras que o
              catálogo imprime (6 canais × planta sadia e doente), na mesma estrutura,
              com colunas numeradas e legenda corrida — porque "Fotossistema II" não
              cabe sob a largura de uma leitura.
          ═══════════════════════════════════════════════════════════════ */}
          <div style={{ marginBottom: '72px' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}
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
                Fenotipagem por imagem · leitura real
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                maxWidth: '760px',
                marginBottom: '28px',
              }}
            >
              Câmeras multiespectrais leem a planta sem tocá-la: termografia infravermelha
              para a temperatura foliar — indicador indireto de transpiração e fechamento
              estomático — e fluorescência da clorofila para o rendimento quântico do
              fotossistema II (ΦPSII) e para a energia excedente dissipada como calor (NPQ),
              mecanismo de fotoproteção. <strong>O estresse aparece nos dados antes do
              sintoma visível</strong>: compare a mesma folha nas duas condições.
            </p>

            <div
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '24px',
                backgroundColor: 'var(--bg-mist)',
              }}
            >
              {FENOTIPAGEM_CONDICOES.map((cond) => (
                <div key={cond.chave} style={{ marginBottom: '16px' }}>
                  <div
                    className="mono"
                    style={{
                      fontSize: '0.625rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--text-tertiary)',
                      marginBottom: '8px',
                    }}
                  >
                    {cond.rotulo}
                  </div>
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}
                  >
                    {FENOTIPAGEM_CANAIS.map((canal) => (
                      <Image
                        key={canal.chave}
                        src={`/maavi/fen-${canal.chave}-${cond.chave}.png`}
                        alt={`${canal.rotulo} — folha ${cond.alt}`}
                        width={104}
                        height={118}
                        sizes="(max-width: 968px) 15vw, 130px"
                        style={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: '4px',
                          display: 'block',
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                {FENOTIPAGEM_CANAIS.map((canal, i) => (
                  <div
                    key={canal.chave}
                    className="mono"
                    style={{
                      fontSize: '0.625rem',
                      color: 'var(--text-tertiary)',
                      textAlign: 'center',
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <p
                className="mono"
                style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.6875rem',
                  lineHeight: 1.7,
                  color: 'var(--text-muted)',
                }}
              >
                {FENOTIPAGEM_CANAIS.map((canal, i) => (
                  <span key={canal.chave}>
                    {i > 0 && ' · '}
                    <b style={{ color: 'var(--text-secondary)' }}>{i + 1}</b> {canal.rotulo}
                  </span>
                ))}
              </p>
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
                  // Alinhado a pagina do MAAVi no catalogo 2026 (decisao do Wilson, 17/08).
                  // A redacao antiga — "letalidade, repelencia e atividade antifungica contra
                  // pragas e patogenos-alvo" — descrevia ensaio sobre praga numa pagina que
                  // fica ao lado do portfolio; o catalogo ja tinha trocado pela fenotipagem.
                  step: '03',
                  title: 'Fenotipagem por imagem',
                  body: 'Câmeras multiespectrais leem a planta sem tocá-la: termografia infravermelha para a temperatura foliar e fluorescência da clorofila para o rendimento quântico do fotossistema II e a energia dissipada como calor.',
                },
                {
                  step: '04',
                  title: 'Validação',
                  // Saíram a faixa dos fitotrons (-5 a 35°C, 0–100%) e os "2.000m² de
                  // estufas": números da mesma safra desatualizada dos 5.000m² e do "60+
                  // pesquisadores", e o catálogo — conferido em fonte primária — não traz
                  // nenhum dos dois. Ele descreve o trajeto, e é isso que fica.
                  body: 'Cultivo em fitotrons e estufas controladas: do laboratório à estufa e da planta-piloto à escala industrial.',
                },
                {
                  step: '05',
                  title: 'Fermentação dirigida',
                  body: 'Espécies vegetais combinadas com microrganismos específicos: o metabolismo microbiano libera peptídeos, aminoácidos livres e metabólitos que a extração direta não alcançaria.',
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
            .sobre-eyebrow {
              margin-left: 0 !important;
            }
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
              {/* Era "Tudo registrado." ate 17/08/2026 — falso para metade do portfolio: o
                  inoculo biologico e DISPENSADO de registro (so a fabrica tem) e o adjuvante e
                  ISENTO. "Declarado" vale para as quatro linhas e nao promete registro que
                  nao existe. */}
              Tudo declarado.
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
              Os fertilizantes minerais e organominerais — de origem europeia, com cadeia
              logística rastreável — possuem registro no Ministério da Agricultura, Pecuária e
              Abastecimento (MAPA). Os adjuvantes da linha Operate são isentos de registro, nos
              termos da legislação vigente. Os biológicos são inóculos de composição
              microbiológica declarada, fornecidos como insumo para produção de bioinsumos para
              uso próprio, nos termos do art. 36 da Lei Federal nº 15.070/2024 — vedada a
              comercialização do bioinsumo produzido. Documentação disponível para distribuidores
              e agrônomos.
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
              {/* CNPJ removido em 18/08/2026 — o numero publicado nao era da empresa. */}
              Paraná — Brasil
              <br />
              Estabelecimento registrado no MAPA — PR
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
              ORIGEM EUROPEIA E NACIONAL
              <br />
              FORMULAÇÃO TÉCNICA CERTIFICADA
            </p>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              QUADRO DE ENQUADRAMENTO — o teor técnico que faltava aqui.
              A seção afirmava "tudo declarado" e não mostrava o quê. Cada linha
              é o regime real da categoria, com a base legal e a contagem de
              produtos — tudo derivado de lib/products.ts, a mesma fonte que a
              ficha de cada produto usa, então não há como divergir.
          ═══════════════════════════════════════════════════════════════ */}
          <div style={{ marginTop: '56px', gridColumn: '1 / -1' }}>
            <div
              className="mono"
              style={{
                fontSize: '0.625rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--argho-blue)',
                fontWeight: 700,
                marginBottom: '16px',
              }}
            >
              Regime por linha de produto
            </div>
            <div
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              {(Object.keys(ENQUADRAMENTO) as ProductCategory[]).map((c, i) => {
                const n = PRODUCTS.filter((p) => p.category === c).length;
                const cor = CAT_ACCENT[c];
                return (
                  <div
                    key={c}
                    className="regime-linha"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1.3fr) minmax(0,1.4fr) auto',
                      gap: '16px',
                      alignItems: 'center',
                      padding: '16px 20px',
                      borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                      borderLeft: `3px solid ${cor}`,
                      backgroundColor: 'var(--bg)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {CATEGORIES[c].label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {ENQUADRAMENTO[c].classificacao}
                    </span>
                    <span
                      className="mono"
                      style={{ fontSize: '0.75rem', color: cor, fontWeight: 700 }}
                    >
                      {ENQUADRAMENTO[c].base}
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {n} produtos
                    </span>
                  </div>
                );
              })}
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                lineHeight: 1.65,
                marginTop: '14px',
              }}
            >
              Os inóculos biológicos são <strong>dispensados de registro</strong> — quem tem
              registro é a unidade fabril. A vedação de comercializar o bioinsumo produzido
              decorre do regime de uso próprio e acompanha todo material da linha.
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
            Conheça o portfólio.{' '}
            <span style={{ color: 'var(--argho-green)' }}>{PRODUCTS.length} produtos</span> com
            ficha técnica completa.
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
            {/* Link Plataforma Colheita escondido via FEATURES.colheitaPlatform */}
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
            )}
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
          .sobre-expertise-corpo {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          /* O quadro de regime tem 4 colunas; a 375px sobram ~55px por coluna e o texto
             quebra letra a letra. Medido no DOM. Empilha e vira lista legivel. */
          .regime-linha {
            grid-template-columns: 1fr !important;
            gap: 4px !important;
            padding: 14px 16px !important;
          }
        }
      `}</style>
    </main>
  );
}
