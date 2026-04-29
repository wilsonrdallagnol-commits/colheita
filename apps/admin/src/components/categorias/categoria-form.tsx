// apps/admin/src/components/categorias/categoria-form.tsx
'use client';

import { Button, Input, Textarea } from '@colheita/ui';
import Link from 'next/link';
import { useActionState, useId } from 'react';
import type { CategoriaFormState } from '@/lib/actions/categorias';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface CategoriaFormProps {
  action: (prevState: CategoriaFormState, formData: FormData) => Promise<CategoriaFormState>;
  cancelHref?: string;
  submitLabel?: string;
  defaultValues?: {
    name?: string;
    description?: string | null;
  };
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: '500',
  color: 'var(--colheita-text-secondary)',
  marginBottom: '6px',
};

const errorStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--colheita-danger)',
  marginTop: '4px',
};

// ── Componente ────────────────────────────────────────────────────────────────

export function CategoriaForm({
  action,
  cancelHref = '/categorias',
  submitLabel = 'Salvar',
  defaultValues = {},
}: CategoriaFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const uid = useId();
  const nameId = `${uid}-name`;
  const descId = `${uid}-desc`;

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

      {/* Nome */}
      <div>
        <label htmlFor={nameId} style={labelStyle}>
          Nome <span style={{ color: 'var(--colheita-danger)' }}>*</span>
        </label>
        <Input
          id={nameId}
          name="name"
          type="text"
          required
          disabled={pending}
          defaultValue={defaultValues.name ?? ''}
          placeholder="Ex: Fertilizantes Minerais"
        />
        {state?.fieldErrors?.name && <p style={errorStyle}>{state.fieldErrors.name}</p>}
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor={descId} style={labelStyle}>
          Descrição
        </label>
        <Textarea
          id={descId}
          name="description"
          rows={3}
          disabled={pending}
          defaultValue={defaultValues.description ?? ''}
          placeholder="Descrição opcional da categoria..."
        />
      </div>

      {/* Ações */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          paddingTop: '8px',
          borderTop: '1px solid var(--colheita-border-subtle)',
        }}
      >
        <Button type="submit" disabled={pending}>
          {pending ? 'Salvando...' : submitLabel}
        </Button>
        <Button variant="ghost" asChild>
          <Link href={cancelHref}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
