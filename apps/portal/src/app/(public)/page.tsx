// apps/portal/src/app/(public)/page.tsx
// Home da Plataforma Colheita — catalogo editorial Argho.
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

export const metadata = {
  title: 'Catálogo — Plataforma Colheita',
  description:
    'Catálogo digital de fertilizantes, biológicos e adjuvantes Argho — acesso para distribuidores e clientes.',
};

type Status = 'draft' | 'published' | 'archived';

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

// ── Vector search helper ──────────────────────────────────────────────────────
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
    return null;
  }
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const { q, category } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const qTrimmed = q?.trim() ?? '';

  // Fetch tenant — fallback gracioso quando Supabase indisponivel.
  let tenantId: string | undefined;
  try {
    const { data: tenantData } = await supabase.from('tenants').select('id').limit(1).single();
    tenantId = tenantData?.id as string | undefined;
  } catch {
    tenantId = undefined;
  }

  // Vector search
  let vectorProductIds: string[] | null = null;
  if (qTrimmed && tenantId) {
    vectorProductIds = await vectorSearchProductIds(qTrimmed, tenantId);
  }

  // Fetch categories and products em paralelo. Falhas viram listas vazias
  // para o portal nao crashar quando o Supabase de producao nao esta configurado.
  const categoriasResult = await (async () => {
    try {
      return await supabase.from('product_categories').select('id, slug, name').order('name');
    } catch {
      return { data: null as null | { id: string; slug: string; name: string }[] };
    }
  })();

  const produtosResult = await (async () => {
    try {
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
          query = query.in('id', vectorProductIds);
        } else if (!vectorProductIds) {
          query = query.or(`name.ilike.%${qTrimmed}%,tagline.ilike.%${qTrimmed}%`);
        }
      }
      return await query;
    } catch {
      return { data: null };
    }
  })();

  const { data: categorias } = categoriasResult;
  const { data: produtos } = produtosResult;

  const categoriasList = categorias ?? [];
  const activeCat = category ? (categoriasList.find((c) => c.slug === category) ?? null) : null;

  const produtosList = (produtos ?? [])
    .map((p) => ({
      ...p,
      status: p.status as Status,
      category: Array.isArray(p.category) ? (p.category[0] ?? null) : (p.category ?? null),
    }))
    .filter((p) => !activeCat || p.category_id === activeCat.id);

  const grouped = new Map<string, typeof produtosList>();
  const uncategorized: typeof produtosList = [];
  for (const p of produtosList) {
    if (!p.category) uncategorized.push(p);
    else {
      const key = p.category.name;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(p);
    }
  }

  const hasFilter = Boolean(q?.trim() ?? activeCat);

  return (
    <>
      {/* Hero editorial */}
      <section
        style={{
          borderBottom: '1px solid #f3f4f6',
          background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '64px 32px 48px',
          }}
        >
          <p className="argho-eyebrow" style={{ marginBottom: 16 }}>
            Plataforma Colheita · Catálogo digital
          </p>
          <h1
            className="argho-display"
            style={{
              fontSize: 'clamp(2.25rem, 4vw + 1rem, 3.5rem)',
              maxWidth: 880,
              marginBottom: 20,
              color: '#0a0a0a',
            }}
          >
            Portfólio Argho <span style={{ color: '#489030' }}>vivo</span>{' '}
            <span style={{ color: '#183090' }}>e técnico</span>.
          </h1>
          <p
            style={{
              fontSize: '1.0625rem',
              color: '#4b5563',
              lineHeight: 1.6,
              maxWidth: 640,
            }}
          >
            Fertilizantes minerais, organominerais, biológicos e adjuvantes desenvolvidos com
            ciência de ponta. Aqui você encontra ficha técnica, indicações por cultura e dados de
            registro MAPA de cada produto.
          </p>

          {/* Search */}
          <form
            method="GET"
            style={{
              marginTop: 32,
              display: 'flex',
              gap: 8,
              maxWidth: 560,
            }}
          >
            {activeCat && <input type="hidden" name="category" value={activeCat.slug} />}
            <input
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Buscar produto, cultura ou ingrediente ativo…"
              style={{
                flex: 1,
                height: 48,
                padding: '0 18px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: '#fff',
                color: '#0a0a0a',
                fontSize: '0.9375rem',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              }}
            />
            <button
              type="submit"
              style={{
                height: 48,
                padding: '0 22px',
                borderRadius: 8,
                background: '#183090',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
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
                  height: 48,
                  padding: '0 16px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  fontSize: '0.875rem',
                  color: '#4b5563',
                  textDecoration: 'none',
                  background: '#fff',
                }}
              >
                Limpar
              </Link>
            )}
          </form>

          {/* Category chips */}
          {categoriasList.length > 0 && (
            <div
              style={{
                marginTop: 24,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <CategoryChip href={q ? `/?q=${encodeURIComponent(q)}` : '/'} active={!activeCat}>
                Todos
              </CategoryChip>
              {categoriasList.map((c) => {
                const isActive = activeCat?.id === c.id;
                const href = q
                  ? `/?q=${encodeURIComponent(q)}&category=${c.slug}`
                  : `/?category=${c.slug}`;
                return (
                  <CategoryChip key={c.id} href={href} active={isActive}>
                    {c.name}
                  </CategoryChip>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Product grids */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 32px' }}>
        {activeCat ? (
          produtosList.length > 0 ? (
            <ProductGrid produtos={produtosList} />
          ) : null
        ) : (
          <>
            {Array.from(grouped.entries()).map(([catName, prods]) => (
              <section key={catName} style={{ marginBottom: 56 }}>
                <h2
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#183090',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 24,
                      height: 2,
                      background: '#489030',
                    }}
                  />
                  {catName}
                </h2>
                <ProductGrid produtos={prods} />
              </section>
            ))}
            {uncategorized.length > 0 && (
              <section style={{ marginBottom: 56 }}>
                <h2
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: 24,
                  }}
                >
                  Outros
                </h2>
                <ProductGrid produtos={uncategorized} />
              </section>
            )}
          </>
        )}

        {produtosList.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '120px 0',
              color: '#6b7280',
            }}
          >
            <p style={{ fontSize: '1.125rem', marginBottom: 12 }}>
              {hasFilter
                ? 'Nenhum produto encontrado para este filtro.'
                : 'Nenhum produto disponível no momento.'}
            </p>
            {hasFilter && (
              <Link
                href="/"
                style={{
                  display: 'inline-block',
                  marginTop: 12,
                  fontSize: '0.875rem',
                  color: '#183090',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Ver todos os produtos →
              </Link>
            )}
          </div>
        )}
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function CategoryChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-block',
        padding: '6px 14px',
        borderRadius: 999,
        fontSize: '0.8125rem',
        fontWeight: 500,
        textDecoration: 'none',
        border: `1px solid ${active ? '#183090' : '#e5e7eb'}`,
        background: active ? '#eaf0ff' : '#ffffff',
        color: active ? '#183090' : '#4b5563',
        transition: 'all 150ms',
      }}
    >
      {children}
    </Link>
  );
}

function ProductGrid({
  produtos,
}: {
  produtos: Array<{
    slug: string;
    name: string;
    tagline: string | null;
    category: { name: string } | null;
  }>;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}
    >
      {produtos.map((p) => (
        <ProductCard key={p.slug} produto={p} />
      ))}
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
        padding: '24px 24px 20px',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        background: '#fff',
        textDecoration: 'none',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        transition: 'all 150ms',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {produto.category && (
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: '#183090',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            marginBottom: 10,
          }}
        >
          {produto.category.name}
        </p>
      )}
      <p
        style={{
          fontSize: '1.0625rem',
          fontWeight: 700,
          color: '#0a0a0a',
          letterSpacing: '-0.02em',
          marginBottom: produto.tagline ? 8 : 0,
          textTransform: 'uppercase',
        }}
      >
        {produto.name}
      </p>
      {produto.tagline && (
        <p
          style={{
            fontSize: '0.875rem',
            color: '#4b5563',
            lineHeight: 1.5,
          }}
        >
          {produto.tagline}
        </p>
      )}
      <div
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: '1px solid #f3f4f6',
          fontSize: '0.75rem',
          color: '#183090',
          fontWeight: 600,
        }}
      >
        Ver ficha técnica →
      </div>
    </Link>
  );
}
