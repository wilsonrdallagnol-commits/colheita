// apps/admin/src/components/academia/modulo-actions.tsx
'use client';

import { useTransition } from 'react';
import { deleteModulo } from '@/lib/actions/academia';

interface ModuloActionsProps {
  moduloId: string;
}

export function ModuloActions({ moduloId }: ModuloActionsProps) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm('Excluir este módulo? As lições associadas também serão removidas.')) return;
    startTransition(async () => {
      const result = await deleteModulo(moduloId);
      if (result.error) {
        alert(result.error);
      }
    });
  }

  return (
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
  );
}
