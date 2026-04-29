// apps/admin/src/components/academia/licao-actions.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteLicao } from '@/lib/actions/academia';

interface LicaoActionsProps {
  licaoId: string;
  editHref: string;
}

export function LicaoActions({ licaoId, editHref }: LicaoActionsProps) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const router = useRouter();

  function handleDeleteClick() {
    setConfirming(true);
    setActionError(null);
  }

  function handleCancel() {
    setConfirming(false);
  }

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteLicao(licaoId);
      if (result.error) {
        setActionError(result.error);
        setConfirming(false);
      } else {
        router.refresh();
      }
    });
  }

  const dangerBtn: React.CSSProperties = {
    fontSize: '0.8125rem',
    color: 'var(--colheita-danger)',
    background: 'none',
    border: 'none',
    cursor: pending ? 'not-allowed' : 'pointer',
    padding: '2px 0',
    opacity: pending ? 0.5 : 1,
  };

  if (confirming) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)' }}>
          Excluir lição e progresso?
        </span>
        <button type="button" onClick={handleConfirm} disabled={pending} style={dangerBtn}>
          {pending ? 'Removendo...' : 'Confirmar'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          style={{ ...dangerBtn, color: 'var(--colheita-text-tertiary)' }}
        >
          Cancelar
        </button>
        {actionError && (
          <span style={{ fontSize: '0.75rem', color: 'var(--colheita-danger)' }}>
            {actionError}
          </span>
        )}
      </div>
    );
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
      <button type="button" onClick={handleDeleteClick} style={dangerBtn}>
        Remover
      </button>
    </div>
  );
}
