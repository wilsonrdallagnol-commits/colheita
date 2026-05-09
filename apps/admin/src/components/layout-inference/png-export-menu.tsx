'use client';

// apps/admin/src/components/layout-inference/png-export-menu.tsx
//
// Dropdown de formatos PNG (social_landscape, social_square, story, etc).
// Cada preset ativa renderBlueprintAsPng com viewport diferente.

import { Button } from '@colheita/ui';
import { ExternalLink, ImageDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { type PngRenderResponse, renderBlueprintAsPng } from '@/lib/actions/layout-inference';

const PRESETS = [
  { value: 'social_landscape', label: 'LinkedIn / FB · 1200×630' },
  { value: 'social_square', label: 'Instagram quadrado · 1080×1080' },
  { value: 'social_story', label: 'Stories vertical · 1080×1920' },
  { value: 'banner_wide', label: 'Banner wide · 1920×1080' },
  { value: 'thumbnail', label: 'Thumbnail · 800×800' },
] as const;

type PresetValue = (typeof PRESETS)[number]['value'];

interface PngExportMenuProps {
  blueprintId: string;
}

export function PngExportMenu({ blueprintId }: PngExportMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [pendingPreset, setPendingPreset] = useState<PresetValue | null>(null);
  const [result, setResult] = useState<PngRenderResponse | null>(null);

  const handleSelect = useCallback(
    (preset: PresetValue) => {
      setOpen(false);
      setPendingPreset(preset);
      startTransition(async () => {
        const response = await renderBlueprintAsPng(blueprintId, preset);
        setResult(response);
        setPendingPreset(null);
        if (response.ok) router.refresh();
      });
    },
    [blueprintId, router],
  );

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
      >
        <ImageDown size={13} strokeWidth={1.75} style={{ marginRight: 6 }} />
        {isPending && pendingPreset
          ? `Gerando ${PRESETS.find((p) => p.value === pendingPreset)?.label.split(' ·')[0] ?? '…'}…`
          : 'Exportar PNG'}
      </Button>

      {open ? (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'default',
            }}
          />

          {/* Menu */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              zIndex: 41,
              minWidth: '260px',
              borderRadius: 'var(--colheita-radius-lg)',
              border: '1px solid var(--colheita-border)',
              backgroundColor: '#ffffff',
              boxShadow: '0 12px 32px -8px rgba(15, 23, 42, 0.18)',
              overflow: 'hidden',
            }}
          >
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                margin: 0,
                padding: '12px 14px 8px',
              }}
            >
              Formato de saída
            </p>
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleSelect(preset.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--colheita-text-primary)',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderTop: '1px solid var(--colheita-border-subtle)',
                  letterSpacing: '-0.005em',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--colheita-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {result?.ok ? (
        <a
          href={result.pngUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 41,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 14px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'var(--colheita-brand-secondary-soft)',
            border: '1px solid var(--colheita-brand-secondary-line)',
            color: 'var(--colheita-brand-secondary)',
            fontSize: '0.75rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
          onClick={() => setTimeout(() => setResult(null), 100)}
        >
          <ExternalLink size={13} strokeWidth={1.75} />
          Abrir PNG ({result.preset})
        </a>
      ) : null}

      {result && !result.ok ? (
        <p
          role="alert"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 41,
            fontSize: '0.75rem',
            color: 'var(--colheita-danger)',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            margin: 0,
          }}
        >
          {result.error}
        </p>
      ) : null}
    </div>
  );
}
