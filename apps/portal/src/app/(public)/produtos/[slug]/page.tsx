// apps/portal/src/app/(public)/produtos/[slug]/page.tsx
import { createServerClient, getSession } from '@colheita/auth';
import type { ProductApplication, ProductComposition, ProductPackaging } from '@colheita/db';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data } = await supabase
    .from('products')
    .select('name, tagline')
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single();

  if (!data) return { title: slug.replace(/-/g, ' ') };

  return {
    title: data.name,
    description: data.tagline ?? undefined,
  };
}

function packagingLabel(p: ProductPackaging[number]) {
  if (p.weightKg) return `${p.type} ${p.weightKg} kg`;
  if (p.volumeL) return `${p.type} ${p.volumeL} L`;
  return p.type;
}

export default async function ProdutoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, tagline, description, safra_codigo, composition, technical_specs, packaging, applications, category:product_categories(name)',
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    notFound();
  }

  // Disponibilidade de estoque (somente se produto mapeado ao Safra)
  const { data: stockRows } = data.safra_codigo
    ? await supabase
        .from('product_stock')
        .select('deposito, estoque, unidade')
        .eq('safra_codigo', data.safra_codigo)
    : { data: null };

  const totalEstoque = stockRows?.reduce((acc, r) => acc + Number(r.estoque), 0) ?? null;
  const hasStock = totalEstoque !== null && totalEstoque > 0;
  const stockTracked = stockRows !== null;

  const category = Array.isArray(data.category)
    ? (data.category[0] ?? null)
    : (data.category ?? null);

  const session = await getSession(cookieStore);
  const isAuthenticated = !!session;

  const composition = (data.composition ?? {}) as ProductComposition;
  const technicalSpecs = (data.technical_specs ?? {}) as Record<string, unknown>;
  const packaging = (data.packaging ?? []) as ProductPackaging;
  const applications = (data.applications ?? []) as ProductApplication[];

  // Resolve nutrients from structured or flat format
  const structured = {
    ...composition.macros,
    ...composition.micros,
    ...composition.others,
  };
  const isStructured = Object.keys(structured).length > 0;
  const flat = Object.fromEntries(
    Object.entries(composition as Record<string, unknown>).filter(
      ([k]) => !['macros', 'micros', 'others'].includes(k),
    ),
  );
  const nutrients = isStructured ? structured : flat;
  const hasNutrients = Object.keys(nutrients).length > 0;

  // Technical specs to display (exclude internal fields)
  const specEntries = Object.entries(technicalSpecs).filter(
    ([k]) => !k.startsWith('registration_'),
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
      {/* Back link */}
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.875rem',
          color: 'var(--colheita-text-tertiary)',
          textDecoration: 'none',
          marginBottom: '32px',
        }}
      >
        ← Voltar ao catálogo
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '48px',
          alignItems: 'start',
        }}
      >
        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Header */}
          <div>
            {category && (
              <p
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--colheita-brand-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '10px',
                }}
              >
                {category.name}
              </p>
            )}
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
              {data.name}
            </h1>
            {data.tagline && (
              <p
                style={{
                  fontSize: '1.0625rem',
                  color: 'var(--colheita-text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                {data.tagline}
              </p>
            )}
          </div>

          {/* Description */}
          {data.description && (
            <div>
              <h2
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '14px',
                }}
              >
                Descrição
              </h2>
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--colheita-text-secondary)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                }}
              >
                {data.description}
              </p>
            </div>
          )}

          {/* Composition */}
          {hasNutrients && (
            <div>
              <h2
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '14px',
                }}
              >
                Composição garantida
              </h2>
              <div
                style={{
                  border: '1px solid var(--colheita-border)',
                  borderRadius: 'var(--colheita-radius-lg)',
                  overflow: 'hidden',
                }}
              >
                {Object.entries(nutrients).map(([nutrient, value], i, arr) => (
                  <div
                    key={nutrient}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px 20px',
                      borderBottom:
                        i < arr.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--colheita-text-secondary)',
                      }}
                    >
                      {nutrient}
                    </span>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--colheita-text-primary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Applications */}
          {applications.length > 0 && (
            <div>
              <h2
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '14px',
                }}
              >
                Indicações por Cultura
              </h2>
              <div
                style={{
                  border: '1px solid var(--colheita-border)',
                  borderRadius: 'var(--colheita-radius-lg)',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 100px 1.5fr',
                    padding: '10px 20px',
                    backgroundColor: 'var(--colheita-surface-elevated)',
                    borderBottom: '1px solid var(--colheita-border)',
                    gap: '12px',
                  }}
                >
                  {['Cultura', 'Estádio', 'Dose/ha', 'Observações'].map((h) => (
                    <span
                      key={h}
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: '600',
                        color: 'var(--colheita-text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {h}
                    </span>
                  ))}
                </div>
                {applications.map((app, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: stable positional list
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 100px 1.5fr',
                      padding: '12px 20px',
                      gap: '12px',
                      borderBottom:
                        i < applications.length - 1
                          ? '1px solid var(--colheita-border-subtle)'
                          : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--colheita-text-primary)',
                      }}
                    >
                      {app.crop}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
                      {app.stage ?? '—'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--colheita-text-secondary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {app.dosePerHa} {app.unit}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-tertiary)' }}>
                      {app.notes ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div
          style={{
            backgroundColor: 'var(--colheita-surface-elevated)',
            border: '1px solid var(--colheita-border)',
            borderRadius: 'var(--colheita-radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'sticky',
            top: '72px',
          }}
        >
          {/* Technical specs */}
          {specEntries.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '14px',
                }}
              >
                Especificações
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {specEntries.map(([key, value]) => (
                  <div key={key}>
                    <p
                      style={{
                        fontSize: '0.6875rem',
                        color: 'var(--colheita-text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '2px',
                      }}
                    >
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--colheita-text-primary)',
                      }}
                    >
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Packaging */}
          {packaging.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '14px',
                }}
              >
                Embalagens
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {packaging.map((p) => (
                  <span
                    key={packagingLabel(p)}
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--colheita-text-secondary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {packagingLabel(p)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Disponibilidade de estoque */}
          {stockTracked && (
            <div
              style={{
                paddingTop: '16px',
                borderTop: '1px solid var(--colheita-border-subtle)',
              }}
            >
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '10px',
                }}
              >
                Disponibilidade
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: hasStock
                      ? 'var(--colheita-success)'
                      : 'var(--colheita-text-tertiary)',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: hasStock ? 'var(--colheita-success)' : 'var(--colheita-text-tertiary)',
                  }}
                >
                  {hasStock ? 'Disponível' : 'Esgotado'}
                </span>
              </div>
              {stockRows && stockRows.length > 1 && (
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--colheita-text-tertiary)',
                    marginTop: '6px',
                  }}
                >
                  {stockRows.filter((r) => Number(r.estoque) > 0).length} de {stockRows.length}{' '}
                  depósitos com estoque
                </p>
              )}
            </div>
          )}

          {/* Ficha técnica download */}
          <div
            style={{
              paddingTop: '4px',
              borderTop: '1px solid var(--colheita-border-subtle)',
            }}
          >
            {isAuthenticated ? (
              <a
                href={`/produtos/${slug}/ficha-tecnica`}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 'var(--colheita-radius-md)',
                  backgroundColor: 'var(--colheita-brand-primary)',
                  color: '#fff',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  textAlign: 'center',
                  letterSpacing: '-0.01em',
                }}
              >
                ↓ Baixar Ficha Técnica (PDF)
              </a>
            ) : (
              <Link
                href={`/entrar?next=/produtos/${slug}`}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 'var(--colheita-radius-md)',
                  border: '1px solid var(--colheita-border)',
                  backgroundColor: 'transparent',
                  color: 'var(--colheita-text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  textAlign: 'center',
                  letterSpacing: '-0.01em',
                }}
              >
                Entrar para baixar a ficha técnica
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
