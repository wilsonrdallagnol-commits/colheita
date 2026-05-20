'use client';

// apps/admin/src/components/compliance/registro-form.tsx
//
// Form de registro regulatorio (MAPA/ANVISA/IBAMA). Usado em /compliance/novo
// e /compliance/[id]/editar.
//
// Server actions sao tipadas via useActionState (Next 15 / React 19).

import { Button } from '@colheita/ui';
import Link from 'next/link';
import { useActionState } from 'react';
import type { RegistroFormState, RegStatus } from '@/lib/actions/regulatorio';

interface ProductOption {
  id: string;
  name: string;
  slug: string;
}

interface RegistroFormProps {
  action: (state: RegistroFormState, formData: FormData) => Promise<RegistroFormState>;
  cancelHref: string;
  submitLabel: string;
  products: ProductOption[];
  /** Quando editando, product_id eh imutavel (so muda outras propriedades) */
  productLocked?: boolean;
  defaultValues?: {
    product_id?: string;
    authority?: string;
    registration_no?: string;
    issued_at?: string | null;
    expires_at?: string | null;
    status?: RegStatus;
    document_url?: string | null;
    notes?: string | null;
  };
}

const AUTHORITIES = [
  { value: 'MAPA', label: 'MAPA' },
  { value: 'ANVISA', label: 'ANVISA' },
  { value: 'IBAMA', label: 'IBAMA' },
  { value: 'STATE', label: 'Estadual' },
  { value: 'OTHER', label: 'Outro' },
];

const STATUSES: { value: RegStatus; label: string }[] = [
  { value: 'active', label: 'Ativo' },
  { value: 'pending', label: 'Pendente' },
  { value: 'expired', label: 'Expirado' },
  { value: 'revoked', label: 'Revogado' },
];

export function RegistroForm({
  action,
  cancelHref,
  submitLabel,
  products,
  productLocked = false,
  defaultValues,
}: RegistroFormProps) {
  const [state, formAction, isPending] = useActionState<RegistroFormState, FormData>(action, null);

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Produto */}
      <Field label="Produto *" htmlFor="product_id" error={state?.fieldErrors?.product_id}>
        <select
          id="product_id"
          name="product_id"
          defaultValue={defaultValues?.product_id ?? ''}
          required
          disabled={productLocked}
          style={selectStyle}
        >
          <option value="">— escolha um produto —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      {/* Autoridade */}
      <Field label="Autoridade *" htmlFor="authority" error={state?.fieldErrors?.authority}>
        <select
          id="authority"
          name="authority"
          defaultValue={defaultValues?.authority ?? 'MAPA'}
          required
          style={selectStyle}
        >
          {AUTHORITIES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Numero do registro */}
      <Field
        label="Número do registro *"
        htmlFor="registration_no"
        hint="Ex: 12345-6, conforme cadastro na autoridade"
        error={state?.fieldErrors?.registration_no}
      >
        <input
          id="registration_no"
          name="registration_no"
          type="text"
          defaultValue={defaultValues?.registration_no ?? ''}
          required
          maxLength={100}
          style={inputStyle}
        />
      </Field>

      {/* Datas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Field label="Emissão" htmlFor="issued_at" error={state?.fieldErrors?.issued_at}>
          <input
            id="issued_at"
            name="issued_at"
            type="date"
            defaultValue={defaultValues?.issued_at ?? ''}
            style={inputStyle}
          />
        </Field>
        <Field label="Vencimento" htmlFor="expires_at" error={state?.fieldErrors?.expires_at}>
          <input
            id="expires_at"
            name="expires_at"
            type="date"
            defaultValue={defaultValues?.expires_at ?? ''}
            style={inputStyle}
          />
        </Field>
      </div>

      {/* Status */}
      <Field label="Status" htmlFor="status">
        <select
          id="status"
          name="status"
          defaultValue={defaultValues?.status ?? 'active'}
          style={selectStyle}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Document URL */}
      <Field label="URL do documento" htmlFor="document_url" hint="Link pro PDF oficial (opcional)">
        <input
          id="document_url"
          name="document_url"
          type="url"
          defaultValue={defaultValues?.document_url ?? ''}
          placeholder="https://..."
          style={inputStyle}
        />
      </Field>

      {/* Notes */}
      <Field label="Observações" htmlFor="notes" error={state?.fieldErrors?.notes}>
        <textarea
          id="notes"
          name="notes"
          defaultValue={defaultValues?.notes ?? ''}
          rows={3}
          style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', fontFamily: 'inherit' }}
        />
      </Field>

      {/* Erro top-level */}
      {state?.error ? (
        <p
          role="alert"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--colheita-danger)',
            padding: '10px 12px',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            margin: 0,
          }}
        >
          {state.error}
        </p>
      ) : null}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <Button asChild variant="outline" size="sm">
          <Link href={cancelHref}>Cancelar</Link>
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Salvando…' : submitLabel}
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
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--colheita-text-primary)',
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

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};
