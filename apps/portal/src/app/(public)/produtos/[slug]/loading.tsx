// apps/portal/src/app/(public)/produtos/[slug]/loading.tsx
export default function Loading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
      <div
        style={{
          height: '20px',
          width: '120px',
          borderRadius: 'var(--colheita-radius-md)',
          backgroundColor: 'var(--colheita-surface-elevated)',
          marginBottom: '32px',
        }}
      />
      <div
        style={{
          height: '40px',
          width: '60%',
          borderRadius: 'var(--colheita-radius-md)',
          backgroundColor: 'var(--colheita-surface-elevated)',
          marginBottom: '16px',
        }}
      />
      <div
        style={{
          height: '20px',
          width: '80%',
          borderRadius: 'var(--colheita-radius-md)',
          backgroundColor: 'var(--colheita-surface-elevated)',
        }}
      />
    </div>
  );
}
