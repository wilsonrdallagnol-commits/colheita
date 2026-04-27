// apps/admin/src/components/produtos/produto-filters.tsx
// Valores iniciais vêm do Server Component via props (não useSearchParams).
// Isso evita Suspense boundary e é o padrão correto para RSC + Client Components.
'use client';

import { Input } from '@colheita/ui';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

interface ProdutoFiltersProps {
  categorias: Array<{ slug: string; name: string }>;
  initialQ: string;
  initialCategoria: string;
}

export function ProdutoFilters({ categorias, initialQ, initialCategoria }: ProdutoFiltersProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(initialQ);
  const [currentCategoria, setCurrentCategoria] = useState(initialCategoria);

  const updateURL = useCallback(
    (newQ: string, newCat: string) => {
      const params = new URLSearchParams();
      if (newQ) params.set('q', newQ);
      if (newCat) params.set('categoria', newCat);
      startTransition(() => {
        router.push(`/produtos?${params.toString()}`, { scroll: false });
      });
    },
    [router],
  );

  const handleCategoryChange = (cat: string) => {
    setCurrentCategoria(cat);
    updateURL(q, cat);
  };

  const handleSearchChange = useCallback(
    (value: string) => {
      setQ(value);
      const timeout = setTimeout(() => updateURL(value, currentCategoria), 300);
      return () => clearTimeout(timeout);
    },
    [currentCategoria, updateURL],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Busca */}
      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search
          size={15}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--colheita-text-tertiary)',
            pointerEvents: 'none',
          }}
        />
        <Input
          type="search"
          placeholder="Buscar produtos..."
          value={q}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={{ paddingLeft: '32px' }}
        />
      </div>

      {/* Filtros de categoria */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <button
          type="button"
          onClick={() => handleCategoryChange('')}
          style={{
            padding: '4px 12px',
            borderRadius: 'var(--colheita-radius-full)',
            fontSize: '0.8125rem',
            border: `1px solid ${currentCategoria === '' ? 'var(--colheita-brand-primary)' : 'var(--colheita-border)'}`,
            backgroundColor:
              currentCategoria === '' ? 'var(--colheita-brand-primary)' : 'transparent',
            color:
              currentCategoria === ''
                ? 'var(--colheita-brand-primary-fg)'
                : 'var(--colheita-text-secondary)',
            cursor: 'pointer',
            transition: 'all var(--colheita-transition-fast)',
          }}
        >
          Todos
        </button>

        {categorias.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => handleCategoryChange(cat.slug)}
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--colheita-radius-full)',
              fontSize: '0.8125rem',
              border: `1px solid ${currentCategoria === cat.slug ? 'var(--colheita-brand-primary)' : 'var(--colheita-border)'}`,
              backgroundColor:
                currentCategoria === cat.slug ? 'var(--colheita-brand-primary)' : 'transparent',
              color:
                currentCategoria === cat.slug
                  ? 'var(--colheita-brand-primary-fg)'
                  : 'var(--colheita-text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--colheita-transition-fast)',
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
