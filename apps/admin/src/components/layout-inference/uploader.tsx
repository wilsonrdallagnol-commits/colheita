'use client';

// apps/admin/src/components/layout-inference/uploader.tsx
//
// Client component do Layout Inference Engine.
// Drag-drop ou file picker → state machine (idle → uploading → analyzing → done).
// Usa server action uploadAndAnalyze que faz tudo: upload, asset, reference,
// vision analysis, blueprint insert.

import { Button } from '@colheita/ui';
import { CheckCircle2, FileImage, Sparkles, Upload, Wand2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useRef, useState } from 'react';
import { type AnalyzeResponse, uploadAndAnalyze } from '@/lib/actions/layout-inference';

type Status = 'idle' | 'reading' | 'analyzing' | 'done' | 'error';

const CATEGORY_OPTIONS = [
  { value: '', label: 'Auto-detectar' },
  { value: 'datasheet', label: 'Ficha técnica' },
  { value: 'banner', label: 'Banner' },
  { value: 'social_post', label: 'Post social' },
  { value: 'catalog', label: 'Catálogo' },
  { value: 'presentation', label: 'Apresentação' },
  { value: 'flyer', label: 'Flyer' },
  { value: 'other', label: 'Outro' },
];

const SOURCE_OPTIONS = [
  { value: 'inspiration', label: 'Inspiração externa' },
  { value: 'competitor', label: 'Peça de concorrente' },
  { value: 'historical', label: 'Material antigo Argho' },
  { value: 'upload', label: 'Outro' },
];

export function LayoutInferenceUploader() {
  const router = useRouter();
  const inputId = useId();
  const titleId = useId();
  const sourceId = useId();
  const categoryId = useId();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState('inspiration');
  const [intendedCategory, setIntendedCategory] = useState('');
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const acceptFile = useCallback((next: File) => {
    setFile(next);
    setStatus('idle');
    setErrorMessage('');
    setResult(null);
    if (next.type.startsWith('image/')) {
      const url = URL.createObjectURL(next);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) acceptFile(f);
    },
    [acceptFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) acceptFile(f);
    },
    [acceptFile],
  );

  const reset = useCallback(() => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setStatus('idle');
    setErrorMessage('');
    setResult(null);
    setTitle('');
    setIntendedCategory('');
    setSourceType('inspiration');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [previewUrl]);

  const submit = useCallback(async () => {
    if (!file) return;
    setStatus('reading');
    setErrorMessage('');

    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title);
    fd.append('sourceType', sourceType);
    if (intendedCategory) fd.append('intendedCategory', intendedCategory);

    setStatus('analyzing');
    const response = await uploadAndAnalyze(fd);
    setResult(response);

    if (response.ok) {
      setStatus('done');
      router.refresh();
    } else {
      setStatus('error');
      setErrorMessage(response.error);
    }
  }, [file, title, sourceType, intendedCategory, router]);

  const isBusy = status === 'reading' || status === 'analyzing';
  const isDone = status === 'done' && result?.ok === true;

  return (
    <div>
      {/* Drop zone */}
      {!file && !isDone ? (
        <section
          aria-label="Área de upload de referência"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            padding: '48px 32px',
            borderRadius: 'var(--colheita-radius-lg)',
            border: `2px dashed ${
              isDragging ? 'var(--colheita-brand-primary)' : 'var(--colheita-brand-primary-line)'
            }`,
            backgroundColor: isDragging
              ? 'var(--colheita-brand-primary-soft)'
              : 'var(--colheita-surface-muted)',
            textAlign: 'center',
            transition: 'background-color 200ms ease, border-color 200ms ease',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--colheita-radius-lg)',
              backgroundColor: '#ffffff',
              color: 'var(--colheita-brand-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-blue-glow)',
            }}
          >
            <Wand2 size={26} strokeWidth={1.5} />
          </div>
          <h2
            className="argho-display"
            style={{
              fontSize: '1.375rem',
              color: '#0a0a0a',
              margin: '0 0 8px',
            }}
          >
            Solte uma referência aqui
          </h2>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--colheita-text-secondary)',
              margin: '0 auto 20px',
              maxWidth: '52ch',
              lineHeight: 1.55,
            }}
          >
            PNG, JPEG, WebP ou PDF (até 8MB). Claude vision lê a estrutura e prepara pra render com
            identidade Argho.
          </p>
          <Button asChild size="sm">
            <label htmlFor={inputId} style={{ cursor: 'pointer' }}>
              <Upload size={14} strokeWidth={1.75} style={{ marginRight: 6 }} />
              Selecionar arquivo
            </label>
          </Button>
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </section>
      ) : null}

      {/* Preview + form */}
      {file && !isDone ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 320px)',
            gap: '24px',
            padding: '24px',
            borderRadius: 'var(--colheita-radius-lg)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Preview */}
          <div
            style={{
              minHeight: '320px',
              borderRadius: 'var(--colheita-radius-md)',
              backgroundColor: 'var(--colheita-surface-muted)',
              border: '1px solid var(--colheita-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview da referência"
                style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain' }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--colheita-text-tertiary)',
                }}
              >
                <FileImage size={32} strokeWidth={1.5} />
                <span style={{ fontSize: '0.8125rem' }}>{file.name}</span>
                <span style={{ fontSize: '0.75rem' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={reset}
              aria-label="Remover arquivo"
              disabled={isBusy}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '28px',
                height: '28px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: '#ffffff',
                color: 'var(--colheita-text-secondary)',
                cursor: isBusy ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-card)',
                opacity: isBusy ? 0.5 : 1,
              }}
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label
                htmlFor={titleId}
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--colheita-text-secondary)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Título
              </label>
              <input
                id={titleId}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={file.name.replace(/\.[^.]+$/, '')}
                disabled={isBusy}
                maxLength={120}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.875rem',
                  borderRadius: 'var(--colheita-radius-md)',
                  border: '1px solid var(--colheita-border)',
                  backgroundColor: '#ffffff',
                  color: 'var(--colheita-text-primary)',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                htmlFor={sourceId}
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--colheita-text-secondary)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Origem
              </label>
              <select
                id={sourceId}
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                disabled={isBusy}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.875rem',
                  borderRadius: 'var(--colheita-radius-md)',
                  border: '1px solid var(--colheita-border)',
                  backgroundColor: '#ffffff',
                  color: 'var(--colheita-text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={categoryId}
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--colheita-text-secondary)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Categoria pretendida
              </label>
              <select
                id={categoryId}
                value={intendedCategory}
                onChange={(e) => setIntendedCategory(e.target.value)}
                disabled={isBusy}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.875rem',
                  borderRadius: 'var(--colheita-radius-md)',
                  border: '1px solid var(--colheita-border)',
                  backgroundColor: '#ffffff',
                  color: 'var(--colheita-text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {errorMessage ? (
              <p
                role="alert"
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--colheita-danger)',
                  margin: 0,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                }}
              >
                {errorMessage}
              </p>
            ) : null}

            <Button type="button" onClick={submit} disabled={isBusy} style={{ marginTop: '4px' }}>
              {status === 'reading' ? (
                'Subindo arquivo…'
              ) : status === 'analyzing' ? (
                <>
                  <Sparkles size={14} strokeWidth={1.75} style={{ marginRight: 6 }} />
                  Analisando com Claude vision…
                </>
              ) : (
                <>
                  <Wand2 size={14} strokeWidth={1.75} style={{ marginRight: 6 }} />
                  Analisar layout
                </>
              )}
            </Button>

            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--colheita-text-tertiary)',
                margin: 0,
                lineHeight: 1.55,
              }}
            >
              A análise leva 5-15 segundos. Você verá o blueprint extraído e poderá renderizar com
              identidade Argho em seguida.
            </p>
          </div>
        </div>
      ) : null}

      {/* Done state */}
      {isDone && result?.ok ? (
        <div
          style={{
            padding: '32px',
            borderRadius: 'var(--colheita-radius-lg)',
            border: '1px solid var(--colheita-brand-secondary-line)',
            backgroundColor: 'var(--colheita-brand-secondary-soft)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--colheita-radius-md)',
                backgroundColor: '#ffffff',
                color: 'var(--colheita-brand-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={22} strokeWidth={1.75} />
            </div>
            <div>
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'var(--colheita-brand-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  margin: '0 0 6px',
                }}
              >
                Blueprint extraído
              </p>
              <h2
                className="argho-display"
                style={{
                  fontSize: '1.5rem',
                  color: '#0a0a0a',
                  margin: '0 0 8px',
                }}
              >
                Estrutura analisada com sucesso
              </h2>
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--colheita-text-secondary)',
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                Custo da análise: <strong>${result.costUsd.toFixed(4)}</strong> · Tempo:{' '}
                <strong>{(result.durationMs / 1000).toFixed(1)}s</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button onClick={reset} variant="outline" size="sm">
              Subir outra
            </Button>
            <Button asChild size="sm">
              <a href={`/layout-inference/${result.referenceId}`}>Ver blueprint</a>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
