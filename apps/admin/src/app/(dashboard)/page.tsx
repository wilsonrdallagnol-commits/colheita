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
    { data: expiringRegs },
    { count: totalPedidos },
    { count: pedidosPendentes },
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
    // Registros regulatórios ativos com vencimento nos próximos 60 dias.
    // Stratificamos no client-side em 4 buckets: expirado, <=15d, <=30d, <=60d.
    // Pega 60d numa query só pra evitar N requests; volume baixo (Argho tem ~12 regs).
    supabase
      .from('regulatory_registrations')
      .select('id, expires_at, registration_no, authority, products!inner(name, slug)')
      .eq('status', 'active')
      .not('expires_at', 'is', null)
      .lte(
        'expires_at',
        new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      )
      .order('expires_at', { ascending: true })
      .limit(50),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['confirmado', 'faturado']),
  ]);

  // Stratifica registros regulatorios em buckets de criticidade.
  // expired: ja venceu (urgencia maxima — risco de multa MAPA)
  // critical: vence em <=15 dias (sem tempo pra renovar via canal normal)
  // warning: vence em <=30 dias (janela de renovacao curta)
  // notice: vence em <=60 dias (tempo pra acionar regulatorio com folga)
  const now = Date.now();
  const expired: typeof expiringRegs = [];
  const critical15d: typeof expiringRegs = [];
  const warning30d: typeof expiringRegs = [];
  const notice60d: typeof expiringRegs = [];

  for (const reg of expiringRegs ?? []) {
    if (!reg.expires_at) continue;
    const daysLeft = Math.ceil(
      (new Date(reg.expires_at as string).getTime() - now) / (1000 * 60 * 60 * 24),
    );
    if (daysLeft < 0) expired.push(reg);
    else if (daysLeft <= 15) critical15d.push(reg);
    else if (daysLeft <= 30) warning30d.push(reg);
    else if (daysLeft <= 60) notice60d.push(reg);
  }

  // Top 3 mais urgentes pra mostrar no banner (se houver expirado/critico).
  const topUrgent = [...expired, ...critical15d].slice(0, 3);

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
      <div style={{ marginBottom: '24px' }}>
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

      {/* Banner de alerta regulatorio — so aparece quando ha expirados OU criticos.
          Camada 9 (Compliance): visibilidade #1 ao abrir o admin. Sem isto, fundador
          descobre vencimento por multa do MAPA. */}
      {(expired.length > 0 || critical15d.length > 0) && (
        <div
          style={{
            marginBottom: '32px',
            padding: '20px 24px',
            borderRadius: 'var(--colheita-radius-lg)',
            backgroundColor: expired.length > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)',
            border: `1px solid ${
              expired.length > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.3)'
            }`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <span
              style={{
                fontSize: '1.5rem',
                lineHeight: 1,
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              {expired.length > 0 ? '🛑' : '⚠️'}
            </span>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: expired.length > 0 ? '#ef4444' : '#f97316',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '6px',
                }}
              >
                {expired.length > 0
                  ? `${expired.length} registro${expired.length === 1 ? '' : 's'} regulatório${
                      expired.length === 1 ? '' : 's'
                    } EXPIRADO${expired.length === 1 ? '' : 'S'}`
                  : `${critical15d.length} registro${critical15d.length === 1 ? '' : 's'} crítico${
                      critical15d.length === 1 ? '' : 's'
                    } — vence${critical15d.length === 1 ? '' : 'm'} em ≤15 dias`}
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--colheita-text-secondary)',
                  lineHeight: 1.5,
                  marginBottom: '12px',
                }}
              >
                {expired.length > 0
                  ? 'Produtos com registro expirado não podem ser comercializados. Renove imediatamente ou suspenda a publicação.'
                  : 'Janela curta de renovação. Acione o regulatório agora pra evitar interrupção de comercialização.'}
              </p>

              {/* Lista compacta dos top 3 mais urgentes */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {topUrgent.map((reg) => {
                  const product = Array.isArray(reg.products) ? reg.products[0] : reg.products;
                  const daysLeft = reg.expires_at
                    ? Math.ceil(
                        (new Date(reg.expires_at as string).getTime() - now) /
                          (1000 * 60 * 60 * 24),
                      )
                    : null;
                  return (
                    <li
                      key={reg.id}
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--colheita-text-primary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>
                        {(product as { name?: string } | null)?.name ?? '—'}
                      </span>
                      <span style={{ color: 'var(--colheita-text-tertiary)' }}>
                        {' · '}
                        {reg.authority} {reg.registration_no}
                        {' · '}
                        {daysLeft !== null && daysLeft < 0
                          ? `vencido há ${Math.abs(daysLeft)}d`
                          : daysLeft !== null
                            ? `${daysLeft}d restantes`
                            : '—'}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <Link
                href="/compliance"
                style={{
                  display: 'inline-block',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  color: expired.length > 0 ? '#ef4444' : '#f97316',
                  textDecoration: 'none',
                }}
              >
                Ver compliance →
              </Link>
            </div>
          </div>
        </div>
      )}

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
        {/* 3 cards stratificados em vez de 1 — visibilidade gradiente da urgencia.
            Cores seguem semaforo: laranja (warning), amarelo (notice), cinza (none). */}
        <StatCard
          label="Reg. vencem ≤15d"
          value={critical15d.length}
          href="/compliance?status=active"
          accent={critical15d.length > 0 ? '#ef4444' : 'var(--colheita-text-tertiary)'}
        />
        <StatCard
          label="Reg. vencem ≤30d"
          value={warning30d.length}
          href="/compliance?status=active"
          accent={warning30d.length > 0 ? '#f97316' : 'var(--colheita-text-tertiary)'}
        />
        <StatCard
          label="Reg. vencem ≤60d"
          value={notice60d.length}
          href="/compliance?status=active"
          accent={
            notice60d.length > 0 ? 'var(--colheita-brand-gold)' : 'var(--colheita-text-tertiary)'
          }
        />
        <StatCard
          label="Pedidos"
          value={totalPedidos ?? 0}
          href="/pedidos"
          accent="var(--colheita-text-primary)"
        />
        <StatCard
          label="Confirmados/Faturados"
          value={pedidosPendentes ?? 0}
          href="/pedidos?status=confirmado"
          accent="var(--colheita-brand-primary)"
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
