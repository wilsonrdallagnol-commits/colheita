// apps/admin/src/components/academia/licao-actions.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { deleteLicao } from '@/lib/actions/academia';

interface LicaoActionsProps {
  licaoId: string;
  editHref: string;
}

export function LicaoActions({ licaoId, editHref }: LicaoActionsProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm('Excluir esta lição? O progresso dos alunos associado também será removido.'))
      return;
    startTransition(async () => {
      const result = await deleteLicao(licaoId);
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Link
        href={editHref}
        style={{
          fontSize: '0.8125rem',
          color: 'var(--colheita-brand-primary)',
          textDecoration: 'none',
        }}
      >
        Editar
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        style={{
          fontSize: '0.8125rem',
          color: 'var(--colheita-error, #dc2626)',
          background: 'none',
          border: 'none',
          cursor: pending ? 'not-allowed' : 'pointer',
          padding: '2px 0',
          opacity: pending ? 0.5 : 1,
        }}
      >
        {pending ? 'Removendo...' : 'Remover'}
      </button>
    </div>
  );
}
