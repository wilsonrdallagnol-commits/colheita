// packages/ai/tests/chunker.test.ts
import { describe, expect, it } from 'vitest';
import { chunkDocument, chunkDocuments } from '../src/chunker.js';
import type { AiDocument } from '../src/types.js';

const tenantId = '00000000-0000-0000-0000-000000000001';

function makeDoc(overrides: Partial<AiDocument> = {}): AiDocument {
  return {
    id: 'doc-1',
    kind: 'product',
    title: 'Xcensis 10-00-06',
    content: 'Conteúdo do produto.',
    metadata: {},
    tenantId,
    ...overrides,
  };
}

describe('chunkDocument', () => {
  it('produz ao menos 1 chunk para qualquer documento', () => {
    const doc = makeDoc({ content: 'Texto curto.' });
    const chunks = chunkDocument(doc);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
  });

  it('herda tenantId do documento', () => {
    const doc = makeDoc({ content: 'Texto.' });
    const chunks = chunkDocument(doc);
    for (const chunk of chunks) {
      expect(chunk.tenantId).toBe(tenantId);
    }
  });

  it('herda documentId e kind do documento', () => {
    const doc = makeDoc({ id: 'prod-abc', kind: 'lesson', content: 'Texto.' });
    const chunks = chunkDocument(doc);
    for (const chunk of chunks) {
      expect(chunk.documentId).toBe('prod-abc');
      expect(chunk.kind).toBe('lesson');
    }
  });

  it('chunkIndex começa em 0 e é sequencial', () => {
    const longContent = Array.from({ length: 20 }, (_, i) =>
      `Parágrafo ${i + 1}. `.repeat(30),
    ).join('\n\n');
    const doc = makeDoc({ content: longContent });
    const chunks = chunkDocument(doc);
    chunks.forEach((chunk, i) => {
      expect(chunk.chunkIndex).toBe(i);
    });
  });

  it('textos pequenos geram chunk único com header', () => {
    const doc = makeDoc({ content: 'Apenas um parágrafo curto.' });
    const chunks = chunkDocument(doc);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.text).toContain('Xcensis 10-00-06');
  });

  it('textos grandes geram múltiplos chunks', () => {
    const longContent = Array.from({ length: 30 }, (_, i) =>
      `Parágrafo número ${i + 1}. `.repeat(20),
    ).join('\n\n');
    const doc = makeDoc({ content: longContent });
    const chunks = chunkDocument(doc, { targetChunkChars: 400, overlapChars: 50 });
    expect(chunks.length).toBeGreaterThan(1);
  });

  it('chunks individuais não são vazios', () => {
    const doc = makeDoc({ content: 'Texto com\n\nmúltiplos\n\nparágrafos.' });
    const chunks = chunkDocument(doc);
    for (const chunk of chunks) {
      expect(chunk.text.trim().length).toBeGreaterThan(0);
    }
  });

  it('metadata do documento é copiada para os chunks', () => {
    const doc = makeDoc({ content: 'Texto.', metadata: { slug: 'xcensis', nivel: 3 } });
    const chunks = chunkDocument(doc);
    for (const chunk of chunks) {
      expect(chunk.metadata.slug).toBe('xcensis');
      expect(chunk.metadata.documentTitle).toBe('Xcensis 10-00-06');
    }
  });

  it('respeita minChunkChars e descarta parágrafos muito curtos isolados', () => {
    // Parágrafo curto no meio; não deve gerar chunk vazio de 1 char
    const content =
      'Primeiro parágrafo com conteúdo suficiente para ser mantido no resultado.\n\n.\n\nTerceiro parágrafo também suficiente para o teste.';
    const doc = makeDoc({ content });
    const chunks = chunkDocument(doc, { minChunkChars: 10 });
    for (const chunk of chunks) {
      expect(chunk.text.trim().length).toBeGreaterThanOrEqual(10);
    }
  });
});

describe('chunkDocuments', () => {
  it('processa múltiplos documentos em batch', () => {
    const docs: AiDocument[] = [
      makeDoc({ id: 'a', content: 'Texto A.' }),
      makeDoc({ id: 'b', content: 'Texto B.' }),
      makeDoc({ id: 'c', content: 'Texto C.' }),
    ];
    const chunks = chunkDocuments(docs);
    const ids = new Set(chunks.map((c) => c.documentId));
    expect(ids.has('a')).toBe(true);
    expect(ids.has('b')).toBe(true);
    expect(ids.has('c')).toBe(true);
  });

  it('retorna array vazio para lista vazia', () => {
    expect(chunkDocuments([])).toEqual([]);
  });
});
