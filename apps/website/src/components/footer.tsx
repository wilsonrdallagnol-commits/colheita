// apps/website/src/components/footer.tsx
import Link from 'next/link';

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '48px 48px 40px',
        backgroundColor: 'oklch(0.06 0.016 148)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '48px',
          marginBottom: '40px',
        }}
      >
        {/* Brand */}
        <div>
          <p
            style={{
              fontFamily: '"Geist", "Inter", system-ui, sans-serif',
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'oklch(0.96 0.004 148)',
              marginBottom: '4px',
            }}
          >
            ARGHO AGROSCIENCES
          </p>
          <p
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: '0.8125rem',
              color: 'oklch(0.52 0.018 148)',
              lineHeight: 1.6,
              marginTop: '12px',
            }}
          >
            Nutrição de precisão para a
            <br />
            agricultura brasileira.
          </p>
          <p
            style={{
              fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
              fontSize: '0.6875rem',
              color: 'oklch(0.40 0.015 148)',
              marginTop: '16px',
              letterSpacing: '0.02em',
            }}
          >
            CNPJ 00.000.000/0001-00
          </p>
        </div>

        {/* Portfólio */}
        <div>
          <p
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'oklch(0.52 0.018 148)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}
          >
            Portfólio
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                href: '/produtos?categoria=fertilizantes-minerais',
                label: 'Fertilizantes Minerais',
              },
              { href: '/produtos?categoria=organominerais', label: 'Organominerais' },
              { href: '/produtos?categoria=biologicos', label: 'Biológicos' },
              { href: '/produtos?categoria=adjuvantes', label: 'Adjuvantes' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: '0.875rem',
                  color: 'oklch(0.62 0.022 148)',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Empresa */}
        <div>
          <p
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'oklch(0.52 0.018 148)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}
          >
            Empresa
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { href: '/sobre', label: 'Sobre a Argho' },
              { href: '/sobre#valores', label: 'Valores' },
              { href: '/sobre#expertise', label: 'Nossa expertise' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: '0.875rem',
                  color: 'oklch(0.62 0.022 148)',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          <div style={{ marginTop: '24px' }}>
            <p
              style={{
                fontFamily: '"Inter", system-ui, sans-serif',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'oklch(0.52 0.018 148)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '8px',
              }}
            >
              Regulatório
            </p>
            <p
              style={{
                fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
                fontSize: '0.75rem',
                color: 'oklch(0.45 0.014 148)',
                lineHeight: 1.6,
              }}
            >
              Produtos registrados
              <br />
              pelo MAPA — Brasil
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <p
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: '0.75rem',
            color: 'oklch(0.40 0.012 148)',
          }}
        >
          © 2026 Argho Agrosciences. Todos os direitos reservados.
        </p>
        <p
          style={{
            fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
            fontSize: '0.6875rem',
            color: 'oklch(0.35 0.010 148)',
            letterSpacing: '0.04em',
          }}
        >
          ORIGEM EUROPEIA · REGISTRO MAPA
        </p>
      </div>
    </footer>
  );
}
