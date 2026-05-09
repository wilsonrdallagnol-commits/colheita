// apps/admin/src/app/(dashboard)/pedidos/[id]/page.tsx
//
// Detalhe de um pedido sincronizado via Safra ERP.
// Exibe cabeçalho do pedido, status, dados do distribuidor e itens.

import { createServerClient, requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

type OrderStatus = 'rascunho' | 'confirmado' | 'faturado' | 'entregue' | 'cancelado';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data } = await supabase.from('orders').select('numero').eq('id', id).single();
  return { title: data ? `Pedido ${data.numero} | Argho Admin` : 'Pedido | Argho Admin' };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function formatCurrency(value: string | number): string {
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

export default async function PedidoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Busca paralela: cabeçalho do pedido + itens
  const [{ data: order, error }, { data: items }] = await Promise.all([
    supabase
      .from('orders')
      .select(
        'id, numero, safra_pedido_id, status, status_anterior, distribuidor_id, distribuidor_nome, distribuidor_cpf_cnpj, total_bruto, total_desconto, total_liquido, observacoes, motivo_ultima_atualizacao, emitido_em, prazo_entrega, synced_at, created_at, updated_at',
      )
      .eq('id', id)
      .single(),
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
  const colors = statusColor(status);

  const labelStyle = {
    fontSize: '0.6875rem',
    fontWeight: '600' as const,
    color: 'var(--colheita-text-tertiary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: '4px',
  };

  const valueStyle = {
    fontSize: '0.875rem',
    color: 'var(--colheita-text-primary)',
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px' }}>
      {/* Back */}
      <Link
        href="/pedidos"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.875rem',
          color: 'var(--colheita-text-tertiary)',
          textDecoration: 'none',
          marginBottom: '28px',
        }}
      >
        ← Pedidos
      </Link>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '32px',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: '600',
              color: 'var(--colheita-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '12px',
            }}
            className="argho-eyebrow"
          >
            Comercial · Pedido Safra
          </p>
          <h1
            className="argho-display"
            style={{
              fontSize: 'clamp(1.875rem, 2.4vw, 2.375rem)',
              color: '#0a0a0a',
              margin: 0,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {order.numero}
          </h1>
        </div>
        <span
          style={{
            display: 'inline-flex',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '0.875rem',
            fontWeight: '500',
            backgroundColor: colors.bg,
            color: colors.color,
            border: `1px solid ${colors.border}`,
            alignSelf: 'center',
          }}
        >
          {statusLabel(status)}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '32px' }}>
        {/* Left column: info + items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Dados do pedido */}
          <section
            style={{
              border: '1px solid var(--colheita-border)',
              borderRadius: 'var(--colheita-radius-lg)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 20px',
                backgroundColor: 'var(--colheita-surface-elevated)',
                borderBottom: '1px solid var(--colheita-border)',
              }}
            >
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Dados do pedido
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                padding: '20px',
              }}
            >
              <div>
                <p style={labelStyle}>ID Safra</p>
                <p style={{ ...valueStyle, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                  {order.safra_pedido_id}
                </p>
              </div>
              <div>
                <p style={labelStyle}>Emitido em</p>
                <p style={valueStyle}>{formatDateTime(order.emitido_em)}</p>
              </div>
              {order.prazo_entrega && (
                <div>
                  <p style={labelStyle}>Prazo de entrega</p>
                  <p style={valueStyle}>{formatDate(order.prazo_entrega)}</p>
                </div>
              )}
              {order.status_anterior && (
                <div>
                  <p style={labelStyle}>Status anterior</p>
                  <p style={valueStyle}>{statusLabel(order.status_anterior as OrderStatus)}</p>
                </div>
              )}
              {order.motivo_ultima_atualizacao && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={labelStyle}>Motivo da última atualização</p>
                  <p style={valueStyle}>{order.motivo_ultima_atualizacao}</p>
                </div>
              )}
              {order.observacoes && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={labelStyle}>Observações</p>
                  <p style={{ ...valueStyle, color: 'var(--colheita-text-secondary)' }}>
                    {order.observacoes}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Itens do pedido */}
          <section
            style={{
              border: '1px solid var(--colheita-border)',
              borderRadius: 'var(--colheita-radius-lg)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 20px',
                backgroundColor: 'var(--colheita-surface-elevated)',
                borderBottom: '1px solid var(--colheita-border)',
              }}
            >
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Itens do pedido ({items?.length ?? 0})
              </p>
            </div>
            {/* Items header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr 80px 60px 90px 10px 80px',
                padding: '8px 20px',
                borderBottom: '1px solid var(--colheita-border-subtle)',
                gap: '8px',
              }}
            >
              {['Código', 'Produto', 'Qtd', 'Un', 'Preço Unit.', '', 'Total'].map((h) => (
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
            {!items || items.length === 0 ? (
              <div style={{ padding: '24px 20px' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-tertiary)' }}>
                  Sem itens registrados.
                </p>
              </div>
            ) : (
              items.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr 80px 60px 90px 10px 80px',
                    padding: '12px 20px',
                    gap: '8px',
                    borderBottom:
                      i < (items?.length ?? 0) - 1
                        ? '1px solid var(--colheita-border-subtle)'
                        : 'none',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--colheita-text-tertiary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {item.produto_codigo}
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
                    {item.produto_nome}
                  </span>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--colheita-text-primary)',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'right',
                    }}
                  >
                    {Number(item.quantidade).toLocaleString('pt-BR')}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--colheita-text-secondary)',
                    }}
                  >
                    {item.unidade}
                  </span>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--colheita-text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'right',
                    }}
                  >
                    {formatCurrency(item.preco_unitario)}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--colheita-text-tertiary)',
                    }}
                  >
                    {Number(item.desconto_pct) > 0 ? `-${item.desconto_pct}%` : ''}
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
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))
            )}
          </section>
        </div>

        {/* Right sidebar: totals + distribuidor + metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Totais */}
          <section
            style={{
              border: '1px solid var(--colheita-border)',
              borderRadius: 'var(--colheita-radius-lg)',
              padding: '20px',
            }}
          >
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: '600',
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '16px',
              }}
            >
              Resumo financeiro
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
                  Subtotal
                </span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--colheita-text-primary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {formatCurrency(order.total_bruto)}
                </span>
              </div>
              {Number(order.total_desconto) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
                    Desconto
                  </span>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--colheita-warning)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    -{formatCurrency(order.total_desconto)}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--colheita-border-subtle)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: 'var(--colheita-text-primary)',
                  }}
                >
                  Total líquido
                </span>
                <span
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: 'var(--colheita-text-primary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {formatCurrency(order.total_liquido)}
                </span>
              </div>
            </div>
          </section>

          {/* Distribuidor */}
          <section
            style={{
              border: '1px solid var(--colheita-border)',
              borderRadius: 'var(--colheita-radius-lg)',
              padding: '20px',
            }}
          >
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: '600',
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '14px',
              }}
            >
              Distribuidor
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <p style={labelStyle}>Nome</p>
                <p style={valueStyle}>{order.distribuidor_nome}</p>
              </div>
              {order.distribuidor_cpf_cnpj && (
                <div>
                  <p style={labelStyle}>CPF/CNPJ</p>
                  <p
                    style={{ ...valueStyle, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
                  >
                    {order.distribuidor_cpf_cnpj}
                  </p>
                </div>
              )}
              {order.distribuidor_id && (
                <Link
                  href={`/distribuidores/${order.distribuidor_id}`}
                  style={{
                    display: 'inline-block',
                    fontSize: '0.8125rem',
                    color: 'var(--colheita-brand-primary)',
                    textDecoration: 'none',
                    marginTop: '4px',
                  }}
                >
                  Ver perfil no portal →
                </Link>
              )}
            </div>
          </section>

          {/* Metadata */}
          <section
            style={{
              border: '1px solid var(--colheita-border)',
              borderRadius: 'var(--colheita-radius-lg)',
              padding: '20px',
            }}
          >
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: '600',
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '14px',
              }}
            >
              Metadados
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <p style={labelStyle}>Último sync</p>
                <p style={{ ...valueStyle, fontSize: '0.8125rem' }}>
                  {formatDateTime(order.synced_at)}
                </p>
              </div>
              <div>
                <p style={labelStyle}>Criado em</p>
                <p style={{ ...valueStyle, fontSize: '0.8125rem' }}>
                  {formatDateTime(order.created_at)}
                </p>
              </div>
              <div>
                <p style={labelStyle}>Atualizado em</p>
                <p style={{ ...valueStyle, fontSize: '0.8125rem' }}>
                  {formatDateTime(order.updated_at)}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
