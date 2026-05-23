// packages/image-gen/src/providers/gemini.ts
//
// Provider Gemini 2.5 Flash Image Preview (apelido: Nano Banana Pro).
//
// Documentação: https://ai.google.dev/gemini-api/docs/image-generation
// Modelo recomendado para produção: 'gemini-2.5-flash-image-preview'
// Preview/desenv: 'imagen-3.0-generate-002' (Imagen 3, qualidade superior, mais caro)

import { GoogleGenAI } from '@google/genai';
import type { GeneratedImage } from '../index.js';

const DEFAULT_MODEL = 'gemini-2.5-flash-image-preview';

export interface GeminiImageRequest {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
  numImages?: number;
  model?: string;
}

export interface GeminiImageResult {
  images: GeneratedImage[];
  model: string;
  promptUsed: string;
}

/**
 * Gera imagens com Gemini.
 *
 * Requer GEMINI_API_KEY no env. Pegue em https://aistudio.google.com/apikey.
 *
 * Custo aproximado (2026):
 * - gemini-2.5-flash-image-preview: ~$0.04 por imagem
 * - imagen-3.0-generate-002: ~$0.04 por imagem (mas qualidade superior pra foto-real)
 */
export async function generateWithGemini(req: GeminiImageRequest): Promise<GeminiImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY não configurado. Adicione no .env e em apps/admin/.env.local. ' +
        'Pegue uma key em https://aistudio.google.com/apikey.',
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = req.model ?? DEFAULT_MODEL;

  // Monta prompt final - inclui negativePrompt se houver (Gemini não suporta
  // negative prompt nativo no flash-image, então embedamos no prompt).
  const fullPrompt = req.negativePrompt
    ? `${req.prompt}\n\nAvoid: ${req.negativePrompt}`
    : req.prompt;

  const response = await ai.models.generateContent({
    model,
    contents: fullPrompt,
    config: {
      // responseModalities permite text+image. Para gerar apenas imagem,
      // usar 'IMAGE' isolado faz com que o modelo responda apenas com a image.
      responseModalities: ['IMAGE'],
      ...(req.aspectRatio && {
        imageConfig: {
          aspectRatio: req.aspectRatio,
        },
      }),
    },
  });

  const images: GeneratedImage[] = [];
  for (const candidate of response.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      if (part.inlineData?.data) {
        images.push({
          base64: part.inlineData.data,
          mimeType: part.inlineData.mimeType ?? 'image/png',
        });
      }
    }
  }

  if (images.length === 0) {
    throw new Error(
      `Gemini retornou resposta sem imagens. Possíveis causas: prompt bloqueado por safety, modelo inválido, ou quota excedida. Resposta: ${JSON.stringify(response, null, 2).slice(0, 500)}`,
    );
  }

  return {
    images,
    model,
    promptUsed: fullPrompt,
  };
}
