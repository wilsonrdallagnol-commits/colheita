// apps/portal/src/components/Footer.tsx
// Footer da Plataforma Colheita.

import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        marginTop: 96,
        borderTop: '1px solid #e5e7eb',
        background: '#f9fafb',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '48px 32px 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 32,
        }}
      >
        <div>
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#183090',
              marginBottom: 12,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 28,
                height: 2,
                background: '#489030',
                marginRight: 12,
                verticalAlign: 'middle',
              }}
            />
            Plataforma Colheita
          </p>
          <p
            style={{
              fontSize: '0.9375rem',
              color: '#4b5563',
              lineHeight: 1.6,
              maxWidth: 320,
            }}
          >
            Catálogo digital de fertilizantes, biológicos e adjuvantes Argho. Acesso para
            distribuidores, consultores agronômicos e clientes.
          </p>
        </div>

        <div>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#0a0a0a',
              marginBottom: 12,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Plataforma
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            <li>
              <Link href="/" style={linkStyle}>
                Catálogo de produtos
              </Link>
            </li>
            <li>
              <Link href="/entrar" style={linkStyle}>
                Acesso de distribuidor
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#0a0a0a',
              marginBottom: 12,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Argho
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            <li>
              <a href="https://arghoagrosciences.com" style={linkStyle}>
                Site institucional
              </a>
            </li>
            <li>
              <a href="https://arghoagrosciences.com/produtos" style={linkStyle}>
                Portfólio completo
              </a>
            </li>
            <li>
              <a href="https://arghoagrosciences.com/sobre" style={linkStyle}>
                Quem somos
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#0a0a0a',
              marginBottom: 12,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Contato
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            <li>
              <a href="mailto:contato@arghoagrosciences.com" style={linkStyle}>
                contato@arghoagrosciences.com
              </a>
            </li>
            <li style={{ fontSize: '0.875rem', color: '#4b5563' }}>Toledo · Paraná · Brasil</li>
          </ul>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid #e5e7eb',
          padding: '20px 32px',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#6b7280',
        }}
      >
        © {year} Argho Agrosciences. Plataforma Colheita — todos os direitos reservados.
      </div>
    </footer>
  );
}

const linkStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#4b5563',
  textDecoration: 'none',
  transition: 'color 150ms',
};
