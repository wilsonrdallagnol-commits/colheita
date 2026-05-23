// apps/portal/src/app/(conta)/conta/suporte/loading.tsx
//
// Skeleton matching /conta/suporte (lista de chamados + form).

export default function SuporteLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--colheita-surface-background)',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div
          style={{
            height: '12px',
            width: '120px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-sm)',
            marginBottom: '20px',
          }}
        />

        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              height: '12px',
              width: '180px',
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: 'var(--colheita-radius-sm)',
              marginBottom: '12px',
            }}
          />
          <div
            style={{
              height: '32px',
              width: '280px',
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: 'var(--colheita-radius-md)',
              marginBottom: '12px',
            }}
          />
          <div
            style={{
              height: '14px',
              width: '90%',
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: 'var(--colheita-radius-sm)',
              marginBottom: '6px',
            }}
          />
          <div
            style={{
              height: '14px',
              width: '70%',
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: 'var(--colheita-radius-sm)',
            }}
          />
        </div>

        {/* Form fields placeholder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={`field-${i}`}>
              <div
                style={{
                  height: '10px',
                  width: '90px',
                  backgroundColor: 'var(--colheita-surface-card)',
                  borderRadius: 'var(--colheita-radius-sm)',
                  marginBottom: '6px',
                }}
              />
              <div
                style={{
                  height: i === 4 ? '120px' : '42px',
                  width: '100%',
                  backgroundColor: 'var(--colheita-surface-card)',
                  borderRadius: 'var(--colheita-radius-md)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
