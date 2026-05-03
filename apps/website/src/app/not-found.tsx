// apps/website/src/app/not-found.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Página não encontrada',
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, oklch(0.58 0.165 148 / 0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* 404 number */}
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'oklch(0.73 0.135 78)',
          marginBottom: '16px',
        }}
      >
        Erro 404
      </p>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: 700,
          letterSpacing: '-0.045em',
          lineHeight: 1.0,
          color: 'oklch(0.96 0.004 148)',
          marginBottom: '8px',
        }}
      >
        Página não
      </h1>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: 700,
          letterSpacing: '-0.045em',
          lineHeight: 1.0,
          color: 'oklch(0.58 0.165 148)',
          marginBottom: '32px',
        }}
      >
        encontrada.
      </h1>

      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '1.0625rem',
          color: 'oklch(0.52 0.018 148)',
          lineHeight: 1.6,
          maxWidth: '400px',
          marginBottom: '48px',
        }}
      >
        Esse produto ou página não existe no portfólio atual. Explore o catálogo completo.
      </p>

      <div style={{ display: 'flex', gap: '16px' }}>
        <Link
          href="/produtos"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'oklch(0.10 0 0)',
            backgroundColor: 'oklch(0.73 0.135 78)',
            textDecoration: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            letterSpacing: '-0.01em',
          }}
        >
          Ver portfólio →
        </Link>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.9375rem',
            fontWeight: 400,
            color: 'oklch(0.72 0.025 148)',
            backgroundColor: 'transparent',
            textDecoration: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            border: '1px solid oklch(0.22 0.025 148)',
            letterSpacing: '-0.01em',
          }}
        >
          Página inicial
        </Link>
      </div>
    </div>
  );
}
