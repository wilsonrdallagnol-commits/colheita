// apps/admin/src/app/(dashboard)/compliance/loading.tsx
export default function ComplianceLoading() {
  const rows = ['r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9'] as const;

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            height: '26px',
            width: '260px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'var(--colheita-surface-sunken)',
            marginBottom: '8px',
          }}
        />
        <div
          style={{
            height: '14px',
            width: '340px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'var(--colheita-surface-sunken)',
          }}
        />
      </div>

      {/* Summary cards skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}
      >
        {(['c0', 'c1', 'c2', 'c3'] as const).map((k) => (
          <div
            key={k}
            style={{
              padding: '16px',
              borderRadius: 'var(--colheita-radius-lg)',
              border: '1px solid var(--colheita-border)',
              backgroundColor: 'var(--colheita-surface-elevated)',
            }}
          >
            <div
              style={{
                height: '10px',
                width: '70px',
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-sunken)',
                marginBottom: '10px',
              }}
            />
            <div
              style={{
                height: '28px',
                width: '40px',
                borderRadius: 'var(--colheita-radius-md)',
                backgroundColor: 'var(--colheita-surface-sunken)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div
        style={{
          borderRadius: 'var(--colheita-radius-lg)',
          border: '1px solid var(--colheita-border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--colheita-border)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            display: 'flex',
            gap: '40px',
          }}
        >
          {(['h0', 'h1', 'h2', 'h3', 'h4', 'h5'] as const).map((k) => (
            <div
              key={k}
              style={{
                height: '10px',
                width: k === 'h0' ? '120px' : k === 'h2' ? '100px' : '60px',
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-sunken)',
              }}
            />
          ))}
        </div>
        {rows.map((k, i) => (
          <div
            key={k}
            style={{
              padding: '14px 16px',
              borderBottom: k !== 'r9' ? '1px solid var(--colheita-border-subtle)' : 'none',
              display: 'flex',
              gap: '40px',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                height: '13px',
                width: `${100 + (i % 4) * 20}px`,
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-sunken)',
              }}
            />
            <div
              style={{
                height: '20px',
                width: '56px',
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-sunken)',
              }}
            />
            <div
              style={{
                height: '13px',
                width: '90px',
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-sunken)',
              }}
            />
            <div
              style={{
                height: '13px',
                width: '70px',
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-sunken)',
              }}
            />
            <div
              style={{
                height: '13px',
                width: '70px',
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-sunken)',
              }}
            />
            <div
              style={{
                height: '22px',
                width: '58px',
                borderRadius: '999px',
                backgroundColor: 'var(--colheita-surface-sunken)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
