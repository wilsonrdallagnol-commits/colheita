// packages/email/src/index.ts
export { _resetResendClient, getResendClient } from './client.js';
export type {
  SendCertificadoEmitidoParams,
  SendPedidoConfirmadoParams,
  SendRegulatorioVencimentosParams,
} from './send.js';
export {
  sendCertificadoEmitido,
  sendPedidoConfirmado,
  sendRegulatorioVencimentos,
} from './send.js';
export type { CertificadoEmitidoEmailProps } from './templates/certificado-emitido.js';
export {
  CertificadoEmitidoEmail,
  getCertificadoEmitidoSubject,
} from './templates/certificado-emitido.js';
export type {
  PedidoConfirmadoEmailProps,
  PedidoConfirmadoItem,
} from './templates/pedido-confirmado.js';
export {
  getPedidoConfirmadoSubject,
  PedidoConfirmadoEmail,
} from './templates/pedido-confirmado.js';
export type {
  RegulatorioVencimentoItem,
  RegulatorioVencimentosEmailProps,
} from './templates/regulatorio-vencimentos.js';
export {
  getRegulatorioVencimentosSubject,
  RegulatorioVencimentosEmail,
} from './templates/regulatorio-vencimentos.js';
