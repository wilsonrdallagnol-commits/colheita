'use client';

// apps/admin/src/components/suporte/reply-form.tsx
//
// Form de resposta dentro do thread de um support_ticket.
// Suporta is_internal=true (nota privada visivel so pro staff) via checkbox.

import { useActionState, useId } from 'react';
import { type ReplyTicketState, replyToTicket } from '@/lib/actions/suporte';

interface ReplyFormProps {
  ticketId: string;
  ticketStatus: string;
}

export function ReplyForm({ ticketId, ticketStatus }: ReplyFormProps) {
  const boundAction = replyToTicket.bind(null, ticketId);
  const [state, formAction, pending] = useActionState<ReplyTicketState, FormData>(
    boundAction,
    null,
  );
  const bodyId = useId();
  const internalId = useId();

  if (ticketStatus === 'closed') {
    return (
      <div
        style={{
          padding: '16px 18px',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--colheita-text-tertiary)',
          backgroundColor: 'var(--colheita-surface-elevated)',
          border: '1px dashed var(--colheita-border)',
          borderRadius: 'var(--colheita-radius-md)',
        }}
      >
        Este chamado foi fechado. Para reabrir, mude o status acima.
      </div>
    );
  }

  return (
    <form
      action={formAction}
      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      key={state?.success ? `success-${Date.now()}` : 'draft'}
    >
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

      {state?.success && (
        <output
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'var(--colheita-brand-secondary-soft, rgba(72,144,48,0.08))',
            border: '1px solid var(--colheita-brand-secondary-line, rgba(72,144,48,0.3))',
            color: 'var(--colheita-brand-secondary, rgb(72,144,48))',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          Resposta enviada.
        </output>
      )}

      <label htmlFor={bodyId} style={{ display: 'none' }}>
        Resposta
      </label>
      <textarea
        id={bodyId}
        name="body"
        required
        rows={5}
        maxLength={10000}
        disabled={pending}
        placeholder="Resposta pro distribuidor (markdown não renderizado)…"
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
          minHeight: '120px',
        }}
      />
      {state?.fieldErrors?.body && (
        <p style={{ fontSize: '0.75rem', color: 'var(--colheita-danger, #dc2626)', margin: 0 }}>
          {state.fieldErrors.body}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <label
          htmlFor={internalId}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8125rem',
            color: 'var(--colheita-text-secondary)',
            cursor: 'pointer',
          }}
        >
          <input
            id={internalId}
            name="is_internal"
            type="checkbox"
            disabled={pending}
            style={{ cursor: 'pointer' }}
          />
          Nota interna (visível só pro time)
        </label>
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
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: pending ? 'not-allowed' : 'pointer',
          }}
        >
          {pending ? 'Enviando…' : 'Enviar resposta'}
        </button>
      </div>
    </form>
  );
}
