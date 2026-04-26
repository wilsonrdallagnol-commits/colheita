-- ============================================================================
-- Migration 0008 — FK indexes ausentes (auditoria pré-Fase 1)
-- ============================================================================
-- Postgres cria índices automáticos em PKs mas não em FKs — lado "many"
-- de relacionamentos frequentemente faz scan sequencial em cascades e
-- lookups sem índice. Impacto cresce linearmente com volume de dados.
--
-- Afetados:
--   product_categories.parent_id  → cascade delete em árvores de categorias
--   asset_collections.parent_id   → cascade delete em hierarquias de coleções
--   assets.parent_id              → navegação de versões de assets
--   product_assets.asset_id       → cascade delete quando asset é removido
-- ============================================================================

-- Partial indexes (WHERE NOT NULL) — a maioria dos rows não tem parent,
-- índice parcial é menor e mais eficiente para os que têm.
create index if not exists product_categories_parent_idx
  on public.product_categories (parent_id)
  where parent_id is not null;

create index if not exists asset_collections_parent_idx
  on public.asset_collections (parent_id)
  where parent_id is not null;

create index if not exists assets_parent_idx
  on public.assets (parent_id)
  where parent_id is not null;

-- product_assets: não é partial (asset_id NOT NULL por schema)
create index if not exists product_assets_asset_idx
  on public.product_assets (asset_id);
