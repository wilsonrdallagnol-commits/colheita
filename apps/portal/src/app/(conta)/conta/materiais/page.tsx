// apps/portal/src/app/(conta)/conta/materiais/page.tsx
//
// Camada 5 (Distribuidores) — area logada com materiais Argho pra download.
//
// Distribuidor autenticado ve catalogo consolidado + ficha tecnica
// de cada produto publicado. Reusa endpoints existentes:
//   /produtos/[slug]/ficha-tecnica (portal — ja em prod com rate limit)

import { createServerClient, requireAuth } from '@colheita/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata = { title: 'Materiais para download' };

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  category: { name: string } | { name: string }[] | null;
}

const PORTAL_PRIMARY = '#183090';
const ARGHO_GREEN = '#489030';

export default async function MateriaisPage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { data: rawProducts } = await supabase
    .from('products')
    .select('id, slug, name, tagline, category:product_categories(name)')
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('name')
    .limit(200);

  const products: ProductRow[] = (rawProducts ?? []) as ProductRow[];

  // Agrupa por categoria pro display
  const grouped = new Map<string, ProductRow[]>();
  for (const p of products) {
    const cat = Array.isArray(p.category) ? p.category[0] : p.category;
    const catName = cat?.name ?? 'Sem categoria';
    if (!grouped.has(catName)) grouped.set(catName, []);
    grouped.get(catName)?.push(p);
  }

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px',
      }}
    >
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--colheita-text-primary)',
          letterSpacing: '-0.02em',
          marginBottom: '4px',
        }}
      >
        Materiais para download
      </h1>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--colheita-text-secondary)',
          marginBottom: '32px',
        }}
      >
        Acesso direto ao catálogo Argho e fichas técnicas individuais.
      </p>

      {/* Catalogo consolidado — destaque */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: 'var(--colheita-radius-lg)',
          background: `linear-gradient(135deg, ${PORTAL_PRIMARY} 0%, ${ARGHO_GREEN} 100%)`,
          color: '#fff',
          marginBottom: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              opacity: 0.85,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '4px',
            }}
          >
            Destaque
          </p>
          <h2
            style={{
              fontSize: '1.375rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}
          >
            Catálogo Argho — Safra {new Date().getFullYear()}
          </h2>
          <p
            style={{
              fontSize: '0.875rem',
              opacity: 0.9,
              margin: 0,
              maxWidth: '560px',
            }}
          >
            Linha completa em 1 PDF: capa institucional + sumário agrupado por categoria + 1 página
            por produto com NPK, embalagens, indicações por cultura e registro MAPA.
          </p>
        </div>
        <a
          href="/conta/materiais/catalogo"
          download
          style={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            padding: '10px 20px',
            borderRadius: 'var(--colheita-radius-md)',
            background: '#fff',
            color: PORTAL_PRIMARY,
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          ↓ Baixar catálogo (PDF)
        </a>
      </div>

      {/* Fichas tecnicas por categoria */}
      <p
        style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          color: 'var(--colheita-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '16px',
        }}
      >
        Fichas técnicas individuais — {products.length} produtos
      </p>

      {products.length === 0 ? (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--colheita-text-tertiary)',
            padding: '24px',
            textAlign: 'center',
            border: '1px dashed var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
          }}
        >
          Nenhum produto publicado no momento.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Array.from(grouped.entries()).map(([catName, list]) => (
            <section key={catName}>
              <h3
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: ARGHO_GREEN,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '24px',
                    height: '2px',
                    background: ARGHO_GREEN,
                  }}
                />
                {catName}
              </h3>
              <div
                style={{
                  border: '1px solid var(--colheita-border-subtle)',
                  borderRadius: 'var(--colheita-radius-lg)',
                  overflow: 'hidden',
                }}
              >
                {list.map((p, i) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '12px',
                      padding: '12px 16px',
                      alignItems: 'center',
                      borderBottom:
                        i < list.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                      background: 'var(--colheita-surface-elevated)',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <Link
                        href={`/produtos/${p.slug}`}
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          color: 'var(--colheita-text-primary)',
                          textDecoration: 'none',
                          marginBottom: '2px',
                          display: 'block',
                          textTransform: 'uppercase',
                          letterSpacing: '0.01em',
                        }}
                      >
                        {p.name}
                      </Link>
                      {p.tagline && (
                        <p
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--colheita-text-tertiary)',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {p.tagline}
                        </p>
                      )}
                    </div>
                    <a
                      href={`/produtos/${p.slug}/ficha-tecnica`}
                      download
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--colheita-radius-md)',
                        border: `1px solid ${PORTAL_PRIMARY}`,
                        color: PORTAL_PRIMARY,
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Ficha técnica (PDF)
                    </a>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
