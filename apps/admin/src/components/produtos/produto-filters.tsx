// apps/admin/src/components/produtos/produto-filters.tsx
// Valores iniciais vêm do Server Component via props (não useSearchParams).
// Isso evita Suspense boundary e é o padrão correto para RSC + Client Components.
'use client';

import { Input } from '@colheita/ui';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState, useTransition } from 'react';

type Status = 'draft' | 'published' | 'archived' | '';

interface ProdutoFiltersProps {
  categorias: Array<{ slug: string; name: string }>;
  initialQ: string;
  initialCategoria: string;
  initialStatus: Status;
}

const STATUS_OPTIONS: Array<{ value: Status; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'published', label: 'Publicados' },
  { value: 'draft', label: 'Rascunhos' },
  { value: 'archived', label: 'Arquivados' },
];

export function ProdutoFilters({
  categorias,
  initialQ,
  initialCategoria,
  initialStatus,
}: ProdutoFiltersProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(initialQ);
  const [currentCategoria, setCurrentCategoria] = useState(initialCategoria);
  const [currentStatus, setCurrentStatus] = useState<Status>(initialStatus);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateURL = useCallback(
    (newQ: string, newCat: string, newStatus: Status) => {
      const params = new URLSearchParams();
      if (newQ) params.set('q', newQ);
      if (newCat) params.set('categoria', newCat);
      if (newStatus) params.set('status', newStatus);
      startTransition(() => {
        router.push(`/produtos?${params.toString()}`, { scroll: false });
      });
    },
    [router],
  );

  const handleCategoryChange = (cat: string) => {
    setCurrentCategoria(cat);
    updateURL(q, cat, currentStatus);
  };

  const handleStatusChange = (s: Status) => {
    setCurrentStatus(s);
    updateURL(q, currentCategoria, s);
  };

  const handleSearchChange = useCallback(
    (value: string) => {
      setQ(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(
        () => updateURL(value, currentCategoria, currentStatus),
        300,
      );
    },
    [currentCategoria, currentStatus, updateURL],
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

      {/* Filtros de status */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value || 'all-status'}
            type="button"
            onClick={() => handleStatusChange(opt.value)}
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--colheita-radius-full)',
              fontSize: '0.8125rem',
              border: `1px solid ${currentStatus === opt.value ? 'var(--colheita-brand-primary)' : 'var(--colheita-border)'}`,
              backgroundColor:
                currentStatus === opt.value ? 'var(--colheita-brand-primary)' : 'transparent',
              color:
                currentStatus === opt.value
                  ? 'var(--colheita-brand-primary-fg)'
                  : 'var(--colheita-text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--colheita-transition-fast)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filtros de categoria */}
      {categorias.length > 0 && (
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
      )}
    </div>
  );
}
