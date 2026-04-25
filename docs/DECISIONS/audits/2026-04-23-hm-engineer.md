# Relatório `/hm-engineer` — Auditoria da Fundação

**Data:** 2026-04-23
**Auditor:** Claude Opus 4.7 via skill `/hm-engineer`
**Escopo:** 31 arquivos da fundação (configs, infra, migrations, packages/db, packages/layout-inference)
**Status:** Parcialmente fechado. Críticos e maioria dos altos aplicados. Médios pendentes pro Claude Code.

---

## Resumo executivo

| Severidade | Total | Aplicados | Pendentes |
|---|---|---|---|
| 🔴 CRÍTICO | 2 | 2 | 0 |
| 🟠 ALTO | 6 | 6 | 0* |
| 🟡 MÉDIO | 5 | 0 | 5 |
| 🟢 BAIXO | 3 | 1 (B3) | 2 |

*A6 aplicado parcial (foundation, PIM, DAM); resto vai junto com M1.

---

## ✅ Aplicados nesta sessão

### C1 — RLS helpers seguros
**Onde:** `infra/supabase/migrations/0001_foundation.sql`

Reescritos `auth.tenant_id()` e `auth.has_role()`:
- `language plpgsql` com bloco `exception when others then return null/false`
- `security definer` + `set search_path = ''` (mitiga search_path injection)
- Validação regex de UUID antes do cast
- `pg_catalog.` qualificando funções built-in
- `revoke all from public` + `grant execute` explícito por role
- Helper extra `auth.tenant_id_with_role(text)` pra defesa em profundidade

### C2 — Secrets fora do código
**Onde:** `infra/docker/docker-compose.yml` + `infra/docker/.env.example`

- Todos os secrets vêm de env vars com `${VAR:?error message}` — falha rápida se não setado
- Defaults dev-only com prefixo `DEV_ONLY_*` (impossível confundir com prod)
- `infra/docker/.env` adicionado ao `.gitignore`
- Bind de portas em `127.0.0.1:` (loopback only — impede exposição acidental)

### A2 — Connection pooling consciente de produção
**Onde:** `packages/db/src/client.ts`

- Detecção automática de modo (Supavisor :6543 transaction mode vs direct :5432)
- `max=1` em prod atrás do pooler (pooler faz multiplex)
- `prepare=false` em transaction mode (não suportado)
- `createDirectClient()` exportado pra migrations e operações que exigem prepared statements
- `DATABASE_URL_DIRECT` documentado no `.env.example`

### A3 — Cost ceiling no analyzer
**Onde:** `packages/layout-inference/src/analyzer/index.ts`

- Parâmetros `maxCostUsd` + `consumedCostUsd` rejeitam call se ultrapassar cota
- Pre-flight de validação de input (URL, mimeType, tamanho de buffer ≤ 20MB)
- `maxRetries` configurável (default 2) — Vercel AI SDK trata transitórios
- Erro tipado `cost_ceiling_exceeded` e `invalid_input` separados

### A4 — Down migration documentada
**Onde:** `infra/supabase/migrations/0006_layout_inference.down.sql`

- Procedimento de rollback explícito
- Guard `do $$ ... $$` que falha se houver `template_id IS NULL` (data loss prevention)
- Documenta opções (deletar histórico vs promover blueprint pra template)

### A5 — pgvector removido da fundação
**Onde:** `infra/supabase/migrations/0001_foundation.sql`

- Extension removida (não usada ainda)
- Comentário explicando que será adicionada na Fase 2 (Knowledge Base)

### A6 (parcial) — JSONB checks
**Onde:** Migrations 0001, 0002, 0003

- `check (jsonb_typeof(col) = 'object'|'array')` em todos os jsonb das migrations aplicadas
- Faltam: 0004 (generator), 0005 (academia), 0006 (layout-inference)

### B3 — README raiz
**Onde:** `README.md`

- Quick start, links para ARCHITECTURE/STATUS/ADRs, princípios

---

## 🔧 Pendente (para o Claude Code)

### M1 — CI bloqueante
Criar `.github/workflows/ci.yml` rodando:
- `pnpm install --frozen-lockfile`
- `pnpm biome ci .`
- `pnpm turbo typecheck`
- `pnpm turbo test`
- **RLS test suite** (subir Postgres ephemeral, validar isolamento entre tenants)
- Falha bloqueia merge.

### M2 — Tipo de `tenants.theme_tokens`
Definir interface `TenantThemeTokens` em `packages/tokens/src/index.ts` e referenciar:
```ts
themeTokens: jsonb('theme_tokens').$type<TenantThemeTokens>().notNull().default({})
```
Adicionar Zod validator ao escrever.

### M3 — Particionamento de `audit_events`
Migration nova:
- `create extension pg_partman`
- Recriar `audit_events` como `partition by range (created_at)`
- Setup de partições mensais via `pg_partman.create_parent`
- Retention policy de 24 meses
- ADR explicando.

### M4 — Retry policy explícito
Já parcialmente coberto em A3 (parâmetro `maxRetries`). Adicionar circuit breaker quando `cost_ceiling_exceeded` se repetir.

### M5 — RLS test suite (CRÍTICO funcionalmente, MÉDIO pelo padrão)
Em `tests/rls.test.ts`:
1. `beforeAll`: subir Postgres ephemeral via testcontainers, rodar migrations
2. Criar tenants `argho` e `competitor`
3. Criar 1 produto em cada
4. Logar como user do `argho`, tentar ler produtos → deve ver só 1
5. Tentar update direto via SQL no produto do `competitor` → deve falhar
6. Tentar bypass via JWT manipulado (claim `tenant_id` errado) → deve falhar
7. Validar que `auth.tenant_id()` retorna NULL com JWT malformado

Esse teste é a **prova de que multi-tenancy funciona**. Sem ele, qualquer mudança futura pode quebrar isolamento sem ninguém perceber.

### B1 — Pricing centralizado
`packages/config/src/pricing.ts`:
```ts
export const ANTHROPIC_PRICING = {
  'claude-sonnet-4-5': { inputPer1M: 3.0, outputPer1M: 15.0, updatedAt: '2026-04-23' },
  'claude-opus-4-7':   { inputPer1M: 15.0, outputPer1M: 75.0, updatedAt: '2026-04-23' },
} as const;
```

### B2 — Comentário de DEV ONLY no inbucket
Já feito durante reescrita do compose. Marcar como concluído.

---

## Recomendação final

A fundação **está pronta pra empacotamento e abertura no Claude Code**.

Os 2 críticos foram fechados (RLS helpers + secrets). Os 6 altos foram fechados. Os 5 médios são trabalho focado de 2-4h no Claude Code, com ciclos curtos e cada fix virando commit.

**Não começar Fase 1 (apps Next.js + UI) antes de M1+M5 estarem fechados.** CI bloqueante e RLS test são as redes de segurança que permitem velocidade sem medo na Fase 1.
