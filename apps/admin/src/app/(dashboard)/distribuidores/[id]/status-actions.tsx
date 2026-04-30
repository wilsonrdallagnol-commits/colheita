// apps/admin/src/app/(dashboard)/distribuidores/[id]/status-actions.tsx
'use client';

import { useTransition } from 'react';
import { reactivateDistribuidorAction, suspendDistribuidorAction } from '../actions';

interface StatusActionsProps {
  id: string;
  status: 'active' | 'invited' | 'suspended';
}

export function StatusActions({ id, status }: StatusActionsProps) {
  const [pending, startTransition] = useTransition();

  if (status === 'suspended') {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await reactivateDistribuidorAction(id);
          });
        }}
        style={{
          padding: '6px 14px',
          borderRadius: 'var(--colheita-radius-md)',
          border: '1px solid rgba(52,199,89,0.4)',
          backgroundColor: 'rgba(52,199,89,0.08)',
          color: 'var(--colheita-brand-green)',
          fontSize: '0.8125rem',
          fontWeight: '500',
          cursor: pending ? 'not-allowed' : 'pointer',
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? 'Reativando…' : 'Reativar acesso'}
      </button>
    );
  }

  if (status === 'active' || status === 'invited') {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await suspendDistribuidorAction(id);
          });
        }}
        style={{
          padding: '6px 14px',
          borderRadius: 'var(--colheita-radius-md)',
          border: '1px solid rgba(239,68,68,0.3)',
          backgroundColor: 'rgba(239,68,68,0.06)',
          color: '#ef4444',
          fontSize: '0.8125rem',
          fontWeight: '500',
          cursor: pending ? 'not-allowed' : 'pointer',
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? 'Suspendendo…' : 'Suspender acesso'}
      </button>
    );
  }

  return null;
}
