// apps/admin/src/app/(dashboard)/produtos/novo/loading.tsx
import { Skeleton } from '@colheita/ui';

export default function NovoProdutoLoading() {
  return (
    <div style={{ padding: '32px', maxWidth: '720px' }}>
      {/* Breadcrumb */}
      <Skeleton style={{ height: '16px', width: '240px', marginBottom: '24px' }} />

      {/* Título */}
      <div style={{ marginBottom: '32px' }}>
        <Skeleton style={{ height: '28px', width: '200px', marginBottom: '8px' }} />
        <Skeleton style={{ height: '16px', width: '360px' }} />
      </div>

      {/* Campos do formulário */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <Skeleton style={{ height: '14px', width: '80px', marginBottom: '6px' }} />
            <Skeleton style={{ height: '36px', width: '100%' }} />
          </div>
        ))}
        {/* Textarea */}
        <div>
          <Skeleton style={{ height: '14px', width: '80px', marginBottom: '6px' }} />
          <Skeleton style={{ height: '96px', width: '100%' }} />
        </div>
      </div>
    </div>
  );
}
