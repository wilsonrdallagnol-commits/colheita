'use client';

// apps/portal/src/components/conta/password-form.tsx
//
// Form de troca de senha. Valida senha atual antes de aplicar nova (defesa
// contra session hijack). Espelha admin/configuracoes/change-password-form.

import { CheckCircle2, KeyRound } from 'lucide-react';
import { useActionState, useId, useState } from 'react';
import { type ChangePasswordState, changePassword } from '@/lib/actions/conta';

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--colheita-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--colheita-radius-md)',
  border: '1px solid var(--colheita-border)',
  backgroundColor: 'var(--colheita-surface-elevated)',
  color: 'var(--colheita-text-primary)',
  fontSize: '0.9375rem',
  fontFamily: 'inherit',
};

const errorStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--colheita-danger, #dc2626)',
  marginTop: '4px',
};

export function PasswordForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ChangePasswordState, FormData>(
    changePassword,
    null,
  );
  const currentId = useId();
  const nextId = useId();
  const confirmId = useId();

  if (state?.success) {
    return (
      <output
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: 'var(--colheita-radius-md)',
          backgroundColor: 'var(--colheita-brand-secondary-soft, rgba(72,144,48,0.08))',
          border: '1px solid var(--colheita-brand-secondary-line, rgba(72,144,48,0.3))',
          color: 'var(--colheita-brand-secondary, rgb(72,144,48))',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}
      >
        <CheckCircle2 size={16} strokeWidth={2} />
        Senha atualizada com sucesso.
      </output>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 16px',
          borderRadius: 'var(--colheita-radius-md)',
          border: '1px solid var(--colheita-border)',
          backgroundColor: 'var(--colheita-surface-elevated)',
          color: 'var(--colheita-text-primary)',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        <KeyRound size={14} strokeWidth={1.75} />
        Trocar senha
      </button>
    );
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {state?.error && (
        <div
          role="alert"
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'rgba(220, 38, 38, 0.08)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            color: 'rgb(185, 28, 28)',
            fontSize: '0.875rem',
          }}
        >
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor={currentId} style={labelStyle}>
          Senha atual
        </label>
        <input
          id={currentId}
          name="current"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          style={inputStyle}
        />
        {state?.fieldErrors?.current && <p style={errorStyle}>{state.fieldErrors.current}</p>}
      </div>

      <div>
        <label htmlFor={nextId} style={labelStyle}>
          Nova senha
        </label>
        <input
          id={nextId}
          name="next"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={100}
          required
          disabled={pending}
          style={inputStyle}
        />
        {state?.fieldErrors?.next ? (
          <p style={errorStyle}>{state.fieldErrors.next}</p>
        ) : (
          <p style={{ ...errorStyle, color: 'var(--colheita-text-tertiary)' }}>
            Mínimo 8 caracteres.
          </p>
        )}
      </div>

      <div>
        <label htmlFor={confirmId} style={labelStyle}>
          Confirmar nova senha
        </label>
        <input
          id={confirmId}
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          disabled={pending}
          style={inputStyle}
        />
        {state?.fieldErrors?.confirm && <p style={errorStyle}>{state.fieldErrors.confirm}</p>}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button
          type="submit"
          disabled={pending}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--colheita-radius-md)',
            border: 'none',
            backgroundColor: pending
              ? 'var(--colheita-text-tertiary)'
              : 'var(--colheita-brand-primary)',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: pending ? 'not-allowed' : 'pointer',
          }}
        >
          {pending ? 'Atualizando…' : 'Atualizar senha'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: 'transparent',
            color: 'var(--colheita-text-secondary)',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
