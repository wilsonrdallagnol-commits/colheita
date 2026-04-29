// apps/admin/src/components/academia/trilha-form.tsx
'use client';

import { Button, Input, Textarea } from '@colheita/ui';
import { useActionState, useId } from 'react';
import type { TrilhaFormState } from '@/lib/actions/academia';

interface TrilhaFormProps {
  action: (prevState: TrilhaFormState, formData: FormData) => Promise<TrilhaFormState>;
  defaultValues?: {
    title?: string;
    subtitle?: string | null;
    description?: string | null;
    level?: string;
    status?: string;
    audience?: string[] | null;
    grants_certification?: boolean;
  };
  submitLabel?: string;
}

const LEVELS = [
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
  { value: 'expert', label: 'Especialista' },
];

const STATUSES = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
];

export function TrilhaForm({ action, defaultValues, submitLabel = 'Salvar' }: TrilhaFormProps) {
  const [state, formAction, pending] = useActionState(action, null);

  const titleId = useId();
  const subtitleId = useId();
  const descriptionId = useId();
  const levelId = useId();
  const statusId = useId();
  const audienceId = useId();

  const fieldStyle = { marginBottom: '24px' };
  const labelStyle = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: 'var(--colheita-text-secondary)',
    marginBottom: '6px',
  };
  const errorStyle = {
    fontSize: '0.75rem',
    color: 'var(--colheita-error, #dc2626)',
    marginTop: '4px',
  };
  const selectStyle = {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    borderRadius: 'var(--colheita-radius-md)',
    border: '1px solid var(--colheita-border)',
    backgroundColor: 'var(--colheita-surface-elevated)',
    color: 'var(--colheita-text-primary)',
    fontSize: '0.9375rem',
    outline: 'none',
  };

  return (
    <form action={formAction}>
      {state?.error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'color-mix(in srgb, var(--colheita-error, #dc2626) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--colheita-error, #dc2626) 20%, transparent)',
            color: 'var(--colheita-error, #dc2626)',
            fontSize: '0.875rem',
            marginBottom: '24px',
          }}
        >
          {state.error}
        </div>
      )}

      {/* Título */}
      <div style={fieldStyle}>
        <label htmlFor={titleId} style={labelStyle}>
          Título *
        </label>
        <Input
          id={titleId}
          name="title"
          placeholder="Ex: Nutrição de Plantas para Distribuidores"
          defaultValue={defaultValues?.title ?? ''}
        />
        {state?.fieldErrors?.title && <p style={errorStyle}>{state.fieldErrors.title}</p>}
      </div>

      {/* Subtítulo */}
      <div style={fieldStyle}>
        <label htmlFor={subtitleId} style={labelStyle}>
          Subtítulo
        </label>
        <Input
          id={subtitleId}
          name="subtitle"
          placeholder="Frase curta de apoio ao título"
          defaultValue={defaultValues?.subtitle ?? ''}
        />
      </div>

      {/* Descrição */}
      <div style={fieldStyle}>
        <label htmlFor={descriptionId} style={labelStyle}>
          Descrição
        </label>
        <Textarea
          id={descriptionId}
          name="description"
          placeholder="Descrição completa da trilha (objetivos, conteúdo, etc.)"
          rows={4}
          defaultValue={defaultValues?.description ?? ''}
        />
      </div>

      {/* Nível + Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', ...fieldStyle }}>
        <div>
          <label htmlFor={levelId} style={labelStyle}>
            Nível
          </label>
          <select
            id={levelId}
            name="level"
            defaultValue={defaultValues?.level ?? 'beginner'}
            style={selectStyle}
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={statusId} style={labelStyle}>
            Status
          </label>
          <select
            id={statusId}
            name="status"
            defaultValue={defaultValues?.status ?? 'draft'}
            style={selectStyle}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Público-alvo */}
      <div style={fieldStyle}>
        <label htmlFor={audienceId} style={labelStyle}>
          Público-alvo (separado por vírgula)
        </label>
        <Input
          id={audienceId}
          name="audience"
          placeholder="Ex: Distribuidores, Técnicos, Vendedores"
          defaultValue={(defaultValues?.audience ?? []).join(', ')}
        />
        <p
          style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)', marginTop: '4px' }}
        >
          Separe múltiplos públicos por vírgula
        </p>
      </div>

      {/* Certificado */}
      <div style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="checkbox"
          id="grants_certification"
          name="grants_certification"
          value="true"
          defaultChecked={defaultValues?.grants_certification ?? false}
          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
        />
        <label
          htmlFor="grants_certification"
          style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}
        >
          Emite certificado ao concluir
        </label>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Button type="submit" disabled={pending} size="sm">
          {pending ? 'Salvando...' : submitLabel}
        </Button>
        <Button type="button" variant="ghost" size="sm" asChild>
          <a href="/academia">Cancelar</a>
        </Button>
      </div>
    </form>
  );
}
