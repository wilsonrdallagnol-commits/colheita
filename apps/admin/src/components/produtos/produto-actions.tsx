// apps/admin/src/components/produtos/produto-actions.tsx
'use client';

import { Button } from '@colheita/ui';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { archiveProduto, draftProduto, publishProduto } from '@/lib/actions/produtos';

interface ProdutoActionsProps {
  slug: string;
  status: string;
}

export function ProdutoActions({ slug, status }: ProdutoActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  function handle(fn: () => Promise<{ error?: string }>) {
    setActionError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) setActionError(result.error);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {/* Editar — sempre visível */}
        <Button variant="outline" size="sm" asChild>
          <Link href={`/produtos/${slug}/editar`}>Editar</Link>
        </Button>

        {/*
          Gerar Ficha Técnica em PDF — sempre visível.
          A rota route.ts gera o PDF via Playwright e retorna application/pdf
          com Content-Disposition attachment, fazendo o browser baixar direto.
          Usar <a download> em vez de <Link> garante o download attachment;
          o PDF abre numa request nova (HTTP GET) — sem fetch + blob na client.
        */}
        <Button variant="outline" size="sm" asChild>
          <a href={`/produtos/${slug}/ficha-tecnica`} download>
            Baixar ficha técnica (PDF)
          </a>
        </Button>

        {/* Publicar — só se draft ou archived */}
        {status !== 'published' && (
          <Button size="sm" disabled={isPending} onClick={() => handle(() => publishProduto(slug))}>
            {isPending ? 'Publicando...' : 'Publicar'}
          </Button>
        )}

        {/* Reverter para rascunho — só se published */}
        {status === 'published' && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => handle(() => draftProduto(slug))}
          >
            {isPending ? 'Revertendo...' : 'Voltar para rascunho'}
          </Button>
        )}

        {/* Arquivar — só se draft ou published */}
        {status !== 'archived' && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => handle(() => archiveProduto(slug))}
          >
            {isPending ? 'Arquivando...' : 'Arquivar'}
          </Button>
        )}

        {/* Reativar como rascunho — só se archived */}
        {status === 'archived' && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => handle(() => draftProduto(slug))}
          >
            {isPending ? 'Reativando...' : 'Reativar como rascunho'}
          </Button>
        )}
      </div>

      {actionError && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--colheita-danger)',
          }}
        >
          {actionError}
        </p>
      )}
    </div>
  );
}
