// apps/admin/src/app/(dashboard)/bi/page.tsx
//
// Camada 8 (BI / Inteligência de Mercado) — dashboard de métricas operacionais.
//
// Foco: indicadores que destravam decisão por dado (não achismo). Cada card
// linka pra UI correspondente (drill-down).
//
// v1 cobre:
//   - Pipeline comercial: leads por status + win rate (ganhos / total fechados)
//   - Materiais gerados: count por template (ficha/catalogo/banner/dossie) + tempo medio
//   - Pedidos: total + ticket medio + status mix
//   - Compliance: registros expirados + criticos (link pra page existente)
//   - Conteúdo: produtos publicados + trilhas/lições da Academia
//
// Tudo server-side via supabase queries em paralelo. Sem lib de chart externo
// (cumulative bar chart custom em SVG inline) — bundle leve.

import { createServerClient, requireAuth } from '@colheita/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@colheita/ui';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata = { title: 'Inteligência de Mercado' };

// Tokens semanticos editoriais — definidos em globals.css (--admin-*).
// Substituem hex Tailwind defaults (#3b82f6, #10b981, etc) que davam energia
// de SaaS template sem identidade Argho.
const STATUS_COLOR: Record<string, string> = {
  novo: 'var(--admin-neutral)',
  qualificado: 'var(--admin-pipeline)',
  proposta: 'var(--admin-attention)',
  ganho: 'var(--admin-positive)',
  perdido: 'var(--admin-critical)',
};

const TEMPLATE_CATEGORY_LABEL: Record<string, string> = {
  datasheet: 'Ficha técnica',
  catalog: 'Catálogo',
  banner: 'Banner social',
  social_post: 'Post social',
  presentation: 'Apresentação',
  flyer: 'Flyer',
  other: 'Outro',
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  confirmado: 'Confirmado',
  faturado: 'Faturado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

const ORDER_STATUS_COLOR: Record<string, string> = {
  rascunho: 'var(--admin-neutral)',
  confirmado: 'var(--admin-pipeline)',
  faturado: 'var(--admin-attention)',
  entregue: 'var(--admin-positive)',
  cancelado: 'var(--admin-critical)',
};

interface MaterialRow {
  duration_ms: number | null;
  template: { category: string } | { category: string }[] | null;
}

interface OrderRow {
  status: string;
  total_liquido: number | string | null;
}

function formatCurrency(brl: number): string {
  return brl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function BiPage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Janela de 30 dias pra sparklines temporais
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // 9 queries em paralelo. Tudo agregado no server pra evitar shipping de
  // dados brutos pro client.
  const [
    leadsResult,
    materiaisResult,
    pedidosResult,
    produtosCount,
    trilhasCount,
    licoesCount,
    regsResult,
    leadsTimelineResult,
    materiaisTimelineResult,
  ] = await Promise.all([
    // A1 fix 2026-05-09: limit + ORDER BY explicito pra evitar full table scan
    // em escala E garantir que truncamento priorize leads recentes (nao aleatorio).
    // 10k cobre ~5 anos de operacao por tenant; alem disso virar RPC agregadora.
    supabase
      .from('leads')
      .select('status, area_hectares')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(10000),
    supabase
      .from('generated_materials')
      .select('duration_ms, template:material_templates(category)')
      .order('generated_at', { ascending: false })
      .limit(1000),
    supabase
      .from('orders')
      .select('status, total_liquido')
      .order('created_at', { ascending: false })
      .limit(10000),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .is('deleted_at', null),
    supabase
      .from('learning_tracks')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase.from('learning_lessons').select('id', { count: 'exact', head: true }),
    supabase
      .from('regulatory_registrations')
      .select('status, expires_at')
      .order('expires_at', { ascending: true, nullsFirst: false })
      .limit(5000),
    // Timeline de 30 dias pra sparklines
    supabase
      .from('leads')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(5000),
    supabase
      .from('generated_materials')
      .select('generated_at')
      .gte('generated_at', thirtyDaysAgo)
      .order('generated_at', { ascending: true })
      .limit(2000),
  ]);

  // ── Leads pipeline ─────────────────────────────────────────────────────────
  type LeadStatus = 'novo' | 'qualificado' | 'proposta' | 'ganho' | 'perdido';
  const leadCounts: Record<LeadStatus, number> = {
    novo: 0,
    qualificado: 0,
    proposta: 0,
    ganho: 0,
    perdido: 0,
  };
  let totalAreaPipeline = 0;
  for (const l of leadsResult.data ?? []) {
    const s = l.status as LeadStatus;
    if (leadCounts[s] !== undefined) leadCounts[s]++;
    if ((s === 'qualificado' || s === 'proposta') && l.area_hectares) {
      totalAreaPipeline += Number(l.area_hectares);
    }
  }
  const totalLeads = Object.values(leadCounts).reduce((a, b) => a + b, 0);
  const totalFechados = leadCounts.ganho + leadCounts.perdido;
  const winRate = totalFechados > 0 ? (leadCounts.ganho / totalFechados) * 100 : 0;
  const ativos = leadCounts.novo + leadCounts.qualificado + leadCounts.proposta;

  // ── Materiais ──────────────────────────────────────────────────────────────
  const materiais = (materiaisResult.data ?? []) as MaterialRow[];
  const materiaisCounts: Record<string, number> = {};
  let totalDuration = 0;
  let durationSamples = 0;
  for (const m of materiais) {
    const tpl = Array.isArray(m.template) ? m.template[0] : m.template;
    const category = (tpl?.category as string) ?? 'other';
    materiaisCounts[category] = (materiaisCounts[category] ?? 0) + 1;
    if (m.duration_ms) {
      totalDuration += m.duration_ms;
      durationSamples++;
    }
  }
  const avgDurationMs = durationSamples > 0 ? totalDuration / durationSamples : 0;
  const totalMateriais = materiais.length;

  // ── Pedidos ────────────────────────────────────────────────────────────────
  const pedidos = (pedidosResult.data ?? []) as OrderRow[];
  const pedidosCounts: Record<string, number> = {};
  let totalRevenue = 0;
  let totalConsiderados = 0;
  for (const p of pedidos) {
    const s = p.status;
    pedidosCounts[s] = (pedidosCounts[s] ?? 0) + 1;
    if (s === 'confirmado' || s === 'faturado' || s === 'entregue') {
      const v = typeof p.total_liquido === 'string' ? Number(p.total_liquido) : p.total_liquido;
      if (typeof v === 'number' && Number.isFinite(v)) {
        totalRevenue += v;
        totalConsiderados++;
      }
    }
  }
  const totalPedidos = pedidos.length;
  const ticketMedio = totalConsiderados > 0 ? totalRevenue / totalConsiderados : 0;

  // ── Sparklines temporais (30 dias) ─────────────────────────────────────────
  // Bucket por dia em ISO YYYY-MM-DD. Array de 30 dias (do mais antigo pro mais
  // recente) com count de eventos por dia.
  function bucketDaily(items: Array<{ ts: string }>, days: number): number[] {
    const buckets = new Array<number>(days).fill(0);
    const now = Date.now();
    for (const item of items) {
      const ts = new Date(item.ts).getTime();
      const daysAgo = Math.floor((now - ts) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < days) {
        const idx = days - 1 - daysAgo; // mais recente no fim do array
        const cur = buckets[idx] ?? 0;
        buckets[idx] = cur + 1;
      }
    }
    return buckets;
  }

  const leadsDaily = bucketDaily(
    (leadsTimelineResult.data ?? []).map((l) => ({ ts: l.created_at as string })),
    30,
  );
  const materiaisDaily = bucketDaily(
    (materiaisTimelineResult.data ?? []).map((m) => ({ ts: m.generated_at as string })),
    30,
  );

  // Comparativo: ultima metade vs primeira metade da janela (15d vs 15d)
  function compareHalves(daily: number[]): {
    delta: number;
    pct: number;
    trend: 'up' | 'down' | 'flat';
  } {
    const half = Math.floor(daily.length / 2);
    const recent = daily.slice(half).reduce((a, b) => a + b, 0);
    const previous = daily.slice(0, half).reduce((a, b) => a + b, 0);
    const delta = recent - previous;
    const pct = previous > 0 ? (delta / previous) * 100 : recent > 0 ? 100 : 0;
    const trend = Math.abs(delta) === 0 ? 'flat' : delta > 0 ? 'up' : 'down';
    return { delta, pct, trend };
  }

  const leadsTrend = compareHalves(leadsDaily);
  const materiaisTrend = compareHalves(materiaisDaily);

  // ── Compliance ─────────────────────────────────────────────────────────────
  const regs = regsResult.data ?? [];
  let regsExpired = 0;
  let regsCritical15 = 0;
  let regsActive = 0;
  const now = Date.now();
  for (const r of regs) {
    if (r.status === 'expired') regsExpired++;
    if (r.status === 'active') {
      regsActive++;
      if (r.expires_at) {
        const days = Math.ceil(
          (new Date(r.expires_at as string).getTime() - now) / (1000 * 60 * 60 * 24),
        );
        if (days >= 0 && days <= 15) regsCritical15++;
      }
    }
  }

  return (
    <div
      style={{
        padding: 'clamp(24px, 3vw, 48px) clamp(24px, 4vw, 72px)',
        // Sem maxWidth — full-width by default. Caixa centralizada de 1200px
        // deixa barras vazias em telas grandes (anti-pattern hm-designer).
      }}
    >
      <Breadcrumb style={{ marginBottom: '32px' }}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span
              style={{
                color: 'var(--colheita-text-tertiary)',
                fontSize: '0.75rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Argho
            </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Inteligência de Mercado
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div style={{ marginBottom: '36px' }}>
        <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
          Inteligência de Mercado
        </p>
        <h1
          className="argho-display"
          style={{
            fontSize: 'clamp(1.875rem, 2.4vw, 2.375rem)',
            color: '#0a0a0a',
            margin: '0 0 8px',
          }}
        >
          Visão consolidada do programa
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--colheita-text-secondary)',
            maxWidth: '64ch',
            margin: 0,
          }}
        >
          Pipeline, materiais, pedidos, compliance — todos sob o mesmo painel.
        </p>
      </div>

      {/* Métricas hero — 4 KPIs principais */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <KpiCard
          label="Win rate"
          value={`${winRate.toFixed(1)}%`}
          sub={`${leadCounts.ganho} ganhos de ${totalFechados} fechados`}
          color={
            winRate >= 25
              ? 'var(--admin-positive)'
              : winRate >= 10
                ? 'var(--admin-attention)'
                : 'var(--admin-critical)'
          }
          href="/leads?status=ganho"
        />
        <KpiCard
          label="Pipeline ativo"
          value={String(ativos)}
          sub={
            totalAreaPipeline > 0
              ? `${totalAreaPipeline.toLocaleString('pt-BR')} ha em qualificação/proposta`
              : 'leads em aberto'
          }
          color="var(--admin-pipeline)"
          href="/leads"
        />
        <KpiCard
          label="Receita capturada"
          value={formatCurrency(totalRevenue)}
          sub={`ticket médio ${formatCurrency(ticketMedio)} · ${totalConsiderados} pedidos`}
          color="var(--admin-positive)"
          href="/pedidos"
        />
        <KpiCard
          label="Materiais gerados"
          value={String(totalMateriais)}
          sub={
            avgDurationMs > 0
              ? `tempo médio ${(avgDurationMs / 1000).toFixed(1)}s`
              : 'tempo médio —'
          }
          color="var(--admin-knowledge)"
          href="/materiais/historico"
        />
      </div>

      {/* Sparklines de tendência — 30 dias */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <SparklineCard
          label="Leads capturados"
          subtitle="Últimos 30 dias"
          daily={leadsDaily}
          color="var(--admin-pipeline)"
          trend={leadsTrend}
          totalLabel={`${leadsDaily.reduce((a, b) => a + b, 0)} no período`}
        />
        <SparklineCard
          label="Materiais gerados"
          subtitle="Últimos 30 dias"
          daily={materiaisDaily}
          color="var(--admin-knowledge)"
          trend={materiaisTrend}
          totalLabel={`${materiaisDaily.reduce((a, b) => a + b, 0)} no período`}
        />
      </div>

      {/* Pipeline funnel + Materiais breakdown — grid 2 cols */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Pipeline funnel */}
        <Section title="Pipeline comercial" subtitle={`${totalLeads} leads totais`}>
          <FunnelBar
            label="Novo"
            count={leadCounts.novo}
            total={totalLeads}
            color={STATUS_COLOR.novo ?? 'var(--admin-neutral)'}
            href="/leads?status=novo"
          />
          <FunnelBar
            label="Qualificado"
            count={leadCounts.qualificado}
            total={totalLeads}
            color={STATUS_COLOR.qualificado ?? 'var(--admin-pipeline)'}
            href="/leads?status=qualificado"
          />
          <FunnelBar
            label="Proposta"
            count={leadCounts.proposta}
            total={totalLeads}
            color={STATUS_COLOR.proposta ?? 'var(--admin-attention)'}
            href="/leads?status=proposta"
          />
          <FunnelBar
            label="Ganho"
            count={leadCounts.ganho}
            total={totalLeads}
            color={STATUS_COLOR.ganho ?? 'var(--admin-positive)'}
            href="/leads?status=ganho"
          />
          <FunnelBar
            label="Perdido"
            count={leadCounts.perdido}
            total={totalLeads}
            color={STATUS_COLOR.perdido ?? 'var(--admin-critical)'}
            href="/leads?status=perdido"
          />
        </Section>

        {/* Materiais por categoria */}
        <Section title="Materiais por tipo" subtitle={`${totalMateriais} gerações`}>
          {Object.entries(materiaisCounts).length === 0 ? (
            <EmptyHint text="Nenhum material gerado ainda. Gere o primeiro na página de produtos." />
          ) : (
            Object.entries(materiaisCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <FunnelBar
                  key={cat}
                  label={TEMPLATE_CATEGORY_LABEL[cat] ?? cat}
                  count={count}
                  total={totalMateriais}
                  color="var(--admin-knowledge)"
                  href="/materiais/historico"
                />
              ))
          )}
        </Section>
      </div>

      {/* Pedidos breakdown + Compliance — grid 2 cols */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <Section title="Pedidos por status" subtitle={`${totalPedidos} pedidos sincronizados`}>
          {Object.entries(pedidosCounts).length === 0 ? (
            <EmptyHint text="Sem pedidos sincronizados. Verifique o webhook Safra." />
          ) : (
            Object.entries(pedidosCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([s, count]) => (
                <FunnelBar
                  key={s}
                  label={ORDER_STATUS_LABEL[s] ?? s}
                  count={count}
                  total={totalPedidos}
                  color={ORDER_STATUS_COLOR[s] ?? 'var(--admin-neutral)'}
                  href={`/pedidos?status=${s}`}
                />
              ))
          )}
        </Section>

        <Section title="Compliance regulatório" subtitle={`${regsActive + regsExpired} registros`}>
          <CountRow
            label="Expirados"
            value={regsExpired}
            color="var(--admin-critical)"
            href="/compliance?status=expired"
          />
          <CountRow
            label="Vencendo em ≤15 dias"
            value={regsCritical15}
            color="var(--admin-attention)"
            href="/compliance?status=active"
          />
          <CountRow
            label="Ativos no total"
            value={regsActive}
            color="var(--admin-positive)"
            href="/compliance?status=active"
          />
        </Section>
      </div>

      {/* Conteúdo (PIM + Academia) */}
      <Section title="Conteúdo publicado">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}
        >
          <MiniStat
            label="Produtos"
            value={String(produtosCount.count ?? 0)}
            href="/produtos?status=published"
          />
          <MiniStat label="Trilhas" value={String(trilhasCount.count ?? 0)} href="/academia" />
          <MiniStat label="Lições" value={String(licoesCount.count ?? 0)} href="/academia" />
        </div>
      </Section>
    </div>
  );
}

// ── Subcomponents ───────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  color,
  href,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: '24px',
        borderRadius: 'var(--colheita-radius-lg)',
        border: '1px solid var(--colheita-border)',
        backgroundColor: '#ffffff',
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        transition: 'box-shadow 200ms ease, border-color 200ms ease',
      }}
    >
      {/* Indicador categorico — barra fina vertical (estilo ficha tecnica Argho) */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          backgroundColor: color,
        }}
      />
      <p
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--colheita-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '14px',
        }}
      >
        {label}
      </p>
      <p
        className="argho-display"
        style={{
          fontSize: '2rem',
          color: '#0a0a0a',
          margin: '0 0 6px',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: '0.8125rem',
          color: 'var(--colheita-text-tertiary)',
          margin: 0,
        }}
      >
        {sub}
      </p>
    </Link>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: '24px',
        borderRadius: 'var(--colheita-radius-lg)',
        border: '1px solid var(--colheita-border)',
        backgroundColor: '#ffffff',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--colheita-brand-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '4px',
          }}
        >
          {title}
        </p>
        {subtitle && (
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--colheita-text-tertiary)',
              margin: 0,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{children}</div>
    </div>
  );
}

function FunnelBar({
  label,
  count,
  total,
  color,
  href,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  href?: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const inner = (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.8125rem',
          marginBottom: '4px',
        }}
      >
        <span style={{ color: 'var(--colheita-text-secondary)' }}>{label}</span>
        <span
          style={{
            color: 'var(--colheita-text-primary)',
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {count}
          <span style={{ color: 'var(--colheita-text-tertiary)', fontWeight: 400 }}>
            {' · '}
            {pct.toFixed(0)}%
          </span>
        </span>
      </div>
      <div
        style={{
          height: '6px',
          borderRadius: '3px',
          backgroundColor: 'var(--colheita-surface-sunken, #f3f4f6)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 200ms',
          }}
        />
      </div>
    </>
  );

  if (!href) return <div>{inner}</div>;
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      {inner}
    </Link>
  );
}

function CountRow({
  label,
  value,
  color,
  href,
}: {
  label: string;
  value: number;
  color: string;
  href?: string;
}) {
  const inner = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 14px',
        borderRadius: 'var(--colheita-radius-sm)',
        backgroundColor: 'color-mix(in srgb, currentColor 6%, transparent)',
        color,
      }}
    >
      <span
        style={{
          fontSize: '0.875rem',
          color: 'var(--colheita-text-primary)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
  if (!href) return inner;
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      {inner}
    </Link>
  );
}

function MiniStat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: '14px 16px',
        borderRadius: 'var(--colheita-radius-md)',
        border: '1px solid var(--colheita-border-subtle)',
        textDecoration: 'none',
      }}
    >
      <p
        style={{
          fontSize: '0.6875rem',
          color: 'var(--colheita-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          margin: '0 0 4px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--colheita-text-primary)',
          margin: 0,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </p>
    </Link>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <p
      style={{
        fontSize: '0.8125rem',
        color: 'var(--colheita-text-tertiary)',
        margin: 0,
        padding: '8px 0',
      }}
    >
      {text}
    </p>
  );
}

// SVG sparkline inline — sem dependencia externa de chart lib.
// Recebe array de counts diarios e renderiza linha + area com gradient.
function SparklineCard({
  label,
  subtitle,
  daily,
  color,
  trend,
  totalLabel,
}: {
  label: string;
  subtitle: string;
  daily: number[];
  color: string;
  trend: { delta: number; pct: number; trend: 'up' | 'down' | 'flat' };
  totalLabel: string;
}) {
  const max = Math.max(...daily, 1);
  const w = 320;
  const h = 60;
  const stepX = daily.length > 1 ? w / (daily.length - 1) : w;

  const points = daily.map((value, i) => {
    const x = i * stepX;
    const y = h - (value / max) * h;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${w} ${h} L 0 ${h} Z`;

  const trendColor =
    trend.trend === 'up' ? '#10b981' : trend.trend === 'down' ? '#ef4444' : '#9ca3af';
  const trendIcon = trend.trend === 'up' ? '↑' : trend.trend === 'down' ? '↓' : '→';

  return (
    <div
      style={{
        padding: '16px 20px',
        borderRadius: 'var(--colheita-radius-lg)',
        border: '1px solid var(--colheita-border)',
        backgroundColor: 'var(--colheita-surface-elevated)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--colheita-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: '0 0 4px',
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-primary)',
              fontWeight: 600,
              margin: 0,
            }}
          >
            {totalLabel}
          </p>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: trendColor,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {trendIcon} {trend.pct >= 0 ? '+' : ''}
            {trend.pct.toFixed(0)}%
          </span>
          <p
            style={{
              fontSize: '0.6875rem',
              color: 'var(--colheita-text-tertiary)',
              margin: 0,
            }}
          >
            vs 15d anteriores
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height="60"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <title>{`${label} - sparkline ${subtitle}`}</title>
        <defs>
          <linearGradient id={`spark-grad-${label.replace(/\s/g, '')}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#spark-grad-${label.replace(/\s/g, '')})`} stroke="none" />
        <path d={linePath} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        {/* Marca o ultimo ponto */}
        {points.length > 0 && (
          <circle
            cx={(points[points.length - 1] ?? { x: 0 }).x}
            cy={(points[points.length - 1] ?? { y: 0 }).y}
            r="2.5"
            fill={color}
          />
        )}
      </svg>
      <p
        style={{
          fontSize: '0.6875rem',
          color: 'var(--colheita-text-tertiary)',
          margin: '6px 0 0',
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}
