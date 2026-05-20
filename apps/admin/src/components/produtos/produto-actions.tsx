// apps/admin/src/components/produtos/produto-actions.tsx
'use client';

import { Button } from '@colheita/ui';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  archiveProduto,
  draftProduto,
  publishProduto,
  softDeleteProduto,
} from '@/lib/actions/produtos';

interface ProdutoActionsProps {
  slug: string;
  status: string;
}

export function ProdutoActions({ slug, status }: ProdutoActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  function handle(fn: () => Promise<{ error?: string }>) {
    setActionError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) setActionError(result.error);
    });
  }

  function handleDelete() {
    const ok = window.confirm(
      `Excluir permanentemente o produto "${slug}"?\n\nO produto some da listagem e do portal. ` +
        `Não fica reversível pela UI — só via SQL direto.`,
    );
    if (!ok) return;

    setActionError(null);
    startTransition(async () => {
      const result = await softDeleteProduto(slug);
      if (result.error) {
        setActionError(result.error);
        return;
      }
      // Volta pra listagem (o produto nao existe mais)
      router.push('/produtos');
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
          Materiais gerados sob demanda — Camada 3 do projeto Colheita.
          Toda geração registra metadata em generated_materials (visível em
          /materiais/historico). Cada link usa <a download> pra forçar download
          attachment direto do browser sem fetch+blob no client.
        */}
        <Button variant="outline" size="sm" asChild>
          <a href={`/produtos/${slug}/ficha-tecnica`} download>
            Ficha técnica (PDF)
          </a>
        </Button>

        <Button variant="outline" size="sm" asChild>
          <a href={`/produtos/${slug}/banner`} download>
            Banner social (PNG)
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

        {/* Excluir permanente — soft delete (deleted_at). Confirm modal antes. */}
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={handleDelete}
          style={{ color: 'var(--colheita-danger)', marginLeft: 'auto' }}
        >
          <Trash2 size={14} strokeWidth={1.75} style={{ marginRight: 6 }} />
          {isPending ? 'Excluindo...' : 'Excluir'}
        </Button>
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
