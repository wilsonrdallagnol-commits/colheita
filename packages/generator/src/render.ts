// packages/generator/src/render.ts

import type { ReactElement } from 'react';
import type { BannerOptions, BannerResult, GenerateOptions, GenerateResult } from './types.js';

interface PngViewport {
  width: number;
  height: number;
  /** Multiplicador de DPI. 2 = retina (output 2x do tamanho do viewport) */
  deviceScaleFactor?: number;
}

/**
 * Renderiza um ReactElement para PDF usando Playwright Chromium.
 *
 * Requer Chromium instalado no ambiente. Em dev local:
 *   npx playwright install chromium
 *
 * Em CI/produção, defina `options.executablePath` para o binário do sistema,
 * ou certifique-se de que `PLAYWRIGHT_BROWSERS_PATH` está configurado.
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

  const launchOptions: Parameters<typeof chromium.launch>[0] = {
    headless: true,
  };
  if (options.executablePath) {
    launchOptions.executablePath = options.executablePath;
  }

  // Se signal ja abortou antes do launch, evita custo do Chromium spin-up
  if (options.signal?.aborted) {
    throw new Error('renderToPdf aborted before browser launch');
  }

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

  const launchOptions: Parameters<typeof chromium.launch>[0] = {
    headless: true,
  };
  if (options.executablePath) {
    launchOptions.executablePath = options.executablePath;
  }

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
    await browser.close();
  }
}
