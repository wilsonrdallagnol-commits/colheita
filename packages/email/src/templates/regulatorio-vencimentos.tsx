// packages/email/src/templates/regulatorio-vencimentos.tsx
/**
 * Template de email: alerta diário de vencimentos regulatórios.
 *
 * Camada 9 (Compliance) — disparado pelo cron diário 08:00 BRT
 * (packages/jobs/src/jobs/regulatorio-vencimentos-cron.ts) quando há
 * registros MAPA/ANVISA/IBAMA ativos com:
 *   - status='expired' (já vencido — vermelho)
 *   - vencimento ≤15 dias (crítico — laranja)
 *   - vencimento ≤30 dias (warning — amarelo)
 *
 * Sem registros nos buckets, o cron NÃO envia email — evita spam.
 *
 * Estrutura table-based pra compatibilidade com clients de email
 * (Outlook, Gmail web, Apple Mail) — não usa flexbox, max-width 600px.
 */

export interface RegulatorioVencimentoItem {
  productName: string;
  authority: 'MAPA' | 'ANVISA' | 'IBAMA' | 'STATE' | 'OTHER';
  registrationNo: string;
  /** ISO date string ou undefined */
  expiresAt: string | undefined;
  /** Negativo = já expirou. */
  daysLeft: number;
}

export interface RegulatorioVencimentosEmailProps {
  /** Nome do tenant (Argho) */
  tenantName: string;
  /** Data formatada pt-BR de geração do alerta */
  generatedAtLabel: string;
  /** Contagens agregadas para exibir no header */
  counts: {
    expired: number;
    critical15d: number;
    warning30d: number;
  };
  /** Lista paginada (top 10 mais urgentes) */
  items: RegulatorioVencimentoItem[];
  /** URL absoluta para /admin/compliance */
  adminUrl: string;
}

const AUTHORITY_LABELS: Record<RegulatorioVencimentoItem['authority'], string> = {
  MAPA: 'MAPA',
  ANVISA: 'ANVISA',
  IBAMA: 'IBAMA',
  STATE: 'Estadual',
  OTHER: 'Outro',
};

function formatDateBR(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

function statusColor(daysLeft: number): { color: string; label: string } {
  if (daysLeft < 0) return { color: '#ef4444', label: `expirado há ${Math.abs(daysLeft)}d` };
  if (daysLeft <= 15) return { color: '#f97316', label: `${daysLeft}d` };
  return { color: '#c9a227', label: `${daysLeft}d` };
}

export function RegulatorioVencimentosEmail({
  tenantName,
  generatedAtLabel,
  counts,
  items,
  adminUrl,
}: RegulatorioVencimentosEmailProps) {
  const totalUrgent = counts.expired + counts.critical15d + counts.warning30d;

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Alerta regulatório — vencimentos</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#f5f5f0',
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
          color: '#1a1a1a',
        }}
      >
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: '#f5f5f0', padding: '40px 20px' }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  width="600"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    maxWidth: '600px',
                    width: '100%',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <tbody>
                    {/* Header */}
                    <tr>
                      <td
                        style={{
                          backgroundColor: counts.expired > 0 ? '#ef4444' : '#f97316',
                          padding: '28px 40px',
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: '12px',
                            fontWeight: 700,
                            color: 'rgba(255,255,255,0.85)',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {tenantName} · Compliance
                        </p>
                        <p
                          style={{
                            margin: '6px 0 0',
                            fontSize: '22px',
                            fontWeight: 700,
                            color: '#ffffff',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {counts.expired > 0
                            ? `${counts.expired} registro${counts.expired === 1 ? '' : 's'} expirado${counts.expired === 1 ? '' : 's'}`
                            : `${totalUrgent} registro${totalUrgent === 1 ? '' : 's'} próximo${totalUrgent === 1 ? '' : 's'} do vencimento`}
                        </p>
                      </td>
                    </tr>

                    {/* Sumário */}
                    <tr>
                      <td style={{ padding: '24px 40px 0' }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#444',
                            lineHeight: 1.5,
                          }}
                        >
                          {counts.expired > 0
                            ? 'Produtos com registro expirado NÃO podem ser comercializados. Renove imediatamente ou suspenda a publicação.'
                            : 'Janela de renovação curta. Acione o regulatório agora pra evitar interrupção de comercialização.'}
                        </p>
                      </td>
                    </tr>

                    {/* Counts row — 3 metricas */}
                    <tr>
                      <td style={{ padding: '20px 40px 0' }}>
                        <table width="100%" cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              {[
                                { label: 'Expirados', value: counts.expired, color: '#ef4444' },
                                { label: '≤15 dias', value: counts.critical15d, color: '#f97316' },
                                { label: '≤30 dias', value: counts.warning30d, color: '#c9a227' },
                              ].map((stat) => (
                                <td
                                  key={stat.label}
                                  style={{
                                    padding: '12px',
                                    textAlign: 'center',
                                    border: '1px solid #f0f0f0',
                                    borderRadius: '4px',
                                    width: '33%',
                                  }}
                                >
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: '24px',
                                      fontWeight: 700,
                                      color: stat.value > 0 ? stat.color : '#999',
                                      lineHeight: 1,
                                    }}
                                  >
                                    {stat.value}
                                  </p>
                                  <p
                                    style={{
                                      margin: '4px 0 0',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      color: '#999',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.06em',
                                    }}
                                  >
                                    {stat.label}
                                  </p>
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Lista de items urgentes */}
                    {items.length > 0 && (
                      <tr>
                        <td style={{ padding: '24px 40px 0' }}>
                          <p
                            style={{
                              margin: '0 0 12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#999',
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                            }}
                          >
                            Mais urgentes
                          </p>
                          <table
                            width="100%"
                            cellPadding={0}
                            cellSpacing={0}
                            style={{ borderTop: '2px solid #1a4a1a' }}
                          >
                            <tbody>
                              {items.map((item, idx) => {
                                const sc = statusColor(item.daysLeft);
                                return (
                                  // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                                  <tr key={idx}>
                                    <td
                                      style={{
                                        padding: '12px 0',
                                        fontSize: '14px',
                                        color: '#1a1a1a',
                                        borderBottom: '1px solid #f4f4f4',
                                      }}
                                    >
                                      <p style={{ margin: 0, fontWeight: 600 }}>
                                        {item.productName}
                                      </p>
                                      <p
                                        style={{
                                          margin: '2px 0 0',
                                          fontSize: '12px',
                                          color: '#666',
                                          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                                        }}
                                      >
                                        {AUTHORITY_LABELS[item.authority]} {item.registrationNo}
                                      </p>
                                    </td>
                                    <td
                                      style={{
                                        padding: '12px 0',
                                        fontSize: '13px',
                                        color: '#666',
                                        textAlign: 'right',
                                        borderBottom: '1px solid #f4f4f4',
                                        verticalAlign: 'top',
                                      }}
                                    >
                                      <p style={{ margin: 0 }}>{formatDateBR(item.expiresAt)}</p>
                                      <p
                                        style={{
                                          margin: '2px 0 0',
                                          fontSize: '12px',
                                          fontWeight: 700,
                                          color: sc.color,
                                        }}
                                      >
                                        {sc.label}
                                      </p>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}

                    {/* CTA */}
                    <tr>
                      <td style={{ padding: '24px 40px 8px', textAlign: 'center' }}>
                        <a
                          href={adminUrl}
                          style={{
                            display: 'inline-block',
                            padding: '12px 28px',
                            backgroundColor: '#1a4a1a',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            borderRadius: '6px',
                            letterSpacing: '0.02em',
                          }}
                        >
                          Abrir painel de compliance
                        </a>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td
                        style={{
                          padding: '20px 40px',
                          borderTop: '1px solid #f0f0f0',
                          textAlign: 'center',
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#999',
                            lineHeight: '1.5',
                          }}
                        >
                          Alerta diário gerado em {generatedAtLabel} pela Plataforma Colheita.
                          <br />
                          Você está recebendo porque tem perfil de admin no tenant {tenantName}.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

/** Subject line para envio via Resend. */
export function getRegulatorioVencimentosSubject(
  tenantName: string,
  counts: { expired: number; critical15d: number; warning30d: number },
): string {
  if (counts.expired > 0) {
    return `🛑 ${tenantName} — ${counts.expired} registro${counts.expired === 1 ? '' : 's'} regulatório${counts.expired === 1 ? '' : 's'} expirado${counts.expired === 1 ? '' : 's'}`;
  }
  if (counts.critical15d > 0) {
    return `⚠️ ${tenantName} — ${counts.critical15d} registro${counts.critical15d === 1 ? '' : 's'} vence${counts.critical15d === 1 ? '' : 'm'} em ≤15 dias`;
  }
  return `${tenantName} — registros regulatórios próximos do vencimento`;
}
