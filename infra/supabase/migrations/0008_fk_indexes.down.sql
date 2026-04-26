-- Rollback 0008
drop index if exists public.product_categories_parent_idx;
drop index if exists public.asset_collections_parent_idx;
drop index if exists public.assets_parent_idx;
drop index if exists public.product_assets_asset_idx;
