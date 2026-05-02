// apps/website/src/app/sobre/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

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
    detail:
      'Micronutrientes quelados com EDTA e Lignossulfonatos, formulações potássicas para enchimento de grãos, cálcio de alta mobilidade foliar.',
  },
  {
    id: 'e2',
    label: 'Organominerais',
    detail:
      'Vinhaça fermentada, substâncias húmicas de leonardita, aminoácidos de origem vegetal e torta de mamona hidrolisada para microbiota e CTC.',
  },
  {
    id: 'e3',
    label: 'Biológicos',
    detail:
      'Consórcios de Trichoderma harzianum e Bacillus spp. (5 espécies) com alta viabilidade celular para controle biológico e promoção de crescimento.',
  },
  {
    id: 'e4',
    label: 'Adjuvantes',
    detail:
      'Família Operate: espalhantes com óleos essenciais, condicionamento de pH, antideriva — formulados para compatibilidade com biológicos.',
  },
];

export default function SobrePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Hero ── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Decorative gold line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '360px',
            width: '1px',
            background:
              'linear-gradient(to bottom, transparent, oklch(0.73 0.135 78 / 0.20) 30%, oklch(0.73 0.135 78 / 0.20) 70%, transparent)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '96px 48px 80px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'end',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.12em',
                color: 'var(--green)',
                textTransform: 'uppercase',
                marginBottom: '24px',
              }}
            >
              Argho Agrosciences
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: 1.0,
                color: 'var(--text-primary)',
                marginBottom: '32px',
              }}
            >
              Origem europeia.
              <br />
              <span style={{ color: 'var(--green)' }}>Solo brasileiro.</span>
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.0625rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
                maxWidth: '480px',
              }}
            >
              A Argho Agrosciences distribui insumos agrícolas desenvolvidos na Europa com registro
              MAPA para o Brasil — conectando a ciência de nutrição de precisão ao agro nacional.
            </p>
          </div>

          {/* Numbers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1px',
              backgroundColor: 'var(--border-subtle)',
            }}
          >
            {[
              { value: '18', label: 'Produtos no portfólio' },
              { value: '4', label: 'Linhas de atuação' },
              { value: 'ES', label: 'Origem Espanha' },
              { value: 'MAPA', label: 'Registro brasileiro' },
            ].map(({ value, label }) => (
              <div
                key={label}
                style={{
                  backgroundColor: 'var(--surface)',
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2rem',
                    fontWeight: 700,
                    letterSpacing: '-0.04em',
                    color: 'var(--gold)',
                    lineHeight: 1,
                  }}
                >
                  {value}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mission ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 48px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: '80px',
            alignItems: 'start',
          }}
        >
          <div style={{ position: 'sticky', top: '80px' }}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.12em',
                color: 'var(--text-faint)',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}
            >
              Nossa missão
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 700,
                letterSpacing: '-0.035em',
                color: 'var(--text-primary)',
                lineHeight: 1.15,
              }}
            >
              Nutrição de
              <br />
              precisão para
              <br />o agro brasileiro.
            </h2>
          </div>

          <div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.0625rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
                marginBottom: '32px',
              }}
            >
              O agricultor brasileiro produz em solos tropicais únicos — alta precipitação, acidez,
              lixiviação intensa — e exige soluções que respeitem essa realidade. A Argho nasceu
              para preencher a lacuna entre a sofisticação técnica europeia e a exigência prática do
              campo nacional.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.0625rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
                marginBottom: '32px',
              }}
            >
              Não somos importadores de catálogo. Selecionamos produtos com base em desempenho
              comprovado, garantimos regularização MAPA completa e desenvolvemos recomendações
              agronômicas adaptadas às culturas e safras brasileiras.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.0625rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
              }}
            >
              Do micronutriente quelado ao bioinsumo com consórcio certificado, cada produto do
              portfólio Argho tem um propósito claro e uma ficha técnica honesta.
            </p>
          </div>
        </div>
      </div>

      {/* ── Values ── */}
      <div
        id="valores"
        style={{
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--surface)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 48px' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              letterSpacing: '0.12em',
              color: 'var(--green)',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Princípios
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing: '-0.035em',
              color: 'var(--text-primary)',
              marginBottom: '56px',
            }}
          >
            O que nos guia.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1px',
              backgroundColor: 'var(--border-subtle)',
            }}
          >
            {VALUES.map((v) => (
              <div
                key={v.id}
                style={{
                  backgroundColor: 'var(--bg)',
                  padding: '40px 36px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    letterSpacing: '0.10em',
                    color: 'var(--text-faint)',
                  }}
                >
                  {v.number}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    letterSpacing: '-0.03em',
                    color: 'var(--text-primary)',
                    lineHeight: 1.2,
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
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Expertise ── */}
      <div id="expertise" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 48px' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            letterSpacing: '0.12em',
            color: 'var(--gold)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          Portfólio técnico
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '-0.035em',
            color: 'var(--text-primary)',
            marginBottom: '48px',
          }}
        >
          Nossa expertise.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {EXPERTISE_ITEMS.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '280px 1fr',
                gap: '48px',
                padding: '32px 0',
                borderTop: i === 0 ? '1px solid var(--border-subtle)' : 'none',
                borderBottom: '1px solid var(--border-subtle)',
                alignItems: 'start',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  letterSpacing: '-0.025em',
                  color: 'var(--text-primary)',
                }}
              >
                {item.label}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                }}
              >
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Regulatory note ── */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--surface)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '64px 48px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.12em',
                color: 'var(--text-faint)',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}
            >
              Regulatório
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 700,
                letterSpacing: '-0.035em',
                color: 'var(--text-primary)',
                marginBottom: '20px',
                lineHeight: 1.15,
              }}
            >
              Tudo registrado.
              <br />
              Sem atalhos.
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
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
              borderRadius: '8px',
              padding: '32px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                lineHeight: 1.8,
                marginBottom: '20px',
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
                marginBottom: '20px',
              }}
            />
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--text-faint)',
                lineHeight: 1.6,
              }}
            >
              ORIGEM EUROPEIA · REGISTRO MAPA
              <br />
              FORMULAÇÃO TÉCNICA CERTIFICADA
            </p>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 48px' }}>
        <div
          style={{
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
                fontSize: '2rem',
                fontWeight: 700,
                letterSpacing: '-0.035em',
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}
            >
              Conheça o portfólio.
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
              }}
            >
              18 produtos com ficha técnica completa e registro MAPA.
            </p>
          </div>
          <Link
            href="/produtos"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'oklch(0.10 0 0)',
              backgroundColor: 'var(--gold)',
              textDecoration: 'none',
              padding: '14px 28px',
              borderRadius: '6px',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Ver catálogo →
          </Link>
        </div>
      </div>
    </div>
  );
}
