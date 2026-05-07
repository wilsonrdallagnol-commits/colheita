// apps/portal/src/app/(public)/sobre/page.tsx
// Pagina estatica "Sobre" — independente de Supabase, sempre disponivel.
import Link from 'next/link';

export const metadata = {
  title: 'Sobre',
  description:
    'A Plataforma Colheita é o catálogo digital da Argho Agrosciences — ficha técnica, indicações por cultura e dados regulatórios MAPA dos produtos Argho em um único lugar.',
};

export default function SobrePage() {
  return (
    <>
      {/* Hero */}
      <section
        style={{
          borderBottom: '1px solid #f3f4f6',
          background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 32px 56px' }}>
          <p className="argho-eyebrow" style={{ marginBottom: 16 }}>
            Plataforma Colheita · Sobre
          </p>
          <h1
            className="argho-display"
            style={{
              fontSize: 'clamp(2.25rem, 4vw + 1rem, 3.25rem)',
              maxWidth: 880,
              marginBottom: 20,
              color: 'var(--colheita-text-primary)',
            }}
          >
            O catálogo <span style={{ color: 'var(--colheita-brand-secondary)' }}>vivo</span>{' '}
            <span style={{ color: 'var(--colheita-brand-primary)' }}>e técnico</span> dos produtos
            Argho.
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--colheita-text-secondary)',
              lineHeight: 1.6,
              maxWidth: 720,
            }}
          >
            A Plataforma Colheita reúne ficha técnica completa, indicações por cultura e dados de
            registro MAPA dos fertilizantes, biológicos e adjuvantes Argho — pra que distribuidores,
            consultores e clientes encontrem rapidamente a solução certa pra cada lavoura.
          </p>
        </div>
      </section>

      {/* Pilares */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 32px 32px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          <Pilar
            eyebrow="Catálogo digital"
            titulo="Portfólio completo Argho"
            descricao="Fertilizantes minerais, organominerais, biológicos e adjuvantes — todos os produtos vigentes com nome comercial, formulação, embalagem e disponibilidade em estoque."
          />
          <Pilar
            eyebrow="Ficha técnica"
            titulo="Composição garantida e indicações"
            descricao="Garantias minerais, modo de ação agronômico, indicações por cultura e estádio fenológico, doses recomendadas e observações de manejo."
          />
          <Pilar
            eyebrow="Regulatório"
            titulo="Registro MAPA e conformidade"
            descricao="Número de registro MAPA, classe e categoria do produto conforme Decreto 4.954/2004 e Instruções Normativas SDA. Tudo auditável e atualizado."
          />
        </div>
      </section>

      {/* Para quem */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px 64px' }}>
        <h2
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--colheita-brand-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 24,
              height: 2,
              background: 'var(--colheita-brand-secondary)',
            }}
          />
          Para quem é
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          <ParaQuem
            titulo="Distribuidores"
            descricao="Acesso rápido a ficha técnica oficial, dados regulatórios e disponibilidade pra apresentar e fechar venda em campo."
          />
          <ParaQuem
            titulo="Consultores agronômicos"
            descricao="Referência confiável pra recomendação técnica — cultura, estádio, dose e modo de aplicação documentados."
          />
          <ParaQuem
            titulo="Clientes finais"
            descricao="Catálogo público pra conhecer o portfólio Argho antes de falar com um distribuidor ou consultor da rede."
          />
          <ParaQuem
            titulo="Equipe Argho"
            descricao="Fonte única de verdade do portfólio — sem PDFs desatualizados circulando por email ou WhatsApp."
          />
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)',
          borderTop: '1px solid #f3f4f6',
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '64px 32px',
            textAlign: 'center',
          }}
        >
          <h2
            className="argho-display"
            style={{
              fontSize: 'clamp(1.75rem, 2.5vw + 1rem, 2.5rem)',
              color: 'var(--colheita-text-primary)',
              marginBottom: 16,
            }}
          >
            Comece pelo catálogo.
          </h2>
          <p
            style={{
              fontSize: '1.0625rem',
              color: 'var(--colheita-text-secondary)',
              lineHeight: 1.6,
              maxWidth: 520,
              margin: '0 auto 32px',
            }}
          >
            Distribuidores autenticados têm acesso ao download de ficha técnica em PDF e à
            disponibilidade de estoque por depósito.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '12px 24px',
                borderRadius: 8,
                background: 'var(--colheita-brand-primary)',
                color: '#fff',
                fontSize: '0.9375rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Ver catálogo →
            </Link>
            <Link
              href="/entrar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '12px 24px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: '#fff',
                color: 'var(--colheita-text-primary)',
                fontSize: '0.9375rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Acesso de distribuidor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function Pilar({
  eyebrow,
  titulo,
  descricao,
}: {
  eyebrow: string;
  titulo: string;
  descricao: string;
}) {
  return (
    <div
      style={{
        padding: '24px 24px 28px',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        background: '#fff',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}
    >
      <p
        style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          color: 'var(--colheita-brand-primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.10em',
          marginBottom: 10,
        }}
      >
        {eyebrow}
      </p>
      <h3
        style={{
          fontSize: '1.0625rem',
          fontWeight: 700,
          color: 'var(--colheita-text-primary)',
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}
      >
        {titulo}
      </h3>
      <p
        style={{ fontSize: '0.9375rem', color: 'var(--colheita-text-secondary)', lineHeight: 1.6 }}
      >
        {descricao}
      </p>
    </div>
  );
}

function ParaQuem({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div
      style={{
        padding: '20px 22px',
        borderRadius: 10,
        background: 'var(--colheita-surface-muted)',
        borderLeft: '3px solid #489030',
      }}
    >
      <p
        style={{
          fontSize: '0.9375rem',
          fontWeight: 700,
          color: 'var(--colheita-text-primary)',
          marginBottom: 6,
        }}
      >
        {titulo}
      </p>
      <p
        style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)', lineHeight: 1.55 }}
      >
        {descricao}
      </p>
    </div>
  );
}
