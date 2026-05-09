// apps/admin/src/app/(dashboard)/distribuidores/loading.tsx
export default function DistribuidoresLoading() {
  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '1100px' }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            height: '28px',
            width: '200px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            marginBottom: '8px',
          }}
        />
        <div
          style={{
            height: '16px',
            width: '160px',
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
              width: k === 'a' ? '240px' : k === 'b' ? '160px' : '80px',
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
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 100px 1.5fr 1fr',
            gap: '16px',
            padding: '10px 16px',
            borderBottom: '1px solid var(--colheita-border)',
            backgroundColor: 'var(--colheita-surface-elevated)',
          }}
        >
          {(['E-mail', 'Nome', 'Status', 'Último acesso', 'Cadastrado'] as const).map((col) => (
            <div
              key={col}
              style={{
                height: '12px',
                width: '80px',
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-sunken)',
              }}
            />
          ))}
        </div>

        {/* Data rows skeleton */}
        {(['r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7'] as const).map((k, i) => (
          <div
            key={k}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 100px 1.5fr 1fr',
              gap: '16px',
              padding: '14px 16px',
              borderBottom: k !== 'r7' ? '1px solid var(--colheita-border-subtle)' : 'none',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                height: '13px',
                width: `${150 + (i % 3) * 30}px`,
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-elevated)',
              }}
            />
            <div
              style={{
                height: '13px',
                width: `${80 + (i % 4) * 20}px`,
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-elevated)',
              }}
            />
            <div
              style={{
                height: '22px',
                width: '64px',
                borderRadius: '999px',
                backgroundColor: 'var(--colheita-surface-elevated)',
              }}
            />
            <div
              style={{
                height: '13px',
                width: '110px',
                borderRadius: 'var(--colheita-radius-sm)',
                backgroundColor: 'var(--colheita-surface-elevated)',
              }}
            />
            <div
              style={{
                height: '13px',
                width: '80px',
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
