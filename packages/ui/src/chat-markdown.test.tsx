// packages/ui/src/chat-markdown.test.tsx
/**
 * Testes do ChatMarkdown — renderizador de markdown para bolhas de chat.
 * Usa renderToStaticMarkup (sem browser, sem Playwright).
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ChatMarkdown } from './components/chat-markdown.js';

function render(text: string): string {
  return renderToStaticMarkup(createElement(ChatMarkdown, null, text));
}

describe('ChatMarkdown — renderização de blocos', () => {
  it('renderiza parágrafo simples', () => {
    const html = render('Olá, mundo!');
    expect(html).toContain('Olá, mundo!');
    expect(html).toContain('<p');
  });

  it('renderiza múltiplos parágrafos separados por linha em branco', () => {
    const html = render('Primeiro parágrafo.\n\nSegundo parágrafo.');
    expect(html).toContain('Primeiro parágrafo.');
    expect(html).toContain('Segundo parágrafo.');
    // Dois elementos <p> distintos
    expect((html.match(/<p/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it('renderiza lista não-ordenada', () => {
    const html = render('- Item A\n- Item B\n- Item C');
    expect(html).toContain('<ul');
    expect(html).toContain('<li');
    expect(html).toContain('Item A');
    expect(html).toContain('Item B');
    expect(html).toContain('Item C');
  });

  it('renderiza lista ordenada', () => {
    const html = render('1. Primeiro\n2. Segundo\n3. Terceiro');
    expect(html).toContain('<ol');
    expect(html).toContain('<li');
    expect(html).toContain('Primeiro');
    expect(html).toContain('Segundo');
  });

  it('renderiza bloco de código', () => {
    const html = render('```js\nconsole.log("hello");\n```');
    expect(html).toContain('<pre');
    expect(html).toContain('<code>');
    expect(html).toContain('console.log');
  });

  it('renderiza heading ## como parágrafo bold', () => {
    const html = render('## Título da seção');
    expect(html).toContain('Título da seção');
    expect(html).toContain('font-weight');
  });

  it('retorna null para string vazia', () => {
    const html = renderToStaticMarkup(createElement(ChatMarkdown, null, ''));
    expect(html).toBe('');
  });
});

describe('ChatMarkdown — formatação inline', () => {
  it('renderiza negrito **texto**', () => {
    const html = render('Isso é **negrito** no texto.');
    expect(html).toContain('<strong');
    expect(html).toContain('negrito');
  });

  it('renderiza itálico *texto*', () => {
    const html = render('Isso é *itálico* no texto.');
    expect(html).toContain('<em');
    expect(html).toContain('itálico');
  });

  it('renderiza código inline `texto`', () => {
    const html = render('Use o comando `pnpm install` para instalar.');
    expect(html).toContain('<code');
    expect(html).toContain('pnpm install');
  });

  it('renderiza múltiplos formatos inline juntos', () => {
    const html = render('**negrito**, *itálico* e `código` na mesma linha.');
    expect(html).toContain('<strong');
    expect(html).toContain('<em');
    expect(html).toContain('<code');
  });

  it('não processa markdown em bloco de código ```', () => {
    const html = render('```\n**não negrito**\n```');
    expect(html).not.toContain('<strong');
    expect(html).toContain('**não negrito**');
  });
});

describe('ChatMarkdown — cursor de streaming', () => {
  it('renderiza cursor ▋ como parágrafo enquanto stream está vazio', () => {
    const html = render('▋');
    expect(html).toContain('▋');
  });

  it('renderiza texto parcial durante streaming', () => {
    const html = render('Xcensis é um ferti');
    expect(html).toContain('Xcensis é um ferti');
  });
});
