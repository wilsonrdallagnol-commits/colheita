// packages/generator/src/render.ts

import type { ReactElement } from 'react';
import type { GenerateOptions, GenerateResult } from './types.js';

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

  const browser = await chromium.launch(launchOptions);

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

    return { pdf: Buffer.from(pdfBuffer), html };
  } finally {
    await browser.close();
  }
}
