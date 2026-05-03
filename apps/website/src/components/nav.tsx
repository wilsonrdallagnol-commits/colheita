// apps/website/src/components/nav.tsx
import Image from 'next/image';
import Link from 'next/link';

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
        padding: '0 64px',
        height: '64px',
        backgroundColor: 'rgba(8, 14, 10, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          height: '40px',
        }}
      >
        <Image
          src="/argho-logo-white.png"
          alt="Argho Agrosciences"
          width={148}
          height={40}
          style={{ objectFit: 'contain', objectPosition: 'left center' }}
          priority
        />
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {[
          { href: '/produtos', label: 'Portfólio' },
          { href: '/sobre', label: 'Sobre' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              fontWeight: 400,
              color: 'oklch(0.62 0.022 148)',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              padding: '6px 14px',
              borderRadius: '6px',
            }}
          >
            {label}
          </Link>
        ))}

        {/* Separator */}
        <div
          aria-hidden
          style={{
            width: '1px',
            height: '20px',
            backgroundColor: 'oklch(0.22 0.025 148)',
            margin: '0 8px',
          }}
        />

        {/* Plataforma — gold accent */}
        <Link
          href="https://colheita.app.br"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'oklch(0.73 0.135 78)',
            textDecoration: 'none',
            padding: '6px 14px',
            borderRadius: '6px',
            border: '1px solid oklch(0.73 0.135 78 / 0.30)',
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'oklch(0.73 0.135 78)',
            }}
          />
          Plataforma
        </Link>

        {/* CTA */}
        <Link
          href="/produtos"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'oklch(0.08 0 0)',
            backgroundColor: 'oklch(0.73 0.135 78)',
            textDecoration: 'none',
            padding: '7px 18px',
            borderRadius: '6px',
            letterSpacing: '-0.01em',
            marginLeft: '4px',
          }}
        >
          Ver catálogo
        </Link>
      </div>
    </nav>
  );
}
