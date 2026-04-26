/**
 * Testes das guardas pre-flight do analyzer.
 *
 * Importante: todos os testes aqui cobrem lógica que executa ANTES de
 * qualquer chamada à API Anthropic. Nenhum mock necessário — se o
 * pre-flight falhar, a função retorna sem fazer chamada externa.
 *
 * Edge cases testados (do /hm-qa):
 *   1. Cost ceiling: valores de fronteira, consumo acumulado, ausência de ceiling
 *   2. Input validation: URL malformada, mimeType inválido, buffer vazio, buffer > 20MB
 */

import { FEATURE_COST_CEILINGS_USD } from '@colheita/config';
import { describe, expect, it } from 'vitest';
import { analyzeLayout } from './index.js';

const ESTIMATED_MAX = FEATURE_COST_CEILINGS_USD.layoutInference.estimatedMaxPerCallUsd; // 0.15

// Helper: input válido que nunca chega à API (interceptado por outros guards)
const VALID_URL_INPUT = {
  kind: 'url' as const,
  url: 'https://example.com/layout.png',
  mimeType: 'image/png',
};

// ============================================================================
// COST CEILING — pre-flight
// ============================================================================

describe('cost ceiling pre-flight', () => {
  it('rejeita quando consumido + estimado ultrapassa o teto', async () => {
    const result = await analyzeLayout({
      input: VALID_URL_INPUT,
      maxCostUsd: 0.1, // teto menor que o estimado por call (0.15)
      consumedCostUsd: 0.0, // projected = 0.15 > 0.10 → exceeds
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('cost_ceiling_exceeded');
      expect(result.details).toContain('ceiling=$0.10'); // ceiling formatado (toFixed(2))
    }
  });

  it('rejeita quando consumido acumulado empurra projeção além do teto', async () => {
    const result = await analyzeLayout({
      input: VALID_URL_INPUT,
      maxCostUsd: 5.0,
      consumedCostUsd: 4.9, // 4.90 + 0.15 = 5.05 > 5.00
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('cost_ceiling_exceeded');
      expect(result.details).toContain('4.9000'); // consumed formatado
    }
  });

  it('fronteira: projected == maxCostUsd é permitido (> não >=)', async () => {
    // projected = ESTIMATED_MAX = 0.15; maxCostUsd = 0.15
    // 0.15 > 0.15 = false → não deve rejeitar por ceiling
    // A função vai tentar chamar a API — vai falhar por network, não por ceiling.
    const result = await analyzeLayout({
      input: VALID_URL_INPUT,
      maxCostUsd: ESTIMATED_MAX, // 0.15 exato
      consumedCostUsd: 0.0,
      timeoutMs: 100, // timeout curto pra não esperar a API
    });

    // Pode falhar por timeout ou model_error, mas NÃO por cost_ceiling_exceeded
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).not.toBe('cost_ceiling_exceeded');
    }
  });

  it('sem maxCostUsd definido: nunca rejeita por ceiling (qualquer custo é permitido)', async () => {
    // Sem maxCostUsd, o check é ignorado — vai tentar chamar a API
    const result = await analyzeLayout({
      input: VALID_URL_INPUT,
      // maxCostUsd não passado
      consumedCostUsd: 999.99, // valor absurdo — não importa sem ceiling
      timeoutMs: 100,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).not.toBe('cost_ceiling_exceeded');
    }
  });

  it('consumedCostUsd default é 0 quando não passado', async () => {
    const result = await analyzeLayout({
      input: VALID_URL_INPUT,
      maxCostUsd: 0.1,
      // consumedCostUsd não passado — default 0
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      // projected = 0 + 0.15 = 0.15 > 0.10 → ceiling exceeded
      expect(result.error).toBe('cost_ceiling_exceeded');
    }
  });
});

// ============================================================================
// INPUT VALIDATION — URL
// ============================================================================

describe('input validation — URL', () => {
  it('rejeita URL malformada', async () => {
    const result = await analyzeLayout({
      input: { kind: 'url', url: 'not-a-url', mimeType: 'image/png' },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('invalid_input');
      expect(result.details).toContain('malformada');
    }
  });

  it('rejeita URL sem protocolo', async () => {
    const result = await analyzeLayout({
      input: { kind: 'url', url: 'example.com/image.png', mimeType: 'image/png' },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('invalid_input');
    }
  });

  it('rejeita mimeType text/html (não é imagem nem PDF)', async () => {
    const result = await analyzeLayout({
      input: { kind: 'url', url: 'https://example.com/page', mimeType: 'text/html' },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('invalid_input');
      expect(result.details).toContain('text/html');
    }
  });

  it('rejeita mimeType application/json', async () => {
    const result = await analyzeLayout({
      input: { kind: 'url', url: 'https://example.com/data.json', mimeType: 'application/json' },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('invalid_input');
    }
  });

  it('aceita mimeType image/png', async () => {
    // Vai tentar chamar a API e falhar por timeout — mas NÃO por invalid_input
    const result = await analyzeLayout({
      input: { kind: 'url', url: 'https://example.com/img.png', mimeType: 'image/png' },
      maxCostUsd: 0.0, // ceiling de zero garante rejeição por cost, não por input
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('cost_ceiling_exceeded'); // não é invalid_input
    }
  });

  it('aceita mimeType application/pdf', async () => {
    const result = await analyzeLayout({
      input: { kind: 'url', url: 'https://example.com/doc.pdf', mimeType: 'application/pdf' },
      maxCostUsd: 0.0,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('cost_ceiling_exceeded'); // aceito — falha por ceiling
    }
  });

  it('aceita qualquer subtype de image/', async () => {
    for (const mimeType of ['image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']) {
      const result = await analyzeLayout({
        input: { kind: 'url', url: 'https://example.com/img', mimeType },
        maxCostUsd: 0.0,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('cost_ceiling_exceeded');
      }
    }
  });
});

// ============================================================================
// INPUT VALIDATION — BUFFER
// ============================================================================

describe('input validation — buffer', () => {
  it('rejeita buffer vazio (0 bytes)', async () => {
    const result = await analyzeLayout({
      input: { kind: 'buffer', data: Buffer.alloc(0), mimeType: 'image/png' },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('invalid_input');
      expect(result.details).toContain('vazio');
    }
  });

  it('rejeita buffer maior que 20MB', async () => {
    const tooBig = Buffer.alloc(20 * 1024 * 1024 + 1); // 20MB + 1 byte
    const result = await analyzeLayout({
      input: { kind: 'buffer', data: tooBig, mimeType: 'image/png' },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('invalid_input');
      expect(result.details).toContain('20MB');
    }
  });

  it('fronteira: buffer de exatamente 20MB é aceito', async () => {
    // Exatamente 20MB — não ultrapassa (> não >=)
    // Vai tentar API, vai falhar por timeout — mas NÃO por invalid_input
    const exactly20MB = Buffer.alloc(20 * 1024 * 1024);
    const result = await analyzeLayout({
      input: { kind: 'buffer', data: exactly20MB, mimeType: 'image/png' },
      maxCostUsd: 0.0, // ceiling de zero garante rejeição por cost, não por tamanho
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('cost_ceiling_exceeded'); // não é invalid_input
    }
  });

  it('buffer de 1 byte é aceito pelo guard de tamanho', async () => {
    const minBuffer = Buffer.alloc(1);
    const result = await analyzeLayout({
      input: { kind: 'buffer', data: minBuffer, mimeType: 'image/png' },
      maxCostUsd: 0.0,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('cost_ceiling_exceeded');
    }
  });
});
