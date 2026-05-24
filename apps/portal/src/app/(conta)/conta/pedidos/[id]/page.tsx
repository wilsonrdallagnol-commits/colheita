// apps/portal/src/app/(conta)/conta/pedidos/[id]/page.tsx
//
// Detalhe de um pedido do distribuidor. RLS bloqueia se pedido não for dele;
// filtro adicional .eq('distribuidor_id', user.id) como defesa em profundidade.

import { createServerClient, requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

import { formatCurrency } from '@/lib/format-currency';
import { formatDate, formatDateTime } from '@/lib/format-date';
import { type OrderStatus, orderStatusColor, orderStatusLabel } from '@/lib/order-labels';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data } = await supabase.from('orders').select('numero').eq('id', id).maybeSingle();
  return { title: data ? `Pedido ${data.numero}` : 'Pedido' };
}



const labelStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: 'var(--colheita-text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '4px',
};

const valueStyle: React.CSSProperties = {
  fontSize: '0.9375rem',
  fontWeight: 500,
  color: 'var(--colheita-text-primary)',
  margin: 0,
};

export default async function PedidoDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Carrega pedido + items em paralelo; filtro distribuidor_id como defesa
  const [{ data: order, error }, { data: itemsData }] = await Promise.all([
    supabase
      .from('orders')
      .select(
        'id, numero, safra_pedido_id, status, distribuidor_nome, total_bruto, total_desconto, total_liquido, observacoes, motivo_ultima_atualizacao, emitido_em, prazo_entrega, synced_at, created_at',
      )
      .eq('id', id)
      .eq('distribuidor_id', user.id)
      .maybeSingle(),
    supabase
      .from('order_items')
      .select(
        'id, produto_codigo, produto_nome, quantidade, unidade, preco_unitario, desconto_pct, total',
      )
      .eq('order_id', id)
      .order('produto_nome'),
  ]);

  if (error || !order) notFound();

  const status = order.status as OrderStatus;
  const colors = orderStatusColor(status);
  const items = itemsData ?? [];

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
          href="/conta/pedidos"
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
          ← Meus pedidos
        </Link>

        {/* Header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            marginBottom: '28px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--colheita-brand-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '6px',
              }}
            >
              Pedido · {order.safra_pedido_id ? `Safra #${order.safra_pedido_id}` : 'Manual'}
            </p>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(1.5rem, 2.4vw, 1.875rem)',
                fontWeight: 600,
                color: 'var(--colheita-text-primary)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.02em',
              }}
            >
              {order.numero}
            </h1>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: '99px',
              color: colors.color,
              backgroundColor: colors.bg,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {orderStatusLabel(status)}
          </span>
        </header>

        {/* Grid de metadados */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
            padding: '20px 24px',
            border: '1px solid var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            backgroundColor: 'var(--colheita-surface-card)',
            marginBottom: '24px',
          }}
        >
          <div>
            <p style={labelStyle}>Emitido em</p>
            <p style={valueStyle}>{formatDate(order.emitido_em)}</p>
          </div>
          {order.prazo_entrega && (
            <div>
              <p style={labelStyle}>Prazo entrega</p>
              <p style={valueStyle}>{formatDate(order.prazo_entrega)}</p>
            </div>
          )}
          <div>
            <p style={labelStyle}>Distribuidor</p>
            <p style={valueStyle}>{order.distribuidor_nome ?? '—'}</p>
          </div>
          {order.synced_at && (
            <div>
              <p style={labelStyle}>Última sync</p>
              <p style={{ ...valueStyle, fontSize: '0.8125rem' }}>
                {formatDateTime(order.synced_at)}
              </p>
            </div>
          )}
        </section>

        {/* Itens */}
        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--colheita-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}
          >
            Itens ({items.length})
          </h2>
          {items.length > 0 ? (
            <div
              style={{
                border: '1px solid var(--colheita-border-subtle)',
                borderRadius: 'var(--colheita-radius-lg)',
                overflow: 'hidden',
                backgroundColor: 'var(--colheita-surface-elevated)',
              }}
            >
              {items.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto auto',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '14px 18px',
                    borderBottom:
                      i < items.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: 'var(--colheita-text-primary)',
                        margin: 0,
                        marginBottom: '2px',
                      }}
                    >
                      {item.produto_nome}
                    </p>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--colheita-text-tertiary)',
                        fontFamily: 'var(--font-mono)',
                        margin: 0,
                      }}
                    >
                      {item.produto_codigo}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--colheita-text-secondary)',
                      margin: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {Number(item.quantidade).toLocaleString('pt-BR')} {item.unidade}
                  </p>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--colheita-text-tertiary)',
                      margin: 0,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {formatCurrency(item.preco_unitario)}
                    {Number(item.desconto_pct) > 0 && (
                      <span style={{ color: 'var(--colheita-brand-secondary)' }}>
                        {' '}
                        −{Number(item.desconto_pct).toFixed(1)}%
                      </span>
                    )}
                  </p>
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: 'var(--colheita-text-primary)',
                      margin: 0,
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'right',
                    }}
                  >
                    {formatCurrency(item.total)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                color: 'var(--colheita-text-tertiary)',
                backgroundColor: 'var(--colheita-surface-elevated)',
                border: '1px solid var(--colheita-border-subtle)',
                borderRadius: 'var(--colheita-radius-lg)',
                fontSize: '0.875rem',
              }}
            >
              Pedido sem itens detalhados.
            </div>
          )}
        </section>

        {/* Totais */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '20px 24px',
            backgroundColor: 'var(--colheita-surface-card)',
            border: '1px solid var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            marginBottom: '24px',
          }}
        >
          {[
            { label: 'Subtotal', value: order.total_bruto },
            { label: 'Desconto', value: order.total_desconto, negative: true },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.875rem',
                color: 'var(--colheita-text-secondary)',
              }}
            >
              <span>{row.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                {row.negative ? '−' : ''}
                {formatCurrency(row.value)}
              </span>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--colheita-text-primary)',
              borderTop: '1px solid var(--colheita-border-subtle)',
              paddingTop: '8px',
              marginTop: '4px',
            }}
          >
            <span>Total líquido</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(order.total_liquido)}
            </span>
          </div>
        </section>

        {/* Observações */}
        {order.observacoes && (
          <section
            style={{
              padding: '16px 18px',
              backgroundColor: 'var(--colheita-surface-elevated)',
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-md)',
              marginBottom: '16px',
            }}
          >
            <p style={labelStyle}>Observações</p>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--colheita-text-secondary)',
                margin: 0,
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
              }}
            >
              {order.observacoes}
            </p>
          </section>
        )}

        {order.motivo_ultima_atualizacao && (
          <section
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--colheita-surface-elevated)',
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-md)',
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-tertiary)',
            }}
          >
            <strong style={{ color: 'var(--colheita-text-secondary)' }}>Última atualização:</strong>{' '}
            {order.motivo_ultima_atualizacao}
          </section>
        )}
      </div>
    </div>
  );
}
