// apps/admin/src/app/(dashboard)/academia/[slug]/loading.tsx
import { Skeleton } from '@colheita/ui';

export default function TrilhaLoading() {
  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '900px' }}>
      <Skeleton style={{ height: '16px', width: '280px', marginBottom: '24px' }} />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Skeleton style={{ height: '32px', width: '260px' }} />
            <Skeleton style={{ height: '22px', width: '80px', borderRadius: '9999px' }} />
          </div>
          <Skeleton style={{ height: '16px', width: '320px', marginBottom: '8px' }} />
          <div style={{ display: 'flex', gap: '16px' }}>
            <Skeleton style={{ height: '14px', width: '80px' }} />
            <Skeleton style={{ height: '14px', width: '60px' }} />
          </div>
        </div>
        <Skeleton
          style={{ height: '34px', width: '110px', borderRadius: 'var(--colheita-radius-md)' }}
        />
      </div>

      {/* Modules */}
      <Skeleton style={{ height: '12px', width: '100px', marginBottom: '16px' }} />
      <div
        style={{
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        {['m1', 'm2'].map((k, idx) => (
          <div
            key={k}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: idx < 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
              backgroundColor: 'var(--colheita-surface-elevated)',
              gap: '16px',
            }}
          >
            <div style={{ flex: 1 }}>
              <Skeleton style={{ height: '18px', width: '220px', marginBottom: '4px' }} />
              <Skeleton style={{ height: '14px', width: '300px' }} />
            </div>
            <Skeleton style={{ height: '14px', width: '60px' }} />
          </div>
        ))}
      </div>

      {/* Add module form */}
      <div
        style={{
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
          padding: '20px',
          backgroundColor: 'var(--colheita-surface-card)',
        }}
      >
        <Skeleton style={{ height: '14px', width: '120px', marginBottom: '16px' }} />
        <Skeleton style={{ height: '40px', marginBottom: '12px' }} />
        <Skeleton style={{ height: '80px', marginBottom: '16px' }} />
        <Skeleton
          style={{ height: '34px', width: '140px', borderRadius: 'var(--colheita-radius-md)' }}
        />
      </div>
    </div>
  );
}
