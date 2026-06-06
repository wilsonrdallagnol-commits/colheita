// apps/website/src/components/nav.tsx
// Nav clara — wis.digital influence + Argho identity gold accent
import Image from 'next/image';
import Link from 'next/link';

import { FEATURES } from '@/lib/features';

export function Nav() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        height: '88px',
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo — proporção respeitosa, peso visual aumentado */}
      <Link
        href="/"
        style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          height: '52px',
          gap: '14px',
        }}
      >
        <Image
          src="/argho-logo-color.png"
          alt="Argho Agrosciences"
          className="nav-logo-img"
          width={196}
          height={52}
          style={{ objectFit: 'contain', objectPosition: 'left center' }}
          priority
        />
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {[
          { href: '/produtos', label: 'Portfólio' },
          { href: '/sobre', label: 'Sobre' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="nav-link-secondary"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              fontWeight: 400,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              letterSpacing: '-0.005em',
              padding: '8px 16px',
              borderRadius: '6px',
              transition: 'color 0.2s',
            }}
          >
            {label}
          </Link>
        ))}

        {/* Plataforma Colheita — gold ghost, subdomínio dedicado.
            Escondido via FEATURES.colheitaPlatform ate plataforma estar
            pronta para acesso publico (ver lib/features.ts). */}
        {FEATURES.colheitaPlatform && (
          <>
            {/* Separator */}
            <div
              aria-hidden
              style={{
                width: '1px',
                height: '20px',
                backgroundColor: 'var(--border)',
                margin: '0 12px',
              }}
            />
            <Link
              href="https://colheita.arghoagrosciences.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'var(--gold-deep)',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid oklch(0.66 0.130 78 / 0.30)',
                letterSpacing: '-0.005em',
                display: 'flex',
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
                  backgroundColor: 'var(--gold)',
                  boxShadow: '0 0 8px oklch(0.66 0.130 78 / 0.6)',
                }}
              />
              Plataforma
            </Link>
          </>
        )}

        {/* CTA primary — azul Argho */}
        <Link
          href="/produtos"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: 'var(--argho-blue)',
            textDecoration: 'none',
            padding: '9px 20px',
            borderRadius: '6px',
            letterSpacing: '-0.005em',
            marginLeft: '6px',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 12px -4px oklch(0.362 0.160 266.7 / 0.4)',
          }}
        >
          Ver catálogo
        </Link>
      </div>
    </nav>
  );
}
