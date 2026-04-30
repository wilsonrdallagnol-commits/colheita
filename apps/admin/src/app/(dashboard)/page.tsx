// apps/admin/src/app/(dashboard)/page.tsx
import { createServerClient, requireAuth } from '@colheita/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata = { title: 'Visão geral' };

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number;
  href: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
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
      <p
        style={{
          fontSize: '0.75rem',
          fontWeight: '500',
          color: 'var(--colheita-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '8px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '2rem',
          fontWeight: '600',
          color: accent,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Busca contagens em paralelo
  const [
    { count: totalProdutos },
    { count: publicados },
    { count: rascunhos },
    { count: arquivados },
    { count: totalCategorias },
    { count: totalTrilhas },
    { count: trilhasPublicadas },
    { count: totalLicoes },
    { count: totalDistribuidores },
  ] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .is('deleted_at', null),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'draft')
      .is('deleted_at', null),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'archived')
      .is('deleted_at', null),
    supabase.from('product_categories').select('id', { count: 'exact', head: true }),
    supabase.from('learning_tracks').select('id', { count: 'exact', head: true }),
    supabase
      .from('learning_tracks')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase.from('learning_lessons').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  // Busca produtos recentes
  const { data: recentes } = await supabase
    .from('products')
    .select('slug, name, status, updated_at')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(5);

  const statusLabel: Record<string, string> = {
    draft: 'Rascunho',
    published: 'Publicado',
    archived: 'Arquivado',
  };

  const statusColor: Record<string, string> = {
    draft: 'var(--colheita-text-tertiary)',
    published: 'var(--colheita-success)',
    archived: 'var(--colheita-warning)',
  };

  return (
    <div style={{ padding: '32px', maxWidth: '860px' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.025em',
            marginBottom: '4px',
          }}
        >
          Visão geral
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
          Argho Agrosciences — painel de gestão
        </p>
      </div>

      {/* Cards de stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
        }}
      >
        <StatCard
          label="Total produtos"
          value={totalProdutos ?? 0}
          href="/produtos"
          accent="var(--colheita-text-primary)"
        />
        <StatCard
          label="Publicados"
          value={publicados ?? 0}
          href="/produtos"
          accent="var(--colheita-success)"
        />
        <StatCard
          label="Rascunhos"
          value={rascunhos ?? 0}
          href="/produtos"
          accent="var(--colheita-brand-primary)"
        />
        <StatCard
          label="Arquivados"
          value={arquivados ?? 0}
          href="/produtos"
          accent="var(--colheita-text-tertiary)"
        />
        <StatCard
          label="Categorias"
          value={totalCategorias ?? 0}
          href="/categorias"
          accent="var(--colheita-text-primary)"
        />
        <StatCard
          label="Trilhas"
          value={totalTrilhas ?? 0}
          href="/academia"
          accent="var(--colheita-text-primary)"
        />
        <StatCard
          label="Trilhas publicadas"
          value={trilhasPublicadas ?? 0}
          href="/academia"
          accent="var(--colheita-success)"
        />
        <StatCard
          label="Lições"
          value={totalLicoes ?? 0}
          href="/academia"
          accent="var(--colheita-text-primary)"
        />
        <StatCard
          label="Distribuidores"
          value={totalDistribuidores ?? 0}
          href="/distribuidores"
          accent="var(--colheita-brand-teal)"
        />
      </div>

      {/* Atividade recente */}
      {recentes && recentes.length > 0 && (
        <div>
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
            Atualizados recentemente
          </p>
          <div
            style={{
              border: '1px solid var(--colheita-border)',
              borderRadius: 'var(--colheita-radius-lg)',
              overflow: 'hidden',
            }}
          >
            {recentes.map((p, i) => (
              <Link
                key={p.slug}
                href={`/produtos/${p.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom:
                    i < recentes.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                  textDecoration: 'none',
                  transition: 'background-color 0.1s',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--colheita-text-primary)',
                  }}
                >
                  {p.name}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: statusColor[p.status] ?? 'var(--colheita-text-tertiary)',
                  }}
                >
                  {statusLabel[p.status] ?? p.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
