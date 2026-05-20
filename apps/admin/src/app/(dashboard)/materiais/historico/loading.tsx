// apps/admin/src/app/(dashboard)/materiais/historico/loading.tsx
import { Skeleton } from '@colheita/ui';

export default function MateriaisHistoricoLoading() {
  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Skeleton style={{ height: '16px', width: '160px', marginBottom: '12px' }} />
        <Skeleton style={{ height: '34px', maxWidth: '450px', marginBottom: '8px' }} />
        <Skeleton style={{ height: '16px', maxWidth: '550px' }} />
      </div>

      {/* Tabela */}
      <div
        style={{
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
          overflow: 'hidden',
          backgroundColor: 'var(--colheita-surface-card)',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr 200px 80px 80px 90px',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: 'var(--colheita-surface-elevated)',
            borderBottom: '1px solid var(--colheita-border-subtle)',
          }}
        >
          {['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].map((k) => (
            <Skeleton key={k} style={{ height: '11px', maxWidth: '80px' }} />
          ))}
        </div>

        {/* Rows */}
        {['r1', 'r2', 'r3', 'r4', 'r5'].map((k, i) => (
          <div
            key={k}
            style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr 200px 80px 80px 90px',
              gap: '12px',
              padding: '12px 16px',
              borderBottom: i < 4 ? '1px solid var(--colheita-border-subtle)' : 'none',
              alignItems: 'center',
            }}
          >
            <Skeleton style={{ height: '14px', maxWidth: '120px' }} />
            <div>
              <Skeleton style={{ height: '14px', marginBottom: '4px', maxWidth: '200px' }} />
              <Skeleton style={{ height: '11px', maxWidth: '120px' }} />
            </div>
            <Skeleton style={{ height: '13px', maxWidth: '140px' }} />
            <Skeleton style={{ height: '13px', width: '30px', marginLeft: 'auto' }} />
            <Skeleton style={{ height: '13px', width: '30px', marginLeft: 'auto' }} />
            <Skeleton style={{ height: '13px', width: '50px', marginLeft: 'auto' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
