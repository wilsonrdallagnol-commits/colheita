// apps/admin/src/components/academia/licao-form.tsx
'use client';

import { Button, Input, Textarea } from '@colheita/ui';
import { useActionState, useId, useState } from 'react';
import type { LicaoFormState } from '@/lib/actions/academia';

interface LicaoFormProps {
  action: (prevState: LicaoFormState, formData: FormData) => Promise<LicaoFormState>;
  nextSortOrder?: number;
  defaultValues?: {
    title?: string;
    type?: string;
    estimated_minutes?: number | null;
    is_required?: boolean;
    content_markdown?: string;
    content_url?: string;
  };
  submitLabel?: string;
  cancelHref?: string;
}

const LESSON_TYPES = [
  { value: 'article', label: 'Artigo (Markdown)' },
  { value: 'video', label: 'Vídeo' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'simulation', label: 'Simulação' },
  { value: 'document', label: 'Documento' },
  { value: 'interactive', label: 'Interativo' },
];

export function LicaoForm({
  action,
  nextSortOrder = 0,
  defaultValues,
  submitLabel = 'Salvar',
  cancelHref,
}: LicaoFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const [selectedType, setSelectedType] = useState(defaultValues?.type ?? 'article');

  const titleId = useId();
  const typeId = useId();
  const estimatedMinutesId = useId();
  const contentMarkdownId = useId();
  const contentUrlId = useId();
  const isRequiredId = useId();

  const labelStyle = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: 'var(--colheita-text-secondary)',
    marginBottom: '6px',
  };
  const fieldStyle = { marginBottom: '16px' };
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
      <input type="hidden" name="sort_order" value={nextSortOrder} />

      {state?.error && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'color-mix(in srgb, var(--colheita-error, #dc2626) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--colheita-error, #dc2626) 20%, transparent)',
            color: 'var(--colheita-error, #dc2626)',
            fontSize: '0.8125rem',
            marginBottom: '16px',
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
          placeholder="Ex: Introdução à Nutrição Mineral"
          defaultValue={defaultValues?.title ?? ''}
        />
        {state?.fieldErrors?.title && <p style={errorStyle}>{state.fieldErrors.title}</p>}
      </div>

      {/* Tipo + Duração estimada */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          ...fieldStyle,
        }}
      >
        <div>
          <label htmlFor={typeId} style={labelStyle}>
            Tipo
          </label>
          <select
            id={typeId}
            name="type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={selectStyle}
          >
            {LESSON_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={estimatedMinutesId} style={labelStyle}>
            Duração estimada (min)
          </label>
          <Input
            id={estimatedMinutesId}
            name="estimated_minutes"
            type="number"
            min="1"
            placeholder="Ex: 15"
            defaultValue={defaultValues?.estimated_minutes ?? ''}
          />
          {state?.fieldErrors?.estimated_minutes && (
            <p style={errorStyle}>{state.fieldErrors.estimated_minutes}</p>
          )}
        </div>
      </div>

      {/* Obrigatória */}
      <div style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="checkbox"
          id={isRequiredId}
          name="is_required"
          value="true"
          defaultChecked={defaultValues?.is_required ?? true}
          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
        />
        <label htmlFor={isRequiredId} style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
          Lição obrigatória para avançar
        </label>
      </div>

      {/* Conteúdo — dinâmico por tipo */}
      {selectedType === 'article' && (
        <div style={fieldStyle}>
          <label htmlFor={contentMarkdownId} style={labelStyle}>
            Conteúdo (Markdown)
          </label>
          <Textarea
            id={contentMarkdownId}
            name="content_markdown"
            placeholder="Escreva o conteúdo da lição em Markdown..."
            rows={10}
            defaultValue={defaultValues?.content_markdown ?? ''}
            style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.875rem' }}
          />
          {state?.fieldErrors?.content_markdown && (
            <p style={errorStyle}>{state.fieldErrors.content_markdown}</p>
          )}
        </div>
      )}

      {selectedType === 'video' && (
        <div style={fieldStyle}>
          <label htmlFor={contentUrlId} style={labelStyle}>
            URL do vídeo
          </label>
          <Input
            id={contentUrlId}
            name="content_url"
            placeholder="Ex: https://www.youtube.com/watch?v=..."
            defaultValue={defaultValues?.content_url ?? ''}
          />
          {state?.fieldErrors?.content_url && (
            <p style={errorStyle}>{state.fieldErrors.content_url}</p>
          )}
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--colheita-text-tertiary)',
              marginTop: '4px',
            }}
          >
            URL do YouTube, Vimeo ou link direto para arquivo de vídeo
          </p>
        </div>
      )}

      {!['article', 'video'].includes(selectedType) && (
        <div
          style={{
            ...fieldStyle,
            padding: '12px 16px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'var(--colheita-surface-card)',
            border: '1px solid var(--colheita-border-subtle)',
          }}
        >
          <p style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-tertiary)', margin: 0 }}>
            O conteúdo deste tipo de lição é configurado via SDK ou integração externa.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <Button type="submit" disabled={pending} size="sm">
          {pending ? 'Salvando...' : submitLabel}
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
