// apps/portal/src/components/PlaceholderHero.test.tsx
// Smoke test: garante que o PlaceholderHero renderiza sem crashar e contém os
// elementos críticos de UX (claim, CTAs para o site institucional).
//
// Usa renderToStaticMarkup para evitar overhead de @testing-library + DOM —
// o componente é puramente apresentacional, não tem hooks nem estado.
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PlaceholderHero } from './PlaceholderHero';

describe('PlaceholderHero', () => {
  it('renderiza sem crashar', () => {
    expect(() => renderToStaticMarkup(<PlaceholderHero />)).not.toThrow();
  });

  it('contém o eyebrow "Em construção" para sinalizar status', () => {
    const html = renderToStaticMarkup(<PlaceholderHero />);
    expect(html).toContain('Em construção');
    expect(html).toContain('Plataforma Colheita');
  });

  it('contém o claim editorial split blue/green', () => {
    const html = renderToStaticMarkup(<PlaceholderHero />);
    expect(html).toContain('Catálogo digital');
    expect(html).toContain('chega');
    expect(html).toContain('em breve');
  });

  it('contém os 2 CTAs para o site institucional Argho', () => {
    const html = renderToStaticMarkup(<PlaceholderHero />);
    expect(html).toContain('https://arghoagrosciences.com/produtos');
    expect(html).toContain('https://arghoagrosciences.com');
    expect(html).toContain('Ver portfólio Argho');
    expect(html).toContain('Site institucional');
  });

  it('usa tokens CSS para cores Argho (multi-tenant ready)', () => {
    const html = renderToStaticMarkup(<PlaceholderHero />);
    // Cores via var(--colheita-*) em vez de hex hardcoded — permite override por
    // tenant via CSS custom properties sem mudar componente.
    expect(html).toContain('var(--colheita-brand-primary)');
    expect(html).toContain('var(--colheita-brand-secondary)');
  });
});
