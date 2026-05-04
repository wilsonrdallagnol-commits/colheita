'use client';

// apps/admin/src/app/(dashboard)/midias/[id]/asset-edit-form.tsx
//
// Formulário para editar título e alt text de um asset.
// Usa useActionState para feedback inline sem redirect.

import { Button, Input, Textarea } from '@colheita/ui';
import { useActionState } from 'react';
import { updateAsset } from './actions';

interface AssetEditFormProps {
  id: string;
  title: string;
  altText: string;
  isImage: boolean;
}

export function AssetEditForm({ id, title, altText, isImage }: AssetEditFormProps) {
  const [state, formAction, isPending] = useActionState(updateAsset, undefined);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />

      <div style={{ marginBottom: '20px' }}>
        <label
          htmlFor="title"
          style={{
            display: 'block',
            fontSize: '0.8125rem',
            fontWeight: '500',
            color: 'var(--colheita-text-primary)',
            marginBottom: '6px',
          }}
        >
          Título
        </label>
        <Input
          id="title"
          name="title"
          defaultValue={title}
          placeholder="Nome descritivo do arquivo"
          disabled={isPending}
        />
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--colheita-text-tertiary)',
            marginTop: '4px',
          }}
        >
          Usado para busca e organização interna.
        </p>
      </div>

      {isImage && (
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="alt_text"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: '500',
              color: 'var(--colheita-text-primary)',
              marginBottom: '6px',
            }}
          >
            Texto alternativo (alt)
          </label>
          <Textarea
            id="alt_text"
            name="alt_text"
            defaultValue={altText}
            placeholder="Descreva a imagem para acessibilidade"
            rows={3}
            disabled={isPending}
            style={{ resize: 'vertical' }}
          />
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--colheita-text-tertiary)',
              marginTop: '4px',
            }}
          >
            Exibido quando a imagem não carrega e usado por leitores de tela.
          </p>
        </div>
      )}

      {/* Feedback */}
      {state?.success && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--colheita-success-subtle, rgba(52,199,89,0.1))',
            border: '1px solid rgba(52,199,89,0.25)',
            borderRadius: 'var(--colheita-radius-sm)',
            fontSize: '0.8125rem',
            color: 'var(--colheita-success, #34c759)',
            marginBottom: '16px',
          }}
        >
          ✓ Salvo com sucesso.
        </div>
      )}

      {state?.error && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 'var(--colheita-radius-sm)',
            fontSize: '0.8125rem',
            color: '#ef4444',
            marginBottom: '16px',
          }}
        >
          {state.error}
        </div>
      )}

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? 'Salvando…' : 'Salvar alterações'}
      </Button>
    </form>
  );
}
