// apps/website/src/components/nav.tsx
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
        padding: '0 48px',
        height: '64px',
        backgroundColor: 'rgba(8, 14, 10, 0.80)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontFamily: '"Geist", "Inter", system-ui, sans-serif',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'oklch(0.96 0.004 148)',
          }}
        >
          ARGHO
        </span>
        <span
          style={{
            fontFamily: '"Geist", "Inter", system-ui, sans-serif',
            fontSize: '0.625rem',
            fontWeight: 500,
            letterSpacing: '0.14em',
            color: 'oklch(0.52 0.018 148)',
            textTransform: 'uppercase',
          }}
        >
          AGROSCIENCES
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {[
          { href: '/produtos', label: 'Portfólio' },
          { href: '/sobre', label: 'Sobre' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: '0.875rem',
              fontWeight: 400,
              color: 'oklch(0.72 0.025 148)',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              transition: 'color 0.15s',
            }}
          >
            {label}
          </Link>
        ))}

        <Link
          href="/produtos"
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'oklch(0.10 0 0)',
            backgroundColor: 'oklch(0.73 0.135 78)',
            textDecoration: 'none',
            padding: '7px 16px',
            borderRadius: '6px',
            letterSpacing: '-0.01em',
            transition: 'background-color 0.15s',
          }}
        >
          Ver catálogo
        </Link>
      </div>
    </nav>
  );
}
