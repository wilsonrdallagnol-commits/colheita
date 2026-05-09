// apps/admin/src/app/(dashboard)/auditoria/loading.tsx
export default function AuditoriaLoading() {
  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '1200px' }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            height: '28px',
            width: '220px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            marginBottom: '8px',
          }}
        />
        <div
          style={{
            height: '16px',
            width: '140px',
            borderRadius: 'var(--colheita-radius-sm)',
            backgroundColor: 'var(--colheita-surface-elevated)',
          }}
        />
      </div>

      {/* Filter skeleton */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {(['a', 'b', 'c'] as const).map((k) => (
          <div
            key={k}
            style={{
              height: '36px',
              width: k === 'a' ? '200px' : k === 'b' ? '160px' : '80px',
              borderRadius: 'var(--colheita-radius-md)',
              backgroundColor: 'var(--colheita-surface-elevated)',
            }}
          />
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
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            padding: '10px 16px',
            borderBottom: '1px solid var(--colheita-border)',
            backgroundColor: 'var(--colheita-surface-elevated)',
          }}
        >
          {(['Data/Hora', 'Ação', 'Recurso', 'ID', 'Ator'] as const).map((col) => (
            <div
              key={col}
              style={{
                height: '14px',
                width:
                  col === 'Data/Hora'
                    ? '120px'
                    : col === 'Ação'
                      ? '80px'
                      : col === 'Recurso'
                        ? '60px'
                        : '80px',
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-sunken)',
              }}
            />
          ))}
        </div>

        {/* Data rows skeleton */}
        {(['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10'] as const).map((k) => (
          <div
            key={k}
            style={{
              display: 'flex',
              gap: '16px',
              padding: '10px 16px',
              borderBottom: '1px solid var(--colheita-border-subtle)',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                height: '12px',
                width: '130px',
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-elevated)',
              }}
            />
            <div
              style={{
                height: '12px',
                width: '90px',
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-elevated)',
              }}
            />
            <div
              style={{
                height: '20px',
                width: '70px',
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-elevated)',
              }}
            />
            <div
              style={{
                height: '12px',
                width: '70px',
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-elevated)',
              }}
            />
            <div
              style={{
                height: '12px',
                width: '70px',
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-elevated)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
