// apps/portal/src/app/(conta)/conta/academia/loading.tsx
//
// Skeleton matching /conta/academia (trilhas + certificacoes).

export default function AcademiaLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--colheita-surface-background)',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div
          style={{
            height: '12px',
            width: '120px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-sm)',
            marginBottom: '20px',
          }}
        />

        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              height: '12px',
              width: '160px',
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: 'var(--colheita-radius-sm)',
              marginBottom: '12px',
            }}
          />
          <div
            style={{
              height: '32px',
              width: '320px',
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: 'var(--colheita-radius-md)',
              marginBottom: '12px',
            }}
          />
          <div
            style={{
              height: '14px',
              width: '85%',
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: 'var(--colheita-radius-sm)',
            }}
          />
        </div>

        {/* Trilhas placeholder */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={`track-${i}`}
              style={{
                padding: '20px 22px',
                backgroundColor: 'var(--colheita-surface-card)',
                border: '1px solid var(--colheita-border-subtle)',
                borderRadius: 'var(--colheita-radius-lg)',
                height: '92px',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
