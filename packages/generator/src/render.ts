// packages/generator/src/render.ts

import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ReactElement } from 'react';
import type { BannerOptions, BannerResult, GenerateOptions, GenerateResult } from './types.js';

interface PngViewport {
  width: number;
  height: number;
  /** Multiplicador de DPI. 2 = retina (output 2x do tamanho do viewport) */
  deviceScaleFactor?: number;
}

/**
 * Subconjunto estrutural de `LaunchOptions` do Playwright. Tipado explicitamente
 * (sem `any`) para poder ser construído fora do escopo do dynamic import de
 * `playwright-core` — e ainda assim ser aceito por `chromium.launch()`.
 */
interface ChromiumLaunchConfig {
  headless: boolean;
  executablePath?: string;
  args?: string[];
}

interface ResolvedLaunch {
  options: ChromiumLaunchConfig;
  /** Limpa o `--user-data-dir` efêmero. No-op fora de serverless. */
  cleanup: () => Promise<void>;
}

/**
 * Resolve a configuração de launch do Chromium conforme o ambiente.
 *
 * - **Serverless (Vercel / AWS Lambda):** `playwright-core` não embute um
 *   browser — em produção serverless o binário vem do `@sparticuz/chromium`
 *   (Chromium comprimido em brotli, descompactado para `/tmp` no cold start e
 *   cacheado em `/tmp/chromium` para invocações quentes). Cada invocação ganha
 *   um `--user-data-dir` único para evitar corrupção de perfil entre execuções
 *   concorrentes no mesmo container quente; o diretório é removido no `finally`.
 * - **Local / CI com `executablePath` explícito:** usa o caminho informado.
 * - **Dev local:** usa o Chromium baixado por `npx playwright install chromium`.
 */
async function resolveLaunch(explicitExecutablePath?: string): Promise<ResolvedLaunch> {
  const isServerless = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) || process.env.VERCEL === '1';

  if (isServerless) {
    // Dynamic import — @sparticuz/chromium é um pacote nativo (binário brotli)
    // que só deve ser carregado no runtime Node serverless, nunca no bundle RSC.
    const { default: sparticuz } = await import('@sparticuz/chromium');
    const userDataDir = join(tmpdir(), `colheita-pw-${randomUUID()}`);
    return {
      options: {
        headless: true,
        executablePath: await sparticuz.executablePath(),
        args: [...sparticuz.args, `--user-data-dir=${userDataDir}`],
      },
      cleanup: async () => {
        await rm(userDataDir, { recursive: true, force: true }).catch(() => {
          // /tmp é efêmero no Lambda; falha de cleanup não é crítica
        });
      },
    };
  }

  return {
    options: explicitExecutablePath
      ? { headless: true, executablePath: explicitExecutablePath }
      : { headless: true },
    cleanup: async () => {
      // sem user-data-dir efêmero fora de serverless
    },
  };
}

/**
 * Renderiza um ReactElement para PDF usando Playwright Chromium.
 *
 * Em dev local, requer Chromium instalado: `npx playwright install chromium`.
 * Em serverless (Vercel/Lambda), usa automaticamente `@sparticuz/chromium`.
 * `options.executablePath` ainda permite sobrescrever o binário em CI.
 */
export async function renderToPdf(
  element: ReactElement,
  options: GenerateOptions = {},
): Promise<GenerateResult> {
  // Dynamic import evita que o bundler RSC do Next.js rejeite react-dom/server
  // na análise estática de imports (é um runtime-only call, não um RSC render).
  const { renderToStaticMarkup } = await import('react-dom/server');
  const html = `<!DOCTYPE html>${renderToStaticMarkup(element)}`;

  // Dynamic import to avoid loading playwright at module parse time
  const { chromium } = await import('playwright-core');

  // Se signal ja abortou antes do launch, evita custo do Chromium spin-up
  if (options.signal?.aborted) {
    throw new Error('renderToPdf aborted before browser launch');
  }

  const { options: launchOptions, cleanup } = await resolveLaunch(options.executablePath);

  const browser = await chromium.launch(launchOptions);

  // Abort handler — fecha o browser imediatamente, sem aguardar pdf().
  // Previne vazamento de processo Chromium em timeouts upstream.
  const onAbort = () => {
    void browser.close().catch(() => {
      // browser ja pode estar fechando; ignora
    });
  };
  options.signal?.addEventListener('abort', onAbort, { once: true });

  try {
    const page = await browser.newPage();

    // Seta o HTML diretamente (sem servidor HTTP local)
    await page.setContent(html, { waitUntil: 'networkidle' });

    const pdfBuffer = await page.pdf({
      format: options.format ?? 'A4',
      landscape: options.landscape ?? false,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    if (options.signal?.aborted) {
      throw new Error('renderToPdf aborted during render');
    }

    return { pdf: Buffer.from(pdfBuffer), html };
  } finally {
    options.signal?.removeEventListener('abort', onAbort);
    await browser.close().catch(() => {
      // ja fechado pelo abort handler
    });
    await cleanup();
  }
}

/**
 * Renderiza um ReactElement para PNG (formato fixo, ex: 1200x630 OG).
 *
 * Diferenças vs renderToPdf:
 *   - Não usa @page/A4 — viewport HTML define dimensões exatas
 *   - deviceScaleFactor=2 produz PNG 2x (retina) — feed do LinkedIn/Insta
 *     adora PNG nítido em telas de alta densidade
 *   - omitBackground=false garante que o background CSS apareça (PNGs sociais
 *     normalmente são sólidos, não transparentes)
 */
export async function renderToPng(
  element: ReactElement,
  viewport: PngViewport,
  options: BannerOptions = {},
): Promise<BannerResult> {
  const { renderToStaticMarkup } = await import('react-dom/server');
  const html = `<!DOCTYPE html>${renderToStaticMarkup(element)}`;

  const { chromium } = await import('playwright-core');

  const { options: launchOptions, cleanup } = await resolveLaunch(options.executablePath);

  const browser = await chromium.launch(launchOptions);

  try {
    const page = await browser.newPage({
      viewport: {
        width: viewport.width,
        height: viewport.height,
      },
      deviceScaleFactor: viewport.deviceScaleFactor ?? 2,
    });

    await page.setContent(html, { waitUntil: 'networkidle' });

    const pngBuffer = await page.screenshot({
      type: 'png',
      fullPage: false,
      omitBackground: false,
      // Limita à viewport definida — sem captura de scroll vertical
      clip: { x: 0, y: 0, width: viewport.width, height: viewport.height },
    });

    return { png: Buffer.from(pngBuffer), html };
  } finally {
    await browser.close().catch(() => {
      // ignora — browser pode ja estar fechado
    });
    await cleanup();
  }
}
