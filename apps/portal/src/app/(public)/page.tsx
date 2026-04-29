// apps/portal/src/app/(public)/page.tsx
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata = { title: 'Produtos' };

type Status = 'draft' | 'published' | 'archived';

export default async function CatalogPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: produtos } = await supabase
    .from('products')
    .select('id, slug, name, tagline, status, category:product_categories(id, name)')
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('name');

  const produtosList = (produtos ?? []).map((p) => ({
    ...p,
    status: p.status as Status,
    category: Array.isArray(p.category) ? (p.category[0] ?? null) : (p.category ?? null),
  }));

  // Group by category
  const grouped = new Map<string, typeof produtosList>();
  const uncategorized: typeof produtosList = [];

  for (const p of produtosList) {
    if (!p.category) {
      uncategorized.push(p);
    } else {
      const key = p.category.name;
      if (!grouped.has(key)) grouped.set(key, []);
      // biome-ignore lint/style/noNonNullAssertion: guarded by has() check above
      grouped.get(key)!.push(p);
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
      {/* Hero */}
      <div style={{ marginBottom: '56px', maxWidth: '640px' }}>
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: '600',
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.03em',
            marginBottom: '12px',
            lineHeight: 1.2,
          }}
        >
          Portfólio Argho
        </h1>
        <p
          style={{
            fontSize: '1.0625rem',
            color: 'var(--colheita-text-secondary)',
            lineHeight: 1.6,
          }}
        >
          Fertilizantes minerais, organominerais, biológicos e adjuvantes desenvolvidos para máxima
          eficiência agronômica.
        </p>
      </div>

      {/* Categories with product grids */}
      {Array.from(grouped.entries()).map(([catName, prods]) => (
        <section key={catName} style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--colheita-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '20px',
            }}
          >
            {catName}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {prods.map((p) => (
              <ProductCard key={p.slug} produto={p} />
            ))}
          </div>
        </section>
      ))}

      {uncategorized.length > 0 && (
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--colheita-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '20px',
            }}
          >
            Outros
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {uncategorized.map((p) => (
              <ProductCard key={p.slug} produto={p} />
            ))}
          </div>
        </section>
      )}

      {produtosList.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
            color: 'var(--colheita-text-tertiary)',
          }}
        >
          <p style={{ fontSize: '1rem' }}>Nenhum produto disponível no momento.</p>
        </div>
      )}
    </div>
  );
}

function ProductCard({
  produto,
}: {
  produto: {
    slug: string;
    name: string;
    tagline: string | null;
    category: { name: string } | null;
  };
}) {
  return (
    <Link
      href={`/produtos/${produto.slug}`}
      style={{
        display: 'block',
        padding: '20px 24px',
        borderRadius: 'var(--colheita-radius-lg)',
        border: '1px solid var(--colheita-border)',
        backgroundColor: 'var(--colheita-surface-elevated)',
        textDecoration: 'none',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
    >
      {produto.category && (
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: '600',
            color: 'var(--colheita-brand-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '8px',
          }}
        >
          {produto.category.name}
        </p>
      )}
      <p
        style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: 'var(--colheita-text-primary)',
          letterSpacing: '-0.01em',
          marginBottom: produto.tagline ? '6px' : 0,
        }}
      >
        {produto.name}
      </p>
      {produto.tagline && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--colheita-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {produto.tagline}
        </p>
      )}
    </Link>
  );
}
