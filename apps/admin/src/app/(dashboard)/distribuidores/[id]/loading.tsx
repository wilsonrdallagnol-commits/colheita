// apps/admin/src/app/(dashboard)/distribuidores/[id]/loading.tsx
export default function DistribuidorDetailLoading() {
  const skeletonBg = 'var(--colheita-surface-card)';
  const borderSubtle = '1px solid var(--colheita-border-subtle)';

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '860px' }}>
      {/* Breadcrumb skeleton */}
      <div
        style={{
          height: '16px',
          width: '280px',
          backgroundColor: skeletonBg,
          borderRadius: '4px',
          marginBottom: '32px',
        }}
      />

      {/* Header card skeleton */}
      <div
        style={{
          border: borderSubtle,
          borderRadius: 'var(--colheita-radius-lg)',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Avatar */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: skeletonBg,
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                height: '20px',
                width: '200px',
                backgroundColor: skeletonBg,
                borderRadius: '4px',
                marginBottom: '8px',
              }}
            />
            <div
              style={{
                height: '14px',
                width: '140px',
                backgroundColor: skeletonBg,
                borderRadius: '4px',
              }}
            />
          </div>
        </div>
        {/* Status badge skeleton */}
        <div
          style={{
            height: '28px',
            width: '80px',
            backgroundColor: skeletonBg,
            borderRadius: '100px',
          }}
        />
      </div>

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Certificações */}
        <div
          style={{
            border: borderSubtle,
            borderRadius: 'var(--colheita-radius-lg)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: borderSubtle,
              height: '18px',
              width: '120px',
              backgroundColor: skeletonBg,
              borderRadius: '4px',
              margin: '16px 20px',
            }}
          />
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                padding: '14px 20px',
                borderBottom: n < 3 ? borderSubtle : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  height: '13px',
                  width: '160px',
                  backgroundColor: skeletonBg,
                  borderRadius: '4px',
                }}
              />
              <div
                style={{
                  height: '20px',
                  width: '60px',
                  backgroundColor: skeletonBg,
                  borderRadius: '100px',
                }}
              />
            </div>
          ))}
        </div>

        {/* Atividade recente */}
        <div
          style={{
            border: borderSubtle,
            borderRadius: 'var(--colheita-radius-lg)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: borderSubtle,
              height: '18px',
              width: '140px',
              backgroundColor: skeletonBg,
              borderRadius: '4px',
              margin: '16px 20px',
            }}
          />
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              style={{
                padding: '12px 20px',
                borderBottom: n < 5 ? borderSubtle : 'none',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: skeletonBg,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: '13px',
                    width: `${100 + n * 20}px`,
                    backgroundColor: skeletonBg,
                    borderRadius: '4px',
                    marginBottom: '4px',
                  }}
                />
                <div
                  style={{
                    height: '11px',
                    width: '80px',
                    backgroundColor: skeletonBg,
                    borderRadius: '4px',
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
