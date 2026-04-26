# ADR 0007 — Particionamento de audit_events por mês

**Status:** Aceito  
**Data:** 2026-04-26  
**Contexto:** Fase 0 — Fundação

---

## Contexto

A tabela `audit_events` registra toda mutação sensível no sistema: criação de usuários, aprovação de materiais, geração de blueprints, concessão de papéis. Em produção multi-tenant, essa tabela cresce sem bound — cada ação de qualquer tenant gera pelo menos um registro.

Projeção conservadora para o primeiro ano:
- 10 tenants × 500 ações/dia × 365 dias = ~1.8M linhas/ano
- Queries por intervalo de tempo (dashboards de auditoria, relatórios de compliance) degradam progressivamente sem particionamento

Problemas sem particionamento:
1. **Performance de leitura:** `SELECT ... WHERE tenant_id = X AND created_at BETWEEN ...` varre a tabela inteira
2. **Arquivamento custoso:** `DELETE WHERE created_at < now() - interval '12 months'` bloqueia a tabela
3. **Backup/restore:** sem partições, não há como restaurar apenas um mês de dados

---

## Decisão

Converter `audit_events` para **Postgres 16 native declarative range partitioning** por mês em `created_at`.

### Por que particionamento nativo e não pg_partman?

`pg_partman` automatiza criação de partições futuras e arquivamento de partições antigas. É a ferramenta certa para produção — mas requer instalação como extensão Postgres, que não está disponível na imagem `postgres:16` usada no CI.

No Supabase Cloud (ambiente de produção), `pg_partman` está disponível como extensão gerenciada. Ele será habilitado na **Fase 1**, junto com o job mensal de criação de partições via **Trigger.dev**.

Para Fase 0: particionamento nativo sem automação, com partições pré-criadas manualmente até julho/2026 e uma `DEFAULT` partition como safety net.

### Estrutura adotada

```sql
CREATE TABLE public.audit_events (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  tenant_id   uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  ...
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)          -- partition key obrigatória na PK
) PARTITION BY RANGE (created_at);

-- Partições mensais
CREATE TABLE audit_events_2026_04 PARTITION OF audit_events
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
-- ...

-- Safety net
CREATE TABLE audit_events_default PARTITION OF audit_events DEFAULT;
```

### Janela de retenção

| Período | Estado | Ação |
|---|---|---|
| 0–12 meses | Ativo | Partições montadas, acessíveis via RLS |
| 12+ meses | Arquivado | Detach partition + dump para cold storage |
| 24+ meses | Expirado | Drop partition (após confirmação de backup) |

Implementação via job mensal no Trigger.dev (Fase 1):
1. Criar partição do próximo mês (D-7 do mês)
2. Detach partições com mais de 12 meses
3. Dump detached partition para S3/Backblaze
4. Drop após 24h de confirmação de backup

---

## Consequências

### Positivas
- Queries por intervalo usam **partition pruning** — varrem apenas as partições relevantes
- Arquivamento via `DETACH PARTITION` é instantâneo e sem lock na tabela principal
- Backup seletivo por mês possível
- RLS definida no parent é herdada automaticamente pelas partições filhas

### Negativas / trade-offs
- **PK composta `(id, created_at)`**: Postgres exige que a partition key faça parte de qualquer unique constraint. Nenhuma outra tabela tem FK para `audit_events`, então não há impacto externo.
- **Partições futuras precisam de pré-criação**: sem pg_partman, linhas com `created_at` fora do range caem na `DEFAULT` partition (não perdem dados, mas perdem o benefício do pruning). Job Trigger.dev resolve isso na Fase 1.
- **INSERT levemente mais custoso**: Postgres verifica qual partição recebe cada row. Impacto negligenciável para o volume projetado.

### Alternativas consideradas

**Sem particionamento:** Simples na Fase 0, mas cria dívida técnica que se torna dolorosa quando a tabela chega em milhões de rows. Rejeito: o custo de migrar uma tabela com dados é muito maior do que particionar com ela vazia.

**Particionamento por `tenant_id`:** Não resolve o problema de arquivamento temporal — cada tenant teria sua partição crescendo indefinidamente. Rejeito: o principal driver de arquivamento é o tempo, não o tenant.

**TimescaleDB:** Overkill para o volume projetado e adiciona dependência de extensão não-padrão no Supabase.

---

## Plano de evolução

```
Fase 0 (atual)
  └── Nativo Postgres 16, partições manuais 2026-04 a 2026-07 + DEFAULT

Fase 1
  ├── Habilitar pg_partman no Supabase Cloud
  ├── Registrar audit_events no pg_partman (período mensal)
  ├── Job Trigger.dev: criar partição próximo mês (D-7)
  └── Job Trigger.dev: arquivar/dropar partições > 12 meses

Fase 2+
  └── Exportar partições arquivadas para cold storage (S3)
      com reindexação para queries de compliance
```

---

## Referências

- [Postgres 16 — Declarative Table Partitioning](https://www.postgresql.org/docs/16/ddl-partitioning.html)
- [pg_partman documentation](https://github.com/pgpartman/pg_partman)
- Migration: `infra/supabase/migrations/0007_audit_partitioning.sql`
- Down migration: `infra/supabase/migrations/0007_audit_partitioning.down.sql`
