'use client';

// apps/admin/src/components/midias/upload-button.tsx
//
// Botão de upload de mídia — abre seletor de arquivo, envia para
// POST /api/midias/upload e atualiza a listagem após o sucesso.

import { Button } from '@colheita/ui';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
].join(',');

export function UploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    inputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset input para permitir re-upload do mesmo arquivo
    e.target.value = '';

    if (!file) return;

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/midias/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Erro ${res.status}`);
      }

      // Revalida a página para exibir o novo asset na grid
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar arquivo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Button size="sm" onClick={handleClick} disabled={loading}>
        {loading ? 'Enviando…' : '+ Enviar arquivo'}
      </Button>

      {error && (
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--colheita-status-error, #ef4444)',
            maxWidth: '260px',
            textAlign: 'right',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
