// packages/email/tests/certificado-emitido.test.tsx
/**
 * Testes do template CertificadoEmitidoEmail.
 * Usa renderToStaticMarkup — sem browser, sem Resend.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { CertificadoEmitidoEmailProps } from '../src/templates/certificado-emitido.js';
import { CertificadoEmitidoEmail } from '../src/templates/certificado-emitido.js';

const BASE_PROPS: CertificadoEmitidoEmailProps = {
  userName: 'João Silva',
  trackTitle: 'Manejo Integrado de Pragas',
  certificateNo: 'ARGHO-2026-ABC12345',
  certificateUrl: 'https://argho.com.br/meu-progresso/certificados/ARGHO-2026-ABC12345',
};

function render(props = BASE_PROPS): string {
  return renderToStaticMarkup(createElement(CertificadoEmitidoEmail, props));
}

describe('CertificadoEmitidoEmail — conteúdo obrigatório', () => {
  it('renderiza o nome do usuário', () => {
    expect(render()).toContain('João Silva');
  });

  it('renderiza o título da trilha', () => {
    expect(render()).toContain('Manejo Integrado de Pragas');
  });

  it('renderiza o número do certificado', () => {
    expect(render()).toContain('ARGHO-2026-ABC12345');
  });

  it('renderiza link href para o certificado', () => {
    expect(render()).toContain(
      'https://argho.com.br/meu-progresso/certificados/ARGHO-2026-ABC12345',
    );
  });

  it('tem estrutura HTML válida (html, body ou div raiz)', () => {
    const html = render();
    expect(html).toMatch(/^<(html|div|table)/);
  });
});

describe('CertificadoEmitidoEmail — expiração', () => {
  it('renderiza data de expiração quando fornecida', () => {
    const html = render({ ...BASE_PROPS, expiresAt: '2027-04-29' });
    expect(html).toContain('2027');
  });

  it('não exibe bloco de validade quando expiresAt é null', () => {
    const html = render({ ...BASE_PROPS, expiresAt: null });
    expect(html).not.toContain('Válido até');
  });

  it('não exibe bloco de validade quando expiresAt não é fornecido', () => {
    expect(render()).not.toContain('Válido até');
  });
});

describe('CertificadoEmitidoEmail — branding Argho', () => {
  it('menciona Argho ou Colheita no corpo', () => {
    const html = render();
    expect(html.toLowerCase()).toMatch(/argho|colheita/);
  });

  it('tem CTA com link para o certificado', () => {
    const html = render();
    // Deve ter um <a> apontando para a URL do certificado
    expect(html).toContain('<a');
    expect(html).toContain('https://argho.com.br/meu-progresso/certificados/ARGHO-2026-ABC12345');
  });
});
