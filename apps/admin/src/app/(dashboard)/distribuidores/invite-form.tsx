// apps/admin/src/app/(dashboard)/distribuidores/invite-form.tsx
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { inviteDistribuidorAction } from './actions';

const initialState = { error: null, success: false };

export function InviteDistribuidorForm() {
  const [state, formAction, pending] = useActionState(inviteDistribuidorAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexWrap: 'wrap' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <input
          type="email"
          name="email"
          required
          placeholder="e-mail do distribuidor..."
          disabled={pending}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--colheita-radius-md)',
            border: state.error
              ? '1px solid rgba(239,68,68,0.6)'
              : '1px solid var(--colheita-border)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            color: 'var(--colheita-text-primary)',
            fontSize: '0.875rem',
            width: '240px',
            outline: 'none',
          }}
        />
        {state.error && (
          <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{state.error}</span>
        )}
        {state.success && (
          <span style={{ fontSize: '0.75rem', color: 'var(--colheita-brand-green)' }}>
            Convite enviado com sucesso!
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        style={{
          padding: '8px 16px',
          borderRadius: 'var(--colheita-radius-md)',
          border: 'none',
          backgroundColor: pending
            ? 'var(--colheita-surface-sunken)'
            : 'var(--colheita-brand-green)',
          color: pending ? 'var(--colheita-text-tertiary)' : '#fff',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: pending ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {pending ? 'Enviando…' : 'Convidar distribuidor'}
      </button>
    </form>
  );
}
