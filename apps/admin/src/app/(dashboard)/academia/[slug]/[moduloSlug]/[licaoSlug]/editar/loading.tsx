// apps/admin/src/app/(dashboard)/academia/[slug]/[moduloSlug]/[licaoSlug]/editar/loading.tsx
export default function EditarLicaoLoading() {
  return (
    <div style={{ padding: '32px', maxWidth: '720px' }}>
      {/* Breadcrumb skeleton */}
      <div
        style={{
          height: '14px',
          width: '440px',
          backgroundColor: 'var(--colheita-surface-card)',
          borderRadius: 'var(--colheita-radius-sm)',
          marginBottom: '32px',
        }}
      />

      {/* Title */}
      <div
        style={{
          height: '28px',
          width: '180px',
          backgroundColor: 'var(--colheita-surface-card)',
          borderRadius: 'var(--colheita-radius-md)',
          marginBottom: '32px',
        }}
      />

      {/* Form fields: title, type, estimated_minutes, is_required, content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {(
          [
            { key: 'title', labelW: 80, h: 36 },
            { key: 'type', labelW: 60, h: 36 },
            { key: 'estimated_minutes', labelW: 180, h: 36 },
            { key: 'is_required', labelW: 240, h: 36 },
            { key: 'content', labelW: 120, h: 240 },
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
