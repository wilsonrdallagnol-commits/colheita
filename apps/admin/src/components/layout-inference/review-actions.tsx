'use client';

// apps/admin/src/components/layout-inference/review-actions.tsx
//
// Botoes de workflow no header da pagina de detalhe do blueprint.
// Transicoes validas (vide updateBlueprintStatus em actions):
//   draft → reviewed | archived
//   reviewed → approved | draft | archived
//   approved → archived
//   archived → draft

import { Button } from '@colheita/ui';
import { Archive, CheckCircle2, Eye, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { updateBlueprintStatus } from '@/lib/actions/layout-inference';

interface ReviewActionsProps {
  blueprintId: string;
  currentStatus: string;
  referenceId: string;
}

export function ReviewActions({ blueprintId, currentStatus }: ReviewActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function transition(nextStatus: 'draft' | 'reviewed' | 'approved' | 'archived') {
    startTransition(async () => {
      const result = await updateBlueprintStatus(blueprintId, nextStatus);
      if (result.ok) router.refresh();
    });
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
      {currentStatus === 'draft' ? (
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => transition('reviewed')}
            disabled={isPending}
          >
            <Eye size={13} strokeWidth={1.75} style={{ marginRight: 6 }} />
            Marcar como revisado
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => transition('archived')}
            disabled={isPending}
          >
            <Archive size={13} strokeWidth={1.75} style={{ marginRight: 6 }} />
            Arquivar
          </Button>
        </>
      ) : null}

      {currentStatus === 'reviewed' ? (
        <>
          <Button
            type="button"
            size="sm"
            onClick={() => transition('approved')}
            disabled={isPending}
          >
            <CheckCircle2 size={13} strokeWidth={1.75} style={{ marginRight: 6 }} />
            Aprovar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => transition('draft')}
            disabled={isPending}
          >
            <RotateCcw size={13} strokeWidth={1.75} style={{ marginRight: 6 }} />
            Voltar pra rascunho
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => transition('archived')}
            disabled={isPending}
          >
            <Archive size={13} strokeWidth={1.75} style={{ marginRight: 6 }} />
            Arquivar
          </Button>
        </>
      ) : null}

      {currentStatus === 'approved' ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => transition('archived')}
          disabled={isPending}
        >
          <Archive size={13} strokeWidth={1.75} style={{ marginRight: 6 }} />
          Arquivar
        </Button>
      ) : null}

      {currentStatus === 'archived' ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => transition('draft')}
          disabled={isPending}
        >
          <RotateCcw size={13} strokeWidth={1.75} style={{ marginRight: 6 }} />
          Reabrir
        </Button>
      ) : null}
    </div>
  );
}
