# STATUS — Programa Colheita Argho

**Última atualização:** 2026-04-25 (M5 RLS suite implementado)
**Fase atual:** 0 — Fundação (Fase A do `/hm-engineer` fechando — só M3 pendente)
**Próximo milestone:** M3 (partitioning audit_events) → `/hm-designer`

---

## ✅ Concluído

### Documentação arquitetural
- `ARCHITECTURE.md` — stack completa justificada item a item
- `docs/DECISIONS/0001-layout-inference-engine.md` — primeiro ADR

### Configuração do monorepo
- `package.json` raiz com scripts unificados
- `pnpm-workspace.yaml` + `turbo.json` (pipeline + env vars)
- `packages/config/tsconfig.base.json` (strict + noUncheckedIndexedAccess)
- `biome.json` (linter + formatter)
- `lefthook.yml` (git hooks com Conventional Commits)
- `.gitignore` + `.env.example` completos

### Infraestrutura local
- `infra/docker/docker-compose.yml` — Supabase stack completa (Postgres 16, Auth, Storage, Studio, Kong, Inbucket)
- `infra/docker/.env.example` — template de secrets dev-only
- Bind em loopback (segurança) + log rotation + healthchecks

### Schema do banco — 6 migrations SQL
1. `0001_foundation.sql` — tenants, users, roles, audit_events + helpers RLS hardenizados
2. `0002_pim.sql` — products, categories, regulatory_registrations
3. `0003_dam.sql` — assets, collections, product_assets
4. `0004_generator.sql` — material_templates, generated_materials
5. `0005_academia.sql` — learning_tracks, modules, lessons, progress, certifications
6. `0006_layout_inference.sql` (+ down) — layout_references, layout_blueprints

Toda tabela com `tenant_id`, RLS habilitado, índices corretos, soft-delete onde aplicável.

### Pacote `@colheita/db`
- Schema Drizzle espelhando as migrations
- Cliente tipado consciente de pooling (Supavisor transaction mode em prod, direct em dev)
- Estrutura de scripts: migrate, seed, tenant:create

### Pacote `@colheita/layout-inference` (completo)
- Schema Zod do Blueprint com refinements (IDs únicos, soma de weights, formato de UUID)
- Vision analyzer com Claude Sonnet 4.5
- Cost ceiling, retry policy, validação de input, timeout
- Compiler Blueprint + Theme + Bindings → RenderSpec
- Mapa de componentes do `@colheita/ui` por tipo de região
- Fixture do Xcensis pra dev sem custo de API
- Testes (5/5 passando em validação standalone)

### Fixes do `/hm-engineer` aplicados
- **C1** — `auth.tenant_id()` e `auth.has_role()` hardenizados (`security definer`, `set search_path = ''`, validação UUID, exception handler, grants explícitos)
- **C2** — Secrets removidos do docker-compose, agora vêm de `infra/docker/.env` (gitignored)
- **A2** — Cliente DB ciente de pooling (Supavisor :6543 transaction mode em prod, direct :5432 pra migrations)
- **A3** — Cost ceiling, retry policy, validação de input no analyzer
- **A4** — Down migration documentada para 0006
- **A5** — `pgvector` removido da fundação (será adicionado em Fase 2 com Knowledge Base)
- **A6 parcial** — Checks `jsonb_typeof()` em foundation, PIM, DAM

### Sessão Claude Code 2026-04-25 — bootstrap + Fase A (parcial)

Repo estava com `.git` numa pasta e os arquivos da fundação numa subpasta — git via tudo como deletado. Estrutura corrigida (fundação de volta na raiz do repo). Lefthook + biome + tsconfig precisaram de fixes pra rodar no Windows. Estes commits compõem a Fase A parcialmente fechada:

- **bootstrap** (`c578819`) — `@colheita/config/package.json` faltando, `tsconfig.json` faltando em `db`/`config`, biome 2.0 com schema antigo, lefthook chamando `if`/`turbo --filter` que não funciona no Windows. Tudo consertado; CI passa local.
- **M1** (`27b776e`) — `.github/workflows/ci.yml` com 4 jobs paralelos (lint, typecheck, test, rls). Job `rls` sobe `postgres:16` como service e tem placeholder pra suite M5.
- **M2** (`b921e09`) — `@colheita/tokens` com `TenantThemeTokens` (Zod schema versionado), `DEFAULT_THEME_TOKENS`, `parseTenantThemeTokens()`. Drizzle `tenants.themeTokens` agora `$type<TenantThemeTokens>()`.
- **B1** (`d08e914`) — `@colheita/config/pricing.ts` com `MODEL_PRICING` (Sonnet 4.5, Opus 4, Haiku 4.5), `FEATURE_COST_CEILINGS_USD`, `calculateModelCost()`. Analyzer agora consome do config.
- **A6 fim** (`a8124a6`) — `check (jsonb_typeof(...))` adicionado em 0004 (4 colunas), 0005 (2 colunas), 0006 (2 colunas).

### M5 — concluído nesta sessão

- [x] **M5** (`TBD`) — `packages/db/tests/rls.test.ts` com 20 testes contra Postgres 16 real.
  - `auth.tenant_id()`: NULL sem JWT, NULL com UUID inválido, UUID correto com JWT válido
  - `auth.has_role()`: false sem roles, true/false por presença no array do JWT
  - `tenants`: cada tenant vê apenas o próprio row; sem JWT → vazio
  - `products`: isolamento cruzado A↔B; UUID falso → vazio; sem JWT → vazio
  - `roles` e `product_categories`: cross-tenant bloqueado
  - CI job `rls` agora roda `pnpm --filter @colheita/db test` (placeholder removido)
  - Setup idempotente: `DROP SCHEMA public CASCADE` + stubs auth + migrations em ordem

### Ainda pendente da Fase A

- [ ] **M3** — Particionar `audit_events` por mês com `pg_partman` (precisa nova migration + ADR explicando trade-offs e janela de retenção).

---

## 🔧 Pendente — Fixes do `/hm-engineer`

Tudo fechado nesta sessão exceto M5 e M3 acima. Quando voltarem, atacar M5 antes — é a rede de segurança que valida RLS.

---

## 🚧 Próximo — Skills a rodar (em ordem)

### 1. Fechar `/hm-engineer`
Aplicar os fixes pendentes acima. **Começar por M5 (RLS test) — é o teste mais importante do projeto inteiro.**

### 2. `/hm-designer`
Auditar a sensibilidade visual do que vai sair pro usuário:
- Tokens iniciais ainda não foram extraídos do Xcensis → criar `packages/tokens/` com tokens base (cores, tipografia, espaçamento, sombras, glow)
- Validar contra padrão Apple/Linear/Stripe definido no CLAUDE.md
- Definir tema base + tema Argho como override

### 3. `/hm-qa`
Encontrar gaps e edge cases:
- O que acontece quando vision model retorna blueprint inválido 3x seguidas?
- O que acontece quando tenant excede cost ceiling no meio de uma geração de catálogo?
- O que acontece quando 2 admins editam o mesmo blueprint simultaneamente (race condition)?
- O que acontece com materiais gerados quando o blueprint pai é deletado?

### 4. `/hm-deploy`
Validar pipeline de deploy antes de qualquer push:
- Vercel project setup (admin, portal, academia, api)
- Supabase Cloud project setup
- Doppler pra secrets prod/staging
- DNS de `colheita.arghoagrosciences.com`
- Trigger.dev project
- GitHub Actions com preview environments por PR

### 5. `auditor-senior`
Auditoria final cross-cutting (UX + DevOps + Engenharia) antes de ir pra Fase 1.

---

## 🏗️ Próximo — Construção da Fase 1

Depois das skills validarem a fundação:

### Apps Next.js
- [ ] `apps/admin` — Next.js 15 + App Router + RSC + middleware multi-tenant
- [ ] `apps/portal` — distribuidores
- [ ] `apps/academia` — LMS
- [ ] `apps/api` — contratos públicos + integração Safra

### Pacotes core
- [ ] `packages/tokens` — design tokens via Style Dictionary (extraídos do Xcensis)
- [ ] `packages/ui` — shadcn customizado + componentes do mapa do compiler (`TenantBrandHeader`, `HeadlineBlock`, `ProductCenterpiece`, `DataGrid`, `IconGrid`, etc — 16 componentes mapeados em `layout-inference/compiler`)
- [ ] `packages/auth` — middleware Next.js + propagação de tenant_id no JWT
- [ ] `packages/generator` — Playwright + templates React → PDF/PNG
- [ ] `packages/ai` — RAG + agents (Fase 2)

### Scripts operacionais
- [ ] `pnpm db:migrate` funcional (atualmente esqueleto)
- [ ] `pnpm db:seed` populando Argho como tenant + Xcensis como produto demo
- [ ] `pnpm tenant:create` CLI

### Integrações Fase 1
- [ ] Contratos com Safra (eventos, webhooks, schema compartilhado)
- [ ] Resend pra emails transacionais
- [ ] Sentry + Axiom + PostHog

---

## 📐 Decisões registradas

- [ADR 0001](./docs/DECISIONS/0001-layout-inference-engine.md) — Layout Inference Engine

### A registrar (vão virar ADRs no Claude Code)
- ADR 0002 — Multi-tenancy via RLS (shared schema)
- ADR 0003 — Drizzle ORM sobre Prisma
- ADR 0004 — Connection pooling (Supavisor transaction mode em produção)
- ADR 0005 — Anthropic como provider único de LLM
- ADR 0006 — Trigger.dev pra background jobs

---

## 🎯 Definition of Done — Fundação (Fase 0)

Para considerar Fase 0 fechada e começar Fase 1:

- [x] ARCHITECTURE.md aprovado
- [x] Schema completo do banco (6 migrations + JSONB checks completos via A6)
- [x] RLS hardenizado (C1) e secrets fora do código (C2)
- [x] CI bloqueante rodando (M1) — 4 jobs paralelos no GitHub Actions
- [x] RLS test suite com 2 tenants (M5) — 20 testes passando
- [ ] `pnpm dev` sobe todas as apps com sucesso
- [ ] `pnpm db:migrate` + `pnpm db:seed` funciona end-to-end
- [ ] Primeiro template de ficha técnica gera PDF do Xcensis
- [ ] Primeiro upload de layout de referência → blueprint extraído → render
- [ ] `/hm-designer` aprovou tokens iniciais
- [ ] `/hm-qa` validou edge cases principais
- [ ] `/hm-deploy` aprovou setup de produção
- [ ] Custo mensal estimado documentado e dentro de $200–350

---

## 📊 Estimativa atual de custo (mensal, produção)

| Serviço | Plano | Custo |
|---|---|---|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| Trigger.dev | $0–20 |
| Anthropic API (Sonnet 4.5) | $50–200 |
| Resend | $0–20 |
| Sentry Team | $26 |
| Axiom | $25 |
| PostHog | $0 (free tier) |
| Doppler | $0 (até 5 users) |
| **Total** | **~$200–350/mês** |

Atualizar conforme uso real no primeiro mês.
