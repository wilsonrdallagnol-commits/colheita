// packages/ui/src/components/chat-markdown.tsx
/**
 * ChatMarkdown — renderizador de markdown leve para bolhas de chat.
 *
 * Suporta os padrões mais comuns em respostas do Claude:
 * - Parágrafos separados por \n\n
 * - Negrito **texto**
 * - Itálico *texto*
 * - Código inline `texto`
 * - Blocos de código ```...```
 * - Listas não-ordenadas (- item)
 * - Listas ordenadas (1. item)
 * - Cabeçalhos ## / ###
 *
 * Sem dependências externas. Compatível com Server e Client Components.
 */

import type { CSSProperties, ReactNode } from 'react';

// ============================================================================
// Inline formatter — processa negrito, itálico, código inline
// ============================================================================

function renderInline(text: string, baseKey: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    // Bloco de código inline `text`
    const codeMatch = remaining.match(/`([^`]+)`/);
    // Negrito **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    // Itálico *text* (sem ser **)
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);

    const candidates = [
      codeMatch ? { pos: codeMatch.index ?? Infinity, match: codeMatch, kind: 'code' } : null,
      boldMatch ? { pos: boldMatch.index ?? Infinity, match: boldMatch, kind: 'bold' } : null,
      italicMatch
        ? { pos: italicMatch.index ?? Infinity, match: italicMatch, kind: 'italic' }
        : null,
    ].filter((c): c is NonNullable<typeof c> => c !== null);

    if (candidates.length === 0) {
      nodes.push(remaining);
      break;
    }

    const first = candidates.reduce((a, b) => (a.pos <= b.pos ? a : b));
    const { pos, match, kind } = first;
    const content = match[1] ?? '';

    if (pos > 0) nodes.push(remaining.slice(0, pos));

    const key = `${baseKey}-${idx++}`;
    if (kind === 'code') {
      nodes.push(
        <code
          key={key}
          style={{
            fontFamily: 'monospace',
            fontSize: '0.8em',
            padding: '1px 4px',
            borderRadius: '3px',
            backgroundColor: 'rgba(0,0,0,0.12)',
          }}
        >
          {content}
        </code>,
      );
    } else if (kind === 'bold') {
      nodes.push(
        <strong key={key} style={{ fontWeight: 600 }}>
          {content}
        </strong>,
      );
    } else {
      nodes.push(<em key={key}>{content}</em>);
    }

    remaining = remaining.slice(pos + match[0].length);
  }

  return nodes;
}

// ============================================================================
// Block parser — divide o texto em blocos de parágrafo / lista / código
// ============================================================================

type Block =
  | { kind: 'paragraph'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'code'; lang: string; code: string }
  | { kind: 'heading'; level: number; text: string };

function parseBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  const lines = markdown.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';

    // Bloco de código ```
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? '').startsWith('```')) {
        codeLines.push(lines[i] ?? '');
        i++;
      }
      i++; // consume closing ```
      blocks.push({ kind: 'code', lang, code: codeLines.join('\n') });
      continue;
    }

    // Heading ## / ###
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        kind: 'heading',
        level: (headingMatch[1] ?? '').length,
        text: headingMatch[2] ?? '',
      });
      i++;
      continue;
    }

    // Lista não-ordenada
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i] ?? '')) {
        items.push((lines[i] ?? '').replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push({ kind: 'ul', items });
      continue;
    }

    // Lista ordenada
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i] ?? '')) {
        items.push((lines[i] ?? '').replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ kind: 'ol', items });
      continue;
    }

    // Linha em branco — separador de parágrafo
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Parágrafo — acumula linhas consecutivas não-especiais
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      (lines[i] ?? '').trim() !== '' &&
      !/^[-*]\s+/.test(lines[i] ?? '') &&
      !/^\d+\.\s+/.test(lines[i] ?? '') &&
      !/^#{1,4}\s+/.test(lines[i] ?? '') &&
      !(lines[i] ?? '').startsWith('```')
    ) {
      paraLines.push(lines[i] ?? '');
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ kind: 'paragraph', text: paraLines.join(' ') });
    }
  }

  return blocks;
}

// ============================================================================
// Component
// ============================================================================

export interface ChatMarkdownProps {
  children: string;
  /** Estilo extra para o wrapper */
  style?: CSSProperties;
  /** Se true, aplica estilos de mensagem do assistente (fundo claro) */
  isUser?: boolean;
}

export function ChatMarkdown({ children, style }: ChatMarkdownProps) {
  if (!children) return null;

  const blocks = parseBlocks(children);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      {blocks.map((block, bi) => {
        const key = `block-${bi}`;

        if (block.kind === 'code') {
          return (
            <pre
              key={key}
              style={{
                margin: 0,
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(0,0,0,0.12)',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                overflowX: 'auto',
                whiteSpace: 'pre',
                lineHeight: 1.5,
              }}
            >
              <code>{block.code}</code>
            </pre>
          );
        }

        if (block.kind === 'heading') {
          const fontSize =
            block.level === 1
              ? '1rem'
              : block.level === 2
                ? '0.9375rem'
                : block.level === 3
                  ? '0.875rem'
                  : '0.8125rem';
          return (
            <p key={key} style={{ margin: 0, fontWeight: 600, fontSize, lineHeight: 1.4 }}>
              {renderInline(block.text, key)}
            </p>
          );
        }

        if (block.kind === 'ul') {
          return (
            <ul
              key={key}
              style={{
                margin: 0,
                paddingLeft: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {block.items.map((item, ii) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: stable list items
                <li key={ii} style={{ lineHeight: 1.5 }}>
                  {renderInline(item, `${key}-li-${ii}`)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.kind === 'ol') {
          return (
            <ol
              key={key}
              style={{
                margin: 0,
                paddingLeft: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {block.items.map((item, ii) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: stable list items
                <li key={ii} style={{ lineHeight: 1.5 }}>
                  {renderInline(item, `${key}-li-${ii}`)}
                </li>
              ))}
            </ol>
          );
        }

        // paragraph
        return (
          <p key={key} style={{ margin: 0, lineHeight: 1.55 }}>
            {renderInline(block.text, key)}
          </p>
        );
      })}
    </div>
  );
}
