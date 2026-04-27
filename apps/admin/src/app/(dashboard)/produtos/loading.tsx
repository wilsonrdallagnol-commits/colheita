// apps/admin/src/app/(dashboard)/produtos/loading.tsx
import { Skeleton } from '@colheita/ui';

export default function ProdutosLoading() {
  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Skeleton style={{ height: '36px', maxWidth: '400px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          {['cat-a', 'cat-b', 'cat-c', 'cat-d', 'cat-e'].map((k) => (
            <Skeleton key={k} style={{ height: '26px', width: '80px', borderRadius: '9999px' }} />
          ))}
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9'].map((k) => (
          <div
            key={k}
            style={{
              borderRadius: 'var(--colheita-radius-lg)',
              border: '1px solid var(--colheita-border-subtle)',
              padding: '20px',
              backgroundColor: 'var(--colheita-surface-card)',
            }}
          >
            <Skeleton style={{ height: '20px', marginBottom: '10px', width: '70%' }} />
            <Skeleton
              style={{
                height: '22px',
                width: '90px',
                borderRadius: '9999px',
                marginBottom: '16px',
              }}
            />
            <Skeleton style={{ height: '14px', marginBottom: '6px' }} />
            <Skeleton style={{ height: '14px', width: '80%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
