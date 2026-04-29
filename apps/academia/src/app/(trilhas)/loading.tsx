// apps/academia/src/app/(trilhas)/loading.tsx
export default function TrilhasLoading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
      {/* Hero skeleton */}
      <div style={{ marginBottom: '56px', maxWidth: '640px' }}>
        <div
          style={{
            height: '40px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-md)',
            marginBottom: '12px',
            width: '60%',
          }}
        />
        <div
          style={{
            height: '20px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-md)',
            width: '80%',
          }}
        />
      </div>

      {/* Cards skeleton */}
      {[0, 1].map((section) => (
        <div key={section} style={{ marginBottom: '48px' }}>
          <div
            style={{
              height: '12px',
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: 'var(--colheita-radius-sm)',
              width: '100px',
              marginBottom: '20px',
            }}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
            }}
          >
            {[0, 1, 2].map((card) => (
              <div
                key={card}
                style={{
                  height: '120px',
                  backgroundColor: 'var(--colheita-surface-card)',
                  borderRadius: 'var(--colheita-radius-lg)',
                  border: '1px solid var(--colheita-border-subtle)',
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
