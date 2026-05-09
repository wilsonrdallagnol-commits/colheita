// apps/admin/src/app/(dashboard)/midias/loading.tsx
import { Skeleton } from '@colheita/ui';

export default function MidiasLoading() {
  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)' }}>
      <Skeleton style={{ width: '160px', height: '16px', marginBottom: '24px' }} />

      <div
        style={{
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <Skeleton style={{ width: '100px', height: '28px', marginBottom: '8px' }} />
          <Skeleton style={{ width: '80px', height: '14px' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Skeleton style={{ width: '90px', height: '32px' }} />
          <Skeleton style={{ width: '120px', height: '32px' }} />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--colheita-border-subtle)',
          paddingBottom: '8px',
        }}
      >
        {(['80px', '70px', '90px', '60px', '60px', '60px'] as const).map((w) => (
          <Skeleton key={w} style={{ width: w, height: '32px' }} />
        ))}
      </div>

      {/* Grid skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'] as const).map((k) => (
          <div
            key={k}
            style={{
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-md)',
              overflow: 'hidden',
            }}
          >
            <Skeleton style={{ width: '100%', aspectRatio: '4/3', borderRadius: '0' }} />
            <div style={{ padding: '10px 12px 12px' }}>
              <Skeleton style={{ width: '80%', height: '14px', marginBottom: '8px' }} />
              <Skeleton style={{ width: '50%', height: '12px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
