// apps/admin/src/components/produtos/produto-grid.tsx
import { ProdutoCard } from './produto-card.js';

interface ProdutoGridProps {
  produtos: Array<{
    id: string;
    slug: string;
    name: string;
    tagline: string | null;
    status: 'draft' | 'published' | 'archived';
    category: { name: string } | null;
  }>;
}

export function ProdutoGrid({ produtos }: ProdutoGridProps) {
  if (produtos.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '64px 24px',
          color: 'var(--colheita-text-tertiary)',
        }}
      >
        <p style={{ fontSize: '0.9375rem', marginBottom: '8px' }}>Nenhum produto encontrado.</p>
        <p style={{ fontSize: '0.8125rem' }}>Tente outros termos de busca ou limpe os filtros.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}
    >
      {produtos.map((p) => (
        <ProdutoCard key={p.id} produto={p} />
      ))}
    </div>
  );
}
