// packages/email/src/templates/certificado-emitido.tsx
/**
 * Template de email: certificado emitido ao concluir uma trilha Argho Academia.
 *
 * Estrutura HTML5 simples com inline styles para máxima compatibilidade com
 * clientes de email (Gmail, Outlook, Apple Mail).
 */

export interface CertificadoEmitidoEmailProps {
  /** Nome completo do usuário certificado */
  userName: string;
  /** Título da trilha concluída */
  trackTitle: string;
  /** Número único do certificado (ex: ARGHO-2026-ABC12345) */
  certificateNo: string;
  /** URL pública do certificado no portal */
  certificateUrl: string;
  /** Data de expiração ISO (ex: "2027-04-29") — omitir se sem validade */
  expiresAt?: string | null;
}

export function CertificadoEmitidoEmail({
  userName,
  trackTitle,
  certificateNo,
  certificateUrl,
  expiresAt,
}: CertificadoEmitidoEmailProps) {
  const expiresDate = expiresAt
    ? new Date(expiresAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`Certificado Argho — ${trackTitle}`}</title>
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
                          padding: '32px 40px',
                          textAlign: 'center',
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: '22px',
                            fontWeight: 700,
                            color: '#c9a227',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          Argho Academia
                        </p>
                        <p
                          style={{
                            margin: '4px 0 0',
                            fontSize: '13px',
                            color: 'rgba(255,255,255,0.7)',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Certificado de Conclusão
                        </p>
                      </td>
                    </tr>

                    {/* Body */}
                    <tr>
                      <td style={{ padding: '40px 40px 32px' }}>
                        <p
                          style={{
                            margin: '0 0 8px',
                            fontSize: '15px',
                            color: '#666',
                          }}
                        >
                          Parabéns,
                        </p>
                        <p
                          style={{
                            margin: '0 0 24px',
                            fontSize: '24px',
                            fontWeight: 700,
                            color: '#1a1a1a',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {userName}
                        </p>

                        <p
                          style={{
                            margin: '0 0 24px',
                            fontSize: '15px',
                            lineHeight: '1.6',
                            color: '#444',
                          }}
                        >
                          Você concluiu com sucesso a trilha{' '}
                          <strong style={{ color: '#1a1a1a' }}>{trackTitle}</strong> e conquistou
                          seu certificado Argho.
                        </p>

                        {/* Certificate badge */}
                        <table
                          width="100%"
                          cellPadding={0}
                          cellSpacing={0}
                          style={{
                            backgroundColor: '#f9f7f0',
                            border: '1px solid #e8e0c8',
                            borderRadius: '6px',
                            marginBottom: '28px',
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ padding: '20px 24px' }}>
                                <p
                                  style={{
                                    margin: '0 0 4px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: '#888',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                  }}
                                >
                                  Número do Certificado
                                </p>
                                <p
                                  style={{
                                    margin: '0',
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: '#1a4a1a',
                                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                                    letterSpacing: '0.04em',
                                  }}
                                >
                                  {certificateNo}
                                </p>
                                {expiresDate && (
                                  <p
                                    style={{
                                      margin: '8px 0 0',
                                      fontSize: '13px',
                                      color: '#666',
                                    }}
                                  >
                                    Válido até{' '}
                                    <strong style={{ color: '#444' }}>{expiresDate}</strong>
                                  </p>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* CTA */}
                        <table cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  backgroundColor: '#1a4a1a',
                                  borderRadius: '6px',
                                  textAlign: 'center',
                                }}
                              >
                                <a
                                  href={certificateUrl}
                                  style={{
                                    display: 'inline-block',
                                    padding: '14px 28px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#ffffff',
                                    textDecoration: 'none',
                                    letterSpacing: '0.01em',
                                  }}
                                >
                                  Ver meu certificado
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td
                        style={{
                          padding: '24px 40px',
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
                          Este email foi enviado pela Argho Distribuidora.
                          <br />
                          Dúvidas? Entre em contato pelo portal Colheita.
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
export function getCertificadoEmitidoSubject(trackTitle: string): string {
  return `🎓 Seu certificado Argho está pronto — ${trackTitle}`;
}
