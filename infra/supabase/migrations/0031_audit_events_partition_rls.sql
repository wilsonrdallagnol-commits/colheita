-- ============================================================================
-- Migration 0031 — fecha exposição do audit log (partições de audit_events)
-- ============================================================================
-- CRÍTICO de segurança encontrado no /hm-engineer.
--
-- A migration 0007 converteu audit_events em tabela particionada por mês e
-- habilitou RLS + policy NO PARENT — mas NÃO nas 5 partições filhas
-- (audit_events_2026_04..07 e audit_events_default), que ficaram com RLS off.
-- A migration 0029 concedeu `select` a anon e CRUD a authenticated em TODAS as
-- tabelas de public — incluindo essas partições.
--
-- Resultado: com a chave anon (pública, embarcada no client) era possível
-- `GET /rest/v1/audit_events_2026_05` e ler o log de auditoria de TODOS os
-- tenants (tenant_id, actor_id, ip_address, user_agent, payload — PII/LGPD).
-- authenticated podia até inserir eventos forjados. O acesso via o parent
-- audit_events é seguro (RLS + policy audit_select), mas o PostgREST expõe
-- cada partição como tabela própria, furando a RLS do parent.
--
-- Fix: habilita RLS em cada partição (sem policy própria = deny-all em acesso
-- direto por roles sem BYPASSRLS) e revoga os grants de anon/authenticated.
-- O /auditoria lê via o parent (privilégios e policy do parent continuam
-- valendo). service_role (BYPASSRLS) segue inserindo/lendo normalmente —
-- audit_events é "insere via service role apenas".
--
-- O DO-block itera as partições reais via pg_inherits: cobre exatamente as que
-- existem e é idempotente (re-rodar não causa erro).
-- ============================================================================

do $$
declare
  part_name text;
begin
  for part_name in
    select c.relname
    from pg_inherits i
    join pg_class c on c.oid = i.inhrelid
    join pg_class p on p.oid = i.inhparent
    join pg_namespace n on n.oid = c.relnamespace
    where p.relname = 'audit_events' and n.nspname = 'public'
  loop
    execute format('alter table public.%I enable row level security', part_name);
    execute format('revoke all on public.%I from anon, authenticated, public', part_name);
    raise notice 'audit_events partition lockdown: %', part_name;
  end loop;
end $$;
