// apps/portal/src/app/(public)/layout.tsx
import Link from 'next/link';
import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top navigation */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid var(--colheita-border-subtle)',
          backgroundColor: 'var(--colheita-surface-background)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 32px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--colheita-radius-md)',
                backgroundColor: 'var(--colheita-brand-primary)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: 'var(--colheita-text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Argho
            </span>
          </Link>

          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link
              href="/"
              style={{
                fontSize: '0.875rem',
                color: 'var(--colheita-text-secondary)',
                textDecoration: 'none',
              }}
            >
              Produtos
            </Link>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--colheita-border-subtle)',
          padding: '24px 32px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-tertiary)' }}>
            © {new Date().getFullYear()} Argho Agrosciences
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-tertiary)' }}>
            Fertilizantes · Biológicos · Adjuvantes
          </span>
        </div>
      </footer>
    </div>
  );
}
