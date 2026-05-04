// apps/admin/src/app/(dashboard)/pedidos/[id]/loading.tsx
export default function PedidoDetailLoading() {
  const skeletonBg = 'var(--colheita-surface-card)';
  const borderSubtle = '1px solid var(--colheita-border-subtle)';

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px' }}>
      {/* Back link skeleton */}
      <div
        style={{
          height: '14px',
          width: '80px',
          backgroundColor: skeletonBg,
          borderRadius: '4px',
          marginBottom: '28px',
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '32px',
          gap: '16px',
        }}
      >
        <div>
          {/* "Pedido Safra" label */}
          <div
            style={{
              height: '11px',
              width: '100px',
              backgroundColor: skeletonBg,
              borderRadius: '4px',
              marginBottom: '8px',
            }}
          />
          {/* Número do pedido */}
          <div
            style={{
              height: '32px',
              width: '200px',
              backgroundColor: skeletonBg,
              borderRadius: '6px',
              marginBottom: '8px',
            }}
          />
          <div
            style={{
              height: '13px',
              width: '160px',
              backgroundColor: skeletonBg,
              borderRadius: '4px',
            }}
          />
        </div>
        {/* Status badge */}
        <div
          style={{
            height: '32px',
            width: '110px',
            backgroundColor: skeletonBg,
            borderRadius: '100px',
          }}
        />
      </div>

      {/* Info cards row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {['a', 'b', 'c', 'd'].map((k) => (
          <div
            key={k}
            style={{
              border: borderSubtle,
              borderRadius: 'var(--colheita-radius-md)',
              padding: '16px',
            }}
          >
            <div
              style={{
                height: '11px',
                width: '70px',
                backgroundColor: skeletonBg,
                borderRadius: '4px',
                marginBottom: '8px',
              }}
            />
            <div
              style={{
                height: '16px',
                width: '110px',
                backgroundColor: skeletonBg,
                borderRadius: '4px',
              }}
            />
          </div>
        ))}
      </div>

      {/* Itens do pedido table */}
      <div
        style={{
          border: borderSubtle,
          borderRadius: 'var(--colheita-radius-lg)',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '12px',
            padding: '12px 20px',
            borderBottom: borderSubtle,
            backgroundColor: 'var(--colheita-surface-elevated)',
          }}
        >
          {['produto', 'qtd', 'unitario', 'total'].map((col) => (
            <div
              key={col}
              style={{
                height: '11px',
                width: col === 'produto' ? '80px' : '50px',
                backgroundColor: skeletonBg,
                borderRadius: '4px',
              }}
            />
          ))}
        </div>
        {/* Table rows */}
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: '12px',
              padding: '14px 20px',
              borderBottom: n < 3 ? borderSubtle : 'none',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  height: '14px',
                  width: `${120 + n * 30}px`,
                  backgroundColor: skeletonBg,
                  borderRadius: '4px',
                  marginBottom: '4px',
                }}
              />
              <div
                style={{
                  height: '11px',
                  width: '60px',
                  backgroundColor: skeletonBg,
                  borderRadius: '4px',
                }}
              />
            </div>
            <div
              style={{
                height: '13px',
                width: '30px',
                backgroundColor: skeletonBg,
                borderRadius: '4px',
              }}
            />
            <div
              style={{
                height: '13px',
                width: '70px',
                backgroundColor: skeletonBg,
                borderRadius: '4px',
              }}
            />
            <div
              style={{
                height: '13px',
                width: '80px',
                backgroundColor: skeletonBg,
                borderRadius: '4px',
              }}
            />
          </div>
        ))}
      </div>

      {/* Total row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div
          style={{
            height: '20px',
            width: '160px',
            backgroundColor: skeletonBg,
            borderRadius: '4px',
          }}
        />
      </div>
    </div>
  );
}
