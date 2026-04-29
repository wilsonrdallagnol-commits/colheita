// apps/admin/src/components/academia/trilha-actions.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { archiveTrilha, publishTrilha } from '@/lib/actions/academia';

interface TrilhaActionsProps {
  trilhaId: string;
  currentStatus: string;
}

export function TrilhaActions({ trilhaId, currentStatus }: TrilhaActionsProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handlePublish() {
    startTransition(async () => {
      const result = await publishTrilha(trilhaId);
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  }

  function handleArchive() {
    if (!confirm('Arquivar esta trilha? Ela ficará oculta do catálogo.')) return;
    startTransition(async () => {
      const result = await archiveTrilha(trilhaId);
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  }

  if (currentStatus === 'published') {
    return (
      <button
        type="button"
        onClick={handleArchive}
        disabled={pending}
        style={{
          padding: '6px 14px',
          borderRadius: 'var(--colheita-radius-md)',
          border: '1px solid var(--colheita-border)',
          backgroundColor: 'transparent',
          color: 'var(--colheita-text-secondary)',
          fontSize: '0.8125rem',
          fontWeight: '500',
          cursor: pending ? 'not-allowed' : 'pointer',
          opacity: pending ? 0.5 : 1,
        }}
      >
        {pending ? 'Arquivando...' : 'Arquivar'}
      </button>
    );
  }

  if (currentStatus === 'draft' || currentStatus === 'archived') {
    return (
      <button
        type="button"
        onClick={handlePublish}
        disabled={pending}
        style={{
          padding: '6px 14px',
          borderRadius: 'var(--colheita-radius-md)',
          border: 'none',
          backgroundColor: 'var(--colheita-brand-primary)',
          color: '#fff',
          fontSize: '0.8125rem',
          fontWeight: '500',
          cursor: pending ? 'not-allowed' : 'pointer',
          opacity: pending ? 0.5 : 1,
        }}
      >
        {pending ? 'Publicando...' : 'Publicar'}
      </button>
    );
  }

  return null;
}
