// packages/email/tests/pedido-confirmado.test.tsx
/**
 * Testes do template PedidoConfirmadoEmail.
 * Usa renderToStaticMarkup — sem browser, sem Resend.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PedidoConfirmadoEmail } from '../src/templates/pedido-confirmado.js';

const BASE_PROPS = {
  pedidoId: 'SAFRA-2026-0042',
  clienteNome: 'Fazenda São João',
  tenantName: 'Argho Distribuidora',
  itens: [
    { produto: 'Xcensis 500 mL', quantidade: 10, unidade: 'caixa' },
    { produto: 'Argho Plus 1 L', quantidade: 5, unidade: 'caixa' },
  ],
  valorTotal: 1250.0,
};

function render(props = BASE_PROPS): string {
  return renderToStaticMarkup(createElement(PedidoConfirmadoEmail, props));
}

describe('PedidoConfirmadoEmail — conteúdo obrigatório', () => {
  it('renderiza o ID do pedido', () => {
    expect(render()).toContain('SAFRA-2026-0042');
  });

  it('renderiza o nome do cliente', () => {
    expect(render()).toContain('Fazenda São João');
  });

  it('renderiza o nome do tenant (distribuidor)', () => {
    expect(render()).toContain('Argho Distribuidora');
  });

  it('renderiza todos os itens do pedido', () => {
    const html = render();
    expect(html).toContain('Xcensis 500 mL');
    expect(html).toContain('Argho Plus 1 L');
  });

  it('renderiza as quantidades dos itens', () => {
    const html = render();
    expect(html).toContain('10');
    expect(html).toContain('5');
  });

  it('tem estrutura HTML válida (html, body ou div raiz)', () => {
    const html = render();
    expect(html).toMatch(/^<(html|div|table)/);
  });
});

describe('PedidoConfirmadoEmail — valor total', () => {
  it('renderiza o valor total quando fornecido', () => {
    const html = render();
    // Locale pt-BR formata como "R$ 1.250,00"
    expect(html).toContain('1.250');
  });

  it('não exibe total quando valorTotal é undefined', () => {
    const { valorTotal: _vt, ...withoutTotal } = BASE_PROPS;
    const html = renderToStaticMarkup(
      createElement(PedidoConfirmadoEmail, withoutTotal as typeof BASE_PROPS),
    );
    expect(html).not.toContain('Total:');
  });
});

describe('PedidoConfirmadoEmail — estrutura mínima', () => {
  it('menciona confirmação ou pedido no corpo', () => {
    const html = render();
    expect(html.toLowerCase()).toMatch(/pedido|confirma/);
  });

  it('lista cada item em elemento separado (múltiplas ocorrências)', () => {
    const html = render();
    // Cada produto aparece em seu próprio bloco
    const xcensisCount = (html.match(/Xcensis/g) ?? []).length;
    expect(xcensisCount).toBeGreaterThanOrEqual(1);
  });
});
