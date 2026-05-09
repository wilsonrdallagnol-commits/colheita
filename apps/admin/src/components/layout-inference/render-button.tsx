'use client';

// apps/admin/src/components/layout-inference/render-button.tsx
//
// Botao "Renderizar com identidade Argho" — fecha o ciclo do Layout Inference.
// Pega o blueprint, compila com tema Argho, gera PDF via Playwright, salva
// em Storage + generated_materials.

import { Button } from '@colheita/ui';
import { CheckCircle2, ExternalLink, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { type RenderResponse, renderBlueprintWithArgho } from '@/lib/actions/layout-inference';

interface RenderButtonProps {
  blueprintId: string;
  disabled?: boolean;
}

export function RenderButton({ blueprintId, disabled }: RenderButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<RenderResponse | null>(null);

  const handleClick = useCallback(() => {
    startTransition(async () => {
      const response = await renderBlueprintWithArgho(blueprintId);
      setResult(response);
      if (response.ok) router.refresh();
    });
  }, [blueprintId, router]);

  // Done state — preview compacto com link pro PDF
  if (result?.ok) {
    return (
      <div
        style={{
          padding: '14px 16px',
          borderRadius: 'var(--colheita-radius-lg)',
          border: '1px solid var(--colheita-brand-secondary-line)',
          backgroundColor: 'var(--colheita-brand-secondary-soft)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: '#ffffff',
            color: 'var(--colheita-brand-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CheckCircle2 size={16} strokeWidth={1.75} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#0a0a0a',
              margin: 0,
              letterSpacing: '-0.005em',
            }}
          >
            PDF Argho gerado em {(result.durationMs / 1000).toFixed(1)}s
          </p>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--colheita-text-secondary)',
              margin: 0,
            }}
          >
            Disponível no histórico de materiais.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <a href={result.pdfUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={13} strokeWidth={1.75} style={{ marginRight: 6 }} />
            Abrir PDF
          </a>
        </Button>
        <button
          type="button"
          onClick={() => setResult(null)}
          style={{
            fontSize: '0.75rem',
            background: 'transparent',
            border: 'none',
            padding: '4px 8px',
            cursor: 'pointer',
            color: 'var(--colheita-text-tertiary)',
            fontWeight: 500,
          }}
        >
          Renderizar de novo
        </button>
      </div>
    );
  }

  // Error state
  if (result && !result.ok) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
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
          {result.error}
        </p>
        <Button type="button" size="sm" onClick={handleClick} disabled={isPending}>
          <Wand2 size={13} strokeWidth={1.75} style={{ marginRight: 6 }} />
          Tentar de novo
        </Button>
      </div>
    );
  }

  // Idle / pending
  return (
    <Button type="button" onClick={handleClick} disabled={disabled || isPending}>
      <Wand2 size={14} strokeWidth={1.75} style={{ marginRight: 6 }} />
      {isPending ? 'Renderizando…' : 'Renderizar com identidade Argho'}
    </Button>
  );
}
