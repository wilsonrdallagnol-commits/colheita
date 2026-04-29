// apps/portal/src/app/(conta)/loading.tsx
export default function ContaLoading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '40px',
        }}
      >
        <div>
          <div
            style={{
              height: '32px',
              width: '180px',
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: 'var(--colheita-radius-md)',
              marginBottom: '8px',
            }}
          />
          <div
            style={{
              height: '16px',
              width: '200px',
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: 'var(--colheita-radius-sm)',
            }}
          />
        </div>
        <div
          style={{
            height: '36px',
            width: '64px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-md)',
          }}
        />
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '40px',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: '80px',
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: 'var(--colheita-radius-lg)',
              border: '1px solid var(--colheita-border-subtle)',
            }}
          />
        ))}
      </div>

      {/* Two-column content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
        }}
      >
        {[0, 1].map((i) => (
          <div key={i}>
            <div
              style={{
                height: '12px',
                width: '120px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-sm)',
                marginBottom: '16px',
              }}
            />
            <div
              style={{
                height: '240px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-lg)',
                border: '1px solid var(--colheita-border-subtle)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
