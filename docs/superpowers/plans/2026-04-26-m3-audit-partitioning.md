# M3 — audit_events Partitioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Converter `audit_events` para tabela particionada por mês via Postgres 16 native range partitioning, com partições iniciais pré-criadas e ADR documentando as decisões.

**Architecture:** Nativa do Postgres 16 (sem pg_partman na Fase 0). Migration 0007 dropa e recria `audit_events` como tabela particionada (PARTITION BY RANGE on `created_at`). PK composta `(id, created_at)` — exigência do Postgres para partitioned tables. RLS, índices e políticas replicados. pg_partman será adicionado na Fase 1 como automação operacional no Supabase Cloud.

**Tech Stack:** Postgres 16 native declarative partitioning, SQL migration, Markdown ADR

---

## Arquivo map

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `infra/supabase/migrations/0007_audit_partitioning.sql` | criar | Drop + recreate particionado + partições iniciais |
| `infra/supabase/migrations/0007_audit_partitioning.down.sql` | criar | Reverter para tabela simples |
| `docs/DECISIONS/0007-audit-events-partitioning.md` | criar | ADR: decisão, contexto, trade-offs, retenção |

---

### Task 1: Migration 0007 — audit_events particionado

**Files:**
- Create: `infra/supabase/migrations/0007_audit_partitioning.sql`

- [ ] **Step 1: Escrever a migration**

```sql
-- 0007_audit_partitioning.sql
-- Converte audit_events para range partitioning por mês (created_at).
-- Seguro em Fase 0: tabela está vazia, sem FKs externas apontando para ela.

BEGIN;

-- Remove tabela original (sem dados em Fase 0)
DROP TABLE IF EXISTS public.audit_events;

-- Recria como partitioned by range em created_at
CREATE TABLE public.audit_events (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  actor_id    uuid REFERENCES public.users(id),
  action      text NOT NULL,
  resource    text NOT NULL,
  resource_id text,
  payload     jsonb,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- PK composta inclui partition key (exigência do Postgres para partitioned tables)
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Partições mensais pré-criadas (mês atual + 3 meses à frente)
CREATE TABLE public.audit_events_2026_04 PARTITION OF public.audit_events
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE public.audit_events_2026_05 PARTITION OF public.audit_events
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE public.audit_events_2026_06 PARTITION OF public.audit_events
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE public.audit_events_2026_07 PARTITION OF public.audit_events
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- Partição default: captura qualquer data fora do range (proteção contra lag na criação)
CREATE TABLE public.audit_events_default PARTITION OF public.audit_events DEFAULT;

-- Índices (herdados por todas as partições automaticamente)
CREATE INDEX audit_tenant_created_idx ON public.audit_events (tenant_id, created_at DESC);
CREATE INDEX audit_resource_idx ON public.audit_events (tenant_id, resource, resource_id);

-- RLS (aplicado ao parent, herdado pelas partições)
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_select ON public.audit_events
  FOR SELECT USING (tenant_id = auth.tenant_id() AND auth.has_role('admin'));

COMMENT ON TABLE public.audit_events IS
  'Log imutável de ações sensíveis. Particionado por mês (created_at). INSERT via service role apenas. Partições criadas mensalmente via pg_partman (Fase 1).';

COMMIT;
```

- [ ] **Step 2: Rodar contra Postgres 16 de teste e verificar sem erros**

```bash
docker run --rm -d --name pg-m3-test \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=colheita_test \
  -p 5433:5432 postgres:16-alpine

# Aguardar ready
until docker exec pg-m3-test pg_isready -U postgres; do sleep 1; done

# Aplicar migrations 0001-0007 em ordem
DATABASE_URL="postgres://postgres:postgres@localhost:5433/colheita_test" \
  pnpm --filter @colheita/db test

docker stop pg-m3-test
```

Esperado: 20/20 testes passando (audit_events não é testado diretamente pela suite RLS, mas a migration deve aplicar sem erros).

---

### Task 2: Down migration

**Files:**
- Create: `infra/supabase/migrations/0007_audit_partitioning.down.sql`

- [ ] **Step 1: Escrever a down migration**

```sql
-- Reverte para tabela não-particionada (Fase 0 → estado pré-M3)

BEGIN;

DROP TABLE IF EXISTS public.audit_events CASCADE;

CREATE TABLE public.audit_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  actor_id    uuid REFERENCES public.users(id),
  action      text NOT NULL,
  resource    text NOT NULL,
  resource_id text,
  payload     jsonb,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_tenant_created_idx ON public.audit_events (tenant_id, created_at DESC);
CREATE INDEX audit_resource_idx ON public.audit_events (tenant_id, resource, resource_id);

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_select ON public.audit_events
  FOR SELECT USING (tenant_id = auth.tenant_id() AND auth.has_role('admin'));

COMMENT ON TABLE public.audit_events IS 'Log imutável de ações sensíveis. Insere via service role apenas.';

COMMIT;
```

---

### Task 3: ADR 0007

**Files:**
- Create: `docs/DECISIONS/0007-audit-events-partitioning.md`

Documentar:
- Contexto: tabelas de audit crescem sem bound; consultas por período ficam lentas sem partitioning
- Decisão: Postgres 16 native range partitioning por mês em `created_at`
- Por que não pg_partman agora: extensão não disponível em postgres:16 stock (CI); disponível no Supabase Cloud — será adicionado na Fase 1
- Trade-offs: PK composta `(id, created_at)` obrigatória; partições futuras precisam ser pré-criadas (ou automatizadas)
- Retenção: 12 meses ativos; partições mais antigas arquivadas/dropadas via job mensal (Trigger.dev — Fase 1)
- DEFAULT partition como safety net

---

### Task 4: Verificar + Commit

- [ ] Biome check + typecheck `pnpm -r typecheck`
- [ ] Testes RLS: 20/20 com Postgres 16
- [ ] Commit: `feat(db): M3 — partition audit_events by month (native Postgres 16)`
- [ ] Atualizar STATUS.md: marcar M3 como concluído, Fase A fechada
