'use client';

// apps/portal/src/components/conta/support-form.tsx
//
// Form pra abrir chamado de suporte humano. Em sucesso, mostra
// confirmacao + numero do ticket; em erro, mostra fieldErrors.

import { CheckCircle2 } from 'lucide-react';
import { useActionState, useId } from 'react';
import { type CreateSupportTicketState, createSupportTicket } from '@/lib/actions/suporte';

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

const helpStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--colheita-text-tertiary)',
  marginTop: '4px',
};

interface SupportFormProps {
  defaultProductSlug?: string | null;
}

export function SupportForm({ defaultProductSlug }: SupportFormProps) {
  const [state, formAction, pending] = useActionState<CreateSupportTicketState, FormData>(
    createSupportTicket,
    null,
  );
  const subjectId = useId();
  const bodyId = useId();
  const categoryId = useId();
  const urgencyId = useId();
  const productId = useId();

  if (state?.success) {
    return (
      <output
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '20px 24px',
          borderRadius: 'var(--colheita-radius-lg)',
          backgroundColor: 'var(--colheita-brand-secondary-soft, rgba(72,144,48,0.08))',
          border: '1px solid var(--colheita-brand-secondary-line, rgba(72,144,48,0.3))',
          color: 'var(--colheita-text-primary)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--colheita-brand-secondary, rgb(72,144,48))',
            fontSize: '0.9375rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} strokeWidth={2} />
          Chamado aberto com sucesso.
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'var(--colheita-text-secondary)',
            lineHeight: 1.55,
          }}
        >
          O time da Argho recebeu sua solicitação e vai responder via e-mail. Você também pode
          acompanhar o status em <strong>Meus chamados</strong>.
        </p>
        {state.ticketId && (
          <p
            style={{
              margin: 0,
              fontSize: '0.75rem',
              color: 'var(--colheita-text-tertiary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Protocolo #{state.ticketId.slice(0, 8)}
          </p>
        )}
      </output>
    );
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {state?.error && (
        <div
          role="alert"
          style={{
            padding: '12px 14px',
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

      {/* Categoria + Urgência side-by-side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label htmlFor={categoryId} style={labelStyle}>
            Categoria
          </label>
          <select
            id={categoryId}
            name="category"
            defaultValue="agronomic"
            disabled={pending}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="agronomic">Recomendação agronômica</option>
            <option value="commercial">Comercial / pedido</option>
            <option value="product">Produto específico</option>
            <option value="logistics">Logística / entrega</option>
            <option value="platform">Plataforma Colheita</option>
            <option value="other">Outros</option>
          </select>
        </div>
        <div>
          <label htmlFor={urgencyId} style={labelStyle}>
            Urgência
          </label>
          <select
            id={urgencyId}
            name="urgency"
            defaultValue="normal"
            disabled={pending}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="low">Baixa</option>
            <option value="normal">Normal (~1 dia útil)</option>
            <option value="high">Alta (janela do plantio)</option>
            <option value="urgent">Urgente (perda iminente)</option>
          </select>
        </div>
      </div>

      {/* Assunto */}
      <div>
        <label htmlFor={subjectId} style={labelStyle}>
          Assunto
        </label>
        <input
          id={subjectId}
          name="subject"
          type="text"
          required
          minLength={4}
          maxLength={200}
          disabled={pending}
          style={inputStyle}
          placeholder="Ex: Diagnóstico de cloraose intervenal em soja V4"
        />
        {state?.fieldErrors?.subject && <p style={errorStyle}>{state.fieldErrors.subject}</p>}
      </div>

      {/* Produto opcional */}
      <div>
        <label htmlFor={productId} style={labelStyle}>
          Produto relacionado (opcional)
        </label>
        <input
          id={productId}
          name="product_slug"
          type="text"
          defaultValue={defaultProductSlug ?? ''}
          maxLength={100}
          disabled={pending}
          style={inputStyle}
          placeholder="Ex: xcensis, defon, biovas"
        />
        <p style={helpStyle}>Slug do produto se a dúvida for sobre algo específico.</p>
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor={bodyId} style={labelStyle}>
          Descrição
        </label>
        <textarea
          id={bodyId}
          name="body"
          required
          minLength={10}
          maxLength={5000}
          disabled={pending}
          rows={8}
          style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical', minHeight: '160px' }}
          placeholder="Descreva o cenário em detalhe — cultura, estádio fenológico, sintomas, histórico de aplicação, condições de clima…"
        />
        {state?.fieldErrors?.body ? (
          <p style={errorStyle}>{state.fieldErrors.body}</p>
        ) : (
          <p style={helpStyle}>
            Quanto mais contexto, melhor a resposta. Inclua data, talhão, dosagens já aplicadas.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        style={{
          alignSelf: 'flex-start',
          padding: '10px 24px',
          borderRadius: 'var(--colheita-radius-md)',
          border: 'none',
          backgroundColor: pending
            ? 'var(--colheita-text-tertiary)'
            : 'var(--colheita-brand-primary)',
          color: '#ffffff',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: pending ? 'not-allowed' : 'pointer',
          marginTop: '8px',
        }}
      >
        {pending ? 'Enviando…' : 'Abrir chamado'}
      </button>
    </form>
  );
}
