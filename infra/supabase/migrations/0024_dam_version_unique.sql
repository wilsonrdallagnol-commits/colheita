-- ============================================================================
-- Migration 0024 — DAM versioning UNIQUE (A2 fix 2026-05-09)
-- ============================================================================
-- Race condition: dois uploads concorrentes do mesmo asset original podem
-- criar duas linhas com (parent_id, version) iguais (ex: ambos calcularam
-- "next version = 2" antes de qualquer commit).
--
-- Solucao: UNIQUE (tenant_id, parent_id, version). Postgres rejeita o segundo
-- INSERT com 23505. Camada de aplicacao trata como conflito e recalcula
-- next_version() em retry. Como parent_id pode ser NULL para originais,
-- adicionamos tambem UNIQUE em (tenant_id, id) implicito via PK + uma
-- regra de versao=1 quando parent_id is null (default ja garante).
-- ============================================================================

-- Indice unico em versoes filhas (parent_id not null)
create unique index if not exists assets_parent_version_uniq
  on public.assets (tenant_id, parent_id, version)
  where parent_id is not null and deleted_at is null;

comment on index public.assets_parent_version_uniq is
  'A2 fix 2026-05-09: previne race condition em versionamento DAM.';
