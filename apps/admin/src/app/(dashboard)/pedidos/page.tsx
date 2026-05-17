// apps/admin/src/app/(dashboard)/pedidos/page.tsx
//
// Lista de pedidos sincronizados via Safra ERP.
// RSC: busca server-side com filtro por status e busca textual.
// URL params: ?status=&q=&page=N

import { createServerClient, requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Pedidos' };

// ── Tipos ─────────────────────────────────────────────────────────────────────

type OrderStatus = 'rascunho' | 'confirmado' | 'faturado' | 'entregue' | 'cancelado';

// ── Helpers ───────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value: string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number(value),
  );
}

function statusLabel(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    rascunho: 'Rascunho',
    confirmado: 'Confirmado',
    faturado: 'Faturado',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
  };
  return map[status];
}

function statusColor(status: OrderStatus): { bg: string; color: string; border: string } {
  switch (status) {
    case 'entregue':
      return {
        bg: 'var(--colheita-success-subtle)',
        color: 'var(--colheita-success)',
        border: 'var(--colheita-success)',
      };
    case 'confirmado':
    case 'faturado':
      return {
        bg: 'color-mix(in oklch, var(--colheita-brand-primary) 12%, transparent)',
        color: 'var(--colheita-brand-primary)',
        border: 'var(--colheita-brand-primary)',
      };
    case 'cancelado':
      return {
        bg: 'color-mix(in oklch, var(--colheita-warning) 12%, transparent)',
        color: 'var(--colheita-warning)',
        border: 'var(--colheita-warning)',
      };
    default:
      return {
        bg: 'var(--colheita-surface-elevated)',
        color: 'var(--colheita-text-tertiary)',
        border: 'var(--colheita-border)',
      };
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}

export default async function PedidosPage({ searchParams }: PageProps) {
  const { status, q, page } = await searchParams;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const currentPage = Math.max(1, Number(page ?? 1));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const validStatuses: OrderStatus[] = [
    'rascunho',
    'confirmado',
    'faturado',
    'entregue',
    'cancelado',
  ];
  const activeStatus =
    status && validStatuses.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;

  let query = supabase
    .from('orders')
    .select(
      'id, numero, status, distribuidor_nome, total_liquido, emitido_em, prazo_entrega, synced_at',
      { count: 'exact' },
    )
    .order('emitido_em', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (activeStatus) {
    query = query.eq('status', activeStatus);
  }

  if (q?.trim()) {
    query = query.or(`numero.ilike.%${q.trim()}%,distribuidor_nome.ilike.%${q.trim()}%`);
  }

  const { data: orders, count } = await query;

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1;

  // Stats por status
  const { data: statsRows } = await supabase
    .from('orders')
    .select('status')
    .returns<{ status: OrderStatus }[]>();

  const stats = (statsRows ?? []).reduce<Record<OrderStatus, number>>(
    (acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    },
    { rascunho: 0, confirmado: 0, faturado: 0, entregue: 0, cancelado: 0 },
  );
  const totalPedidos = Object.values(stats).reduce((a, b) => a + b, 0);

  const buildUrl = (params: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    if (params.status) p.set('status', params.status);
    if (params.q) p.set('q', params.q);
    if (params.page && params.page !== '1') p.set('page', params.page);
    const str = p.toString();
    return str ? `/pedidos?${str}` : '/pedidos';
  };

  const sectionHeadingStyle = {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: 'var(--colheita-text-tertiary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1400px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '32px',
        }}
      >
        <div>
          <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
            Comercial · Pedidos
          </p>
          <h1
            className="argho-display"
            style={{
              fontSize: 'clamp(1.875rem, 2.4vw, 2.375rem)',
              color: '#0a0a0a',
              margin: '0 0 8px',
            }}
          >
            Pedidos do programa
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--colheita-text-secondary)',
              margin: 0,
              maxWidth: '60ch',
            }}
          >
            Sincronizado via Safra ERP · {totalPedidos} pedido{totalPedidos !== 1 ? 's' : ''} no
            total — webhook idempotente por message_id.
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          marginBottom: '28px',
        }}
      >
        {(['confirmado', 'faturado', 'entregue', 'rascunho', 'cancelado'] as OrderStatus[]).map(
          (s) => {
            const colors = statusColor(s);
            return (
              <Link
                key={s}
                href={buildUrl({ status: activeStatus === s ? undefined : s, q })}
                style={{
                  display: 'block',
                  padding: '16px',
                  borderRadius: 'var(--colheita-radius-lg)',
                  backgroundColor:
                    activeStatus === s ? colors.bg : 'var(--colheita-surface-elevated)',
                  border: `1px solid ${activeStatus === s ? colors.border : 'var(--colheita-border)'}`,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: '600',
                    color: activeStatus === s ? colors.color : 'var(--colheita-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '8px',
                  }}
                >
                  {statusLabel(s)}
                </p>
                <p
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: activeStatus === s ? colors.color : 'var(--colheita-text-primary)',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {stats[s] ?? 0}
                </p>
              </Link>
            );
          },
        )}
      </div>

      {/* Filters */}
      <form
        method="GET"
        action="/pedidos"
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          alignItems: 'center',
        }}
      >
        {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar por número ou distribuidor…"
          style={{
            flex: 1,
            maxWidth: '400px',
            padding: '8px 12px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            color: 'var(--colheita-text-primary)',
            fontSize: '0.875rem',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'var(--colheita-brand-primary)',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Buscar
        </button>
        {(q || activeStatus) && (
          <Link
            href="/pedidos"
            style={{
              fontSize: '0.875rem',
              color: 'var(--colheita-text-tertiary)',
              textDecoration: 'none',
            }}
          >
            Limpar
          </Link>
        )}
      </form>

      {/* Table */}
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
            gridTemplateColumns: '140px 1fr 120px 100px 120px 110px',
            padding: '10px 20px',
            backgroundColor: 'var(--colheita-surface-elevated)',
            borderBottom: '1px solid var(--colheita-border)',
            gap: '12px',
          }}
        >
          {['Número', 'Distribuidor', 'Status', 'Total', 'Emitido em', 'Sincronizado'].map((h) => (
            <span key={h} style={sectionHeadingStyle}>
              {h}
            </span>
          ))}
        </div>

        {!orders || orders.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9375rem', color: 'var(--colheita-text-tertiary)' }}>
              {q || activeStatus
                ? 'Nenhum pedido encontrado com os filtros aplicados.'
                : 'Nenhum pedido sincronizado ainda. Os pedidos aparecem aqui quando o Safra ERP envia eventos via webhook.'}
            </p>
          </div>
        ) : (
          orders.map((order, i) => {
            const colors = statusColor(order.status as OrderStatus);
            return (
              <Link
                key={order.id}
                href={`/pedidos/${order.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr 120px 100px 120px 110px',
                  padding: '12px 20px',
                  gap: '12px',
                  borderBottom:
                    i < (orders?.length ?? 0) - 1
                      ? '1px solid var(--colheita-border-subtle)'
                      : 'none',
                  textDecoration: 'none',
                  alignItems: 'center',
                  transition: 'background-color 0.1s',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--colheita-brand-primary)',
                    fontFamily: 'var(--font-mono)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {order.numero}
                </span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--colheita-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {order.distribuidor_nome}
                </span>
                <span>
                  <span
                    style={{
                      display: 'inline-flex',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: colors.bg,
                      color: colors.color,
                      border: `1px solid ${colors.border}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {statusLabel(order.status as OrderStatus)}
                  </span>
                </span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--colheita-text-primary)',
                    fontFamily: 'var(--font-mono)',
                    textAlign: 'right',
                  }}
                >
                  {formatCurrency(order.total_liquido)}
                </span>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--colheita-text-secondary)',
                  }}
                >
                  {formatDate(order.emitido_em)}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--colheita-text-tertiary)',
                  }}
                >
                  {formatDateTime(order.synced_at)}
                </span>
              </Link>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '20px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {currentPage > 1 && (
            <Link
              href={buildUrl({ status: activeStatus, q, page: String(currentPage - 1) })}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--colheita-radius-md)',
                border: '1px solid var(--colheita-border)',
                fontSize: '0.875rem',
                color: 'var(--colheita-text-secondary)',
                textDecoration: 'none',
              }}
            >
              ← Anterior
            </Link>
          )}
          <span
            style={{
              fontSize: '0.875rem',
              color: 'var(--colheita-text-tertiary)',
              padding: '0 8px',
            }}
          >
            Página {currentPage} de {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={buildUrl({ status: activeStatus, q, page: String(currentPage + 1) })}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--colheita-radius-md)',
                border: '1px solid var(--colheita-border)',
                fontSize: '0.875rem',
                color: 'var(--colheita-text-secondary)',
                textDecoration: 'none',
              }}
            >
              Próxima →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
