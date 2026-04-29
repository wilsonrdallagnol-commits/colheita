// packages/generator/tests/generator.test.ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FichaTecnica } from '../src/templates/FichaTecnica.js';
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
