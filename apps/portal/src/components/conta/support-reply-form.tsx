'use client';

// apps/portal/src/components/conta/support-reply-form.tsx
//
// Form do distribuidor responder em chamado proprio. Versao simples
// (sem checkbox is_internal — distribuidor so manda mensagens publicas).

import { useActionState, useId } from 'react';
import { type ReplyTicketState, replyToOwnTicket } from '@/lib/actions/suporte-reply';

interface SupportReplyFormProps {
  ticketId: string;
  ticketStatus: string;
}

export function SupportReplyForm({ ticketId, ticketStatus }: SupportReplyFormProps) {
  const boundAction = replyToOwnTicket.bind(null, ticketId);
  const [state, formAction, pending] = useActionState<ReplyTicketState, FormData>(
    boundAction,
    null,
  );
  const bodyId = useId();

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
        Este chamado foi fechado. Pra continuar a conversa, abra um novo chamado.
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
          Mensagem enviada.
        </output>
      )}

      <label htmlFor={bodyId} style={{ display: 'none' }}>
        Resposta
      </label>
      <textarea
        id={bodyId}
        name="body"
        required
        rows={4}
        maxLength={10000}
        disabled={pending}
        placeholder="Sua mensagem pro agrônomo…"
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
      {state?.fieldErrors?.body && (
        <p style={{ fontSize: '0.75rem', color: 'var(--colheita-danger, #dc2626)', margin: 0 }}>
          {state.fieldErrors.body}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        style={{
          alignSelf: 'flex-start',
          padding: '10px 22px',
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
    </form>
  );
}
