// apps/portal/src/app/(conta)/page.tsx
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { signOut } from '@/lib/actions/auth';

export const metadata = { title: 'Minha Conta' };

export default async function ContaPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Busca dados do distribuidor em paralelo
  const [{ data: progressData }, { data: certData }, { data: productsData }, { data: ordersData }] =
    await Promise.all([
      supabase
        .from('learning_progress')
        .select(
          `status, updated_at,
         learning_lessons(title,
           learning_modules(title, learning_tracks(slug, title)))`,
        )
        .eq('user_id', user?.id ?? '')
        .order('updated_at', { ascending: false })
        .limit(5),

      supabase
        .from('certifications')
        .select(
          `certificate_no, issued_at, status, final_score,
         learning_tracks(slug, title)`,
        )
        .eq('user_id', user?.id ?? '')
        .eq('status', 'active')
        .order('issued_at', { ascending: false })
        .limit(3),

      supabase
        .from('products')
        .select('id, name, slug, status')
        .eq('status', 'published')
        .order('name')
        .limit(6),

      // Pedidos do distribuidor (RLS garante isolamento; filtro adicional por segurança)
      user?.id
        ? supabase
            .from('orders')
            .select('id, numero, status, total_liquido, emitido_em')
            .eq('distribuidor_id', user.id)
            .order('emitido_em', { ascending: false })
            .limit(5)
        : Promise.resolve({ data: null }),
    ]);

  const progressList = progressData ?? [];
  const certList = certData ?? [];
  const productsList = productsData ?? [];
  const ordersList = ordersData ?? [];

  type OrderStatus = 'rascunho' | 'confirmado' | 'faturado' | 'entregue' | 'cancelado';

  function orderStatusLabel(s: string): string {
    const map: Record<string, string> = {
      rascunho: 'Rascunho',
      confirmado: 'Confirmado',
      faturado: 'Faturado',
      entregue: 'Entregue',
      cancelado: 'Cancelado',
    };
    return map[s] ?? s;
  }

  function orderStatusColor(s: string): string {
    if (s === 'entregue') return 'var(--colheita-success)';
    if (s === 'confirmado' || s === 'faturado') return 'var(--colheita-brand-primary)';
    if (s === 'cancelado') return 'var(--colheita-warning)';
    return 'var(--colheita-text-tertiary)';
  }

  function formatCurrency(v: string): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v));
  }

  const completedCount = progressList.filter((p) => p.status === 'completed').length;
  const inProgressCount = progressList.filter((p) => p.status === 'in_progress').length;

  const sectionLabelStyle = {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--colheita-text-tertiary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: '12px',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--colheita-surface-background)',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '40px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'var(--colheita-text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '4px',
              }}
            >
              Minha Conta
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
              {user?.email}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link
              href="/conta/materiais"
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--colheita-radius-md)',
                backgroundColor: 'var(--colheita-brand-primary)',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
              }}
            >
              📂 Materiais
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--colheita-radius-md)',
                  backgroundColor: 'transparent',
                  color: 'var(--colheita-text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  border: '1px solid var(--colheita-border)',
                  cursor: 'pointer',
                }}
              >
                Sair
              </button>
            </form>
          </div>
        </div>

        {/* Stats */}
        {progressList.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '40px',
            }}
          >
            {[
              { label: 'Lições concluídas', value: completedCount },
              { label: 'Em andamento', value: inProgressCount },
              { label: 'Certificações', value: certList.length },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: '20px 24px',
                  backgroundColor: 'var(--colheita-surface-card)',
                  border: '1px solid var(--colheita-border-subtle)',
                  borderRadius: 'var(--colheita-radius-lg)',
                }}
              >
                <p
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    color: 'var(--colheita-text-primary)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    marginBottom: '6px',
                  }}
                >
                  {stat.value}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-tertiary)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Atividade recente */}
          <div>
            <h2 style={sectionLabelStyle}>Atividade recente</h2>
            <div
              style={{
                border: '1px solid var(--colheita-border-subtle)',
                borderRadius: 'var(--colheita-radius-lg)',
                overflow: 'hidden',
              }}
            >
              {progressList.length > 0 ? (
                progressList.map((p, i) => {
                  const lesson = Array.isArray(p.learning_lessons)
                    ? p.learning_lessons[0]
                    : p.learning_lessons;
                  const mod = lesson
                    ? Array.isArray(lesson.learning_modules)
                      ? lesson.learning_modules[0]
                      : lesson.learning_modules
                    : null;
                  const track = mod
                    ? Array.isArray(mod.learning_tracks)
                      ? mod.learning_tracks[0]
                      : mod.learning_tracks
                    : null;

                  return (
                    <div
                      key={`${p.status}-${i}`}
                      style={{
                        padding: '12px 16px',
                        borderBottom:
                          i < progressList.length - 1
                            ? '1px solid var(--colheita-border-subtle)'
                            : 'none',
                        backgroundColor: 'var(--colheita-surface-elevated)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: 'var(--colheita-text-primary)',
                            marginBottom: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {lesson?.title ?? '—'}
                        </p>
                        <p
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--colheita-text-tertiary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {track?.title ?? 'Trilha desconhecida'}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: '600',
                          color:
                            p.status === 'completed'
                              ? 'var(--colheita-brand-primary)'
                              : 'var(--colheita-text-tertiary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          flexShrink: 0,
                        }}
                      >
                        {p.status === 'completed' ? '✓' : '→'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    padding: '32px 16px',
                    textAlign: 'center',
                    color: 'var(--colheita-text-tertiary)',
                    backgroundColor: 'var(--colheita-surface-elevated)',
                  }}
                >
                  <p style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
                    Nenhuma atividade ainda.
                  </p>
                  <p style={{ fontSize: '0.8125rem' }}>
                    Explore as{' '}
                    <Link
                      href="/produtos"
                      style={{ color: 'var(--colheita-brand-primary)', textDecoration: 'none' }}
                    >
                      soluções disponíveis
                    </Link>{' '}
                    para começar.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Certificações */}
          <div>
            <h2 style={sectionLabelStyle}>Certificações ({certList.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {certList.length > 0 ? (
                certList.map((cert) => {
                  const track = Array.isArray(cert.learning_tracks)
                    ? cert.learning_tracks[0]
                    : cert.learning_tracks;
                  const issuedDate = cert.issued_at
                    ? new Date(cert.issued_at).toLocaleDateString('pt-BR')
                    : '—';

                  return (
                    <div
                      key={cert.certificate_no}
                      style={{
                        padding: '14px 16px',
                        border: '1px solid var(--colheita-border-subtle)',
                        borderRadius: 'var(--colheita-radius-lg)',
                        backgroundColor: 'var(--colheita-surface-elevated)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: '600',
                          color: 'var(--colheita-text-primary)',
                          marginBottom: '4px',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {track?.title ?? 'Trilha desconhecida'}
                      </p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)' }}>
                          {issuedDate}
                        </p>
                        {cert.final_score && (
                          <p
                            style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)' }}
                          >
                            Score: {cert.final_score}%
                          </p>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: '0.6875rem',
                          color: 'var(--colheita-text-tertiary)',
                          fontFamily: 'var(--font-mono)',
                          marginTop: '6px',
                        }}
                      >
                        #{cert.certificate_no}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    padding: '32px 16px',
                    border: '1px solid var(--colheita-border-subtle)',
                    borderRadius: 'var(--colheita-radius-lg)',
                    textAlign: 'center',
                    color: 'var(--colheita-text-tertiary)',
                    backgroundColor: 'var(--colheita-surface-elevated)',
                  }}
                >
                  <p style={{ fontSize: '0.875rem' }}>Nenhuma certificação ainda.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pedidos recentes */}
        {ordersList.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ ...sectionLabelStyle, marginBottom: '12px' }}>
              Meus Pedidos ({ordersList.length})
            </h2>
            <div
              style={{
                border: '1px solid var(--colheita-border-subtle)',
                borderRadius: 'var(--colheita-radius-lg)',
                overflow: 'hidden',
              }}
            >
              {ordersList.map((order, i) => (
                <div
                  key={order.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom:
                      i < ordersList.length - 1
                        ? '1px solid var(--colheita-border-subtle)'
                        : 'none',
                    backgroundColor: 'var(--colheita-surface-elevated)',
                    gap: '12px',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--colheita-text-primary)',
                        fontFamily: 'var(--font-mono)',
                        marginBottom: '2px',
                      }}
                    >
                      {order.numero}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)' }}>
                      {new Date(order.emitido_em).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--colheita-text-primary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {formatCurrency(order.total_liquido)}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: '600',
                        color: orderStatusColor(order.status as OrderStatus),
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {orderStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Soluções disponíveis */}
        {productsList.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '12px',
              }}
            >
              <h2 style={{ ...sectionLabelStyle, marginBottom: 0 }}>Soluções disponíveis</h2>
              <Link
                href="/produtos"
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--colheita-brand-primary)',
                  textDecoration: 'none',
                }}
              >
                Ver todas →
              </Link>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
              }}
            >
              {productsList.map((product) => (
                <Link
                  key={product.id}
                  href={`/produtos/${product.slug}`}
                  style={{
                    padding: '14px 16px',
                    backgroundColor: 'var(--colheita-surface-card)',
                    border: '1px solid var(--colheita-border-subtle)',
                    borderRadius: 'var(--colheita-radius-lg)',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'var(--colheita-text-primary)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {product.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
