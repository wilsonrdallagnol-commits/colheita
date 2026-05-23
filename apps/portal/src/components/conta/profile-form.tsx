'use client';

// apps/portal/src/components/conta/profile-form.tsx
//
// Form de edição de perfil do distribuidor. Campos: nome completo,
// telefone, empresa. Email é read-only (login do supabase auth).

import { CheckCircle2 } from 'lucide-react';
import { useActionState, useId } from 'react';
import { type UpdateProfileState, updateProfile } from '@/lib/actions/conta';

interface ProfileFormProps {
  email: string;
  defaultValues: {
    full_name: string;
    phone: string;
    company: string;
  };
}

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

export function ProfileForm({ email, defaultValues }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState<UpdateProfileState, FormData>(
    updateProfile,
    null,
  );
  const emailId = useId();
  const fullNameId = useId();
  const phoneId = useId();
  const companyId = useId();

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

      {state?.success && (
        <output
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'var(--colheita-brand-secondary-soft, rgba(72,144,48,0.08))',
            border: '1px solid var(--colheita-brand-secondary-line, rgba(72,144,48,0.3))',
            color: 'var(--colheita-brand-secondary, rgb(72,144,48))',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={16} strokeWidth={2} />
          Perfil atualizado.
        </output>
      )}

      {/* Email read-only */}
      <div>
        <label htmlFor={emailId} style={labelStyle}>
          E-mail (login)
        </label>
        <input
          id={emailId}
          type="email"
          value={email}
          readOnly
          style={{
            ...inputStyle,
            backgroundColor: 'var(--colheita-surface)',
            color: 'var(--colheita-text-tertiary)',
            cursor: 'not-allowed',
          }}
        />
        <p style={{ ...errorStyle, color: 'var(--colheita-text-tertiary)' }}>
          Pra alterar e-mail, fale com a Argho.
        </p>
      </div>

      {/* Nome */}
      <div>
        <label htmlFor={fullNameId} style={labelStyle}>
          Nome completo
        </label>
        <input
          id={fullNameId}
          name="full_name"
          type="text"
          defaultValue={defaultValues.full_name}
          maxLength={200}
          disabled={pending}
          style={inputStyle}
          placeholder="Ex: Carlos Andrade"
        />
        {state?.fieldErrors?.full_name && <p style={errorStyle}>{state.fieldErrors.full_name}</p>}
      </div>

      {/* Telefone */}
      <div>
        <label htmlFor={phoneId} style={labelStyle}>
          Telefone (WhatsApp preferencial)
        </label>
        <input
          id={phoneId}
          name="phone"
          type="tel"
          defaultValue={defaultValues.phone}
          maxLength={30}
          disabled={pending}
          style={inputStyle}
          placeholder="(45) 99999-9999"
        />
        {state?.fieldErrors?.phone && <p style={errorStyle}>{state.fieldErrors.phone}</p>}
      </div>

      {/* Empresa */}
      <div>
        <label htmlFor={companyId} style={labelStyle}>
          Empresa / Razão social
        </label>
        <input
          id={companyId}
          name="company"
          type="text"
          defaultValue={defaultValues.company}
          maxLength={200}
          disabled={pending}
          style={inputStyle}
          placeholder="Ex: Distribuidora Agro do Oeste"
        />
        {state?.fieldErrors?.company && <p style={errorStyle}>{state.fieldErrors.company}</p>}
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
        {pending ? 'Salvando…' : 'Salvar alterações'}
      </button>
    </form>
  );
}
