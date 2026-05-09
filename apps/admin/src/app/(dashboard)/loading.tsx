// apps/admin/src/app/(dashboard)/loading.tsx
export default function DashboardLoading() {
  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '860px' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div
          style={{
            height: '28px',
            width: '160px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-md)',
            marginBottom: '8px',
          }}
        />
        <div
          style={{
            height: '14px',
            width: '260px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-sm)',
          }}
        />
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
        }}
      >
        {([0, 1, 2, 3, 4, 5, 6, 7] as const).map((n) => (
          <div
            key={n}
            style={{
              height: '88px',
              borderRadius: 'var(--colheita-radius-lg)',
              border: '1px solid var(--colheita-border-subtle)',
              backgroundColor: 'var(--colheita-surface-card)',
            }}
          />
        ))}
      </div>

      {/* Recent activity label */}
      <div
        style={{
          height: '12px',
          width: '180px',
          backgroundColor: 'var(--colheita-surface-card)',
          borderRadius: 'var(--colheita-radius-sm)',
          marginBottom: '12px',
        }}
      />

      {/* Recent activity list */}
      <div
        style={{
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
          overflow: 'hidden',
        }}
      >
        {([0, 1, 2, 3, 4] as const).map((n) => (
          <div
            key={n}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: n < 4 ? '1px solid var(--colheita-border-subtle)' : 'none',
              backgroundColor: 'var(--colheita-surface-elevated)',
            }}
          >
            <div
              style={{
                height: '15px',
                width: `${160 + n * 20}px`,
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-sm)',
              }}
            />
            <div
              style={{
                height: '12px',
                width: '72px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-sm)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
