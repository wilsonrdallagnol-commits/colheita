// apps/admin/src/components/categorias/categoria-row.tsx
'use client';

import { useState, useTransition } from 'react';
import { deleteCategoria } from '@/lib/actions/categorias';

interface CategoriaRowProps {
  categoria: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
  };
  isLast: boolean;
}

export function CategoriaRow({ categoria, isLast }: CategoriaRowProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm(`Excluir a categoria "${categoria.name}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteCategoria(categoria.id);
      if (result.error) setDeleteError(result.error);
    });
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: isLast ? 'none' : '1px solid var(--colheita-border-subtle)',
        gap: '16px',
        opacity: isPending ? 0.5 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'var(--colheita-text-primary)',
            marginBottom: categoria.description ? '2px' : 0,
          }}
        >
          {categoria.name}
        </p>
        {categoria.description && (
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-tertiary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {categoria.description}
          </p>
        )}
        {deleteError && (
          <p style={{ fontSize: '0.75rem', color: 'var(--colheita-danger)', marginTop: '4px' }}>
            {deleteError}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <a
          href={`/categorias/${categoria.id}/editar`}
          style={{
            fontSize: '0.8125rem',
            color: 'var(--colheita-text-secondary)',
            textDecoration: 'none',
            padding: '4px 8px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
            display: 'inline-block',
          }}
        >
          Editar
        </a>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          style={{
            fontSize: '0.8125rem',
            color: 'var(--colheita-danger)',
            background: 'none',
            border: '1px solid color-mix(in srgb, var(--colheita-danger) 40%, transparent)',
            borderRadius: 'var(--colheita-radius-md)',
            padding: '4px 8px',
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? '...' : 'Excluir'}
        </button>
      </div>
    </div>
  );
}
