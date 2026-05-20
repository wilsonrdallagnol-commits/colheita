// apps/admin/src/app/(dashboard)/layout-inference/loading.tsx
import { Skeleton } from '@colheita/ui';

export default function LayoutInferenceLoading() {
  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <Skeleton style={{ height: '16px', width: '200px', marginBottom: '12px' }} />
        <Skeleton style={{ height: '40px', maxWidth: '600px', marginBottom: '12px' }} />
        <Skeleton style={{ height: '18px', maxWidth: '700px' }} />
      </div>

      {/* Uploader area */}
      <div
        style={{
          marginBottom: '48px',
          padding: '40px',
          borderRadius: 'var(--colheita-radius-lg)',
          border: '2px dashed var(--colheita-border)',
          textAlign: 'center' as const,
        }}
      >
        <Skeleton
          style={{ height: '40px', maxWidth: '300px', margin: '0 auto 12px', borderRadius: '8px' }}
        />
        <Skeleton style={{ height: '14px', maxWidth: '200px', margin: '0 auto' }} />
      </div>

      {/* Blueprints grid */}
      <div style={{ marginBottom: '48px' }}>
        <Skeleton style={{ height: '11px', width: '140px', marginBottom: '16px' }} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
          }}
        >
          {['b1', 'b2', 'b3', 'b4'].map((k) => (
            <div
              key={k}
              style={{
                borderRadius: 'var(--colheita-radius-lg)',
                border: '1px solid var(--colheita-border)',
                backgroundColor: '#ffffff',
                overflow: 'hidden',
              }}
            >
              <Skeleton style={{ aspectRatio: '4 / 3', borderRadius: 0 }} />
              <div style={{ padding: '14px 16px' }}>
                <Skeleton style={{ height: '14px', marginBottom: '6px' }} />
                <Skeleton style={{ height: '10px', width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
