'use client';

// apps/admin/src/app/(dashboard)/midias/[id]/asset-edit-form.tsx
//
// Formulário para editar metadata + organização + direitos de uso de um asset.
// Camada 4 (DAM): tags pra busca, license pra direitos, expires_at pra licenças
// com prazo. Tudo numa form única com useActionState pra feedback inline.

import { Button, Input, Textarea } from '@colheita/ui';
import { useActionState, useId } from 'react';
import { updateAsset } from './actions';

type AssetLicense = 'internal' | 'public' | 'restricted' | 'licensed';

interface AssetEditFormProps {
  id: string;
  title: string;
  altText: string;
  tags: string[];
  license: AssetLicense;
  licenseNotes: string;
  expiresAt: string | null;
  isImage: boolean;
}

const LICENSE_OPTIONS: Array<{ value: AssetLicense; label: string; help: string }> = [
  {
    value: 'internal',
    label: 'Interno (Argho)',
    help: 'Uso restrito ao tenant. Asset proprietário, sem prazo.',
  },
  {
    value: 'public',
    label: 'Público',
    help: 'Pode ser distribuído externamente sem restrição (logos, favicon, mockups oficiais).',
  },
  {
    value: 'restricted',
    label: 'Restrito',
    help: 'Uso interno apenas em contextos específicos. Detalhar nas observações abaixo.',
  },
  {
    value: 'licensed',
    label: 'Licenciado de terceiro',
    help: 'Asset de terceiro com licença ativa. Preencher prazo e notas obrigatoriamente.',
  },
];

export function AssetEditForm({
  id,
  title,
  altText,
  tags,
  license,
  licenseNotes,
  expiresAt,
  isImage,
}: AssetEditFormProps) {
  const [state, formAction, isPending] = useActionState(updateAsset, undefined);
  const titleId = useId();
  const altTextId = useId();
  const tagsId = useId();
  const licenseId = useId();
  const licenseNotesId = useId();
  const expiresAtId = useId();
  const tagsString = tags.join(', ');

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />

      <div style={{ marginBottom: '20px' }}>
        <label
          htmlFor={titleId}
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
          id={titleId}
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
            htmlFor={altTextId}
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
            id={altTextId}
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

      {/* ── Tags ────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <label
          htmlFor={tagsId}
          style={{
            display: 'block',
            fontSize: '0.8125rem',
            fontWeight: '500',
            color: 'var(--colheita-text-primary)',
            marginBottom: '6px',
          }}
        >
          Tags
        </label>
        <Input
          id={tagsId}
          name="tags"
          defaultValue={tagsString}
          placeholder="hero, soja, embalagem, lifeon (separadas por vírgula)"
          disabled={isPending}
        />
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--colheita-text-tertiary)',
            marginTop: '4px',
          }}
        >
          Separe por vírgula. Lowercase, máx 30 chars cada, máx 30 tags. Use pra busca rápida.
        </p>
      </div>

      {/* ── Direitos de uso ────────────────────────────────────────────── */}
      <div
        style={{
          marginBottom: '20px',
          paddingTop: '20px',
          borderTop: '1px solid var(--colheita-border-subtle)',
        }}
      >
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: '700',
            color: 'var(--colheita-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '14px',
          }}
        >
          Direitos de uso
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor={licenseId}
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: '500',
              color: 'var(--colheita-text-primary)',
              marginBottom: '6px',
            }}
          >
            Licença
          </label>
          <select
            id={licenseId}
            name="license"
            defaultValue={license}
            disabled={isPending}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--colheita-radius-md)',
              border: '1px solid var(--colheita-border)',
              backgroundColor: 'var(--colheita-surface-elevated)',
              color: 'var(--colheita-text-primary)',
              fontSize: '0.875rem',
            }}
          >
            {LICENSE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--colheita-text-tertiary)',
              marginTop: '4px',
            }}
          >
            {LICENSE_OPTIONS.find((o) => o.value === license)?.help ?? LICENSE_OPTIONS[0]?.help}
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor={licenseNotesId}
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: '500',
              color: 'var(--colheita-text-primary)',
              marginBottom: '6px',
            }}
          >
            Observações de licença
          </label>
          <Textarea
            id={licenseNotesId}
            name="license_notes"
            defaultValue={licenseNotes}
            placeholder="Ex: licença Adobe Stock #12345, válida até 2027"
            rows={2}
            disabled={isPending}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div>
          <label
            htmlFor={expiresAtId}
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: '500',
              color: 'var(--colheita-text-primary)',
              marginBottom: '6px',
            }}
          >
            Vence em
          </label>
          <Input
            id={expiresAtId}
            name="expires_at"
            type="date"
            defaultValue={expiresAt ?? ''}
            disabled={isPending}
          />
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--colheita-text-tertiary)',
              marginTop: '4px',
            }}
          >
            Obrigatório pra licença "licenciada de terceiro". Deixe em branco se for permanente.
          </p>
        </div>
      </div>

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
