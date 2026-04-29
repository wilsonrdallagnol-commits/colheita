// apps/admin/src/components/produtos/produto-form.tsx
'use client';

import { Button, Input, Textarea } from '@colheita/ui';
import Link from 'next/link';
import { useActionState, useId } from 'react';
import type { ProdutoFormState } from '@/lib/actions/produtos';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Categoria {
  id: string;
  name: string;
  slug: string;
}

interface ProdutoFormProps {
  action: (prevState: ProdutoFormState, formData: FormData) => Promise<ProdutoFormState>;
  categorias: Categoria[];
  cancelHref: string;
  submitLabel?: string;
  defaultValues?: {
    name?: string;
    tagline?: string | null;
    description?: string | null;
    category_id?: string | null;
  };
}

// ── Estilos inline compartilhados ─────────────────────────────────────────────

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

const hintStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--colheita-text-tertiary)',
  marginTop: '4px',
};

// ── Componente ────────────────────────────────────────────────────────────────

export function ProdutoForm({
  action,
  categorias,
  cancelHref,
  submitLabel = 'Salvar',
  defaultValues = {},
}: ProdutoFormProps) {
  const [state, formAction, pending] = useActionState(action, null);

  // IDs únicos gerados por React — evita colisões em SSR e múltiplas instâncias
  const uid = useId();
  const nameId = `${uid}-name`;
  const nameErrorId = `${uid}-name-error`;
  const taglineId = `${uid}-tagline`;
  const categoryId = `${uid}-category`;
  const descriptionId = `${uid}-description`;

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Erro global */}
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
          placeholder="Ex: Xcensis"
          aria-describedby={state?.fieldErrors?.name ? nameErrorId : undefined}
        />
        {state?.fieldErrors?.name ? (
          <p id={nameErrorId} style={errorStyle}>
            {state.fieldErrors.name}
          </p>
        ) : (
          <p style={hintStyle}>O slug é gerado automaticamente a partir do nome.</p>
        )}
      </div>

      {/* Tagline */}
      <div>
        <label htmlFor={taglineId} style={labelStyle}>
          Tagline
        </label>
        <Input
          id={taglineId}
          name="tagline"
          type="text"
          disabled={pending}
          defaultValue={defaultValues.tagline ?? ''}
          placeholder="Ex: Multi-micronutriente foliar com EDTA e Lignossulfonatos"
        />
        {state?.fieldErrors?.tagline && <p style={errorStyle}>{state.fieldErrors.tagline}</p>}
      </div>

      {/* Categoria */}
      <div>
        <label htmlFor={categoryId} style={labelStyle}>
          Categoria
        </label>
        <select
          id={categoryId}
          name="category_id"
          disabled={pending}
          defaultValue={defaultValues.category_id ?? ''}
          style={{
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
          }}
        >
          <option value="">— Sem categoria —</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor={descriptionId} style={labelStyle}>
          Descrição
        </label>
        <Textarea
          id={descriptionId}
          name="description"
          rows={6}
          disabled={pending}
          defaultValue={defaultValues.description ?? ''}
          placeholder="Descrição técnica completa do produto..."
        />
        {state?.fieldErrors?.description && (
          <p style={errorStyle}>{state.fieldErrors.description}</p>
        )}
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
