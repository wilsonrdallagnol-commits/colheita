// apps/admin/src/components/imagens/imagen-generator-panel.tsx
//
// Painel client-side de geração de imagens via Nano Banana Pro.
// Form com prompt + aspectRatio + numImages → POST /api/imagens/gerar →
// preview com download.

'use client';

import { useId, useState } from 'react';

type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';

interface GeneratedImage {
  base64: string;
  mimeType: string;
}

interface SuccessResponse {
  images: GeneratedImage[];
  provider: string;
  model: string;
  promptUsed: string;
}

interface ErrorResponse {
  error: string;
  detail?: string;
}

const PROMPT_TEMPLATES = [
  {
    label: 'Mockup foto-real frasco 1L',
    value:
      'Photo-realistic 3D render of a 1L plastic agricultural product bottle, white background with subtle gradient, soft studio lighting, gentle drop shadow underneath. The label is clean and minimal with a blue gradient and white text. Product photography style, ultra high resolution, professional catalog quality.',
  },
  {
    label: 'Ilustração técnica raiz',
    value:
      'Technical scientific illustration of a plant root system with rhizosphere microbiome, soft watercolor style, biology textbook aesthetic, labeled with subtle Latin annotations, white background. Detailed mycorrhizae and bacterial colonies visible. Editorial illustration.',
  },
  {
    label: 'Foto campo soja florescimento',
    value:
      'Aerial photography of a soybean field in full flowering stage, golden hour light, shallow depth of field, professional agricultural photography, vibrant green leaves with delicate white-purple flowers, atmospheric and editorial.',
  },
];

export function ImagenGeneratorPanel() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [numImages, setNumImages] = useState(1);

  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{ model: string; promptUsed: string } | null>(null);
  const promptId = useId();
  const negativeId = useId();
  const aspectId = useId();
  const numId = useId();

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    setError(null);
    setImages([]);
    setMetadata(null);

    try {
      const res = await fetch('/api/imagens/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim() || undefined,
          aspectRatio,
          numImages,
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as ErrorResponse;
        const detail = err.detail ? ` — ${err.detail}` : '';
        setError(`${err.error ?? `HTTP ${res.status}`}${detail}`);
        return;
      }

      const data = (await res.json()) as SuccessResponse;
      setImages(data.images);
      setMetadata({ model: data.model, promptUsed: data.promptUsed });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha de rede.');
    } finally {
      setGenerating(false);
    }
  }

  function downloadImage(img: GeneratedImage, idx: number) {
    const dataUrl = `data:${img.mimeType};base64,${img.base64}`;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `argho-imagem-${Date.now()}-${idx + 1}.${img.mimeType.split('/')[1] ?? 'png'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 380px) minmax(0, 1fr)',
        gap: '32px',
        maxWidth: '1280px',
      }}
      className="imagens-grid"
    >
      {/* Form */}
      <form
        onSubmit={handleGenerate}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <div>
          <label
            htmlFor={promptId}
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--colheita-text-secondary)',
              marginBottom: '6px',
            }}
          >
            Prompt
          </label>
          <textarea
            id={promptId}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Descreva a imagem que quer gerar… ex: mockup foto-real de frasco 1L branco com rótulo azul Argho, fundo branco, sombra suave"
            rows={6}
            maxLength={2000}
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 'var(--colheita-radius-md)',
              border: '1px solid var(--colheita-border)',
              backgroundColor: 'var(--colheita-surface)',
              color: 'var(--colheita-text-primary)',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: '120px',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '4px',
              fontSize: '0.6875rem',
              color: 'var(--colheita-text-tertiary)',
            }}
          >
            <span>{prompt.length}/2000</span>
            <span>EN tende a entregar melhor qualidade visual</span>
          </div>
        </div>

        {/* Templates rápidos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--colheita-text-tertiary)',
            }}
          >
            Templates rápidos
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {PROMPT_TEMPLATES.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setPrompt(t.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--colheita-radius-sm)',
                  border: '1px solid var(--colheita-border)',
                  backgroundColor: 'var(--colheita-surface-elevated)',
                  color: 'var(--colheita-text-secondary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor={negativeId}
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--colheita-text-secondary)',
              marginBottom: '6px',
            }}
          >
            Negative prompt (opcional)
          </label>
          <input
            id={negativeId}
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="text, watermark, blurry, low quality, distorted"
            maxLength={500}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--colheita-radius-md)',
              border: '1px solid var(--colheita-border)',
              backgroundColor: 'var(--colheita-surface)',
              color: 'var(--colheita-text-primary)',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label
              htmlFor={aspectId}
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--colheita-text-secondary)',
                marginBottom: '6px',
              }}
            >
              Proporção
            </label>
            <select
              id={aspectId}
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--colheita-radius-md)',
                border: '1px solid var(--colheita-border)',
                backgroundColor: 'var(--colheita-surface)',
                color: 'var(--colheita-text-primary)',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
              }}
            >
              <option value="1:1">Quadrado 1:1</option>
              <option value="3:4">Retrato 3:4 (produtos)</option>
              <option value="4:3">Paisagem 4:3</option>
              <option value="9:16">Story 9:16</option>
              <option value="16:9">Wide 16:9</option>
            </select>
          </div>
          <div>
            <label
              htmlFor={numId}
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--colheita-text-secondary)',
                marginBottom: '6px',
              }}
            >
              Quantidade
            </label>
            <select
              id={numId}
              value={numImages}
              onChange={(e) => setNumImages(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--colheita-radius-md)',
                border: '1px solid var(--colheita-border)',
                backgroundColor: 'var(--colheita-surface)',
                color: 'var(--colheita-text-primary)',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
              }}
            >
              <option value={1}>1 imagem (~$0,04)</option>
              <option value={2}>2 imagens (~$0,08)</option>
              <option value={3}>3 imagens (~$0,12)</option>
              <option value={4}>4 imagens (~$0,16)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={generating || !prompt.trim()}
          style={{
            padding: '12px 20px',
            borderRadius: 'var(--colheita-radius-md)',
            border: 'none',
            backgroundColor: generating
              ? 'var(--colheita-text-tertiary)'
              : 'var(--colheita-brand-primary, #183090)',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: generating || !prompt.trim() ? 'not-allowed' : 'pointer',
            opacity: !prompt.trim() ? 0.5 : 1,
            transition: 'background-color 0.15s ease, opacity 0.15s ease',
            marginTop: '8px',
          }}
        >
          {generating ? 'Gerando…' : 'Gerar imagem'}
        </button>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--colheita-radius-md)',
              backgroundColor: 'rgba(220, 38, 38, 0.08)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              color: 'rgb(185, 28, 28)',
              fontSize: '0.8125rem',
              lineHeight: 1.5,
            }}
          >
            <strong>Erro:</strong> {error}
            {error.includes('GEMINI_API_KEY') && (
              <div style={{ marginTop: '8px', fontSize: '0.75rem' }}>
                Pegue uma key em{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  aistudio.google.com/apikey
                </a>{' '}
                e adicione como variável de ambiente <code>GEMINI_API_KEY</code> em{' '}
                <code>apps/admin/.env.local</code> e na Vercel.
              </div>
            )}
          </div>
        )}
      </form>

      {/* Preview */}
      <div>
        {generating && (
          <div
            style={{
              padding: '48px 24px',
              borderRadius: 'var(--colheita-radius-md)',
              border: '1px dashed var(--colheita-border)',
              textAlign: 'center',
              color: 'var(--colheita-text-tertiary)',
              fontSize: '0.875rem',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '3px solid var(--colheita-border)',
                borderTopColor: 'var(--colheita-brand-primary, #183090)',
                animation: 'imgGenSpin 0.8s linear infinite',
                marginBottom: '12px',
              }}
            />
            <div>Gerando imagem com Nano Banana Pro… (10–30s)</div>
            <style>{`@keyframes imgGenSpin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!generating && images.length === 0 && !error && (
          <div
            style={{
              padding: '48px 24px',
              borderRadius: 'var(--colheita-radius-md)',
              border: '1px dashed var(--colheita-border)',
              textAlign: 'center',
              color: 'var(--colheita-text-tertiary)',
              fontSize: '0.875rem',
            }}
          >
            Resultado aparece aqui depois de gerar
          </div>
        )}

        {images.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {images.map((img, idx) => (
                <div
                  key={`${idx}-${img.base64.slice(0, 16)}`}
                  style={{
                    borderRadius: 'var(--colheita-radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--colheita-border)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:${img.mimeType};base64,${img.base64}`}
                    alt={`Imagem gerada ${idx + 1}`}
                    style={{ display: 'block', width: '100%', height: 'auto' }}
                  />
                  <div
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--colheita-surface-elevated)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--colheita-border-subtle)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--colheita-text-tertiary)',
                      }}
                    >
                      #{idx + 1} · {img.mimeType}
                    </span>
                    <button
                      type="button"
                      onClick={() => downloadImage(img, idx)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--colheita-radius-sm)',
                        border: '1px solid var(--colheita-border)',
                        backgroundColor: 'var(--colheita-surface)',
                        color: 'var(--colheita-text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Baixar PNG
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {metadata && (
              <div
                style={{
                  padding: '10px 14px',
                  fontSize: '0.6875rem',
                  color: 'var(--colheita-text-tertiary)',
                  fontFamily: 'monospace',
                  backgroundColor: 'var(--colheita-surface-elevated)',
                  borderRadius: 'var(--colheita-radius-sm)',
                  border: '1px solid var(--colheita-border-subtle)',
                }}
              >
                <div>Modelo: {metadata.model}</div>
                <div style={{ marginTop: '4px', wordBreak: 'break-word' }}>
                  Prompt: {metadata.promptUsed.slice(0, 200)}
                  {metadata.promptUsed.length > 200 ? '…' : ''}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 968px) {
          .imagens-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
