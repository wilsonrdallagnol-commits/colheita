'use client';

// apps/admin/src/components/produtos/product-asset-uploader.tsx
//
// Uploader inline pra anexar documento (MSDS, certificado, ficha, etc) ao
// produto. Fluxo:
//   1. User escolhe role (dropdown) + arquivo (input file)
//   2. Upload via POST /api/midias/upload (cria row em assets, dedup sha256)
//   3. attachProductAsset() (server action) cria row em product_assets
//   4. revalidatePath dispara re-render da /produtos/[slug]
//
// Funciona com arquivos ate 50MB. Mostra progresso via isPending.

import { Button } from '@colheita/ui';
import { CheckCircle2, FileUp, X } from 'lucide-react';
import { useCallback, useRef, useState, useTransition } from 'react';
import { attachProductAsset, type ProductAssetRole } from '@/lib/actions/produtos';

interface ProductAssetUploaderProps {
  productSlug: string;
}

const ROLE_OPTIONS: { value: ProductAssetRole; label: string; hint: string }[] = [
  { value: 'msds', label: 'FISPQ / MSDS', hint: 'Ficha de segurança do produto' },
  { value: 'certificate', label: 'Certificado', hint: 'ISO, orgânico, terceiros' },
  { value: 'spec_sheet', label: 'Documento regulatório', hint: 'MAPA, ANVISA, IBAMA' },
  { value: 'datasheet', label: 'Ficha técnica externa', hint: 'PDF assinado regulatório' },
  { value: 'photo', label: 'Foto extra', hint: 'Lifestyle, embalagem em uso' },
  { value: 'gallery', label: 'Galeria de fotos', hint: 'Hero shots, fotos em campo' },
  { value: 'video', label: 'Vídeo', hint: 'Demo de aplicação, treinamento' },
  { value: 'document', label: 'Outro documento', hint: 'Documento avulso' },
];

export function ProductAssetUploader({ productSlug }: ProductAssetUploaderProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<ProductAssetRole>('msds');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      reset();

      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        setError('Selecione um arquivo.');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('Arquivo excede 50 MB.');
        return;
      }

      startTransition(async () => {
        // Step 1: upload pro DAM via API existente
        const formData = new FormData();
        formData.append('file', file);

        let assetId: string;
        try {
          const res = await fetch('/api/midias/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error ?? 'Erro no upload.');
            return;
          }
          assetId = data.asset?.id;
          if (!assetId) {
            setError('Resposta de upload inválida.');
            return;
          }
        } catch {
          setError('Falha de rede no upload.');
          return;
        }

        // Step 2: cria associacao product_assets
        const result = await attachProductAsset(productSlug, assetId, role);
        if (result.error) {
          setError(result.error);
          return;
        }

        setSuccess(`"${file.name}" anexado como ${role}.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
    },
    [productSlug, role, reset],
  );

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen(true);
          reset();
        }}
      >
        <FileUp size={14} strokeWidth={1.75} style={{ marginRight: 6 }} />
        Adicionar documento
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '16px',
        borderRadius: 'var(--colheita-radius-md)',
        border: '1px solid var(--colheita-border)',
        backgroundColor: 'var(--colheita-surface-elevated)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--colheita-text-primary)',
            margin: 0,
          }}
        >
          Novo documento
        </p>
        <button
          type="button"
          aria-label="Fechar"
          onClick={() => {
            setOpen(false);
            reset();
          }}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--colheita-text-tertiary)',
            padding: 0,
          }}
        >
          <X size={16} strokeWidth={1.75} />
        </button>
      </div>

      <div>
        <label
          htmlFor="role-select"
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--colheita-text-secondary)',
            marginBottom: '4px',
          }}
        >
          Tipo
        </label>
        <select
          id="role-select"
          value={role}
          onChange={(e) => setRole(e.target.value as ProductAssetRole)}
          disabled={isPending}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: '#ffffff',
            fontSize: '0.8125rem',
            color: 'var(--colheita-text-primary)',
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} — {opt.hint}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="file-input"
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--colheita-text-secondary)',
            marginBottom: '4px',
          }}
        >
          Arquivo (máx 50 MB)
        </label>
        <input
          ref={fileInputRef}
          id="file-input"
          type="file"
          disabled={isPending}
          style={{
            width: '100%',
            padding: '6px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: '#ffffff',
            fontSize: '0.8125rem',
            color: 'var(--colheita-text-primary)',
          }}
        />
      </div>

      {error ? (
        <p
          role="alert"
          style={{
            fontSize: '0.75rem',
            color: 'var(--colheita-danger)',
            padding: '8px 10px',
            borderRadius: '6px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            margin: 0,
          }}
        >
          {error}
        </p>
      ) : null}

      {success ? (
        <p
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: 'var(--colheita-brand-secondary)',
            padding: '8px 10px',
            borderRadius: '6px',
            backgroundColor: 'var(--colheita-brand-secondary-soft)',
            border: '1px solid var(--colheita-brand-secondary-line)',
            margin: 0,
          }}
        >
          <CheckCircle2 size={14} strokeWidth={1.75} />
          {success}
        </p>
      ) : null}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setOpen(false);
            reset();
          }}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Enviando…' : 'Anexar ao produto'}
        </Button>
      </div>
    </form>
  );
}
