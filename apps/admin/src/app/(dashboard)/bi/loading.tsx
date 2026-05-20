// apps/admin/src/app/(dashboard)/bi/loading.tsx
import { Skeleton } from '@colheita/ui';

export default function BiLoading() {
  return (
    <div style={{ padding: 'clamp(24px, 3vw, 48px) clamp(24px, 4vw, 72px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <Skeleton style={{ height: '16px', width: '180px', marginBottom: '12px' }} />
        <Skeleton style={{ height: '34px', maxWidth: '500px', marginBottom: '8px' }} />
        <Skeleton style={{ height: '16px', maxWidth: '600px' }} />
      </div>

      {/* KPIs hero */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {['k1', 'k2', 'k3', 'k4'].map((k) => (
          <div
            key={k}
            style={{
              padding: '24px',
              borderRadius: 'var(--colheita-radius-lg)',
              border: '1px solid var(--colheita-border)',
              backgroundColor: '#ffffff',
            }}
          >
            <Skeleton style={{ height: '11px', width: '70px', marginBottom: '14px' }} />
            <Skeleton style={{ height: '32px', width: '100px', marginBottom: '6px' }} />
            <Skeleton style={{ height: '12px', maxWidth: '180px' }} />
          </div>
        ))}
      </div>

      {/* Sparklines */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {['s1', 's2'].map((k) => (
          <div
            key={k}
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--colheita-radius-lg)',
              border: '1px solid var(--colheita-border)',
              backgroundColor: 'var(--colheita-surface-elevated)',
            }}
          >
            <Skeleton style={{ height: '11px', width: '100px', marginBottom: '8px' }} />
            <Skeleton style={{ height: '60px', marginBottom: '8px' }} />
            <Skeleton style={{ height: '11px', width: '80px' }} />
          </div>
        ))}
      </div>

      {/* Sections */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '16px',
        }}
      >
        {['p1', 'p2'].map((k) => (
          <div
            key={k}
            style={{
              padding: '24px',
              borderRadius: 'var(--colheita-radius-lg)',
              border: '1px solid var(--colheita-border)',
              backgroundColor: '#ffffff',
            }}
          >
            <Skeleton style={{ height: '11px', width: '140px', marginBottom: '20px' }} />
            {['b1', 'b2', 'b3', 'b4', 'b5'].map((b) => (
              <div key={b} style={{ marginBottom: '14px' }}>
                <Skeleton style={{ height: '12px', marginBottom: '4px' }} />
                <Skeleton style={{ height: '6px', borderRadius: '3px' }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
