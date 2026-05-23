// apps/admin/src/app/api/imagens/gerar/route.ts
//
// Endpoint POST pra gerar imagens via Nano Banana Pro (Gemini).
// Protegido por auth + rate limit. Retorna base64 da imagem gerada.
//
// Uso (UI):
// ```ts
// const res = await fetch('/api/imagens/gerar', {
//   method: 'POST',
//   body: JSON.stringify({ prompt: '...', aspectRatio: '3:4' }),
// });
// const { images } = await res.json();
// const dataUrl = `data:${images[0].mimeType};base64,${images[0].base64}`;
// ```

import { requireAuth } from '@colheita/auth';
import { generateImage } from '@colheita/image-gen';
import { captureError } from '@colheita/observability';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { buildRateLimiter, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Gemini pode demorar 10-30s

// Rate limit conservador: imagem custa ~$0.04 — evitar abuso.
const imageRateLimiter = buildRateLimiter({
  prefix: '@colheita/admin/imagens',
  limit: 10,
  window: '1 m',
});

interface GenerateBody {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
  numImages?: number;
}

function validateBody(raw: unknown): GenerateBody | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  const prompt = obj.prompt;
  if (typeof prompt !== 'string' || prompt.trim().length === 0) return null;
  if (prompt.length > 2000) return null;

  const result: GenerateBody = { prompt: prompt.trim() };

  if (typeof obj.negativePrompt === 'string' && obj.negativePrompt.length <= 500) {
    result.negativePrompt = obj.negativePrompt;
  }
  const ratios = ['1:1', '4:3', '3:4', '16:9', '9:16'] as const;
  if (
    typeof obj.aspectRatio === 'string' &&
    ratios.includes(obj.aspectRatio as (typeof ratios)[number])
  ) {
    result.aspectRatio = obj.aspectRatio as GenerateBody['aspectRatio'];
  }
  if (typeof obj.numImages === 'number' && obj.numImages >= 1 && obj.numImages <= 4) {
    result.numImages = Math.floor(obj.numImages);
  }

  return result;
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth(cookieStore);
  } catch {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const rate = await checkRateLimit(imageRateLimiter, `imagens:${user.id}`);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'Limite de 10 imagens por minuto atingido. Aguarde.' },
      { status: 429, headers: rateLimitHeaders(rate) },
    );
  }

  let body: GenerateBody | null;
  try {
    body = validateBody(await request.json());
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }
  if (!body) {
    return NextResponse.json(
      { error: 'Prompt vazio ou inválido (máx 2000 chars).' },
      { status: 400 },
    );
  }

  try {
    const result = await generateImage(body);
    return NextResponse.json(
      {
        images: result.images,
        provider: result.provider,
        model: result.model,
        promptUsed: result.promptUsed,
      },
      { headers: rateLimitHeaders(rate) },
    );
  } catch (err) {
    captureError(err instanceof Error ? err : new Error(String(err)), {
      context: 'admin.api.imagens.gerar',
      tags: { userId: user.id },
    });
    return NextResponse.json(
      {
        error: 'Falha ao gerar imagem.',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
