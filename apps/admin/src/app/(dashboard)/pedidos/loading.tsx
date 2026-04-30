// apps/admin/src/app/(dashboard)/pedidos/loading.tsx
import { Skeleton } from '@colheita/ui';

export default function PedidosLoading() {
  return (
    <div style={{ padding: '40px 48px', maxWidth: '1400px' }}>
      <Skeleton style={{ width: '180px', height: '28px', marginBottom: '8px' }} />
      <Skeleton style={{ width: '280px', height: '16px', marginBottom: '32px' }} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          marginBottom: '28px',
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
          <Skeleton key={i} style={{ height: '72px', borderRadius: '8px' }} />
        ))}
      </div>
      <Skeleton
        style={{ width: '100%', height: '44px', marginBottom: '24px', borderRadius: '8px' }}
      />
      <Skeleton style={{ width: '100%', height: '400px', borderRadius: '8px' }} />
    </div>
  );
}
