// apps/academia/src/components/markdown.tsx
// Renderizador de markdown leve para artigos da Academia.
// Suporta: headings, bold, italic, listas, tabelas, code blocks, blockquotes.
// Server Component — sem dependências externas.

import type { CSSProperties, ReactNode } from 'react';
import { Fragment } from 'react';

// ---------------------------------------------------------------------------
// Inline formatting
// ---------------------------------------------------------------------------
function renderInline(text: string): ReactNode[] {
  // Process bold (**text**) and italic (*text*) and inline `code`
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Italic: *text* (not **)
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
    // Inline code: `text`
    const codeMatch = remaining.match(/`(.+?)`/);

    const matches = [
      boldMatch ? { idx: boldMatch.index ?? Infinity, match: boldMatch, type: 'bold' } : null,
      italicMatch
        ? { idx: italicMatch.index ?? Infinity, match: italicMatch, type: 'italic' }
        : null,
      codeMatch ? { idx: codeMatch.index ?? Infinity, match: codeMatch, type: 'code' } : null,
    ].filter((m): m is NonNullable<typeof m> => m !== null);

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches.reduce((a, b) => (a.idx <= b.idx ? a : b));
    const { idx, match, type } = first;

    if (idx > 0) {
      parts.push(remaining.slice(0, idx));
    }

    const content = match[1] ?? '';
    if (type === 'bold') {
      parts.push(
        <strong key={key++} style={{ fontWeight: 600, color: 'var(--colheita-text-primary)' }}>
          {content}
        </strong>,
      );
    } else if (type === 'italic') {
      parts.push(
        <em key={key++} style={{ fontStyle: 'italic' }}>
          {content}
        </em>,
      );
    } else {
      parts.push(
        <code
          key={key++}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.875em',
            backgroundColor: 'color-mix(in srgb, var(--colheita-surface-card) 80%, transparent)',
            padding: '1px 5px',
            borderRadius: '3px',
          }}
        >
          {content}
        </code>,
      );
    }

    remaining = remaining.slice(idx + match[0].length);
  }

  return parts;
}

// ---------------------------------------------------------------------------
// Block types
// ---------------------------------------------------------------------------
type Block =
  | { type: 'h1' | 'h2' | 'h3'; text: string }
  | { type: 'paragraph'; lines: string[] }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'code'; lang: string; code: string }
  | { type: 'blockquote'; text: string }
  | { type: 'hr' };

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';

    // Skip blank lines between blocks
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Heading
    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.slice(2) });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3) });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4) });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? '').startsWith('```')) {
        codeLines.push(lines[i] ?? '');
        i++;
      }
      blocks.push({ type: 'code', lang, code: codeLines.join('\n') });
      i++; // skip closing ```
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quotedLines: string[] = [];
      while (i < lines.length && (lines[i] ?? '').startsWith('> ')) {
        quotedLines.push((lines[i] ?? '').slice(2));
        i++;
      }
      blocks.push({ type: 'blockquote', text: quotedLines.join(' ') });
      continue;
    }

    // Unordered list
    if (/^[-*+] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+] /.test(lines[i] ?? '')) {
        items.push((lines[i] ?? '').slice(2));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Checkbox list (- [ ] or - [x])
    if (/^- \[[ x]\] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^- \[[ x]\] /.test(lines[i] ?? '')) {
        const checked = (lines[i] ?? '').startsWith('- [x]');
        const text = (lines[i] ?? '').slice(6);
        items.push((checked ? '☑ ' : '☐ ') + text);
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i] ?? '')) {
        items.push((lines[i] ?? '').replace(/^\d+\. /, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Table: starts with |
    if (line.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && (lines[i] ?? '').startsWith('|')) {
        tableLines.push(lines[i] ?? '');
        i++;
      }
      if (tableLines.length >= 2) {
        const parseRow = (row: string) =>
          row
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());
        const header = parseRow(tableLines[0] ?? '');
        // Skip separator row (--- etc.)
        const dataRows = tableLines.slice(2).map(parseRow);
        blocks.push({ type: 'table', header, rows: dataRows });
      }
      continue;
    }

    // Paragraph: collect consecutive non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      (lines[i] ?? '').trim() !== '' &&
      !/^[#>|`*+\-\d]/.test(lines[i] ?? '') &&
      !/^[-*_]{3,}$/.test((lines[i] ?? '').trim())
    ) {
      paraLines.push(lines[i] ?? '');
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', lines: paraLines });
    } else {
      i++;
    }
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Render blocks
// ---------------------------------------------------------------------------
const HEADING: Record<string, CSSProperties> = {
  h1: {
    fontSize: '1.625rem',
    fontWeight: 700,
    color: 'var(--colheita-text-primary)',
    letterSpacing: '-0.025em',
    lineHeight: 1.2,
    marginTop: '32pt',
    marginBottom: '12pt',
  },
  h2: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'var(--colheita-text-primary)',
    letterSpacing: '-0.015em',
    lineHeight: 1.3,
    marginTop: '28pt',
    marginBottom: '10pt',
  },
  h3: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--colheita-text-secondary)',
    letterSpacing: '-0.01em',
    lineHeight: 1.4,
    marginTop: '20pt',
    marginBottom: '8pt',
  },
};

function renderBlock(block: Block, index: number): ReactNode {
  switch (block.type) {
    case 'h1':
    case 'h2':
    case 'h3': {
      const Tag = block.type;
      return (
        <Tag key={index} style={HEADING[block.type]}>
          {renderInline(block.text)}
        </Tag>
      );
    }

    case 'paragraph':
      return (
        <p
          key={index}
          style={{
            fontSize: '0.9375rem',
            color: 'var(--colheita-text-secondary)',
            lineHeight: 1.8,
            marginBottom: '16pt',
          }}
        >
          {block.lines.map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable positional render
            <Fragment key={i}>
              {renderInline(line)}
              {i < block.lines.length - 1 && <br />}
            </Fragment>
          ))}
        </p>
      );

    case 'ul':
      return (
        <ul
          key={index}
          style={{
            paddingLeft: '24px',
            marginBottom: '16pt',
            listStyleType: 'disc',
          }}
        >
          {block.items.map((item, j) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: stable positional render
              key={j}
              style={{
                fontSize: '0.9375rem',
                color: 'var(--colheita-text-secondary)',
                lineHeight: 1.7,
                marginBottom: '4pt',
              }}
            >
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );

    case 'ol':
      return (
        <ol
          key={index}
          style={{
            paddingLeft: '24px',
            marginBottom: '16pt',
            listStyleType: 'decimal',
          }}
        >
          {block.items.map((item, j) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: stable positional render
              key={j}
              style={{
                fontSize: '0.9375rem',
                color: 'var(--colheita-text-secondary)',
                lineHeight: 1.7,
                marginBottom: '4pt',
              }}
            >
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );

    case 'table':
      return (
        <div
          key={index}
          style={{
            width: '100%',
            overflowX: 'auto',
            marginBottom: '20pt',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {block.header.map((cell, j) => (
                  <th
                    // biome-ignore lint/suspicious/noArrayIndexKey: stable positional render
                    key={j}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: 'var(--colheita-surface-card)',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--colheita-text-tertiary)',
                      borderBottom: '1px solid var(--colheita-border)',
                    }}
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, j) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: stable positional render
                <tr key={j}>
                  {row.map((cell, k) => (
                    <td
                      // biome-ignore lint/suspicious/noArrayIndexKey: stable positional render
                      key={k}
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.875rem',
                        color: 'var(--colheita-text-secondary)',
                        borderBottom:
                          j < block.rows.length - 1
                            ? '1px solid var(--colheita-border-subtle)'
                            : 'none',
                      }}
                    >
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'code':
      return (
        <pre
          key={index}
          style={{
            backgroundColor: 'var(--colheita-surface-card)',
            border: '1px solid var(--colheita-border)',
            borderRadius: 'var(--colheita-radius-md)',
            padding: '16px',
            marginBottom: '16pt',
            overflowX: 'auto',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--colheita-text-secondary)',
            lineHeight: 1.6,
          }}
        >
          <code>{block.code}</code>
        </pre>
      );

    case 'blockquote':
      return (
        <blockquote
          key={index}
          style={{
            borderLeft: '3px solid var(--colheita-brand-primary)',
            paddingLeft: '16px',
            marginLeft: 0,
            marginBottom: '16pt',
            fontStyle: 'italic',
            color: 'var(--colheita-text-tertiary)',
            fontSize: '0.9375rem',
          }}
        >
          {renderInline(block.text)}
        </blockquote>
      );

    case 'hr':
      return (
        <hr
          key={index}
          style={{
            border: 'none',
            borderTop: '1px solid var(--colheita-border-subtle)',
            marginTop: '24pt',
            marginBottom: '24pt',
          }}
        />
      );

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------
interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  const blocks = parseBlocks(content);
  return <div>{blocks.map((block, i) => renderBlock(block, i))}</div>;
}
