// packages/image-gen/src/providers/gemini.test.ts
//
// Testes do provider Gemini Nano Banana Pro - 100% mockados (não chama
// API real, não gasta créditos). Cobertura: validação env + montagem
// de prompt + parse de resposta + casos de erro.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock @google/genai antes de qualquer import que use ele
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

import { generateWithGemini } from './gemini.js';

describe('generateWithGemini', () => {
  const originalEnv = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    mockGenerateContent.mockReset();
    process.env.GEMINI_API_KEY = 'test-key-mock';
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalEnv;
    }
  });

  it('throws com mensagem actionable se GEMINI_API_KEY não setada', async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(generateWithGemini({ prompt: 'test' })).rejects.toThrow(
      /GEMINI_API_KEY não configurado/,
    );
    await expect(generateWithGemini({ prompt: 'test' })).rejects.toThrow(
      /aistudio\.google\.com\/apikey/,
    );
  });

  it('retorna imagens parseando inlineData base64 do response', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      candidates: [
        {
          content: {
            parts: [
              {
                inlineData: {
                  data: 'iVBORw0KGgo=', // base64 mínimo de PNG
                  mimeType: 'image/png',
                },
              },
            ],
          },
        },
      ],
    });

    const result = await generateWithGemini({ prompt: 'frasco branco 1L' });

    expect(result.images).toHaveLength(1);
    expect(result.images[0]).toEqual({
      base64: 'iVBORw0KGgo=',
      mimeType: 'image/png',
    });
    expect(result.model).toBe('gemini-2.5-flash-image-preview');
    expect(result.promptUsed).toBe('frasco branco 1L');
  });

  it('embeda negativePrompt no fullPrompt usando "Avoid: ..." (Gemini flash-image não suporta nativo)', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      candidates: [
        {
          content: {
            parts: [{ inlineData: { data: 'abc', mimeType: 'image/png' } }],
          },
        },
      ],
    });

    const result = await generateWithGemini({
      prompt: 'campo de soja',
      negativePrompt: 'text, watermark, blurry',
    });

    expect(result.promptUsed).toBe('campo de soja\n\nAvoid: text, watermark, blurry');
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        contents: 'campo de soja\n\nAvoid: text, watermark, blurry',
      }),
    );
  });

  it('passa aspectRatio em imageConfig quando definido', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      candidates: [{ content: { parts: [{ inlineData: { data: 'x', mimeType: 'image/png' } }] } }],
    });

    await generateWithGemini({ prompt: 'mockup', aspectRatio: '3:4' });

    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          responseModalities: ['IMAGE'],
          imageConfig: { aspectRatio: '3:4' },
        }),
      }),
    );
  });

  it('NÃO inclui imageConfig quando aspectRatio omitido', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      candidates: [{ content: { parts: [{ inlineData: { data: 'x', mimeType: 'image/png' } }] } }],
    });

    await generateWithGemini({ prompt: 'mockup' });

    const calledWith = mockGenerateContent.mock.calls[0]?.[0] as Record<string, unknown>;
    const config = calledWith.config as Record<string, unknown>;
    expect(config.imageConfig).toBeUndefined();
  });

  it('respeita model override (ex: imagen-3 quando especificado)', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      candidates: [{ content: { parts: [{ inlineData: { data: 'x', mimeType: 'image/png' } }] } }],
    });

    const result = await generateWithGemini({
      prompt: 'foto real',
      model: 'imagen-3.0-generate-002',
    });

    expect(result.model).toBe('imagen-3.0-generate-002');
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'imagen-3.0-generate-002' }),
    );
  });

  it('throws com mensagem clara quando resposta vem sem imagens (safety filter, quota, etc)', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      candidates: [{ content: { parts: [{ text: 'I cannot generate this image.' }] } }],
    });

    await expect(generateWithGemini({ prompt: 'something blocked' })).rejects.toThrow(
      /Gemini retornou resposta sem imagens/,
    );
  });

  it('lida com response.candidates vazio sem crashar', async () => {
    mockGenerateContent.mockResolvedValueOnce({ candidates: [] });

    await expect(generateWithGemini({ prompt: 'edge case' })).rejects.toThrow(
      /Gemini retornou resposta sem imagens/,
    );
  });

  it('agrega múltiplas imagens em um único response (numImages > 1)', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      candidates: [
        {
          content: {
            parts: [
              { inlineData: { data: 'img1', mimeType: 'image/png' } },
              { inlineData: { data: 'img2', mimeType: 'image/png' } },
              { inlineData: { data: 'img3', mimeType: 'image/png' } },
            ],
          },
        },
      ],
    });

    const result = await generateWithGemini({ prompt: 'multi', numImages: 3 });

    expect(result.images).toHaveLength(3);
    expect(result.images.map((i) => i.base64)).toEqual(['img1', 'img2', 'img3']);
  });
});
