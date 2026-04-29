// apps/academia/src/app/error.tsx
'use client';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
          color: 'var(--colheita-danger)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '16px',
        }}
      >
        Erro
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
        Algo deu errado
      </h1>
      <p
        style={{
          fontSize: '0.9375rem',
          color: 'var(--colheita-text-secondary)',
          marginBottom: '32px',
        }}
      >
        Ocorreu um erro inesperado. Tente novamente.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '8px 20px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'var(--colheita-brand-primary)',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Tentar novamente
        </button>
        <a
          href="/"
          style={{
            padding: '8px 20px',
            borderRadius: 'var(--colheita-radius-md)',
            color: 'var(--colheita-text-secondary)',
            fontSize: '0.875rem',
            fontWeight: '500',
            border: '1px solid var(--colheita-border)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Ver trilhas
        </a>
      </div>
    </div>
  );
}
