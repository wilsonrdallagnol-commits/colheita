// apps/website/src/app/page.tsx
// Home — Argho Agrosciences
// Design: Ciência viva no campo. Hero cinematográfico com embalagens reais.

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Argho Agrosciences — Nutrição de precisão para o agro brasileiro',
  description:
    'Fertilizantes minerais, organominerais, biológicos e adjuvantes desenvolvidos com ciência de ponta para alta produtividade agrícola.',
};

// ─── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  bg: 'oklch(0.07 0.018 148)',
  bgMid: 'oklch(0.10 0.020 148)',
  bgLight: 'oklch(0.13 0.022 148)',
  green: 'oklch(0.58 0.165 148)',
  greenMid: 'oklch(0.42 0.12 148)',
  gold: 'oklch(0.73 0.135 78)',
  teal: 'oklch(0.64 0.13 195)',
  muted: 'oklch(0.52 0.025 148)',
  faint: 'oklch(0.30 0.018 148)',
  border: 'oklch(0.18 0.020 148)',
  white: '#ffffff',
};

export default function Home() {
  return (
    <main style={{ backgroundColor: C.bg, overflowX: 'hidden' }}>
      {/* ═══════════════════════════════════════════════════════════════════════
          HERO — Produto como protagonista. Fundo escuro, glow dourado/verde.
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingTop: '64px',
          paddingBottom: '80px',
          overflow: 'hidden',
          backgroundColor: C.bg,
        }}
      >
        {/* Glow de fundo — aurora verde/dourada */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 70% 55% at 50% 42%, oklch(0.22 0.10 148 / 0.55) 0%, oklch(0.14 0.06 148 / 0.25) 45%, transparent 72%)',
            pointerEvents: 'none',
          }}
        />

        {/* Glow dourado acento */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            width: '520px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, oklch(0.73 0.135 78 / 0.22) 0%, transparent 70%)',
            top: '38%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            filter: 'blur(40px)',
          }}
        />

        {/* Anéis orbitais — SVG decorativo */}
        <svg
          aria-hidden="true"
          role="presentation"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <ellipse
            cx="720"
            cy="400"
            rx="310"
            ry="200"
            fill="none"
            stroke="oklch(0.58 0.165 148 / 0.07)"
            strokeWidth="1"
          />
          <ellipse
            cx="720"
            cy="400"
            rx="490"
            ry="310"
            fill="none"
            stroke="oklch(0.58 0.165 148 / 0.04)"
            strokeWidth="1"
          />
          <ellipse
            cx="720"
            cy="400"
            rx="670"
            ry="420"
            fill="none"
            stroke="oklch(0.73 0.135 78 / 0.025)"
            strokeWidth="1"
          />
          {/* Pontos nas órbitas */}
          <circle cx="1030" cy="400" r="3" fill="oklch(0.73 0.135 78 / 0.4)" />
          <circle cx="410" cy="400" r="3" fill="oklch(0.58 0.165 148 / 0.4)" />
          <circle cx="720" cy="90" r="2" fill="oklch(0.64 0.13 195 / 0.35)" />
        </svg>

        {/* ── Label topo ── */}
        <div
          style={{
            position: 'absolute',
            top: '84px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '24px',
              height: '1px',
              background: C.gold,
              opacity: 0.6,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.6875rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: C.gold,
              opacity: 0.8,
            }}
          >
            Argho Agrosciences — Linha Completa 2024
          </span>
          <span
            style={{
              display: 'inline-block',
              width: '24px',
              height: '1px',
              background: C.gold,
              opacity: 0.6,
            }}
          />
        </div>

        {/* ── Embalagens hero — 3 produtos em cluster ── */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '820px',
            height: '440px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          {/* Grow Filling — esquerda, atrás */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-280px) scale(0.72) rotate(-6deg)',
              transformOrigin: 'bottom center',
              filter: 'drop-shadow(0 30px 50px oklch(0.58 0.165 148 / 0.3)) brightness(0.88)',
              zIndex: 1,
              opacity: 0.85,
            }}
          >
            <Image
              src="/mockups/grow-filling.png"
              alt="Grow Filling"
              width={220}
              height={300}
              style={{ objectFit: 'contain', display: 'block' }}
              priority
            />
          </div>

          {/* Xcensis — centro, frente */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%) scale(1.08)',
              transformOrigin: 'bottom center',
              filter:
                'drop-shadow(0 0 60px oklch(0.73 0.135 78 / 0.45)) drop-shadow(0 30px 60px oklch(0.58 0.165 148 / 0.5))',
              zIndex: 3,
            }}
          >
            <Image
              src="/mockups/xcensis.png"
              alt="Xcensis"
              width={280}
              height={380}
              style={{ objectFit: 'contain', display: 'block' }}
              priority
            />
          </div>

          {/* Grow MoB — direita, atrás */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(60px) scale(0.72) rotate(6deg)',
              transformOrigin: 'bottom center',
              filter: 'drop-shadow(0 30px 50px oklch(0.64 0.13 195 / 0.3)) brightness(0.88)',
              zIndex: 2,
              opacity: 0.85,
            }}
          >
            <Image
              src="/mockups/grow-mob.png"
              alt="Grow MoB+"
              width={220}
              height={300}
              style={{ objectFit: 'contain', display: 'block' }}
              priority
            />
          </div>
        </div>

        {/* ── Headline + CTA ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            padding: '0 24px',
            marginTop: '8px',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
              fontWeight: 600,
              color: C.white,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              margin: '0 0 20px',
            }}
          >
            Nutrição que transforma
            <br />
            <span style={{ color: C.gold }}>lavouras em resultados</span>
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: C.muted,
              maxWidth: '440px',
              margin: '0 auto 36px',
              lineHeight: 1.65,
            }}
          >
            18 produtos. 4 linhas. Uma ciência desenvolvida para a alta produtividade do campo
            brasileiro.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/produtos"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'oklch(0.08 0 0)',
                backgroundColor: C.gold,
                textDecoration: 'none',
                padding: '13px 32px',
                borderRadius: '6px',
                letterSpacing: '-0.01em',
                display: 'inline-block',
              }}
            >
              Ver catálogo completo
            </Link>
            <Link
              href="https://colheita.app.br"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: C.gold,
                backgroundColor: 'transparent',
                textDecoration: 'none',
                padding: '13px 32px',
                borderRadius: '6px',
                border: `1px solid oklch(0.73 0.135 78 / 0.30)`,
                letterSpacing: '-0.01em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: C.gold,
                }}
              />
              Plataforma Colheita
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          NÚMEROS — strip de credibilidade
      ══════════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          backgroundColor: C.bgMid,
          display: 'flex',
          alignItems: 'stretch',
          overflowX: 'auto',
        }}
      >
        {[
          { value: '18', label: 'Produtos ativos' },
          { value: '4', label: 'Linhas especializadas' },
          { value: '100%', label: 'Tecnologia nacional' },
          { value: '+5', label: 'Anos de pesquisa' },
        ].map((stat, i) => (
          <div
            key={stat.value}
            style={{
              flex: '1 1 0',
              minWidth: '160px',
              padding: '32px 24px',
              textAlign: 'center',
              borderRight: i < 3 ? `1px solid ${C.border}` : 'none',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.25rem',
                fontWeight: 600,
                color: C.gold,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                marginBottom: '6px',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                color: C.muted,
                letterSpacing: '-0.01em',
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LINHAS — 4 categorias com design editorial
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: '100px 64px',
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        {/* Cabeçalho da seção */}
        <div style={{ marginBottom: '64px' }}>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.6875rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: C.green,
              marginBottom: '12px',
            }}
          >
            Portfólio
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
              fontWeight: 600,
              color: C.white,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              margin: 0,
              maxWidth: '520px',
            }}
          >
            Quatro linhas.{' '}
            <span style={{ color: C.muted }}>Cada uma com um propósito no campo.</span>
          </h2>
        </div>

        {/* Grid de linhas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2px',
          }}
        >
          {/* Fertilizantes Minerais */}
          <LineCard
            number="01"
            name="Fertilizantes Minerais"
            accent={C.green}
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

          {/* Organominerais */}
          <LineCard
            number="02"
            name="Organominerais"
            accent={C.teal}
            description="Minerais associados a fontes orgânicas para melhora do solo e eficiência de absorção radicular."
            products={['Impuch', 'Life On', 'Grow Nitro P', 'Up Soil']}
            href="/produtos?categoria=organominerais"
          />

          {/* Biológicos */}
          <LineCard
            number="03"
            name="Biológicos"
            accent="oklch(0.66 0.150 150)"
            description="Inoculantes e compostos bioativos que estimulam a microbiologia do solo e a resistência da planta."
            products={['Troian', 'Biovas']}
            href="/produtos?categoria=biologicos"
          />

          {/* Adjuvantes */}
          <LineCard
            number="04"
            name="Adjuvantes"
            accent={C.gold}
            description="Potencializadores de caldas e pulverização para maximizar a absorção e cobertura foliar."
            products={['Operate Plus', 'Operate Citronela', 'Operate 4 em 1', 'Operate Orange']}
            href="/produtos?categoria=adjuvantes"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          DESTAQUE — Stron + Operate em spotlight completo
      ══════════════════════════════════════════════════════════════════════════ */}

      {/* Stron */}
      <section
        style={{
          borderTop: `1px solid ${C.border}`,
          backgroundColor: C.bgMid,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 64px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            alignItems: 'center',
            gap: '80px',
            minHeight: '520px',
          }}
        >
          {/* Texto */}
          <div style={{ padding: '80px 0' }}>
            <span
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-body)',
                fontSize: '0.6875rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: C.green,
                marginBottom: '20px',
              }}
            >
              Fertilizante Mineral — Destaque
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                fontWeight: 600,
                color: C.white,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                margin: '0 0 20px',
              }}
            >
              Stron
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: C.muted,
                lineHeight: 1.7,
                margin: '0 0 32px',
                maxWidth: '420px',
              }}
            >
              Proteína específica com precursores vegetais. Melhora arquitetura e ativação
              fisiológica da planta, potencializando o enraizamento e a absorção de nutrientes.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
              {['Enraizamento', 'Ativação fisiológica', 'V5 → 100 mL/ha'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    color: C.green,
                    border: `1px solid oklch(0.58 0.165 148 / 0.3)`,
                    borderRadius: '4px',
                    padding: '4px 12px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link
              href="/produtos/stron"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: C.white,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                letterSpacing: '-0.01em',
              }}
            >
              Ver ficha técnica
              <span style={{ color: C.green }}>→</span>
            </Link>
          </div>

          {/* Imagem Stron — num card iluminado */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              padding: '48px 0 0',
              position: 'relative',
            }}
          >
            {/* Glow verde atrás da embalagem */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                width: '340px',
                height: '340px',
                borderRadius: '50%',
                background:
                  'radial-gradient(ellipse, oklch(0.58 0.165 148 / 0.2) 0%, transparent 70%)',
                bottom: '60px',
                left: '50%',
                transform: 'translateX(-50%)',
                filter: 'blur(30px)',
              }}
            />
            <Image
              src="/mockups/stron.png"
              alt="Stron 1L — Argho Agrosciences"
              width={320}
              height={420}
              style={{
                objectFit: 'contain',
                position: 'relative',
                zIndex: 1,
                filter: 'drop-shadow(0 20px 60px oklch(0.58 0.165 148 / 0.35))',
              }}
            />
          </div>
        </div>
      </section>

      {/* Operate */}
      <section
        style={{
          borderTop: `1px solid ${C.border}`,
          backgroundColor: C.bg,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 64px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            alignItems: 'center',
            gap: '80px',
            minHeight: '520px',
          }}
        >
          {/* Imagem Operate — esquerda desta vez */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              padding: '48px 0 0',
              position: 'relative',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                width: '380px',
                height: '300px',
                borderRadius: '50%',
                background:
                  'radial-gradient(ellipse, oklch(0.73 0.135 78 / 0.18) 0%, transparent 70%)',
                bottom: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                filter: 'blur(30px)',
              }}
            />
            <Image
              src="/mockups/operate.png"
              alt="Operate Plus 20L — Argho Agrosciences"
              width={340}
              height={380}
              style={{
                objectFit: 'contain',
                position: 'relative',
                zIndex: 1,
                filter: 'drop-shadow(0 20px 60px oklch(0.73 0.135 78 / 0.25))',
              }}
            />
          </div>

          {/* Texto */}
          <div style={{ padding: '80px 0' }}>
            <span
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-body)',
                fontSize: '0.6875rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: C.gold,
                marginBottom: '20px',
              }}
            >
              Adjuvante — Destaque
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                fontWeight: 600,
                color: C.white,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                margin: '0 0 20px',
              }}
            >
              Operate Plus
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: C.muted,
                lineHeight: 1.7,
                margin: '0 0 32px',
                maxWidth: '420px',
              }}
            >
              Adjuvante de alta performance para potencialização de caldas. Reduz a tensão
              superficial, aumenta a cobertura foliar e melhora a absorção dos ativos aplicados.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
              {['Cobertura foliar', 'Anti-deriva', '50–100 mL/100L'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    color: C.gold,
                    border: `1px solid oklch(0.73 0.135 78 / 0.3)`,
                    borderRadius: '4px',
                    padding: '4px 12px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link
              href="/produtos/operate-plus"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: C.white,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                letterSpacing: '-0.01em',
              }}
            >
              Ver ficha técnica
              <span style={{ color: C.gold }}>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PLATAFORMA COLHEITA — Acesso restrito
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: '100px 64px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
          }}
        >
          {/* Copy */}
          <div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: C.gold,
                  animation: 'pulseRing 2s ease-out infinite',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: C.gold,
                }}
              >
                Acesso restrito
              </span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
                fontWeight: 600,
                color: C.white,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                margin: '0 0 20px',
              }}
            >
              Plataforma Colheita
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: C.muted,
                lineHeight: 1.7,
                margin: '0 0 36px',
                maxWidth: '400px',
              }}
            >
              A plataforma de gestão agronômica da Argho. Dados em tempo real, recomendações de
              produto e acompanhamento de lavoura em um único ambiente.
            </p>
            <Link
              href="https://colheita.app.br"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'oklch(0.08 0 0)',
                backgroundColor: C.gold,
                textDecoration: 'none',
                padding: '13px 28px',
                borderRadius: '6px',
                letterSpacing: '-0.01em',
                display: 'inline-block',
              }}
            >
              Acessar plataforma →
            </Link>
          </div>

          {/* Glass card — dashboard mockup */}
          <div
            style={{
              background:
                'linear-gradient(135deg, oklch(0.14 0.025 148 / 0.8) 0%, oklch(0.10 0.018 148 / 0.9) 100%)',
              border: `1px solid oklch(0.73 0.135 78 / 0.15)`,
              borderRadius: '16px',
              padding: '36px',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Glow ouro */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: '-80px',
                right: '-60px',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background:
                  'radial-gradient(ellipse, oklch(0.73 0.135 78 / 0.10) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Header do card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '28px',
                paddingBottom: '20px',
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'oklch(0.73 0.135 78 / 0.15)',
                  border: `1px solid oklch(0.73 0.135 78 / 0.2)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '14px' }}>🌾</span>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: C.white,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Colheita Dashboard
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.6875rem',
                    color: C.muted,
                  }}
                >
                  colheita.app.br
                </div>
              </div>
            </div>

            {/* Métricas mock */}
            {[
              { label: 'Safra Soja 24/25', value: 'Em andamento', color: C.green },
              { label: 'Último relatório', value: '2 dias atrás', color: C.muted },
              { label: 'Produtos aplicados', value: '4 recomendações', color: C.gold },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 0',
                  borderBottom: `1px solid oklch(0.18 0.020 148 / 0.5)`,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8125rem',
                    color: C.muted,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: item.color,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}

            <div
              style={{
                marginTop: '24px',
                padding: '12px 16px',
                backgroundColor: 'oklch(0.73 0.135 78 / 0.08)',
                borderRadius: '8px',
                border: `1px solid oklch(0.73 0.135 78 / 0.15)`,
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.75rem',
                  color: 'oklch(0.73 0.135 78 / 0.8)',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                🔒 Acesso exclusivo para clientes Argho credenciados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FILOSOFIA — Strip final antes do CTA
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: '80px 64px',
          textAlign: 'center',
          backgroundColor: C.bgMid,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)',
            fontWeight: 400,
            color: C.muted,
            letterSpacing: '-0.03em',
            lineHeight: 1.5,
            maxWidth: '680px',
            margin: '0 auto 32px',
          }}
        >
          "Ciência agrícola desenvolvida no Brasil, para o Brasil. Cada fórmula nasce de pesquisa
          aplicada com{' '}
          <em style={{ color: C.white, fontStyle: 'normal' }}>foco em resultado real no campo.</em>"
        </p>
        <Link
          href="/sobre"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: C.muted,
            textDecoration: 'none',
            letterSpacing: '-0.01em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          Sobre a Argho <span style={{ color: C.green }}>→</span>
        </Link>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: '100px 64px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow de fundo */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 50% 80% at 50% 100%, oklch(0.58 0.165 148 / 0.10) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.6875rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: C.green,
              marginBottom: '16px',
            }}
          >
            Catálogo completo
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              fontWeight: 600,
              color: C.white,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              margin: '0 0 20px',
            }}
          >
            Conheça todos os <span style={{ color: C.green }}>18 produtos</span>
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: C.muted,
              margin: '0 auto 40px',
              maxWidth: '420px',
              lineHeight: 1.65,
            }}
          >
            Da nutrição mineral aos biológicos. Encontre a solução certa para cada estágio da sua
            lavoura.
          </p>
          <Link
            href="/produtos"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'oklch(0.08 0 0)',
              backgroundColor: C.gold,
              textDecoration: 'none',
              padding: '15px 40px',
              borderRadius: '6px',
              letterSpacing: '-0.01em',
              display: 'inline-block',
            }}
          >
            Ver portfólio completo
          </Link>
        </div>
      </section>
    </main>
  );
}

// ─── Componente: card de linha de produto ──────────────────────────────────────
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
        backgroundColor: C.bgMid,
        border: `1px solid ${C.border}`,
        padding: '40px',
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Número */}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '5rem',
          fontWeight: 700,
          color: `${accent}12`,
          position: 'absolute',
          top: '16px',
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
          fontWeight: 600,
          color: C.white,
          letterSpacing: '-0.03em',
          margin: '0 0 12px',
        }}
      >
        {name}
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          color: C.muted,
          lineHeight: 1.6,
          margin: '0 0 28px',
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
              backgroundColor: `${accent}10`,
              border: `1px solid ${accent}28`,
              borderRadius: '3px',
              padding: '3px 8px',
              letterSpacing: '-0.01em',
            }}
          >
            {p}
          </span>
        ))}
      </div>

      {/* CTA do card */}
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: accent,
          letterSpacing: '-0.01em',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        Ver linha →
      </span>
    </Link>
  );
}
