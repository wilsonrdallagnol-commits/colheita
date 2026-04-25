/**
 * Fixture: Blueprint extraído da peça Xcensis (referência real).
 *
 * Demonstra como o vision analyzer mapearia a estrutura da ficha técnica
 * Xcensis em um blueprint reutilizável, tenant-agnostic.
 *
 * Uso em dev: importar pra testar o compiler e o generator sem precisar
 * chamar a API de visão (custo zero, determinístico).
 */

import type { LayoutBlueprint } from '../blueprint/schema.js';

export const xcensisBlueprintFixture: LayoutBlueprint = {
  format: {
    aspectRatio: '9:16',
    orientation: 'portrait',
    intendedDpi: 72,
    intendedMedium: 'social',
  },
  grid: {
    columns: 12,
    rows: 'auto',
    density: 'high',
    gutterRelative: 0.03,
  },
  regions: [
    {
      id: 'brand_top',
      type: 'brand_header',
      position: 'top',
      weight: 0.06,
      notes: 'Logo centralizado com tagline em caps abaixo',
    },
    {
      id: 'main_headline',
      type: 'headline_block',
      position: 'upper',
      weight: 0.13,
      hierarchy: ['primary_headline', 'secondary_headline', 'tertiary_headline'],
      notes: 'Três linhas de headline em escala decrescente, alto peso tipográfico',
    },
    {
      id: 'product_hero',
      type: 'product_centerpiece',
      position: 'center',
      weight: 0.32,
      layoutHint: 'overlap',
      notes:
        'Packshot central com glow azul radial, ícones de elementos químicos orbitando, célula vegetal ao lado direito',
    },
    {
      id: 'composition_grid',
      type: 'data_grid',
      position: 'lower',
      weight: 0.14,
      itemCount: 7,
      layoutHint: 'horizontal_chips',
      notes: 'Grade horizontal de chips: cada chip tem símbolo grande, nome, percentual',
    },
    {
      id: 'tech_badges',
      type: 'badge_strip',
      position: 'lower',
      weight: 0.08,
      itemCount: 4,
      layoutHint: 'horizontal_chips',
      notes: 'Linha de badges técnicos com ícone + label curto',
    },
    {
      id: 'features_three_col',
      type: 'feature_list',
      position: 'lower',
      weight: 0.12,
      itemCount: 3,
      layoutHint: 'grid',
      notes: 'Três colunas paralelas: cada uma com ícone temático, título em caps e bullets curtos',
    },
    {
      id: 'positioning_block',
      type: 'cta_block',
      position: 'bottom',
      weight: 0.06,
      notes: 'Bloco de aplicação/posicionamento com selo circular à esquerda',
    },
    {
      id: 'closing_statement',
      type: 'headline_block',
      position: 'bottom',
      weight: 0.05,
      hierarchy: ['tagline'],
      notes: 'Frase de fechamento de marca',
    },
    {
      id: 'legal_footer',
      type: 'footer',
      position: 'bottom',
      weight: 0.04,
      notes: 'Site, importador, contatos, logos parceiros',
    },
  ],
  visualIntent: {
    mood: 'technical_premium',
    density: 'high',
    balance: 'centered',
    emphasis: 'product_first',
    inferredPalette: 'dark',
  },
  notes:
    'Layout vertical de ficha técnica premium com forte ancoragem central no produto, glow azul-cinematográfico, alta densidade de dados técnicos organizados em hierarquia clara: marca → mensagem → produto → composição → diferenciais → benefícios → posicionamento → footer.',
};
