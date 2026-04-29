// apps/academia/src/app/(privado)/meu-progresso/certificados/[certificateNo]/loading.tsx
export default function CertificadoLoading() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px' }}>
      {/* Breadcrumb skeleton */}
      <div
        style={{
          height: '14px',
          width: '280px',
          backgroundColor: 'var(--colheita-surface-card)',
          borderRadius: 'var(--colheita-radius-sm)',
          marginBottom: '32px',
        }}
      />

      {/* Certificate card skeleton */}
      <div
        style={{
          border: '1px solid var(--colheita-border)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        {/* Top stripe */}
        <div
          style={{
            height: '6px',
            backgroundColor: 'var(--colheita-surface-card)',
          }}
        />

        <div style={{ padding: '48px 56px' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '48px',
            }}
          >
            <div
              style={{
                height: '40px',
                width: '160px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-md)',
              }}
            />
            <div
              style={{
                height: '40px',
                width: '140px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-md)',
              }}
            />
          </div>

          {/* Body */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div
              style={{
                height: '12px',
                width: '180px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-sm)',
                margin: '0 auto 20px',
              }}
            />
            <div
              style={{
                height: '24px',
                width: '220px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-sm)',
                margin: '0 auto 20px',
              }}
            />
            <div
              style={{
                height: '36px',
                width: '340px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-md)',
                margin: '0 auto',
              }}
            />
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '32px',
              borderTop: '1px solid var(--colheita-border-subtle)',
            }}
          >
            <div
              style={{
                height: '36px',
                width: '120px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-sm)',
              }}
            />
            <div
              style={{
                height: '36px',
                width: '120px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-sm)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
