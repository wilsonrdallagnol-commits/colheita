// packages/email/src/send.ts
/**
 * Funções de envio de email transacional.
 * Thin wrappers sobre o cliente Resend — cada função aceita os props do template
 * e o endereço do destinatário.
 */
import { createElement } from 'react';

import { getResendClient } from './client.js';
import {
  CertificadoEmitidoEmail,
  type CertificadoEmitidoEmailProps,
  getCertificadoEmitidoSubject,
} from './templates/certificado-emitido.js';
import {
  getPedidoConfirmadoSubject,
  PedidoConfirmadoEmail,
  type PedidoConfirmadoEmailProps,
} from './templates/pedido-confirmado.js';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Argho <noreply@argho.com.br>';

// ── sendCertificadoEmitido ───────────────────────────────────────────────────

export interface SendCertificadoEmitidoParams extends CertificadoEmitidoEmailProps {
  to: string;
}

export async function sendCertificadoEmitido({
  to,
  ...props
}: SendCertificadoEmitidoParams): Promise<{ id: string }> {
  const resend = getResendClient();
  // Dynamic import evita que o bundler RSC rejeite react-dom/server estaticamente
  const { renderToStaticMarkup } = await import('react-dom/server');
  const html = renderToStaticMarkup(createElement(CertificadoEmitidoEmail, props));
  const subject = getCertificadoEmitidoSubject(props.trackTitle);

  const { data, error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });

  if (error || !data) {
    throw new Error(`[email] Falha ao enviar certificado: ${error?.message ?? 'resposta vazia'}`);
  }

  return { id: data.id };
}

// ── sendPedidoConfirmado ─────────────────────────────────────────────────────

export interface SendPedidoConfirmadoParams extends PedidoConfirmadoEmailProps {
  to: string;
}

export async function sendPedidoConfirmado({
  to,
  ...props
}: SendPedidoConfirmadoParams): Promise<{ id: string }> {
  const resend = getResendClient();
  const { renderToStaticMarkup } = await import('react-dom/server');
  const html = renderToStaticMarkup(createElement(PedidoConfirmadoEmail, props));
  const subject = getPedidoConfirmadoSubject(props.pedidoId, props.clienteNome);

  const { data, error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });

  if (error || !data) {
    throw new Error(
      `[email] Falha ao enviar confirmação de pedido: ${error?.message ?? 'resposta vazia'}`,
    );
  }

  return { id: data.id };
}
