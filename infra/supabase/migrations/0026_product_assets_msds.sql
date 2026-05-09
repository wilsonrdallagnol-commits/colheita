-- ============================================================================
-- Migration 0026 — product_assets: amplia roles pra MSDS + photo + spec_sheet
-- ============================================================================
-- product_assets ja cobre gallery/datasheet/video/document/certificate.
-- Faltam types comuns no agronegocio:
--   - msds: Material Safety Data Sheet (FISPQ no Brasil)
--   - photo: foto adicional (lifestyle, embalagem em uso)
--   - spec_sheet: spec tecnica externa (PDF do regulamento, comprovante MAPA)
--
-- Mantem compatibilidade — rows existentes continuam validas.
-- ============================================================================

alter table public.product_assets
  drop constraint if exists product_assets_role_check;

alter table public.product_assets
  add constraint product_assets_role_check check (
    role in (
      'gallery',
      'datasheet',
      'video',
      'document',
      'certificate',
      'msds',
      'photo',
      'spec_sheet'
    )
  );

comment on column public.product_assets.role is
  'Papel do asset relativo ao produto: gallery (fotos hero/produto em ação), datasheet (ficha técnica PDF), video (demo), document (qualquer documento), certificate (cert. terceiros como ISO, organic, etc), msds (FISPQ/Material Safety Data Sheet), photo (foto extra), spec_sheet (spec regulatorio MAPA/ANVISA/IBAMA).';
