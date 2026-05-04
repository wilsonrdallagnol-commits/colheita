// apps/admin/src/app/(dashboard)/midias/[id]/loading.tsx
export default function AssetDetailLoading() {
  return (
    <div style={{ padding: '32px', maxWidth: '800px' }}>
      {/* Breadcrumb skeleton */}
      <div
        style={{
          height: '16px',
          width: '240px',
          backgroundColor: 'var(--colheita-surface-card)',
          borderRadius: '4px',
          marginBottom: '24px',
        }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          {/* Preview skeleton */}
          <div
            style={{
              aspectRatio: '4/3',
              backgroundColor: 'var(--colheita-surface-elevated)',
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-lg)',
              marginBottom: '16px',
            }}
          />
          {/* Meta skeleton */}
          <div
            style={{
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-md)',
              overflow: 'hidden',
            }}
          >
            {[
              { w: 80, label: 'a' },
              { w: 120, label: 'b' },
              { w: 60, label: 'c' },
              { w: 80, label: 'd' },
            ].map(({ w, label }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '10px 14px',
                  borderBottom: label !== 'd' ? '1px solid var(--colheita-border-subtle)' : 'none',
                }}
              >
                <div
                  style={{
                    height: '13px',
                    width: '80px',
                    backgroundColor: 'var(--colheita-surface-card)',
                    borderRadius: '4px',
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    height: '13px',
                    width: `${w}px`,
                    backgroundColor: 'var(--colheita-surface-card)',
                    borderRadius: '4px',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          {/* Form skeleton */}
          <div
            style={{
              height: '20px',
              width: '160px',
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: '4px',
              marginBottom: '20px',
            }}
          />
          {['titulo', 'alt'].map((field) => (
            <div key={field} style={{ marginBottom: '20px' }}>
              <div
                style={{
                  height: '13px',
                  width: '80px',
                  backgroundColor: 'var(--colheita-surface-card)',
                  borderRadius: '4px',
                  marginBottom: '6px',
                }}
              />
              <div
                style={{
                  height: '36px',
                  backgroundColor: 'var(--colheita-surface-elevated)',
                  border: '1px solid var(--colheita-border-subtle)',
                  borderRadius: 'var(--colheita-radius-sm)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
