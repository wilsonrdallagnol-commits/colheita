// apps/portal/src/app/(public)/page.tsx
import {
  type MockEmbeddingProvider,
  OpenAIEmbeddingProvider,
  SupabaseVectorRetriever,
  VoyageEmbeddingProvider,
} from '@colheita/ai';
import { createServerClient } from '@colheita/auth';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata = { title: 'Produtos — Argho' };

type Status = 'draft' | 'published' | 'archived';

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

// ── Vector search helper ──────────────────────────────────────────────────────

/**
 * Retorna IDs de produtos relevantes para a query via pgvector.
 * Retorna null se as env vars de embedding não estiverem configuradas (fallback para ilike).
 */
async function vectorSearchProductIds(query: string, tenantId: string): Promise<string[] | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  let embeddingProvider:
    | InstanceType<typeof VoyageEmbeddingProvider>
    | InstanceType<typeof OpenAIEmbeddingProvider>
    | InstanceType<typeof MockEmbeddingProvider>
    | null = null;

  if (process.env.VOYAGE_API_KEY) {
    embeddingProvider = new VoyageEmbeddingProvider();
  } else if (process.env.OPENAI_API_KEY) {
    embeddingProvider = new OpenAIEmbeddingProvider();
  } else {
    return null;
  }

  try {
    const supabase = createServiceClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const retriever = new SupabaseVectorRetriever(supabase, embeddingProvider);
    const results = await retriever.retrieve({
      query,
      tenantId,
      kinds: ['product'],
      topK: 20,
    });

    // Deduplica por documentId (produto pode ter múltiplos chunks)
    const seen = new Set<string>();
    const ids: string[] = [];
    for (const r of results) {
      const docId = r.chunk.documentId;
      if (!seen.has(docId)) {
        seen.add(docId);
        ids.push(docId);
      }
    }
    return ids;
  } catch {
    // Falha silenciosa — fallback para ilike
    return null;
  }
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const { q, category } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const qTrimmed = q?.trim() ?? '';

  // Fetch tenant (needed for vector search scope)
  const { data: tenantData } = await supabase.from('tenants').select('id').limit(1).single();
  const tenantId = tenantData?.id as string | undefined;

  // Vector search — tenta semântico, fallback para ilike
  let vectorProductIds: string[] | null = null;
  if (qTrimmed && tenantId) {
    vectorProductIds = await vectorSearchProductIds(qTrimmed, tenantId);
  }

  // Fetch categories and products in parallel
  const [{ data: categorias }, { data: produtos }] = await Promise.all([
    supabase.from('product_categories').select('id, slug, name').order('name'),

    (() => {
      let query = supabase
        .from('products')
        .select(
          'id, slug, name, tagline, status, category_id, category:product_categories(id, slug, name)',
        )
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('name');

      if (qTrimmed) {
        if (vectorProductIds && vectorProductIds.length > 0) {
          // Semântico: filtra por IDs retornados pelo pgvector
          query = query.in('id', vectorProductIds);
        } else if (!vectorProductIds) {
          // Fallback léxico: ilike em nome e tagline
          query = query.or(`name.ilike.%${qTrimmed}%,tagline.ilike.%${qTrimmed}%`);
        }
        // vectorProductIds === [] significa busca retornou vazio — não filtra (mostra nada)
      }

      return query;
    })(),
  ]);

  const categoriasList = categorias ?? [];

  // Resolve active category filter
  const activeCat = category ? (categoriasList.find((c) => c.slug === category) ?? null) : null;

  const produtosList = (produtos ?? [])
    .map((p) => ({
      ...p,
      status: p.status as Status,
      category: Array.isArray(p.category) ? (p.category[0] ?? null) : (p.category ?? null),
    }))
    .filter((p) => !activeCat || p.category_id === activeCat.id);

  // Group by category when not filtering
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

  const hasFilter = Boolean(q?.trim() ?? activeCat);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
      {/* Hero */}
      <div style={{ marginBottom: '40px', maxWidth: '640px' }}>
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

      {/* Search bar */}
      <form
        method="GET"
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          maxWidth: '480px',
        }}
      >
        {activeCat && <input type="hidden" name="category" value={activeCat.slug} />}
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar produto..."
          style={{
            flex: 1,
            height: '40px',
            padding: '0 14px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            color: 'var(--colheita-text-primary)',
            fontSize: '0.9375rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            height: '40px',
            padding: '0 18px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'var(--colheita-brand-primary)',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Buscar
        </button>
        {hasFilter && (
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: '40px',
              padding: '0 14px',
              borderRadius: 'var(--colheita-radius-md)',
              border: '1px solid var(--colheita-border)',
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-secondary)',
              textDecoration: 'none',
            }}
          >
            Limpar
          </Link>
        )}
      </form>

      {/* Category filter chips */}
      {categoriasList.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '40px',
          }}
        >
          <Link
            href={q ? `/?q=${encodeURIComponent(q)}` : '/'}
            style={{
              display: 'inline-block',
              padding: '5px 14px',
              borderRadius: '999px',
              fontSize: '0.8125rem',
              fontWeight: '500',
              textDecoration: 'none',
              border: `1px solid ${!activeCat ? 'var(--colheita-brand-primary)' : 'var(--colheita-border)'}`,
              backgroundColor: !activeCat
                ? 'color-mix(in srgb, var(--colheita-brand-primary) 12%, transparent)'
                : 'transparent',
              color: !activeCat
                ? 'var(--colheita-brand-primary)'
                : 'var(--colheita-text-secondary)',
            }}
          >
            Todos
          </Link>
          {categoriasList.map((c) => {
            const isActive = activeCat?.id === c.id;
            const href = q
              ? `/?q=${encodeURIComponent(q)}&category=${c.slug}`
              : `/?category=${c.slug}`;
            return (
              <Link
                key={c.id}
                href={href}
                style={{
                  display: 'inline-block',
                  padding: '5px 14px',
                  borderRadius: '999px',
                  fontSize: '0.8125rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  border: `1px solid ${isActive ? 'var(--colheita-brand-primary)' : 'var(--colheita-border)'}`,
                  backgroundColor: isActive
                    ? 'color-mix(in srgb, var(--colheita-brand-primary) 12%, transparent)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--colheita-brand-primary)'
                    : 'var(--colheita-text-secondary)',
                }}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* Product grids */}
      {activeCat ? (
        /* Flat list when category filter is active */
        produtosList.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {produtosList.map((p) => (
              <ProductCard key={p.slug} produto={p} />
            ))}
          </div>
        ) : null
      ) : (
        /* Grouped by category */
        <>
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
        </>
      )}

      {produtosList.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
            color: 'var(--colheita-text-tertiary)',
          }}
        >
          <p style={{ fontSize: '1rem' }}>
            {hasFilter
              ? 'Nenhum produto encontrado para este filtro.'
              : 'Nenhum produto disponível no momento.'}
          </p>
          {hasFilter && (
            <Link
              href="/"
              style={{
                display: 'inline-block',
                marginTop: '12px',
                fontSize: '0.875rem',
                color: 'var(--colheita-brand-primary)',
                textDecoration: 'none',
              }}
            >
              Ver todos os produtos
            </Link>
          )}
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
