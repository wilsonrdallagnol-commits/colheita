/**
 * @colheita/layout-inference
 *
 * Layout Inference Engine — extrai estrutura de layouts de referência
 * via vision model e re-renderiza com identidade do tenant.
 *
 * Pipeline:
 *   1. analyzeLayout(image)              → LayoutBlueprint + métricas
 *   2. (revisão humana opcional no admin)
 *   3. compileBlueprint(blueprint, theme, bindings)  → RenderSpec
 *   4. @colheita/generator render(spec)  → PDF/PNG via Playwright
 */

export * from './blueprint/schema.js';
export * from './analyzer/index.js';
export * from './compiler/index.js';
export {
  ANALYZER_PROMPT_VERSION,
  ANALYZER_SYSTEM_PROMPT,
} from './prompts/analyzer.js';
