-- ============================================================================
-- DOWN Migration 0006 — Layout Inference Engine
-- ============================================================================
-- ⚠️ ATENÇÃO: esta down migration NÃO é totalmente segura por padrão.
--
-- O `alter column template_id drop not null` na up migration permite que
-- existam rows em generated_materials com template_id NULL (vindos de
-- blueprint). Se você tentar reverter isso após dados existirem, a recriação
-- do constraint NOT NULL FALHA.
--
-- Procedimento seguro de rollback:
--   1. Backup completo do banco antes
--   2. Decidir o que fazer com generated_materials que têm template_id IS NULL:
--      a) Deletar (perda de histórico): delete from generated_materials where template_id is null;
--      b) Promover blueprint pra template antes de remover
--   3. Rodar este script
-- ============================================================================

begin;

-- 1. Remover FK e coluna blueprint_id de generated_materials
alter table public.generated_materials
  drop constraint if exists generated_materials_source_check;

drop index if exists generated_materials_blueprint_idx;

alter table public.generated_materials
  drop column if exists blueprint_id;

-- 2. Restaurar NOT NULL em template_id
-- ⚠️ Pré-requisito: nenhuma row pode ter template_id IS NULL.
--    Se houver, este comando vai falhar — trate os dados primeiro.
do $$
declare
  null_count integer;
begin
  select count(*) into null_count
  from public.generated_materials
  where template_id is null;

  if null_count > 0 then
    raise exception
      'Cannot drop NOT NULL: % rows have template_id IS NULL. Resolve them before rolling back.',
      null_count;
  end if;
end;
$$;

alter table public.generated_materials
  alter column template_id set not null;

-- 3. Drop tabelas do layout inference (cascade limpa policies e indexes)
drop table if exists public.layout_blueprints cascade;
drop table if exists public.layout_references cascade;

commit;
