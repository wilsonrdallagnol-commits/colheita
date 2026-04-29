// apps/admin/src/components/produtos/produto-actions.tsx
'use client';

import { Button } from '@colheita/ui';
import Link from 'next/link';
import { useTransition } from 'react';
import { archiveProduto, draftProduto, publishProduto } from '@/lib/actions/produtos';

interface ProdutoActionsProps {
  slug: string;
  status: string;
}

export function ProdutoActions({ slug, status }: ProdutoActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    startTransition(async () => {
      await publishProduto(slug);
    });
  }

  function handleArchive() {
    startTransition(async () => {
      await archiveProduto(slug);
    });
  }

  function handleDraft() {
    startTransition(async () => {
      await draftProduto(slug);
    });
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {/* Editar — sempre visível */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/produtos/${slug}/editar`}>Editar</Link>
      </Button>

      {/* Publicar — só se draft ou archived */}
      {status !== 'published' && (
        <Button size="sm" disabled={isPending} onClick={handlePublish}>
          {isPending ? 'Publicando...' : 'Publicar'}
        </Button>
      )}

      {/* Reverter para rascunho — só se published */}
      {status === 'published' && (
        <Button variant="outline" size="sm" disabled={isPending} onClick={handleDraft}>
          {isPending ? 'Revertendo...' : 'Voltar para rascunho'}
        </Button>
      )}

      {/* Arquivar — só se draft ou published */}
      {status !== 'archived' && (
        <Button variant="ghost" size="sm" disabled={isPending} onClick={handleArchive}>
          {isPending ? 'Arquivando...' : 'Arquivar'}
        </Button>
      )}

      {/* Reativar como rascunho — só se archived */}
      {status === 'archived' && (
        <Button variant="outline" size="sm" disabled={isPending} onClick={handleDraft}>
          {isPending ? 'Reativando...' : 'Reativar como rascunho'}
        </Button>
      )}
    </div>
  );
}
