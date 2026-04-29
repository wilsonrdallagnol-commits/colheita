// apps/academia/src/app/(trilhas)/trilhas/[slug]/loading.tsx
export default function TrilhaDetailLoading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
      {/* Back link skeleton */}
      <div
        style={{
          height: '16px',
          width: '120px',
          backgroundColor: 'var(--colheita-surface-card)',
          borderRadius: 'var(--colheita-radius-sm)',
          marginBottom: '32px',
        }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '48px' }}>
        <div>
          {/* Header skeleton */}
          <div style={{ marginBottom: '40px' }}>
            <div
              style={{
                height: '12px',
                width: '80px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-sm)',
                marginBottom: '10px',
              }}
            />
            <div
              style={{
                height: '40px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-md)',
                marginBottom: '12px',
                width: '70%',
              }}
            />
            <div
              style={{
                height: '64px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-md)',
              }}
            />
          </div>

          {/* Modules skeleton */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: '80px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-lg)',
                marginBottom: '12px',
                border: '1px solid var(--colheita-border-subtle)',
              }}
            />
          ))}
        </div>

        {/* Sidebar skeleton */}
        <div
          style={{
            height: '280px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-lg)',
            border: '1px solid var(--colheita-border-subtle)',
          }}
        />
      </div>
    </div>
  );
}
