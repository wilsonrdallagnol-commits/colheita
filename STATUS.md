# STATUS — Programa Colheita Argho

**Última atualização:** 2026-04-29 (apps/api MVP concluído — 4 de 4 apps Fase 1 completas)
**Fase atual:** 1 — Todas as 4 apps Next.js operacionais ✅
**Próximo milestone:** pnpm dev end-to-end + packages/generator (PDF de ficha técnica)

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

### M3 — concluído nesta sessão

- [x] **M3** (`TBD`) — `0007_audit_partitioning.sql` + down + ADR 0007.
  - Native Postgres 16 range partitioning por mês em `created_at`
  - PK composta `(id, created_at)` — obrigatório para partitioned tables
  - Partições pré-criadas: 2026-04 a 2026-07 + DEFAULT (safety net)
  - Índices e RLS definidos no parent, herdados pelas partições
  - pg_partman reservado para Fase 1 (Supabase Cloud tem a extensão)
  - ADR documenta retenção de 12 meses, arquivamento via Trigger.dev

**Fase A do `/hm-engineer` CONCLUÍDA.**

---

## ✅ Skills de validação — TODAS CONCLUÍDAS

### ~~`/hm-engineer`~~ — CONCLUÍDO
M1 (CI), M2 (tokens schema), M3 (audit partitioning), M5 (RLS suite), B1 (pricing config), A2-A6 (fixes de segurança e schema)

### ~~`/hm-designer`~~ — CONCLUÍDO (2026-04-26)
`packages/tokens/src/system.ts` e `packages/tokens/src/argho.ts` — verde floresta técnico + ouro da colheita + teal AI. Dark-first, OKLCH, Geist + Inter + JetBrains Mono.

### ~~`/hm-qa`~~ — CONCLUÍDO (2026-04-26)
51 testes passando (26 layout-inference + 25 DB). Cost ceiling, input validation, blueprint cascade delete, race condition is_current. Fixes: zod-to-json-schema override, vitest fileParallelism.

### ~~`/hm-deploy`~~ — CONCLUÍDO (2026-04-26)
Scripts migrate/seed/create-tenant implementados. infra/supabase/init/ criado. turbo.json env vars corrigidos. biome.json override para scripts CLI.

### ~~`auditor-senior`~~ — CONCLUÍDO (2026-04-26)
Migration 0008: 4 índices FK ausentes adicionados (product_categories.parent_id, asset_collections.parent_id, assets.parent_id, product_assets.asset_id). CI test job ampliado para cobrir todos os packages via turbo.

---

## ✅ apps/admin — MVP concluído (2026-04-28/29)

### Funcionalidades entregues
- [x] Auth completo: login, logout, middleware de proteção de rotas, callback OAuth
- [x] `@colheita/auth`: `createServerClient`, `requireAuth`, `updateSession` middleware, test suite (19 testes)
- [x] `@colheita/ui`: Button, Badge, Card, Table, Input, Textarea, Sidebar, Skeleton, Breadcrumb, Separator
- [x] Dashboard home com stats (total, publicados, rascunhos, arquivados, categorias) + recentes
- [x] PIM Produtos: listar (busca + filtros status + filtros categoria), criar, editar, ver detalhe
- [x] PIM Produtos: publicar, arquivar, reverter rascunho, com feedback de erro
- [x] PIM Produtos: campos composição e especificações técnicas (JSON livre com validação)
- [x] PIM Categorias: listar, criar, editar, excluir (bloqueio se houver produtos)
- [x] Sidebar: Visão geral, Produtos, Categorias, logout com feedback
- [x] Loading states (Skeleton) em todas as páginas assíncronas
- [x] Biome 2.0 limpo + TypeScript strict 0 erros

---

## ✅ apps/api — MVP concluído (2026-04-29)

### Funcionalidades entregues
- [x] `GET /api/health` — health check com versão e timestamp
- [x] `GET /api/v1/catalog` — catálogo público de produtos (ISR 5min, CORS *, RSC)
- [x] `GET /api/v1/catalog/:slug` — detalhe do produto por slug
- [x] `POST /api/webhooks/safra` — receiver com HMAC-SHA256 (X-Safra-Signature)
- [x] Root page JSON com índice de endpoints
- [x] `.env.example` atualizado com `SAFRA_WEBHOOK_SECRET`
- [x] Biome 2.0 limpo + TypeScript strict 0 erros

---

## ✅ apps/academia — MVP concluído (2026-04-29)

### Funcionalidades entregues
- [x] Catálogo público de trilhas agrupado por nível (iniciante → especialista)
- [x] Detalhe da trilha: índice de módulos e lições com estimativa de duração
- [x] Visualizador de lição: artigo (markdown), vídeo stub, quiz stub, breadcrumb
- [x] Auth magic link: `/entrar` + `/auth/callback` (redireciona para `/meu-progresso`)
- [x] Middleware: trilhas públicas, `/meu-progresso` protegido
- [x] Dashboard `/meu-progresso`: atividade recente + certificações ativas (RSC)
- [x] Páginas de erro e 404 globais
- [x] Biome 2.0 limpo + TypeScript strict 0 erros

---

## ✅ apps/portal — MVP concluído (2026-04-29)

### Funcionalidades entregues
- [x] Catálogo público: listagem por categoria, cards com link para detalhe
- [x] Detalhe do produto: composição garantida (dual-format), specs técnicas, embalagens
- [x] Auth magic link: `/entrar` com `useActionState` + `signInWithMagicLink` server action
- [x] Callback OAuth: `/auth/callback` troca code por sessão, redireciona para `/conta`
- [x] Middleware customizado: catálogo público, `/conta/*` protegido, `/entrar` redireciona autenticados
- [x] Área do distribuidor: `/conta` stub com guard de autenticação via RSC layout
- [x] Páginas de erro: `not-found.tsx` (404) e `error.tsx` (error boundary)
- [x] Biome 2.0 limpo + TypeScript strict 0 erros

---

## 🏗️ Próximo — Fase 1 continuação

### Apps Next.js
- [x] `apps/admin` — ✅ MVP completo (PIM + auth + dashboard) — porta 3000
- [x] `apps/portal` — ✅ MVP completo (catálogo público + auth magic link + área do distribuidor) — porta 3001
- [x] `apps/academia` — ✅ MVP completo (trilhas + lições + progresso + certificações) — porta 3002
- [x] `apps/api` — ✅ MVP completo (catalog REST + health + webhook Safra HMAC) — porta 3003

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
- [x] Schema completo do banco (8 migrations + JSONB checks + FK indexes)
- [x] RLS hardenizado (C1) e secrets fora do código (C2)
- [x] CI bloqueante rodando (M1) — 4 jobs, turbo cobre todos os packages
- [x] RLS test suite com 2 tenants (M5) — 20 testes passando
- [x] `pnpm db:migrate` + `pnpm db:seed` implementados e testados
- [x] `/hm-designer` aprovou tokens iniciais
- [x] `/hm-qa` validou edge cases principais — 51 testes passando
- [x] `/hm-deploy` aprovou setup de produção
- [x] `auditor-senior` validou fundação — 0 issues críticos pendentes
- [x] Custo mensal estimado documentado e dentro de $200–350
- [ ] `pnpm dev` sobe todas as apps com sucesso — **Fase 1**
- [ ] Primeiro template de ficha técnica gera PDF do Xcensis — **Fase 1**
- [ ] Primeiro upload de layout de referência → blueprint extraído → render — **Fase 1**

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
