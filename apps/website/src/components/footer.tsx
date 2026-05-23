// apps/website/src/components/footer.tsx
// Footer claro — alinhado com aesthetic wis.digital + identidade Argho
import Image from 'next/image';
import Link from 'next/link';

import { FEATURES } from '@/lib/features';

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '64px 48px 36px',
        backgroundColor: 'var(--bg-soft)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr',
          gap: '64px',
          marginBottom: '56px',
        }}
      >
        {/* Brand */}
        <div>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '24px' }}>
            <Image
              src="/argho-logo-color.png"
              alt="Argho Agrosciences"
              width={180}
              height={48}
              style={{ objectFit: 'contain', objectPosition: 'left center' }}
            />
          </Link>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.0625rem',
              color: 'var(--text-primary)',
              lineHeight: 1.45,
              letterSpacing: '-0.02em',
              marginTop: '4px',
              maxWidth: '320px',
            }}
          >
            Tecnologia viva
            <br />
            para o agro brasileiro.
          </p>
          <p
            className="mono"
            style={{
              color: 'var(--text-tertiary)',
              marginTop: '24px',
              fontSize: '0.6875rem',
              letterSpacing: '0.04em',
            }}
          >
            CNPJ 00.000.000/0001-00
          </p>
        </div>

        {/* Portfólio */}
        <div>
          <p className="label" style={{ marginBottom: '18px' }}>
            Portfólio
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  letterSpacing: '-0.005em',
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Empresa */}
        <div>
          <p className="label" style={{ marginBottom: '18px' }}>
            Empresa
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { href: '/sobre', label: 'Sobre a Argho' },
              { href: '/sobre#valores', label: 'Valores' },
              { href: '/sobre#expertise', label: 'Nossa expertise' },
              // Plataforma Colheita escondida via FEATURES.colheitaPlatform
              ...(FEATURES.colheitaPlatform
                ? [
                    {
                      href: 'https://colheita.arghoagrosciences.com',
                      label: 'Plataforma Colheita ↗',
                      external: true,
                    },
                  ]
                : []),
            ].map(({ href, label, external }) => (
              <Link
                key={href}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: external ? 'var(--gold-deep)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  letterSpacing: '-0.005em',
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          <div style={{ marginTop: '28px' }}>
            <p className="label" style={{ marginBottom: '8px' }}>
              Regulatório
            </p>
            <p
              className="mono"
              style={{
                color: 'var(--text-tertiary)',
                fontSize: '0.75rem',
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
          maxWidth: '1280px',
          margin: '0 auto',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
          }}
        >
          © 2026 Argho Agrosciences. Todos os direitos reservados.
        </p>
        <p
          className="mono"
          style={{
            color: 'var(--text-tertiary)',
            fontSize: '0.6875rem',
            letterSpacing: '0.08em',
          }}
        >
          ORIGEM EUROPEIA · REGISTRO MAPA
        </p>
      </div>
    </footer>
  );
}
