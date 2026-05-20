'use client';

// apps/admin/src/components/configuracoes/change-password-form.tsx
//
// Form pra trocar senha do usuario logado. Em /configuracoes. Os 3 fields:
// senha atual + nova + confirmar. Server action valida tudo antes de chamar
// supabase.auth.updateUser.

import { Button } from '@colheita/ui';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { useActionState, useState } from 'react';
import { type ChangePasswordState, changePassword } from '@/lib/actions/auth';

export function ChangePasswordForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<ChangePasswordState, FormData>(
    changePassword,
    null,
  );

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <KeyRound size={14} strokeWidth={1.75} style={{ marginRight: 6 }} />
        Trocar senha
      </Button>
    );
  }

  // Sucesso — mostra confirmacao e reseta
  if (state?.success) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: 'var(--colheita-radius-md)',
          backgroundColor: 'var(--colheita-brand-secondary-soft)',
          border: '1px solid var(--colheita-brand-secondary-line)',
          color: 'var(--colheita-brand-secondary)',
          fontSize: '0.8125rem',
          fontWeight: 600,
        }}
      >
        <CheckCircle2 size={14} strokeWidth={1.75} />
        Senha atualizada com sucesso.
      </div>
    );
  }

  return (
    <form
      action={formAction}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        borderRadius: 'var(--colheita-radius-md)',
        border: '1px solid var(--colheita-border)',
        backgroundColor: 'var(--colheita-surface-elevated)',
      }}
    >
      <Field label="Senha atual" htmlFor="current" error={state?.fieldErrors?.current}>
        <input
          id="current"
          name="current"
          type="password"
          required
          autoComplete="current-password"
          disabled={isPending}
          style={inputStyle}
        />
      </Field>

      <Field
        label="Nova senha"
        htmlFor="next"
        hint="Mínimo 8 caracteres"
        error={state?.fieldErrors?.next}
      >
        <input
          id="next"
          name="next"
          type="password"
          required
          minLength={8}
          maxLength={100}
          autoComplete="new-password"
          disabled={isPending}
          style={inputStyle}
        />
      </Field>

      <Field label="Confirmar nova senha" htmlFor="confirm" error={state?.fieldErrors?.confirm}>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={isPending}
          style={inputStyle}
        />
      </Field>

      {state?.error ? (
        <p
          role="alert"
          style={{
            fontSize: '0.75rem',
            color: 'var(--colheita-danger)',
            padding: '8px 10px',
            borderRadius: '6px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            margin: 0,
          }}
        >
          {state.error}
        </p>
      ) : null}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(false)}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Atualizando…' : 'Atualizar senha'}
        </Button>
      </div>
    </form>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label
        htmlFor={htmlFor}
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--colheita-text-secondary)',
        }}
      >
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p
          style={{
            fontSize: '0.6875rem',
            color: 'var(--colheita-text-tertiary)',
            margin: 0,
          }}
        >
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          style={{
            fontSize: '0.6875rem',
            color: 'var(--colheita-danger)',
            margin: 0,
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 'var(--colheita-radius-md)',
  border: '1px solid var(--colheita-border)',
  backgroundColor: '#ffffff',
  fontSize: '0.875rem',
  color: 'var(--colheita-text-primary)',
  outline: 'none',
};
