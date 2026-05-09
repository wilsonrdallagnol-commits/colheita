// apps/admin/src/lib/layout-inference/bindings-validator.ts
//
// Helpers puros (sem deps Supabase) pra validar bindings antes de salvar
// ou compilar. Extraidos da action server pra serem testaveis em isolacao.

export type BindingShape =
  | { kind: 'auto' }
  | { kind: 'product_ref'; productId: string }
  | { kind: 'headline'; lines: string[] }
  | { kind: 'feature_list'; items: Array<{ icon?: string; title: string; description?: string }> }
  | { kind: 'icon_grid'; items: Array<{ symbol: string; label: string; value?: string }> }
  | { kind: 'cta'; label: string; href?: string }
  | { kind: 'media'; assetId: string };

export type BindingsMap = Record<string, BindingShape>;

const PRODUCT_REGION_TYPES = new Set(['product_centerpiece', 'product_gallery']);
const HEADLINE_REGION_TYPES = new Set(['headline_block', 'subheadline_block', 'testimonial']);

/**
 * Sanitiza um binding individual: remove campos vazios, valida formato.
 * Retorna 'auto' como fallback quando o binding eh invalido.
 */
export function sanitizeBinding(binding: BindingShape | undefined): BindingShape {
  if (!binding) return { kind: 'auto' };

  if (binding.kind === 'auto') return binding;

  if (binding.kind === 'product_ref') {
    if (!binding.productId || binding.productId.trim() === '') return { kind: 'auto' };
    return { kind: 'product_ref', productId: binding.productId.trim() };
  }

  if (binding.kind === 'headline') {
    const filtered = (binding.lines ?? [])
      .map((l) => (typeof l === 'string' ? l.trim() : ''))
      .filter((l) => l.length > 0);
    if (filtered.length === 0) return { kind: 'auto' };
    return { kind: 'headline', lines: filtered };
  }

  if (binding.kind === 'cta') {
    if (!binding.label || binding.label.trim() === '') return { kind: 'auto' };
    const out: BindingShape = { kind: 'cta', label: binding.label.trim() };
    if (binding.href) out.href = binding.href.trim();
    return out;
  }

  if (binding.kind === 'media') {
    if (!binding.assetId) return { kind: 'auto' };
    return { kind: 'media', assetId: binding.assetId.trim() };
  }

  return { kind: 'auto' };
}

/**
 * Sanitiza um mapa inteiro de bindings de uma vez.
 */
export function sanitizeBindings(bindings: BindingsMap): BindingsMap {
  const result: BindingsMap = {};
  for (const [regionId, binding] of Object.entries(bindings)) {
    result[regionId] = sanitizeBinding(binding);
  }
  return result;
}

/**
 * Verifica se um binding eh compativel com o tipo de region.
 * Espelha a logica do compiler — usado pra pre-validar no editor.
 */
export function isBindingCompatible(regionType: string, bindingKind: string): boolean {
  if (bindingKind === 'auto') return true;

  if (bindingKind === 'product_ref') {
    return PRODUCT_REGION_TYPES.has(regionType);
  }

  if (bindingKind === 'headline') {
    return HEADLINE_REGION_TYPES.has(regionType);
  }

  // Compatibilidades adicionais
  if (bindingKind === 'cta' && regionType === 'cta_block') return true;
  if (bindingKind === 'media' && regionType === 'media_block') return true;
  if (bindingKind === 'feature_list' && regionType === 'feature_list') return true;
  if (
    bindingKind === 'icon_grid' &&
    (regionType === 'icon_grid' || regionType === 'data_grid' || regionType === 'badge_strip')
  ) {
    return true;
  }

  return false;
}

/**
 * Conta bindings ativos (nao-auto) num mapa. Util pra UI mostrar
 * "3 regions atreladas".
 */
export function countActiveBindings(bindings: BindingsMap): number {
  return Object.values(bindings).filter((b) => b.kind !== 'auto').length;
}
