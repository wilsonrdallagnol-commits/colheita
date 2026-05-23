// apps/portal/src/app/(conta)/conta/pedidos/loading.tsx
//
// Skeleton matching /conta/pedidos layout pra perceived perf.
// Mostra header + filtros pills + 6 linhas placeholder.

export default function PedidosLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--colheita-surface-background)',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Back link */}
        <div
          style={{
            height: '12px',
            width: '120px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-sm)',
            marginBottom: '20px',
          }}
        />

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              height: '12px',
              width: '140px',
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: 'var(--colheita-radius-sm)',
              marginBottom: '12px',
            }}
          />
          <div
            style={{
              height: '32px',
              width: '220px',
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: 'var(--colheita-radius-md)',
              marginBottom: '10px',
            }}
          />
          <div
            style={{
              height: '14px',
              width: '60%',
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: 'var(--colheita-radius-sm)',
            }}
          />
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[60, 90, 90, 80, 80].map((w, i) => (
            <div
              key={i}
              style={{
                height: '28px',
                width: `${w}px`,
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: '99px',
              }}
            />
          ))}
        </div>

        {/* Lista */}
        <div
          style={{
            border: '1px solid var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            overflow: 'hidden',
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                borderBottom: i < 5 ? '1px solid var(--colheita-border-subtle)' : 'none',
                backgroundColor: 'var(--colheita-surface-elevated)',
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: '16px',
                    width: '140px',
                    backgroundColor: 'var(--colheita-surface-card)',
                    borderRadius: 'var(--colheita-radius-sm)',
                    marginBottom: '6px',
                  }}
                />
                <div
                  style={{
                    height: '11px',
                    width: '180px',
                    backgroundColor: 'var(--colheita-surface-card)',
                    borderRadius: 'var(--colheita-radius-sm)',
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    height: '16px',
                    width: '90px',
                    backgroundColor: 'var(--colheita-surface-card)',
                    borderRadius: 'var(--colheita-radius-sm)',
                  }}
                />
                <div
                  style={{
                    height: '22px',
                    width: '78px',
                    backgroundColor: 'var(--colheita-surface-card)',
                    borderRadius: '99px',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
