// apps/admin/src/components/academia/modulo-edit-form.tsx
'use client';

import { Button, Input, Textarea } from '@colheita/ui';
import { useActionState, useId } from 'react';
import type { ModuloFormState } from '@/lib/actions/academia';

interface ModuloEditFormProps {
  action: (prevState: ModuloFormState, formData: FormData) => Promise<ModuloFormState>;
  defaultValues?: { title?: string; description?: string | null };
  cancelHref?: string;
}

export function ModuloEditForm({ action, defaultValues, cancelHref }: ModuloEditFormProps) {
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
  const fieldStyle = { marginBottom: '20px' };
  const errorStyle = {
    fontSize: '0.75rem',
    color: 'var(--colheita-error, #dc2626)',
    marginTop: '4px',
  };

  return (
    <form action={formAction}>
      {state?.error && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'color-mix(in srgb, var(--colheita-error, #dc2626) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--colheita-error, #dc2626) 20%, transparent)',
            color: 'var(--colheita-error, #dc2626)',
            fontSize: '0.8125rem',
            marginBottom: '20px',
          }}
        >
          {state.error}
        </div>
      )}

      <div style={fieldStyle}>
        <label htmlFor={titleId} style={labelStyle}>
          Título do módulo *
        </label>
        <Input
          id={titleId}
          name="title"
          placeholder="Ex: Fundamentos da Nutrição Mineral"
          defaultValue={defaultValues?.title ?? ''}
        />
        {state?.fieldErrors?.title && <p style={errorStyle}>{state.fieldErrors.title}</p>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor={descriptionId} style={labelStyle}>
          Descrição (opcional)
        </label>
        <Textarea
          id={descriptionId}
          name="description"
          placeholder="Breve descrição do que o aluno vai aprender neste módulo"
          rows={3}
          defaultValue={defaultValues?.description ?? ''}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Button type="submit" disabled={pending} size="sm">
          {pending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
        {cancelHref && (
          <Button type="button" variant="ghost" size="sm" asChild>
            <a href={cancelHref}>Cancelar</a>
          </Button>
        )}
      </div>
    </form>
  );
}
