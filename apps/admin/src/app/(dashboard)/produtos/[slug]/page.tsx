// apps/admin/src/app/(dashboard)/produtos/[slug]/page.tsx
import { createServerClient, requireAuth } from '@colheita/auth';
import type { ProductApplication, ProductComposition, ProductPackaging } from '@colheita/db';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProdutoActions } from '@/components/produtos/produto-actions';
import { ProdutoDetail } from '@/components/produtos/produto-detail';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data } = await supabase
    .from('products')
    .select('name')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (!data) return { title: slug.replace(/-/g, ' ') };
  return { title: data.name };
}

export default async function ProdutoPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();

  await requireAuth(cookieStore);

  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      tagline,
      description,
      status,
      safra_codigo,
      composition,
      technical_specs,
      packaging,
      applications,
      category:product_categories(name),
      registrations:regulatory_registrations(registration_no)
    `)
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    notFound();
  }

  // Busca estoque sincronizado do Safra (se houver mapeamento)
  const { data: stockRows } = data.safra_codigo
    ? await supabase
        .from('product_stock')
        .select('deposito, estoque, unidade, synced_at')
        .eq('safra_codigo', data.safra_codigo)
        .order('deposito')
    : { data: null };

  const registration = Array.isArray(data.registrations) ? (data.registrations[0] ?? null) : null;

  const category = Array.isArray(data.category)
    ? (data.category[0] ?? null)
    : (data.category ?? null);

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)' }}>
      <Link
        href="/produtos"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--colheita-text-tertiary)',
          textDecoration: 'none',
          marginBottom: '20px',
        }}
      >
        ← Catálogo de produtos
      </Link>

      <header style={{ marginBottom: '28px' }}>
        <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
          PIM · {category?.name ?? 'Produto'}
        </p>
        <h1
          className="argho-product-name"
          style={{
            fontSize: 'clamp(1.875rem, 2.6vw, 2.5rem)',
            margin: '0 0 8px',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
          }}
        >
          {data.name}
        </h1>
        {data.tagline ? (
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--colheita-text-secondary)',
              margin: 0,
              maxWidth: '64ch',
              letterSpacing: '-0.005em',
            }}
          >
            {data.tagline}
          </p>
        ) : null}
      </header>

      {/* Barra de ações */}
      <div
        style={{
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <ProdutoActions slug={slug} status={data.status} />
        <a
          href={`/produtos/${slug}/ficha-tecnica`}
          download={`ficha-tecnica-${slug}.pdf`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 16px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            color: 'var(--colheita-text-secondary)',
            fontSize: '0.8125rem',
            fontWeight: '500',
            textDecoration: 'none',
          }}
        >
          ↓ Ficha Técnica PDF
        </a>
      </div>

      <ProdutoDetail
        produto={{
          name: data.name,
          tagline: data.tagline ?? null,
          description: data.description ?? null,
          status: data.status,
          composition: (data.composition ?? {}) as ProductComposition,
          technicalSpecs: (data.technical_specs ?? {}) as Record<string, unknown>,
          packaging: (data.packaging ?? []) as ProductPackaging,
          applications: (data.applications ?? []) as ProductApplication[],
          category,
          registrationNo: registration?.registration_no ?? null,
        }}
      />

      {/* Seção de integração Safra (estoque + código) */}
      <div
        style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid var(--colheita-border-subtle)',
        }}
      >
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: '500',
            color: 'var(--colheita-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '12px',
          }}
        >
          Integração ERP Safra
        </p>

        {/* Código Safra */}
        <div style={{ marginBottom: '16px' }}>
          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-secondary)',
              marginRight: '8px',
            }}
          >
            Código Safra:
          </span>
          {data.safra_codigo ? (
            <code
              style={{
                fontFamily: 'monospace',
                fontSize: '0.8125rem',
                color: 'var(--colheita-text-primary)',
                backgroundColor: 'var(--colheita-surface)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid var(--colheita-border-subtle)',
              }}
            >
              {data.safra_codigo}
            </code>
          ) : (
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--colheita-text-tertiary)',
                fontStyle: 'italic',
              }}
            >
              Não configurado —{' '}
              <a
                href={`/produtos/${slug}/editar`}
                style={{ color: 'var(--colheita-brand-primary)', textDecoration: 'none' }}
              >
                editar produto
              </a>{' '}
              para vincular ao Safra
            </span>
          )}
        </div>

        {/* Estoque por depósito */}
        {stockRows && stockRows.length > 0 ? (
          <div
            style={{
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-md)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 80px 160px',
                padding: '8px 16px',
                backgroundColor: 'var(--colheita-surface)',
                borderBottom: '1px solid var(--colheita-border-subtle)',
              }}
            >
              {['Depósito', 'Estoque', 'Unidade', 'Sincronizado em'].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: 'var(--colheita-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
            {stockRows.map((row, i) => (
              <div
                key={`${row.deposito}-${i}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 80px 160px',
                  padding: '10px 16px',
                  borderBottom:
                    i < stockRows.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                  backgroundColor: 'var(--colheita-surface-elevated)',
                }}
              >
                <span style={{ fontSize: '0.875rem', color: 'var(--colheita-text-primary)' }}>
                  {row.deposito}
                </span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color:
                      Number(row.estoque) > 0
                        ? 'var(--colheita-success)'
                        : 'var(--colheita-text-tertiary)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {Number(row.estoque).toLocaleString('pt-BR', { maximumFractionDigits: 3 })}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
                  {row.unidade}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--colheita-text-tertiary)',
                    fontFamily: 'monospace',
                  }}
                >
                  {new Date(row.synced_at).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : data.safra_codigo ? (
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-tertiary)',
              fontStyle: 'italic',
            }}
          >
            Nenhum dado de estoque recebido ainda. O estoque será exibido após o próximo evento{' '}
            <code style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
              inventario.atualizado
            </code>{' '}
            do Safra.
          </p>
        ) : null}
      </div>
    </div>
  );
}
