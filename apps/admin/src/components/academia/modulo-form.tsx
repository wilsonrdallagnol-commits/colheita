// apps/admin/src/components/academia/modulo-form.tsx
'use client';

import { Button, Input, Textarea } from '@colheita/ui';
import { useActionState, useId } from 'react';
import type { ModuloFormState } from '@/lib/actions/academia';

interface ModuloFormProps {
  action: (prevState: ModuloFormState, formData: FormData) => Promise<ModuloFormState>;
  nextSortOrder?: number;
}

export function ModuloForm({ action, nextSortOrder = 0 }: ModuloFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const titleId = useId();
  const descriptionId = useId();

  const labelStyle = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: 'var(--colheita-text-secondary)',
    marginBottom: '6px',
  };

  return (
    <form action={formAction}>
      <input type="hidden" name="sort_order" value={nextSortOrder} />

      {state?.error && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--colheita-error, #dc2626)',
            marginBottom: '12px',
          }}
        >
          {state.error}
        </p>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor={titleId} style={labelStyle}>
          Título do módulo *
        </label>
        <Input id={titleId} name="title" placeholder="Ex: Fundamentos da Nutrição Mineral" />
        {state?.fieldErrors?.title && (
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--colheita-error, #dc2626)',
              marginTop: '4px',
            }}
          >
            {state.fieldErrors.title}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor={descriptionId} style={labelStyle}>
          Descrição (opcional)
        </label>
        <Textarea
          id={descriptionId}
          name="description"
          placeholder="Breve descrição do que o aluno vai aprender neste módulo"
          rows={2}
        />
      </div>

      <Button type="submit" disabled={pending} size="sm" variant="outline">
        {pending ? 'Adicionando...' : '+ Adicionar módulo'}
      </Button>
    </form>
  );
}
