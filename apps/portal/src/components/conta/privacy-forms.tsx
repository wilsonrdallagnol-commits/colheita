'use client';

// apps/portal/src/components/conta/privacy-forms.tsx
//
// Forms LGPD:
//   - ExportDataButton: dispara action, recebe JSON inline e
//     baixa via Blob URL no client (sem precisar de Storage)
//   - DeleteAccountForm: collapsible com textarea motivo

import { AlertTriangle, CheckCircle2, Download } from 'lucide-react';
import { useActionState, useEffect, useId, useState } from 'react';
import {
  type DeleteRequestState,
  type ExportDataState,
  exportMyData,
  requestAccountDeletion,
} from '@/lib/actions/privacidade';

// ── ExportDataButton ─────────────────────────────────────────────────────────

export function ExportDataButton() {
  const [state, formAction, pending] = useActionState<ExportDataState, FormData>(
    exportMyData,
    null,
  );

  // Quando state retorna sucesso com JSON, dispara download via Blob
  useEffect(() => {
    if (!state?.success || !state.data) return;
    const blob = new Blob([state.data], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `colheita-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [state]);

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
      <button
        type="submit"
        disabled={pending}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: 'var(--colheita-radius-md)',
          border: '1px solid var(--colheita-border)',
          backgroundColor: pending
            ? 'var(--colheita-surface-elevated)'
            : 'var(--colheita-surface-card)',
          color: 'var(--colheita-text-primary)',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: pending ? 'wait' : 'pointer',
          alignSelf: 'flex-start',
        }}
      >
        <Download size={14} strokeWidth={1.75} />
        {pending ? 'Gerando JSON…' : 'Baixar meus dados (JSON)'}
      </button>
    </form>
  );
}

// ── DeleteAccountForm ────────────────────────────────────────────────────────

export function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<DeleteRequestState, FormData>(
    requestAccountDeletion,
    null,
  );
  const reasonId = useId();

  if (state?.success) {
    return (
      <output
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          padding: '14px 18px',
          borderRadius: 'var(--colheita-radius-md)',
          backgroundColor: 'var(--colheita-brand-secondary-soft, rgba(72,144,48,0.08))',
          border: '1px solid var(--colheita-brand-secondary-line, rgba(72,144,48,0.3))',
          color: 'var(--colheita-brand-secondary, rgb(72,144,48))',
          fontSize: '0.875rem',
        }}
      >
        <CheckCircle2 size={16} strokeWidth={2} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          Solicitação registrada. O time da Argho vai entrar em contato em até 15 dias úteis (SLA
          LGPD). Você pode acompanhar em <strong>Meus chamados</strong>.
        </span>
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
          gap: '8px',
          padding: '10px 18px',
          borderRadius: 'var(--colheita-radius-md)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          backgroundColor: 'transparent',
          color: 'rgb(185, 28, 28)',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          alignSelf: 'flex-start',
        }}
      >
        <AlertTriangle size={14} strokeWidth={1.75} />
        Solicitar exclusão da conta
      </button>
    );
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

      <label htmlFor={reasonId} style={{ display: 'none' }}>
        Motivo da solicitação
      </label>
      <textarea
        id={reasonId}
        name="reason"
        required
        minLength={10}
        maxLength={1000}
        disabled={pending}
        rows={4}
        placeholder="Conte rapidamente o motivo. Ajuda o time a entender e processar mais rápido."
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 'var(--colheita-radius-md)',
          border: '1px solid var(--colheita-border)',
          backgroundColor: 'var(--colheita-surface-elevated)',
          color: 'var(--colheita-text-primary)',
          fontSize: '0.9375rem',
          fontFamily: 'inherit',
          resize: 'vertical',
          minHeight: '100px',
        }}
      />
      {state?.fieldErrors?.reason && (
        <p style={{ fontSize: '0.75rem', color: 'var(--colheita-danger, #dc2626)', margin: 0 }}>
          {state.fieldErrors.reason}
        </p>
      )}

      <p
        style={{
          fontSize: '0.75rem',
          color: 'var(--colheita-text-tertiary)',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        Por segurança (LGPD art 18), o time da Argho verifica sua identidade antes de processar.
        Dados em pedidos confirmados são anonimizados, não excluídos (obrigação fiscal).
      </p>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="submit"
          disabled={pending}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--colheita-radius-md)',
            border: 'none',
            backgroundColor: pending ? 'var(--colheita-text-tertiary)' : 'rgb(185, 28, 28)',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: pending ? 'not-allowed' : 'pointer',
          }}
        >
          {pending ? 'Enviando…' : 'Enviar solicitação'}
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
