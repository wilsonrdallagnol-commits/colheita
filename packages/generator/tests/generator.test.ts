// packages/generator/tests/generator.test.ts

import type { ResolvedRegion } from '@colheita/layout-inference/compiler';
import type { CompilerTheme } from '@colheita/ui';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FichaTecnica } from '../src/templates/FichaTecnica.js';
import { RenderSpecLayout } from '../src/templates/RenderSpecLayout.js';
import type { FichaTecnicaData } from '../src/types.js';

// Fixture com dados completos do Xcensis (sem acionar Playwright)
const XCENSIS_DATA: FichaTecnicaData = {
  productName: 'Xcensis 10-00-06',
  tagline: 'Nutrição foliar de alta eficiência para grandes culturas',
  description:
    'Fertilizante mineral misto líquido desenvolvido para aplicações foliares em soja, milho e algodão.',
  mapaRegistration: '00123/2024',
  tenantName: 'Argho AgriSciences',
  composition: {
    macros: { N: 10, K2O: 6 },
    micros: { Zn: 0.5, B: 0.15 },
  },
  technicalSpecs: {
    Formulação: 'Líquida',
    pH: '6.5–7.0',
    Densidade: '1.25 g/mL',
    'Solubilidade em água': 'Total',
  },
  packaging: [
    { type: 'bottle', volumeL: 1, sku: 'XCN-001' },
    { type: 'drum', volumeL: 200, sku: 'XCN-020' },
  ],
  applications: [
    { crop: 'Soja', stage: 'V3–V6', dosePerHa: 1.5, unit: 'l', notes: 'Aplicar com adjuvante' },
    { crop: 'Milho', stage: 'V4–V8', dosePerHa: 2, unit: 'l' },
    { crop: 'Algodão', stage: 'Vegetativo', dosePerHa: 1.5, unit: 'l' },
  ],
  year: 2026,
};

describe('FichaTecnica template', () => {
  it('renderiza sem erros para dados completos', () => {
    const el = createElement(FichaTecnica, { data: XCENSIS_DATA });
    expect(() => renderToStaticMarkup(el)).not.toThrow();
  });

  it('contém o nome do produto', () => {
    const el = createElement(FichaTecnica, { data: XCENSIS_DATA });
    const html = renderToStaticMarkup(el);
    expect(html).toContain('Xcensis 10-00-06');
  });

  it('contém o número MAPA', () => {
    const el = createElement(FichaTecnica, { data: XCENSIS_DATA });
    const html = renderToStaticMarkup(el);
    expect(html).toContain('00123/2024');
  });

  it('contém a tagline', () => {
    const el = createElement(FichaTecnica, { data: XCENSIS_DATA });
    const html = renderToStaticMarkup(el);
    expect(html).toContain('Nutrição foliar de alta eficiência');
  });

  it('lista os macronutrientes', () => {
    const el = createElement(FichaTecnica, { data: XCENSIS_DATA });
    const html = renderToStaticMarkup(el);
    expect(html).toContain('Nitrogênio (N)');
    expect(html).toContain('Potássio (K₂O)');
  });

  it('lista os micronutrientes', () => {
    const el = createElement(FichaTecnica, { data: XCENSIS_DATA });
    const html = renderToStaticMarkup(el);
    expect(html).toContain('Zinco (Zn)');
    expect(html).toContain('Boro (B)');
  });

  it('mostra as especificações técnicas', () => {
    const el = createElement(FichaTecnica, { data: XCENSIS_DATA });
    const html = renderToStaticMarkup(el);
    expect(html).toContain('Líquida');
    expect(html).toContain('pH');
  });

  it('lista as embalagens', () => {
    const el = createElement(FichaTecnica, { data: XCENSIS_DATA });
    const html = renderToStaticMarkup(el);
    expect(html).toContain('Frasco');
    expect(html).toContain('Tambor');
    expect(html).toContain('XCN-001');
  });

  it('lista as indicações por cultura', () => {
    const el = createElement(FichaTecnica, { data: XCENSIS_DATA });
    const html = renderToStaticMarkup(el);
    expect(html).toContain('Soja');
    expect(html).toContain('Milho');
    expect(html).toContain('Algodão');
    expect(html).toContain('V3–V6');
  });

  it('renderiza sem campos opcionais', () => {
    const minimal: FichaTecnicaData = {
      productName: 'TestProd',
      tenantName: 'TestCo',
      composition: {},
      technicalSpecs: {},
      packaging: [],
      applications: [],
    };
    const el = createElement(FichaTecnica, { data: minimal });
    expect(() => renderToStaticMarkup(el)).not.toThrow();
    const html = renderToStaticMarkup(el);
    expect(html).toContain('TestProd');
    expect(html).toContain('TestCo');
  });

  it('exibe o ano correto no footer', () => {
    const el = createElement(FichaTecnica, { data: XCENSIS_DATA });
    const html = renderToStaticMarkup(el);
    expect(html).toContain('© 2026');
  });

  it('exibe o tenant name no footer', () => {
    const el = createElement(FichaTecnica, { data: XCENSIS_DATA });
    const html = renderToStaticMarkup(el);
    expect(html).toContain('Argho AgriSciences');
  });
});

// ============================================================================
// RenderSpecLayout — compiler blocks integration
// ============================================================================

const ARGHO_THEME: CompilerTheme = {
  brandColor: '#166534',
  fontFamily: "'Inter', system-ui, sans-serif",
  tenantName: 'Argho AgriSciences',
  tagline: 'Ciência que colhe',
};

const makeRegion = (
  id: string,
  componentRef: string,
  content: ResolvedRegion['content'],
): ResolvedRegion => ({
  id,
  type: 'headline_block',
  position: 'top',
  weight: 0.2,
  componentRef,
  content,
});

describe('RenderSpecLayout template', () => {
  it('renderiza sem erros com lista vazia de regiões', () => {
    const el = createElement(RenderSpecLayout, { regions: [], theme: ARGHO_THEME });
    expect(() => renderToStaticMarkup(el)).not.toThrow();
  });

  it('renderiza HeadlineBlock com conteúdo correto', () => {
    const regions: ResolvedRegion[] = [
      makeRegion('h1', 'HeadlineBlock', {
        kind: 'headline',
        lines: ['Xcensis 10-00-06', 'Nutrição foliar de precisão'],
      }),
    ];
    const el = createElement(RenderSpecLayout, { regions, theme: ARGHO_THEME, title: 'Catálogo' });
    const html = renderToStaticMarkup(el);
    expect(html).toContain('Xcensis 10-00-06');
    expect(html).toContain('Nutrição foliar de precisão');
    expect(html).toContain('<title>Catálogo</title>');
  });

  it('renderiza SubheadlineBlock', () => {
    const regions: ResolvedRegion[] = [
      makeRegion('sub', 'SubheadlineBlock', {
        kind: 'headline',
        lines: ['Seção de destaque'],
      }),
    ];
    const html = renderToStaticMarkup(
      createElement(RenderSpecLayout, { regions, theme: ARGHO_THEME }),
    );
    expect(html).toContain('Seção de destaque');
  });

  it('renderiza TenantBrandHeader com nome do tenant', () => {
    const regions: ResolvedRegion[] = [makeRegion('header', 'TenantBrandHeader', { kind: 'auto' })];
    const html = renderToStaticMarkup(
      createElement(RenderSpecLayout, { regions, theme: ARGHO_THEME }),
    );
    expect(html).toContain('Argho AgriSciences');
  });

  it('renderiza TenantFooter com copyright', () => {
    const regions: ResolvedRegion[] = [
      makeRegion('footer', 'TenantFooter', { kind: 'footer', tenantBranding: true }),
    ];
    const html = renderToStaticMarkup(
      createElement(RenderSpecLayout, { regions, theme: ARGHO_THEME }),
    );
    expect(html).toContain('Argho AgriSciences');
    expect(html).toContain('©');
  });

  it('renderiza FeatureList com itens', () => {
    const regions: ResolvedRegion[] = [
      makeRegion('features', 'FeatureList', {
        kind: 'feature_list',
        items: [
          { icon: '🌱', title: 'Alta absorção foliar' },
          { title: 'Compatível com adjuvantes', description: 'pH neutro garantido' },
        ],
      }),
    ];
    const html = renderToStaticMarkup(
      createElement(RenderSpecLayout, { regions, theme: ARGHO_THEME }),
    );
    expect(html).toContain('Alta absorção foliar');
    expect(html).toContain('pH neutro garantido');
  });

  it('renderiza IconGrid com símbolos e valores', () => {
    const regions: ResolvedRegion[] = [
      makeRegion('icons', 'IconGrid', {
        kind: 'icon_grid',
        items: [
          { symbol: '🌿', label: 'Nitrogênio', value: '10%' },
          { symbol: '🔬', label: 'Potássio', value: '6%' },
        ],
      }),
    ];
    const html = renderToStaticMarkup(
      createElement(RenderSpecLayout, { regions, theme: ARGHO_THEME }),
    );
    expect(html).toContain('Nitrogênio');
    expect(html).toContain('10%');
  });

  it('renderiza BadgeStrip com badges', () => {
    const regions: ResolvedRegion[] = [
      makeRegion('badges', 'BadgeStrip', {
        kind: 'icon_grid',
        items: [
          { symbol: '✅', label: 'MAPA', value: '00123/2024' },
          { symbol: '🏆', label: 'ISO 9001' },
        ],
      }),
    ];
    const html = renderToStaticMarkup(
      createElement(RenderSpecLayout, { regions, theme: ARGHO_THEME }),
    );
    expect(html).toContain('MAPA');
    expect(html).toContain('ISO 9001');
  });

  it('renderiza CtaBlock com label e URL', () => {
    const regions: ResolvedRegion[] = [
      makeRegion('cta', 'CtaBlock', {
        kind: 'cta',
        label: 'Solicitar amostra',
        href: 'https://argho.com.br/contato',
      }),
    ];
    const html = renderToStaticMarkup(
      createElement(RenderSpecLayout, { regions, theme: ARGHO_THEME }),
    );
    expect(html).toContain('Solicitar amostra');
    expect(html).toContain('argho.com.br');
  });

  it('renderiza LegalBlock com texto completo', () => {
    const regions: ResolvedRegion[] = [
      makeRegion('legal', 'LegalBlock', {
        kind: 'legal',
        text: 'Registro MAPA obrigatório. Leia o rótulo antes de usar.',
      }),
    ];
    const html = renderToStaticMarkup(
      createElement(RenderSpecLayout, { regions, theme: ARGHO_THEME }),
    );
    expect(html).toContain('Registro MAPA obrigatório');
  });

  it('renderiza Testimonial com citação e atribuição', () => {
    const regions: ResolvedRegion[] = [
      makeRegion('testimonial', 'Testimonial', {
        kind: 'headline',
        lines: ['Aumentou minha produtividade em 15%', 'João Silva, Agrônomo'],
      }),
    ];
    const html = renderToStaticMarkup(
      createElement(RenderSpecLayout, { regions, theme: ARGHO_THEME }),
    );
    expect(html).toContain('Aumentou minha produtividade');
    expect(html).toContain('João Silva');
  });

  it('renderiza ProductCenterpiece com placeholder quando sem dados resolvidos', () => {
    const regions: ResolvedRegion[] = [
      makeRegion('product', 'ProductCenterpiece', {
        kind: 'product_ref',
        productId: 'prod_xcensis',
      }),
    ];
    const html = renderToStaticMarkup(
      createElement(RenderSpecLayout, { regions, theme: ARGHO_THEME }),
    );
    expect(html).toContain('prod_xcensis');
  });

  it('renderiza DataGrid em modo product_data_grid com placeholder', () => {
    const regions: ResolvedRegion[] = [
      makeRegion('grid', 'DataGrid', {
        kind: 'product_data_grid',
        productId: 'prod_xcensis',
        fields: ['pH', 'Densidade', 'Formulação'],
      }),
    ];
    const html = renderToStaticMarkup(
      createElement(RenderSpecLayout, { regions, theme: ARGHO_THEME }),
    );
    expect(html).toContain('pH');
    expect(html).toContain('Densidade');
  });

  it('renderiza Decorative sem erros', () => {
    const regions: ResolvedRegion[] = [makeRegion('dec', 'Decorative', { kind: 'auto' })];
    expect(() =>
      renderToStaticMarkup(createElement(RenderSpecLayout, { regions, theme: ARGHO_THEME })),
    ).not.toThrow();
  });

  it('usa tema padrão quando theme não é fornecido', () => {
    const regions: ResolvedRegion[] = [
      makeRegion('h', 'HeadlineBlock', { kind: 'headline', lines: ['Sem tema'] }),
    ];
    const el = createElement(RenderSpecLayout, { regions });
    expect(() => renderToStaticMarkup(el)).not.toThrow();
    expect(renderToStaticMarkup(el)).toContain('Sem tema');
  });

  it('renderiza região desconhecida como placeholder', () => {
    const regions: ResolvedRegion[] = [
      makeRegion('unk', 'ComponenteInexistente', { kind: 'auto' }),
    ];
    const html = renderToStaticMarkup(
      createElement(RenderSpecLayout, { regions, theme: ARGHO_THEME }),
    );
    expect(html).toContain('ComponenteInexistente');
    expect(html).toContain('unk');
  });
});
