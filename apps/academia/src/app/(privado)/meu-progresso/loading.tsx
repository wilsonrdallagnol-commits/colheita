// apps/academia/src/app/(privado)/meu-progresso/loading.tsx
export default function MeuProgressoLoading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div
          style={{
            height: '32px',
            width: '200px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-md)',
            marginBottom: '8px',
          }}
        />
        <div
          style={{
            height: '16px',
            width: '160px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-sm)',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {[0, 1].map((col) => (
          <div key={col}>
            <div
              style={{
                height: '12px',
                width: '120px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-sm)',
                marginBottom: '16px',
              }}
            />
            <div
              style={{
                height: '240px',
                backgroundColor: 'var(--colheita-surface-card)',
                borderRadius: 'var(--colheita-radius-lg)',
                border: '1px solid var(--colheita-border-subtle)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
