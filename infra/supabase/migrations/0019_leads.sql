-- ============================================================================
-- Migration 0019 — Leads (Camada 7 / CRM minimal)
-- ============================================================================
-- Tabela basica de leads pra pipeline comercial agro:
--   novo -> qualificado -> proposta -> ganho/perdido
--
-- Sem complexidade desnecessaria nesta v1:
-- - Sem activities/timeline (entra na v2 quando follow-ups forem ativados)
-- - Sem assignments multi-user (entra quando time comercial crescer)
-- - Sem custom fields/tags (jsonb metadata cobre por enquanto)
--
-- Foco: capturar lead -> classificar -> mover no pipeline -> gerar proposta
-- (esta ultima fase usa Camada 3 generator quando entrar).
-- ============================================================================

create table if not exists public.leads (
  id              uuid          primary key default gen_random_uuid(),
  tenant_id       uuid          not null references public.tenants(id) on delete cascade,

  -- Identificacao
  name            text          not null,
  company         text,
  email           text,
  phone           text,
  cpf_cnpj        text,

  -- Origem do lead — explicita pra atribuicao de canal (atribuir CAC futuro)
  source          text          not null default 'other'
                  check (source in ('website', 'whatsapp', 'evento', 'indicacao', 'cold-outreach', 'distribuidor', 'feira', 'other')),

  -- Pipeline status
  status          text          not null default 'novo'
                  check (status in ('novo', 'qualificado', 'proposta', 'ganho', 'perdido')),

  -- Razao da perda (NULL exceto quando status='perdido')
  lost_reason     text,

  -- Localizacao geografica (opcional, importante pra agro — regiao impacta produto)
  state           text          check (state ~ '^[A-Z]{2}$' or state is null),
  city            text,

  -- Cultura/area de interesse (opcional)
  cultura         text,
  area_hectares   numeric(12,2) check (area_hectares is null or area_hectares >= 0),

  -- Notas livres + metadata pra extensoes futuras
  notes           text,
  metadata        jsonb         not null default '{}'::jsonb
                  check (jsonb_typeof(metadata) = 'object'),

  -- Atribuicao (qual user comercial cuida deste lead)
  owner_id        uuid          references public.users(id) on delete set null,

  -- Datas
  qualified_at    timestamptz,
  proposal_sent_at timestamptz,
  closed_at       timestamptz,
  next_followup_at timestamptz,

  -- Auditoria
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now(),
  created_by      uuid          references public.users(id) on delete set null,
  deleted_at      timestamptz
);

create trigger leads_updated_at
  before update on public.leads
  for each row execute function set_updated_at();

-- Indexes pra queries comuns no admin/CRM
create index if not exists leads_tenant_status_idx
  on public.leads (tenant_id, status)
  where deleted_at is null;

create index if not exists leads_tenant_owner_idx
  on public.leads (tenant_id, owner_id)
  where deleted_at is null and owner_id is not null;

create index if not exists leads_tenant_followup_idx
  on public.leads (tenant_id, next_followup_at)
  where deleted_at is null and next_followup_at is not null;

-- Busca textual em name + company + email + cpf_cnpj
create index if not exists leads_search_idx on public.leads
  using gin (to_tsvector('portuguese',
    coalesce(name, '') || ' ' || coalesce(company, '') || ' ' || coalesce(email, '') || ' ' || coalesce(cpf_cnpj, '')
  ));

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table public.leads enable row level security;

-- Comercial e admin do tenant veem todos os leads
create policy leads_select on public.leads
  for select
  using (tenant_id = auth.tenant_id() and deleted_at is null);

-- Apenas roles com permissao escrevem (admin ou role 'sales')
create policy leads_write on public.leads
  for all
  using (
    tenant_id = auth.tenant_id()
    and (auth.has_role('admin') or auth.has_role('sales'))
  );

comment on table public.leads is
  'Pipeline comercial agro. Status: novo->qualificado->proposta->ganho/perdido.';
comment on column public.leads.metadata is
  'jsonb extensivel para custom fields e integracoes futuras (ex: HubSpot, RD Station).';
