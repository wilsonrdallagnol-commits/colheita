'use client';

// apps/admin/src/components/layout-inference/re-analyze-button.tsx

import { Button } from '@colheita/ui';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { type ReAnalyzeResponse, reAnalyzeBlueprint } from '@/lib/actions/layout-inference';

interface ReAnalyzeButtonProps {
  referenceId: string;
}

export function ReAnalyzeButton({ referenceId }: ReAnalyzeButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ReAnalyzeResponse | null>(null);

  const handleClick = useCallback(() => {
    if (
      !window.confirm(
        'Re-analisar gera uma nova versão do blueprint via Claude vision (custo ~$0.02). Continuar?',
      )
    ) {
      return;
    }
    startTransition(async () => {
      const response = await reAnalyzeBlueprint(referenceId);
      setResult(response);
      if (response.ok) router.refresh();
    });
  }, [referenceId, router]);

  if (result?.ok) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          color: 'var(--colheita-brand-secondary)',
          padding: '6px 10px',
          borderRadius: 'var(--colheita-radius-md)',
          backgroundColor: 'var(--colheita-brand-secondary-soft)',
        }}
      >
        <CheckCircle2 size={13} strokeWidth={1.75} />v{result.version} criada · $
        {result.costUsd.toFixed(4)}
      </div>
    );
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={handleClick} disabled={isPending}>
      <RefreshCw
        size={13}
        strokeWidth={1.75}
        style={{
          marginRight: 6,
          animation: isPending ? 'spin 1s linear infinite' : undefined,
        }}
      />
      {isPending ? 'Re-analisando…' : 'Re-analisar'}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Button>
  );
}
