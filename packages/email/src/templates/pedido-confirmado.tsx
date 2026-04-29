// packages/email/src/templates/pedido-confirmado.tsx
/**
 * Template de email: confirmação de pedido Safra para o distribuidor.
 *
 * Disparado quando um evento `pedido.criado` chega via webhook Safra.
 * Notifica o distribuidor (tenant) com os detalhes do pedido recebido.
 */

export interface PedidoConfirmadoItem {
  produto: string;
  quantidade: number;
  unidade: string;
}

export interface PedidoConfirmadoEmailProps {
  /** ID/referência do pedido Safra */
  pedidoId: string;
  /** Nome do cliente que fez o pedido */
  clienteNome: string;
  /** Nome do tenant/distribuidor */
  tenantName: string;
  /** Itens do pedido */
  itens: PedidoConfirmadoItem[];
  /** Valor total em BRL (opcional) */
  valorTotal?: number;
}

export function PedidoConfirmadoEmail({
  pedidoId,
  clienteNome,
  tenantName,
  itens,
  valorTotal,
}: PedidoConfirmadoEmailProps) {
  const totalFormatted =
    valorTotal != null
      ? valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : null;

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`Pedido confirmado — ${pedidoId}`}</title>
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
                          backgroundColor: '#1a4a1a',
                          padding: '28px 40px',
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#c9a227',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {tenantName}
                        </p>
                        <p
                          style={{
                            margin: '4px 0 0',
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#ffffff',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          Novo pedido recebido
                        </p>
                      </td>
                    </tr>

                    {/* Order summary */}
                    <tr>
                      <td style={{ padding: '32px 40px 0' }}>
                        <table width="100%" cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td style={{ paddingBottom: '16px' }}>
                                <p
                                  style={{
                                    margin: '0 0 2px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: '#999',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                  }}
                                >
                                  Pedido
                                </p>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    color: '#1a1a1a',
                                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                                  }}
                                >
                                  {pedidoId}
                                </p>
                              </td>
                              <td style={{ paddingBottom: '16px', textAlign: 'right' }}>
                                <p
                                  style={{
                                    margin: '0 0 2px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: '#999',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                  }}
                                >
                                  Cliente
                                </p>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    color: '#1a1a1a',
                                  }}
                                >
                                  {clienteNome}
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Items table */}
                    <tr>
                      <td style={{ padding: '0 40px 32px' }}>
                        <table
                          width="100%"
                          cellPadding={0}
                          cellSpacing={0}
                          style={{
                            borderTop: '2px solid #1a4a1a',
                            marginTop: '8px',
                          }}
                        >
                          <thead>
                            <tr>
                              <th
                                style={{
                                  padding: '10px 0',
                                  textAlign: 'left',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: '#999',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.06em',
                                  borderBottom: '1px solid #f0f0f0',
                                }}
                              >
                                Produto
                              </th>
                              <th
                                style={{
                                  padding: '10px 0',
                                  textAlign: 'right',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: '#999',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.06em',
                                  borderBottom: '1px solid #f0f0f0',
                                }}
                              >
                                Qtd
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {itens.map((item, idx) => (
                              // biome-ignore lint/suspicious/noArrayIndexKey: stable items
                              <tr key={idx}>
                                <td
                                  style={{
                                    padding: '10px 0',
                                    fontSize: '14px',
                                    color: '#1a1a1a',
                                    borderBottom: '1px solid #f8f8f8',
                                  }}
                                >
                                  {item.produto}
                                </td>
                                <td
                                  style={{
                                    padding: '10px 0',
                                    fontSize: '14px',
                                    color: '#444',
                                    textAlign: 'right',
                                    borderBottom: '1px solid #f8f8f8',
                                  }}
                                >
                                  {item.quantidade} {item.unidade}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          {totalFormatted && (
                            <tfoot>
                              <tr>
                                <td
                                  style={{
                                    padding: '12px 0 0',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#1a1a1a',
                                  }}
                                >
                                  Total:
                                </td>
                                <td
                                  style={{
                                    padding: '12px 0 0',
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    color: '#1a4a1a',
                                    textAlign: 'right',
                                  }}
                                >
                                  {totalFormatted}
                                </td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
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
                          Este email foi gerado automaticamente pela integração Colheita ↔ Safra.
                          <br />
                          Não responda a este email.
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

/** Subject line para o envio via Resend */
export function getPedidoConfirmadoSubject(pedidoId: string, clienteNome: string): string {
  return `Novo pedido recebido — ${pedidoId} · ${clienteNome}`;
}
