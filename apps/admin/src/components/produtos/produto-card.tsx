// apps/admin/src/components/produtos/produto-card.tsx
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@colheita/ui';
import Link from 'next/link';

interface ProdutoCardProps {
  produto: {
    slug: string;
    name: string;
    tagline: string | null;
    status: 'draft' | 'published' | 'archived';
    category: { name: string } | null;
  };
}

const STATUS_DOT: Record<string, string> = {
  published: 'var(--colheita-success)',
  draft: 'var(--colheita-warning)',
  archived: 'var(--colheita-text-disabled)',
};

export function ProdutoCard({ produto }: ProdutoCardProps) {
  return (
    <Link href={`/produtos/${produto.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <Card style={{ height: '100%', cursor: 'pointer' }}>
        <CardHeader>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <CardTitle style={{ flex: 1 }}>{produto.name}</CardTitle>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: 'var(--colheita-radius-full)',
                backgroundColor: STATUS_DOT[produto.status] ?? STATUS_DOT.archived,
                flexShrink: 0,
                marginTop: '5px',
              }}
              title={produto.status}
            />
          </div>
          {produto.category && (
            <Badge variant="secondary" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
              {produto.category.name}
            </Badge>
          )}
        </CardHeader>
        {produto.tagline && (
          <CardContent>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--colheita-text-secondary)',
                lineHeight: '1.5',
              }}
            >
              {produto.tagline}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
