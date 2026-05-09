// apps/admin/src/app/(dashboard)/academia/loading.tsx
import { Skeleton } from '@colheita/ui';

export default function AcademiaLoading() {
  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)' }}>
      <Skeleton style={{ height: '16px', width: '180px', marginBottom: '24px' }} />
      <div
        style={{
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Skeleton style={{ height: '32px', width: '160px', marginBottom: '8px' }} />
          <Skeleton style={{ height: '16px', width: '120px' }} />
        </div>
        <Skeleton
          style={{ height: '34px', width: '110px', borderRadius: 'var(--colheita-radius-md)' }}
        />
      </div>
      <div
        style={{
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
          overflow: 'hidden',
        }}
      >
        {['t1', 't2', 't3'].map((k, idx) => (
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
                style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}
              >
                <Skeleton style={{ height: '18px', width: '200px' }} />
                <Skeleton style={{ height: '20px', width: '70px', borderRadius: '9999px' }} />
              </div>
              <Skeleton style={{ height: '14px', width: '280px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Skeleton style={{ height: '14px', width: '70px' }} />
              <Skeleton style={{ height: '14px', width: '60px' }} />
              <Skeleton style={{ height: '14px', width: '40px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
