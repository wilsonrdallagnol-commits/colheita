// apps/academia/src/app/(trilhas)/trilhas/[slug]/iniciar/loading.tsx
export default function IniciarLoading() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          height: '20px',
          width: '200px',
          backgroundColor: 'var(--colheita-surface-card)',
          borderRadius: 'var(--colheita-radius-md)',
        }}
      />
      <div
        style={{
          height: '14px',
          width: '140px',
          backgroundColor: 'var(--colheita-surface-card)',
          borderRadius: 'var(--colheita-radius-sm)',
        }}
      />
    </div>
  );
}
