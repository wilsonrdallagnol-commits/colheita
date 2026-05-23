// packages/image-gen/src/index.ts
//
// @colheita/image-gen — Geração de imagens via IA.
//
// Provider padrão: Gemini 2.5 Flash Image (Nano Banana Pro) — pedido
// explícito do fundador. Roteamento futuro pode incluir Recraft (logo/branding),
// Flux Pro Ultra (foto-real), OpenAI gpt-image-1 (geral).
//
// Uso:
// ```ts
// import { generateImage } from '@colheita/image-gen';
//
// const result = await generateImage({
//   prompt: 'mockup foto-real de frasco branco 1L com rótulo azul Argho...',
//   aspectRatio: '3:4',
// });
// console.log(result.images[0].base64);
// ```

export {
  type GeminiImageRequest,
  type GeminiImageResult,
  generateWithGemini,
} from './providers/gemini.js';

export interface GenerateImageInput {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
  numImages?: number;
  /**
   * Provider explícito (default: 'gemini' — Nano Banana Pro).
   * Roteamento futuro deve considerar qualidade vs custo por caso de uso.
   */
  provider?: 'gemini';
}

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

export interface GenerateImageResult {
  images: GeneratedImage[];
  provider: 'gemini';
  model: string;
  promptUsed: string;
}

/**
 * Roteador principal. Por enquanto usa SEMPRE Gemini (Nano Banana Pro)
 * conforme orientação do fundador. Adicionar Recraft/Flux quando houver
 * caso de uso justificado (logo, foto-real específica, etc).
 */
export async function generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
  // Lazy import - evita carregar SDK Google em quem não usar
  const { generateWithGemini } = await import('./providers/gemini.js');

  const result = await generateWithGemini({
    prompt: input.prompt,
    negativePrompt: input.negativePrompt,
    aspectRatio: input.aspectRatio ?? '1:1',
    numImages: input.numImages ?? 1,
  });

  return {
    images: result.images,
    provider: 'gemini',
    model: result.model,
    promptUsed: result.promptUsed,
  };
}
