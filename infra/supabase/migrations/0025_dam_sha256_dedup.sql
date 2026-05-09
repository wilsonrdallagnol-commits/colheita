-- ============================================================================
-- Migration 0025 — DAM dedup por sha256 (A2 audit fix complement 2026-05-09)
-- ============================================================================
-- Migration 0024 cobriu race em versionamento (parent_id NOT NULL).
-- Esta complementa cobrindo originais (parent_id NULL): se 2 uploads sobem
-- o mesmo arquivo no mesmo tenant, dedup por hash de conteudo evita duplicacao
-- silenciosa (mesmo arquivo, IDs diferentes, dobra de bill de storage).
--
-- Implementacao:
--   1. Coluna sha256 (text) em assets — nullable pra rows existentes
--   2. Index parcial UNIQUE em (tenant_id, sha256) WHERE sha256 IS NOT NULL
--      AND deleted_at IS NULL
--   3. Backfill em sprint operacional (job hash + UPDATE)
--
-- Camada de aplicacao (upload routes) deve calcular sha256 antes do INSERT
-- e tratar 23505 como "ja existe — retorna o asset existente".
-- ============================================================================

alter table public.assets
  add column if not exists sha256 text;

comment on column public.assets.sha256 is
  'SHA-256 do conteudo binario do arquivo. Usado pra dedup em uploads. Backfill via job pra rows pre-2026-05-09.';

create unique index if not exists assets_tenant_sha256_uniq
  on public.assets (tenant_id, sha256)
  where sha256 is not null and deleted_at is null;

comment on index public.assets_tenant_sha256_uniq is
  'A2 fix 2026-05-09 complement: previne duplicacao por conteudo no DAM.';

-- Index pra buscar por sha256 sem filtro de tenant (debug operacional)
create index if not exists assets_sha256_idx
  on public.assets (sha256)
  where sha256 is not null;
