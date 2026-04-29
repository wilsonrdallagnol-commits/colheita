// apps/admin/src/app/(dashboard)/midias/colecoes/loading.tsx
import { Skeleton } from '@colheita/ui';

export default function ColecoesLoading() {
  return (
    <div style={{ padding: '32px' }}>
      <Skeleton style={{ width: '200px', height: '16px', marginBottom: '24px' }} />
      <div
        style={{
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <Skeleton style={{ width: '110px', height: '28px', marginBottom: '8px' }} />
          <Skeleton style={{ width: '80px', height: '14px' }} />
        </div>
        <Skeleton style={{ width: '120px', height: '32px' }} />
      </div>
      <div
        style={{
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
          overflow: 'hidden',
        }}
      >
        {(['a', 'b', 'c', 'd'] as const).map((k, i) => (
          <div
            key={k}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 20px',
              borderBottom: i < 3 ? '1px solid var(--colheita-border-subtle)' : 'none',
            }}
          >
            <Skeleton
              style={{ width: '36px', height: '36px', borderRadius: 'var(--colheita-radius-md)' }}
            />
            <div style={{ flex: 1 }}>
              <Skeleton style={{ width: '140px', height: '14px', marginBottom: '6px' }} />
              <Skeleton style={{ width: '200px', height: '12px' }} />
            </div>
            <Skeleton style={{ width: '80px', height: '12px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
