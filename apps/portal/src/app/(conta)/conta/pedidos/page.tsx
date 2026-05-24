// apps/portal/src/app/(conta)/conta/pedidos/page.tsx
//
// Lista de pedidos do distribuidor (espelha admin/pedidos mas filtrado
// por distribuidor_id = user.id). RLS garante isolamento; filtro
// adicional como defesa em profundidade.

import { createServerClient, requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';

import { formatCurrency } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';
import { type OrderStatus, orderStatusColor, orderStatusLabel } from '@/lib/order-labels';

export const metadata: Metadata = { title: 'Meus pedidos' };

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function MeusPedidosPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const params = await searchParams;
  const statusFilter = (params.status ?? '').trim() as OrderStatus | '';
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // Query paginada
  let query = supabase
    .from('orders')
    .select(
      'id, numero, status, total_liquido, emitido_em, prazo_entrega, motivo_ultima_atualizacao',
      { count: 'exact' },
    )
    .eq('distribuidor_id', user.id)
    .order('emitido_em', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (statusFilter) query = query.eq('status', statusFilter);

  const { data: orders, count, error } = await query;

  if (error) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
        <p style={{ color: 'var(--colheita-danger, #dc2626)' }}>
          Erro ao carregar pedidos. Tente recarregar.
        </p>
      </div>
    );
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const orderList = orders ?? [];

  // Resumo financeiro do período listado
  const totalPagina = orderList.reduce((sum, o) => sum + Number(o.total_liquido), 0);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--colheita-surface-background)',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Link
          href="/conta"
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
          ← Minha conta
        </Link>

        <header style={{ marginBottom: '24px' }}>
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--colheita-brand-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '8px',
            }}
          >
            Conta · Pedidos
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(1.5rem, 2.4vw, 1.875rem)',
              fontWeight: 600,
              color: 'var(--colheita-text-primary)',
              letterSpacing: '-0.025em',
            }}
          >
            Meus pedidos
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: '0.875rem',
              color: 'var(--colheita-text-secondary)',
            }}
          >
            {total > 0
              ? `${total} pedido${total === 1 ? '' : 's'} total · ${formatCurrency(String(totalPagina))} nessa página`
              : 'Nenhum pedido ainda — os pedidos sincronizam via Safra ERP.'}
          </p>
        </header>

        {/* Filtros de status */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { value: '', label: 'Todos' },
            { value: 'confirmado', label: 'Confirmados' },
            { value: 'faturado', label: 'Faturados' },
            { value: 'entregue', label: 'Entregues' },
            { value: 'cancelado', label: 'Cancelados' },
          ].map((f) => {
            const active = statusFilter === f.value;
            return (
              <Link
                key={f.value || 'todos'}
                href={f.value ? `/conta/pedidos?status=${f.value}` : '/conta/pedidos'}
                style={{
                  padding: '6px 14px',
                  borderRadius: '99px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: active ? '#fff' : 'var(--colheita-text-secondary)',
                  backgroundColor: active
                    ? 'var(--colheita-brand-primary)'
                    : 'var(--colheita-surface-elevated)',
                  border: '1px solid var(--colheita-border-subtle)',
                  textDecoration: 'none',
                }}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {/* Lista */}
        {orderList.length > 0 ? (
          <div
            style={{
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-lg)',
              overflow: 'hidden',
            }}
          >
            {orderList.map((order, i) => {
              const colors = orderStatusColor(order.status);
              return (
                <Link
                  key={order.id}
                  href={`/conta/pedidos/${order.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 18px',
                    borderBottom:
                      i < orderList.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                    backgroundColor: 'var(--colheita-surface-elevated)',
                    textDecoration: 'none',
                    gap: '12px',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: 'var(--colheita-text-primary)',
                        fontFamily: 'var(--font-mono)',
                        margin: 0,
                        marginBottom: '4px',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {order.numero}
                    </p>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--colheita-text-tertiary)',
                        margin: 0,
                      }}
                    >
                      Emitido em {formatDate(order.emitido_em)}
                      {order.prazo_entrega && ` · Entrega ${formatDate(order.prazo_entrega)}`}
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: 'var(--colheita-text-primary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {formatCurrency(order.total_liquido)}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '99px',
                        color: colors.color,
                        backgroundColor: colors.bg,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        minWidth: '78px',
                        textAlign: 'center',
                      }}
                    >
                      {orderStatusLabel(order.status)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: '40px 24px',
              textAlign: 'center',
              color: 'var(--colheita-text-tertiary)',
              backgroundColor: 'var(--colheita-surface-elevated)',
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-lg)',
            }}
          >
            <p style={{ fontSize: '0.875rem', marginBottom: '6px' }}>
              {statusFilter
                ? `Nenhum pedido ${orderStatusLabel(statusFilter).toLowerCase()}.`
                : 'Nenhum pedido encontrado.'}
            </p>
            <p style={{ fontSize: '0.8125rem' }}>
              Pedidos aparecem aqui após sincronização do Safra ERP.
            </p>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-tertiary)',
            }}
          >
            <span>
              Página {page} de {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {page > 1 && (
                <Link
                  href={`/conta/pedidos?${statusFilter ? `status=${statusFilter}&` : ''}page=${page - 1}`}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--colheita-radius-md)',
                    border: '1px solid var(--colheita-border)',
                    textDecoration: 'none',
                    color: 'var(--colheita-text-secondary)',
                  }}
                >
                  ← Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/conta/pedidos?${statusFilter ? `status=${statusFilter}&` : ''}page=${page + 1}`}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--colheita-radius-md)',
                    border: '1px solid var(--colheita-border)',
                    textDecoration: 'none',
                    color: 'var(--colheita-text-secondary)',
                  }}
                >
                  Próxima →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
