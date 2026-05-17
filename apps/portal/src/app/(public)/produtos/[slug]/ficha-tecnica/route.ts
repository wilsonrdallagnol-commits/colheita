// apps/portal/src/app/(public)/produtos/[slug]/ficha-tecnica/route.ts
//
// Gera e retorna a Ficha Técnica em PDF para um produto publicado.
// Requer sessão autenticada (distribuidor logado no portal).
//
// Resource discipline (multi-tenant blast radius):
//   Playwright + Chromium = ~3-8s + ~150-300MB RAM por chamada.
//   Sem rate limit + timeout, um único user (ou bug do client) derruba o
//   serviço para TODOS os tenants. Por isso temos:
//     1. Rate limit por user: 5/min, 30/hora (Upstash sliding window).
//     2. Timeout hard de 25s no render — request HTTP nunca pendura.
//     3. Erros vão pro Sentry com contexto, não só pro response.
//
// GET /produtos/:slug/ficha-tecnica
//   → 200  application/pdf — PDF da ficha técnica
//   → 302  redirect para /entrar se não autenticado
//   → 404  produto não encontrado ou não publicado
//   → 429  rate limit excedido (com header Retry-After)
//   → 503  Chromium indisponível (dev sem Docker) ou timeout

// Playwright + react-dom/server requerem o runtime Node.js (não Edge)
export const runtime = 'nodejs';
// PDF via Chromium serverless — cold start (extrair binário + launch) pode
// passar de 10s; 60s cobre cold start + o budget de 25s do withTimeout.
export const maxDuration = 60;

import { createServerClient, requireAuth } from '@colheita/auth';
import type { FichaTecnicaData, PackagingUnit, ProductApplication } from '@colheita/generator';
import { generateFichaTecnica } from '@colheita/generator';
import { captureError } from '@colheita/observability';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { buildRateLimiter, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Limites por user — sliding window. Combina proteção contra bot autenticado
// com folga pra distribuidor legítimo (5 abas abertas em sequência ainda passa).
const PDF_LIMIT_PER_MINUTE = 5;
const PDF_TIMEOUT_MS = 25_000;

const pdfRateLimiter = buildRateLimiter({
  prefix: '@colheita/portal/pdf',
  limit: PDF_LIMIT_PER_MINUTE,
  window: '1 m',
});

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * Wrappa uma Promise com timeout. Se vencer, rejeita com Error('timeout');
 * a Promise original continua mas seu resultado é descartado (Playwright
 * fecha o browser via finally interno em packages/generator/src/render.ts).
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timeout after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const cookieStore = await cookies();

  // Requer distribuidor autenticado — redireciona se não autenticado
  const user = await requireAuth(cookieStore);
  const userId = user.id;

  // Rate limit POR USUÁRIO (não por IP) — distribuidores podem compartilhar IP corporativo.
  const rateResult = await checkRateLimit(pdfRateLimiter, `pdf:${userId}`);
  if (!rateResult.ok) {
    return NextResponse.json(
      {
        error: 'Limite de geração de PDF excedido. Tente novamente em alguns instantes.',
      },
      {
        status: 429,
        headers: rateLimitHeaders(rateResult),
      },
    );
  }

  const supabase = createServerClient(cookieStore);

  const { data: product, error } = await supabase
    .from('products')
    .select(
      `name, tagline, description, composition, technical_specs, packaging, applications,
       tenant:tenants!inner(name)`,
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single();

  if (error || !product) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  }

  const tenantName =
    (Array.isArray(product.tenant)
      ? (product.tenant[0] as { name?: string } | undefined)?.name
      : (product.tenant as { name?: string } | null)?.name) ?? 'Argho Agrosciences';

  const data: FichaTecnicaData = {
    productName: product.name,
    tagline: product.tagline ?? undefined,
    description: product.description ?? undefined,
    composition: (product.composition as FichaTecnicaData['composition']) ?? {},
    technicalSpecs: (product.technical_specs as Record<string, unknown>) ?? {},
    packaging: (product.packaging as PackagingUnit[]) ?? [],
    applications: (product.applications as ProductApplication[]) ?? [],
    tenantName,
    year: new Date().getFullYear(),
  };

  try {
    const { pdf } = await withTimeout(
      generateFichaTecnica(data),
      PDF_TIMEOUT_MS,
      'generateFichaTecnica',
    );

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ficha-tecnica-${slug}.pdf"`,
        'Content-Length': String(pdf.length),
        // Cache curto por usuário — invalida implicitamente quando produto editado
        // dispara nova URL; ver M2 do audit pra etag-based invalidation futura.
        'Cache-Control': 'private, max-age=3600',
        ...rateLimitHeaders(rateResult),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido.';
    const isTimeout = message.includes('timeout');
    const isChromiumMissing =
      !isTimeout &&
      (message.includes('Executable') ||
        message.includes('chromium') ||
        message.includes('browser'));

    // Capturar no Sentry com contexto — sem isto não temos sinal de quanto
    // o endpoint está estourando timeout em prod (causa raiz pra mover pra fila).
    captureError(err, {
      context: 'portal.fichaTecnica.generate',
      slug,
      userId,
      timeout: isTimeout,
      chromiumMissing: isChromiumMissing,
    });

    const userMessage = isTimeout
      ? 'A geração da ficha técnica demorou demais. Tente novamente.'
      : isChromiumMissing
        ? 'Geração de PDF indisponível. Chromium não instalado neste ambiente.'
        : 'Erro ao gerar ficha técnica.';

    return NextResponse.json(
      {
        error: userMessage,
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 503 },
    );
  }
}
