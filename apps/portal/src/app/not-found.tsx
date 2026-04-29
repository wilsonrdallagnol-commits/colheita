// apps/portal/src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--colheita-surface-background)',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontSize: '0.75rem',
          fontWeight: '600',
          color: 'var(--colheita-brand-primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '16px',
        }}
      >
        404
      </p>
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'var(--colheita-text-primary)',
          letterSpacing: '-0.02em',
          marginBottom: '8px',
        }}
      >
        Página não encontrada
      </h1>
      <p
        style={{
          fontSize: '0.9375rem',
          color: 'var(--colheita-text-secondary)',
          marginBottom: '32px',
        }}
      >
        O produto ou página que você buscou não existe ou foi removido.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: 'var(--colheita-brand-primary)',
          textDecoration: 'none',
        }}
      >
        ← Voltar ao catálogo
      </Link>
    </div>
  );
}
