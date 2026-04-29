// apps/admin/src/app/(dashboard)/academia/[slug]/[moduloSlug]/loading.tsx
import { Skeleton } from '@colheita/ui';

export default function ModuloLoading() {
  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <Skeleton style={{ height: '16px', width: '340px', marginBottom: '24px' }} />

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Skeleton style={{ height: '32px', width: '280px', marginBottom: '8px' }} />
        <Skeleton style={{ height: '16px', width: '400px' }} />
      </div>

      {/* Lessons header */}
      <Skeleton style={{ height: '12px', width: '80px', marginBottom: '16px' }} />

      {/* Lessons list */}
      <div
        style={{
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        {['l1', 'l2', 'l3'].map((k, idx) => (
          <div
            key={k}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: idx < 2 ? '1px solid var(--colheita-border-subtle)' : 'none',
              backgroundColor: 'var(--colheita-surface-elevated)',
              gap: '16px',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}
              >
                <Skeleton style={{ height: '12px', width: '20px' }} />
                <Skeleton style={{ height: '18px', width: '200px' }} />
                <Skeleton style={{ height: '20px', width: '60px', borderRadius: '9999px' }} />
              </div>
              <Skeleton style={{ height: '14px', width: '60px', marginLeft: '28px' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Skeleton style={{ height: '14px', width: '40px' }} />
              <Skeleton style={{ height: '14px', width: '55px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Add lesson form */}
      <div
        style={{
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
          padding: '20px',
          backgroundColor: 'var(--colheita-surface-card)',
        }}
      >
        <Skeleton style={{ height: '14px', width: '100px', marginBottom: '16px' }} />
        <Skeleton style={{ height: '40px', marginBottom: '12px' }} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '12px',
          }}
        >
          <Skeleton style={{ height: '40px' }} />
          <Skeleton style={{ height: '40px' }} />
        </div>
        <Skeleton style={{ height: '200px', marginBottom: '16px' }} />
        <Skeleton
          style={{ height: '34px', width: '100px', borderRadius: 'var(--colheita-radius-md)' }}
        />
      </div>
    </div>
  );
}
