'use client';

// apps/admin/src/components/layout-inference/bindings-editor.tsx
//
// Editor inline de bindings — atrela produto do PIM a region especifica do
// blueprint. v1: cobre product_ref (centerpiece, gallery) e headline_block.
// Outros tipos vao em sprints futuras.

import { Button } from '@colheita/ui';
import { Boxes, CheckCircle2, Save } from 'lucide-react';
import { useCallback, useState, useTransition } from 'react';
import { saveBlueprintBindings } from '@/lib/actions/layout-inference';

interface ProductOption {
  id: string;
  name: string;
  slug: string;
}

interface RegionBindable {
  id: string;
  type: string;
}

type BindingKind = 'auto' | 'product_ref' | 'headline';

interface BindingsState {
  [regionId: string]:
    | { kind: 'auto' }
    | { kind: 'product_ref'; productId: string }
    | { kind: 'headline'; lines: string[] };
}

interface BindingsEditorProps {
  blueprintId: string;
  regions: RegionBindable[];
  products: ProductOption[];
  initial?: BindingsState;
}

const REGION_LABEL: Record<string, string> = {
  brand_header: 'Header de marca',
  headline_block: 'Bloco de headline',
  subheadline_block: 'Sub-headline',
  product_centerpiece: 'Produto central',
  product_gallery: 'Galeria de produtos',
  data_grid: 'Grid de dados',
  feature_list: 'Lista de features',
  icon_grid: 'Grid de ícones',
  cta_block: 'CTA',
  footer: 'Rodapé',
};

// Tipos de region que aceitam product_ref
const PRODUCT_REGION_TYPES = new Set(['product_centerpiece', 'product_gallery']);
// Tipos de region que aceitam headline
const HEADLINE_REGION_TYPES = new Set(['headline_block', 'subheadline_block', 'testimonial']);

function defaultBinding(): BindingsState[string] {
  return { kind: 'auto' };
}

export function BindingsEditor({
  blueprintId,
  regions,
  products,
  initial = {},
}: BindingsEditorProps) {
  const [bindings, setBindings] = useState<BindingsState>(() => {
    const initialState: BindingsState = {};
    for (const region of regions) {
      initialState[region.id] = initial[region.id] ?? defaultBinding();
    }
    return initialState;
  });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const updateBinding = useCallback(
    (regionId: string, kind: BindingKind, payload?: { productId?: string; lines?: string[] }) => {
      setBindings((prev) => {
        const next = { ...prev };
        if (kind === 'auto') {
          next[regionId] = { kind: 'auto' };
        } else if (kind === 'product_ref') {
          next[regionId] = { kind: 'product_ref', productId: payload?.productId ?? '' };
        } else if (kind === 'headline') {
          next[regionId] = { kind: 'headline', lines: payload?.lines ?? [''] };
        }
        return next;
      });
      setSaved(false);
    },
    [],
  );

  const handleSave = useCallback(() => {
    startTransition(async () => {
      // Filtra bindings vazios (product_ref sem productId, headline com linhas vazias)
      const valid: BindingsState = {};
      for (const [regionId, binding] of Object.entries(bindings)) {
        if (binding.kind === 'auto') {
          valid[regionId] = binding;
        } else if (binding.kind === 'product_ref' && binding.productId) {
          valid[regionId] = binding;
        } else if (binding.kind === 'headline' && binding.lines.some((l) => l.trim() !== '')) {
          valid[regionId] = {
            kind: 'headline',
            lines: binding.lines.filter((l) => l.trim() !== ''),
          };
        } else {
          valid[regionId] = { kind: 'auto' };
        }
      }

      const result = await saveBlueprintBindings(blueprintId, valid);
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }, [blueprintId, bindings]);

  const bindableRegions = regions.filter(
    (r) => PRODUCT_REGION_TYPES.has(r.type) || HEADLINE_REGION_TYPES.has(r.type),
  );

  if (bindableRegions.length === 0) {
    return null;
  }

  return (
    <details
      style={{
        marginBottom: '32px',
        padding: '16px 20px',
        borderRadius: 'var(--colheita-radius-lg)',
        border: '1px solid var(--colheita-border)',
        backgroundColor: '#ffffff',
      }}
    >
      <summary
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          cursor: 'pointer',
          listStyle: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Boxes size={16} strokeWidth={1.75} color="var(--colheita-brand-primary)" />
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#0a0a0a',
              letterSpacing: '-0.005em',
            }}
          >
            Bindings · atrelar conteúdo a regions
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              color: 'var(--colheita-text-tertiary)',
              fontWeight: 500,
            }}
          >
            {bindableRegions.length} regions configuráveis
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)' }}>▾</span>
      </summary>

      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {bindableRegions.map((region) => {
          const binding = bindings[region.id] ?? { kind: 'auto' as const };
          const isProduct = PRODUCT_REGION_TYPES.has(region.type);
          const isHeadline = HEADLINE_REGION_TYPES.has(region.type);

          return (
            <div
              key={region.id}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--colheita-radius-md)',
                backgroundColor: 'var(--colheita-surface-muted)',
                border: '1px solid var(--colheita-border-subtle)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px',
                  marginBottom: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#0a0a0a',
                    letterSpacing: '-0.005em',
                  }}
                >
                  {REGION_LABEL[region.type] ?? region.type}
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--colheita-text-tertiary)',
                  }}
                >
                  #{region.id}
                </span>
              </div>

              {isProduct ? (
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
                >
                  <select
                    value={binding.kind === 'product_ref' ? binding.productId : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        updateBinding(region.id, 'auto');
                      } else {
                        updateBinding(region.id, 'product_ref', { productId: value });
                      }
                    }}
                    disabled={isPending}
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      padding: '8px 12px',
                      fontSize: '0.875rem',
                      borderRadius: 'var(--colheita-radius-md)',
                      border: '1px solid var(--colheita-border)',
                      backgroundColor: '#ffffff',
                      color: 'var(--colheita-text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Auto (sem produto fixo)</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {isHeadline ? (
                <textarea
                  rows={3}
                  placeholder="Uma linha por linha do headline. Vazio = auto."
                  value={binding.kind === 'headline' ? binding.lines.join('\n') : ''}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n');
                    if (lines.every((l) => l.trim() === '')) {
                      updateBinding(region.id, 'auto');
                    } else {
                      updateBinding(region.id, 'headline', { lines });
                    }
                  }}
                  disabled={isPending}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                    borderRadius: 'var(--colheita-radius-md)',
                    border: '1px solid var(--colheita-border)',
                    backgroundColor: '#ffffff',
                    color: 'var(--colheita-text-primary)',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              ) : null}
            </div>
          );
        })}

        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            paddingTop: '4px',
          }}
        >
          <Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
            <Save size={13} strokeWidth={1.75} style={{ marginRight: 6 }} />
            {isPending ? 'Salvando…' : 'Salvar bindings'}
          </Button>
          {saved ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                color: 'var(--colheita-brand-secondary)',
                fontWeight: 500,
              }}
            >
              <CheckCircle2 size={13} strokeWidth={1.75} />
              Salvo · próximo render usa estes bindings
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.6875rem',
                color: 'var(--colheita-text-tertiary)',
              }}
            >
              Próximo "Renderizar com Argho" aplica estes bindings
            </span>
          )}
        </div>
      </div>
    </details>
  );
}
