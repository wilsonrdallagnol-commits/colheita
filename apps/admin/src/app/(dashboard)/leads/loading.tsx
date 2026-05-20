// apps/admin/src/app/(dashboard)/leads/loading.tsx
import { Skeleton } from '@colheita/ui';

export default function LeadsLoading() {
  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Skeleton style={{ height: '16px', width: '140px', marginBottom: '12px' }} />
        <Skeleton style={{ height: '34px', maxWidth: '400px', marginBottom: '8px' }} />
        <Skeleton style={{ height: '16px', maxWidth: '500px' }} />
      </div>

      {/* Pipeline summary cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}
      >
        {['novo', 'qual', 'prop', 'ganho', 'perdido'].map((k) => (
          <div
            key={k}
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--colheita-radius-lg)',
              border: '1px solid var(--colheita-border)',
              backgroundColor: 'var(--colheita-surface-elevated)',
            }}
          >
            <Skeleton style={{ height: '11px', width: '60px', marginBottom: '6px' }} />
            <Skeleton style={{ height: '24px', width: '40px' }} />
          </div>
        ))}
      </div>

      {/* Search bar */}
      <Skeleton style={{ height: '36px', maxWidth: '400px', marginBottom: '20px' }} />

      {/* Lista de leads */}
      <div
        style={{
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
          overflow: 'hidden',
        }}
      >
        {['l1', 'l2', 'l3', 'l4', 'l5'].map((k, i) => (
          <div
            key={k}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 200px 140px 120px',
              gap: '12px',
              padding: '14px 16px',
              alignItems: 'center',
              borderBottom: i < 4 ? '1px solid var(--colheita-border-subtle)' : 'none',
              backgroundColor: 'var(--colheita-surface-elevated)',
            }}
          >
            <div>
              <Skeleton style={{ height: '15px', marginBottom: '4px', maxWidth: '180px' }} />
              <Skeleton style={{ height: '12px', maxWidth: '120px' }} />
            </div>
            <div>
              <Skeleton style={{ height: '13px', marginBottom: '3px' }} />
              <Skeleton style={{ height: '11px', maxWidth: '90px' }} />
            </div>
            <div>
              <Skeleton style={{ height: '11px', width: '70px', marginBottom: '4px' }} />
              <Skeleton style={{ height: '11px', width: '60px' }} />
            </div>
            <div style={{ textAlign: 'right' as const }}>
              <Skeleton
                style={{
                  height: '22px',
                  width: '70px',
                  borderRadius: '9999px',
                  marginLeft: 'auto',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
