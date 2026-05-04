'use client';

// apps/admin/src/components/midias/search-input.tsx
//
// Input de busca para a grade de mídias.
// Navega para ?q=<termo> via router.push — não submete form ao servidor,
// usa useTransition para manter o botão de clear responsivo durante a navegação.

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface SearchInputProps {
  defaultValue?: string;
  baseHref?: string;
}

export function SearchInput({ defaultValue = '', baseHref = '/midias' }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set('q', value.trim());
    } else {
      params.delete('q');
    }

    // Preserva o filtro de tipo ativo
    const href = params.toString() ? `${baseHref}?${params.toString()}` : baseHref;
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '0.875rem',
          color: 'var(--colheita-text-tertiary)',
          pointerEvents: 'none',
          lineHeight: 1,
        }}
      >
        🔍
      </span>
      <input
        type="search"
        placeholder="Buscar por nome ou título…"
        defaultValue={defaultValue}
        onChange={handleChange}
        disabled={isPending}
        style={{
          width: '100%',
          paddingLeft: '32px',
          paddingRight: '12px',
          paddingTop: '7px',
          paddingBottom: '7px',
          fontSize: '0.8125rem',
          color: 'var(--colheita-text-primary)',
          backgroundColor: 'var(--colheita-surface-elevated)',
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-sm)',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
          opacity: isPending ? 0.6 : 1,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--colheita-brand-primary)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--colheita-border-subtle)';
        }}
      />
    </div>
  );
}
