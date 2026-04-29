// apps/portal/src/app/(public)/loading.tsx
export default function CatalogLoading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
      {/* Hero skeleton */}
      <div style={{ marginBottom: '40px', maxWidth: '640px' }}>
        <div
          style={{
            height: '44px',
            width: '280px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-md)',
            marginBottom: '12px',
          }}
        />
        <div
          style={{
            height: '17px',
            width: '100%',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-sm)',
            marginBottom: '8px',
          }}
        />
        <div
          style={{
            height: '17px',
            width: '75%',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-sm)',
          }}
        />
      </div>

      {/* Search bar skeleton */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          maxWidth: '480px',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '40px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border-subtle)',
          }}
        />
        <div
          style={{
            width: '80px',
            height: '40px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-md)',
          }}
        />
      </div>

      {/* Category chips skeleton */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '40px',
        }}
      >
        {([60, 80, 100, 70, 90] as const).map((w) => (
          <div
            key={w}
            style={{
              height: '28px',
              width: `${w}px`,
              backgroundColor: 'var(--colheita-surface-card)',
              borderRadius: '999px',
              border: '1px solid var(--colheita-border-subtle)',
            }}
          />
        ))}
      </div>

      {/* Section label */}
      <div
        style={{
          height: '12px',
          width: '100px',
          backgroundColor: 'var(--colheita-surface-card)',
          borderRadius: 'var(--colheita-radius-sm)',
          marginBottom: '20px',
        }}
      />

      {/* Product card grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {([0, 1, 2, 3, 4, 5] as const).map((n) => (
          <div
            key={n}
            style={{
              height: '100px',
              borderRadius: 'var(--colheita-radius-lg)',
              border: '1px solid var(--colheita-border-subtle)',
              backgroundColor: 'var(--colheita-surface-card)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
