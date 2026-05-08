-- ============================================================================
-- Migration 0020 — Lead Activities (Camada 7 / CRM mov 2)
-- ============================================================================
-- Timeline de atividades por lead — registrar contatos, ligacoes, emails, etc.
--
-- Append-only (sem update/delete via RLS) — toda activity vira historico
-- imutavel. Edicao seria via admin API (audit trail preservado).
-- ============================================================================

create table if not exists public.lead_activities (
  id          uuid          primary key default gen_random_uuid(),
  tenant_id   uuid          not null references public.tenants(id) on delete cascade,
  lead_id     uuid          not null references public.leads(id) on delete cascade,

  kind        text          not null check (kind in ('call','email','whatsapp','meeting','note','other')),
  body        text          not null check (length(body) >= 1 and length(body) <= 5000),
  metadata    jsonb         not null default '{}'::jsonb
              check (jsonb_typeof(metadata) = 'object'),

  created_by  uuid          references public.users(id) on delete set null,
  created_at  timestamptz   not null default now()
);

create index if not exists lead_activities_lead_idx
  on public.lead_activities (lead_id, created_at desc);

create index if not exists lead_activities_tenant_idx
  on public.lead_activities (tenant_id, created_at desc);

alter table public.lead_activities enable row level security;

-- Comercial e admin do tenant ve todas activities
create policy lead_activities_select on public.lead_activities
  for select
  using (tenant_id = auth.tenant_id());

-- Apenas admin ou sales pode criar (sem update/delete via RLS — append-only)
create policy lead_activities_insert on public.lead_activities
  for insert
  with check (
    tenant_id = auth.tenant_id()
    and (auth.has_role('admin') or auth.has_role('sales'))
  );

comment on table public.lead_activities is
  'Timeline append-only de interacoes com lead. Sem RLS de update/delete por design.';
