// apps/admin/src/app/(dashboard)/categorias/loading.tsx
export default function CategoriasLoading() {
  return (
    <div style={{ padding: '32px' }}>
      {/* Breadcrumb skeleton */}
      <div
        style={{
          height: '14px',
          width: '200px',
          backgroundColor: 'var(--colheita-surface-card)',
          borderRadius: 'var(--colheita-radius-sm)',
          marginBottom: '24px',
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px',
          gap: '16px',
        }}
      >
        <div>
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
              width: '180px',
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: 'var(--colheita-radius-sm)',
            }}
          />
        </div>
        <div
          style={{
            height: '32px',
            width: '140px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-md)',
          }}
        />
      </div>

      {/* List skeleton */}
      <div
        style={{
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
          overflow: 'hidden',
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: i < 3 ? '1px solid var(--colheita-border-subtle)' : 'none',
              backgroundColor: 'var(--colheita-surface-elevated)',
              gap: '16px',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: '16px',
                  width: `${140 + i * 24}px`,
                  backgroundColor: 'var(--colheita-surface-card)',
                  borderRadius: 'var(--colheita-radius-sm)',
                  marginBottom: '6px',
                }}
              />
              <div
                style={{
                  height: '12px',
                  width: `${200 + i * 16}px`,
                  backgroundColor: 'var(--colheita-surface-card)',
                  borderRadius: 'var(--colheita-radius-sm)',
                }}
              />
            </div>
            <div
              style={{
                height: '28px',
                width: '72px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-md)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
