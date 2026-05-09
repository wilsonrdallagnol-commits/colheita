// apps/admin/src/app/(dashboard)/produtos/[slug]/editar/loading.tsx
import { Skeleton } from '@colheita/ui';

export default function EditarProdutoLoading() {
  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '720px' }}>
      {/* Breadcrumb */}
      <Skeleton style={{ height: '16px', width: '320px', marginBottom: '24px' }} />

      {/* Título */}
      <div style={{ marginBottom: '32px' }}>
        <Skeleton style={{ height: '28px', width: '220px' }} />
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
          <Skeleton style={{ height: '144px', width: '100%' }} />
        </div>
      </div>
    </div>
  );
}
