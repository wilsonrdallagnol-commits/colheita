// apps/admin/src/components/leads/lead-form.tsx
'use client';

// Camada 7 (CRM) — formulario reusavel pra criar e editar leads.
//
// Mesma forma do ProdutoForm: useActionState + fieldErrors granular,
// state.error pra falha global. Suporta tanto createLead quanto
// updateLead via prop `action` polimorfica.

import { Button, Input, Textarea } from '@colheita/ui';
import Link from 'next/link';
import { useActionState, useId } from 'react';
import type { LeadFormState } from '@/lib/actions/leads';

type LeadAction = (prev: LeadFormState, formData: FormData) => Promise<LeadFormState>;

type LeadSource =
  | 'website'
  | 'whatsapp'
  | 'evento'
  | 'indicacao'
  | 'cold-outreach'
  | 'distribuidor'
  | 'feira'
  | 'other';

const SOURCE_OPTIONS: Array<{ value: LeadSource; label: string }> = [
  { value: 'website', label: 'Site institucional' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'evento', label: 'Evento' },
  { value: 'feira', label: 'Feira' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'distribuidor', label: 'Distribuidor' },
  { value: 'cold-outreach', label: 'Cold outreach' },
  { value: 'other', label: 'Outro' },
];

interface LeadFormProps {
  action: LeadAction;
  cancelHref: string;
  submitLabel?: string;
  defaultValues?: {
    name?: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    cpf_cnpj?: string | null;
    source?: LeadSource;
    state?: string | null;
    city?: string | null;
    cultura?: string | null;
    area_hectares?: number | null;
    notes?: string | null;
    next_followup_at?: string | null;
  };
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: 'var(--colheita-text-secondary)',
  marginBottom: '6px',
};

const errorStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--colheita-danger)',
  marginTop: '4px',
};

const hintStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--colheita-text-tertiary)',
  marginTop: '4px',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  height: '36px',
  padding: '0 12px',
  borderRadius: 'var(--colheita-radius-md)',
  border: '1px solid var(--colheita-border)',
  backgroundColor: 'var(--colheita-surface-elevated)',
  color: 'var(--colheita-text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  cursor: 'pointer',
};

function formatDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  // Format YYYY-MM-DDTHH:mm pra <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function LeadForm({
  action,
  cancelHref,
  submitLabel = 'Salvar',
  defaultValues = {},
}: LeadFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const uid = useId();

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {state?.error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'color-mix(in srgb, var(--colheita-danger) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--colheita-danger) 30%, transparent)',
            borderRadius: 'var(--colheita-radius-md)',
            fontSize: '0.875rem',
            color: 'var(--colheita-danger)',
          }}
        >
          {state.error}
        </div>
      )}

      {/* Identificação */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label htmlFor={`${uid}-name`} style={labelStyle}>
            Nome <span style={{ color: 'var(--colheita-danger)' }}>*</span>
          </label>
          <Input
            id={`${uid}-name`}
            name="name"
            type="text"
            required
            disabled={pending}
            defaultValue={defaultValues.name ?? ''}
            placeholder="Ex: João da Silva"
          />
          {state?.fieldErrors?.name && <p style={errorStyle}>{state.fieldErrors.name}</p>}
        </div>

        <div>
          <label htmlFor={`${uid}-company`} style={labelStyle}>
            Empresa
          </label>
          <Input
            id={`${uid}-company`}
            name="company"
            type="text"
            disabled={pending}
            defaultValue={defaultValues.company ?? ''}
            placeholder="Ex: Fazenda Boa Esperança"
          />
        </div>
      </div>

      {/* Contato */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <label htmlFor={`${uid}-email`} style={labelStyle}>
            Email
          </label>
          <Input
            id={`${uid}-email`}
            name="email"
            type="email"
            disabled={pending}
            defaultValue={defaultValues.email ?? ''}
            placeholder="email@exemplo.com.br"
          />
          {state?.fieldErrors?.email && <p style={errorStyle}>{state.fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor={`${uid}-phone`} style={labelStyle}>
            Telefone / WhatsApp
          </label>
          <Input
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            disabled={pending}
            defaultValue={defaultValues.phone ?? ''}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label htmlFor={`${uid}-cpf-cnpj`} style={labelStyle}>
            CPF/CNPJ
          </label>
          <Input
            id={`${uid}-cpf-cnpj`}
            name="cpf_cnpj"
            type="text"
            disabled={pending}
            defaultValue={defaultValues.cpf_cnpj ?? ''}
            placeholder="000.000.000-00"
          />
        </div>
      </div>

      {/* Origem */}
      <div>
        <label htmlFor={`${uid}-source`} style={labelStyle}>
          Origem
        </label>
        <select
          id={`${uid}-source`}
          name="source"
          disabled={pending}
          defaultValue={defaultValues.source ?? 'other'}
          style={selectStyle}
        >
          {SOURCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p style={hintStyle}>Como o lead chegou — usado pra atribuição de canal.</p>
      </div>

      {/* Localização + cultura */}
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <label htmlFor={`${uid}-state`} style={labelStyle}>
            UF
          </label>
          <Input
            id={`${uid}-state`}
            name="state"
            type="text"
            maxLength={2}
            disabled={pending}
            defaultValue={defaultValues.state ?? ''}
            placeholder="MT"
            style={{ textTransform: 'uppercase' }}
          />
          {state?.fieldErrors?.state && <p style={errorStyle}>{state.fieldErrors.state}</p>}
        </div>

        <div>
          <label htmlFor={`${uid}-city`} style={labelStyle}>
            Cidade
          </label>
          <Input
            id={`${uid}-city`}
            name="city"
            type="text"
            disabled={pending}
            defaultValue={defaultValues.city ?? ''}
            placeholder="Sorriso"
          />
        </div>

        <div>
          <label htmlFor={`${uid}-cultura`} style={labelStyle}>
            Cultura
          </label>
          <Input
            id={`${uid}-cultura`}
            name="cultura"
            type="text"
            disabled={pending}
            defaultValue={defaultValues.cultura ?? ''}
            placeholder="soja, milho, algodão…"
          />
        </div>

        <div>
          <label htmlFor={`${uid}-area`} style={labelStyle}>
            Área (ha)
          </label>
          <Input
            id={`${uid}-area`}
            name="area_hectares"
            type="text"
            inputMode="decimal"
            disabled={pending}
            defaultValue={defaultValues.area_hectares?.toString() ?? ''}
            placeholder="2500"
          />
          {state?.fieldErrors?.area_hectares && (
            <p style={errorStyle}>{state.fieldErrors.area_hectares}</p>
          )}
        </div>
      </div>

      {/* Follow-up */}
      <div>
        <label htmlFor={`${uid}-followup`} style={labelStyle}>
          Próximo follow-up
        </label>
        <Input
          id={`${uid}-followup`}
          name="next_followup_at"
          type="datetime-local"
          disabled={pending}
          defaultValue={formatDateTimeLocal(defaultValues.next_followup_at)}
        />
        {state?.fieldErrors?.next_followup_at && (
          <p style={errorStyle}>{state.fieldErrors.next_followup_at}</p>
        )}
        <p style={hintStyle}>Quando contactar de novo. Aparece como alerta na lista.</p>
      </div>

      {/* Notas */}
      <div>
        <label htmlFor={`${uid}-notes`} style={labelStyle}>
          Notas
        </label>
        <Textarea
          id={`${uid}-notes`}
          name="notes"
          rows={4}
          disabled={pending}
          defaultValue={defaultValues.notes ?? ''}
          placeholder="Histórico da conversa, dores levantadas, próximos passos…"
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
        <Button type="submit" disabled={pending}>
          {pending ? 'Salvando…' : submitLabel}
        </Button>
        <Button asChild variant="outline" disabled={pending}>
          <Link href={cancelHref}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
