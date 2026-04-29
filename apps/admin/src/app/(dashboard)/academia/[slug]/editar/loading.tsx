// apps/admin/src/app/(dashboard)/academia/[slug]/editar/loading.tsx
export default function EditarTrilhaLoading() {
  return (
    <div style={{ padding: '32px', maxWidth: '720px' }}>
      {/* Breadcrumb skeleton */}
      <div
        style={{
          height: '14px',
          width: '320px',
          backgroundColor: 'var(--colheita-surface-card)',
          borderRadius: 'var(--colheita-radius-sm)',
          marginBottom: '32px',
        }}
      />

      {/* Title */}
      <div
        style={{
          height: '28px',
          width: '200px',
          backgroundColor: 'var(--colheita-surface-card)',
          borderRadius: 'var(--colheita-radius-md)',
          marginBottom: '32px',
        }}
      />

      {/* Form fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {(
          [
            { key: 'title', labelW: 140, h: 36 },
            { key: 'subtitle', labelW: 220, h: 36 },
            { key: 'description', labelW: 300, h: 96 },
            { key: 'level', labelW: 160, h: 36 },
            { key: 'status', labelW: 120, h: 36 },
          ] as const
        ).map(({ key, labelW, h }) => (
          <div key={key}>
            <div
              style={{
                height: '12px',
                width: `${labelW}px`,
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-sm)',
                marginBottom: '8px',
              }}
            />
            <div
              style={{
                height: `${h}px`,
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-md)',
                border: '1px solid var(--colheita-border-subtle)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Submit button */}
      <div
        style={{
          height: '36px',
          width: '120px',
          backgroundColor: 'var(--colheita-surface-card)',
          borderRadius: 'var(--colheita-radius-md)',
          marginTop: '32px',
        }}
      />
    </div>
  );
}
