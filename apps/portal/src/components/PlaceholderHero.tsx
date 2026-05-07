// apps/portal/src/components/PlaceholderHero.tsx
// Mostrado quando NEXT_PUBLIC_SUPABASE_URL nao aponta para Supabase de producao
// (ainda esta com placeholder ou apontando para local). Apresenta a marca Argho
// com mensagem "em breve" — evita pagina de erro quando o portal esta deployado
// mas o banco prod ainda nao foi conectado.
import Link from 'next/link';

export function PlaceholderHero() {
  return (
    <section
      style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 32px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
      }}
    >
      <div style={{ maxWidth: 720, textAlign: 'center' }}>
        <p className="argho-eyebrow" style={{ marginBottom: 24 }}>
          Plataforma Colheita · Em construção
        </p>
        <h1
          className="argho-display"
          style={{
            fontSize: 'clamp(2.25rem, 4vw + 1rem, 3.25rem)',
            color: 'var(--colheita-text-primary)',
            marginBottom: 24,
          }}
        >
          Catálogo digital <span style={{ color: 'var(--colheita-brand-secondary)' }}>chega</span>{' '}
          <span style={{ color: 'var(--colheita-brand-primary)' }}>em breve</span>.
        </h1>
        <p
          style={{
            fontSize: '1.0625rem',
            color: 'var(--colheita-text-secondary)',
            lineHeight: 1.6,
            maxWidth: 520,
            margin: '0 auto 36px',
          }}
        >
          Estamos finalizando a integração com nosso PIM e ERP para entregar ficha técnica,
          indicações por cultura e dados regulatórios de cada produto Argho em um único lugar.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="https://arghoagrosciences.com/produtos"
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
            Ver portfólio Argho →
          </Link>
          <Link
            href="https://arghoagrosciences.com"
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
            Site institucional
          </Link>
        </div>
      </div>
    </section>
  );
}
