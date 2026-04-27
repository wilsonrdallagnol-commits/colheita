// apps/admin/src/app/(dashboard)/produtos/[slug]/loading.tsx
import { Skeleton } from '@colheita/ui';

export default function ProdutoLoading() {
  return (
    <div style={{ padding: '32px' }}>
      <Skeleton style={{ height: '16px', width: '200px', marginBottom: '32px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '40px' }}>
        <div>
          <Skeleton style={{ height: '36px', width: '60%', marginBottom: '12px' }} />
          <Skeleton style={{ height: '20px', width: '80%', marginBottom: '32px' }} />
          <Skeleton style={{ height: '160px', marginBottom: '32px' }} />
          <Skeleton style={{ height: '200px' }} />
        </div>
        <Skeleton style={{ height: '300px', borderRadius: 'var(--colheita-radius-lg)' }} />
      </div>
    </div>
  );
}
