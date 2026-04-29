// apps/admin/src/components/academia/trilha-actions.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { archiveTrilha, publishTrilha } from '@/lib/actions/academia';

interface TrilhaActionsProps {
  trilhaId: string;
  currentStatus: string;
}

export function TrilhaActions({ trilhaId, currentStatus }: TrilhaActionsProps) {
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const router = useRouter();

  function handlePublish() {
    setActionError(null);
    startTransition(async () => {
      const result = await publishTrilha(trilhaId);
      if (result.error) {
        setActionError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  function handleArchive() {
    setActionError(null);
    startTransition(async () => {
      const result = await archiveTrilha(trilhaId);
      if (result.error) {
        setActionError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  const btnBase: React.CSSProperties = {
    padding: '6px 14px',
    borderRadius: 'var(--colheita-radius-md)',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: pending ? 'not-allowed' : 'pointer',
    opacity: pending ? 0.5 : 1,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {(currentStatus === 'draft' || currentStatus === 'archived') && (
          <button
            type="button"
            onClick={handlePublish}
            disabled={pending}
            style={{
              ...btnBase,
              border: 'none',
              backgroundColor: 'var(--colheita-brand-primary)',
              color: '#fff',
            }}
          >
            {pending ? 'Publicando...' : 'Publicar'}
          </button>
        )}

        {currentStatus === 'published' && (
          <button
            type="button"
            onClick={handleArchive}
            disabled={pending}
            style={{
              ...btnBase,
              border: '1px solid var(--colheita-border)',
              backgroundColor: 'transparent',
              color: 'var(--colheita-text-secondary)',
            }}
          >
            {pending ? 'Arquivando...' : 'Arquivar'}
          </button>
        )}

        {currentStatus === 'draft' && (
          <button
            type="button"
            onClick={handleArchive}
            disabled={pending}
            style={{
              ...btnBase,
              border: '1px solid var(--colheita-border)',
              backgroundColor: 'transparent',
              color: 'var(--colheita-text-tertiary)',
            }}
          >
            {pending ? 'Arquivando...' : 'Arquivar'}
          </button>
        )}
      </div>

      {actionError && (
        <p style={{ fontSize: '0.75rem', color: 'var(--colheita-danger)' }}>{actionError}</p>
      )}
    </div>
  );
}
