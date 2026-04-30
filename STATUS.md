# STATUS — Programa Colheita Argho

**Última atualização:** 2026-04-30 (Orders: migration 0014 + pedido.criado upsert + pedido.atualizado handler + admin /pedidos list + /pedidos/[id] detail; Fase 4 handlers todos implementados)
**Fase atual:** 3 — Hardening de produção (COMPLETA)
**Próximo milestone:** Fase 3 (roadmap) — CRM agro + BI + Compliance regulatório; Fase 4 — Integrações (ERP, WhatsApp, AgroTools, Climate FieldView)

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

### Schema do banco — 12 migrations SQL
1. `0001_foundation.sql` — tenants, users, roles, audit_events + helpers RLS hardenizados
2. `0002_pim.sql` — products, categories, regulatory_registrations
3. `0003_dam.sql` — assets, collections, product_assets
4. `0004_generator.sql` — material_templates, generated_materials
5. `0005_academia.sql` — learning_tracks, modules, lessons, progress, certifications
6. `0006_layout_inference.sql` (+ down) — layout_references, layout_blueprints
7. `0007_audit_partitioning.sql` (+ down) — particionamento nativo Postgres 16 por mês
8. `0008_fk_indexes.sql` (+ down) — 4 índices FK ausentes
9. `0009_auth_hook.sql` (+ down) — `custom_access_token_hook` para tenant_id no JWT
10. `0010_public_read_policies.sql` (+ down) — políticas de leitura pública (catálogo)
11. `0011_vectors.sql` (+ down) — pgvector: `product_embeddings` + `lesson_embeddings` (HNSW), `match_*` SQL functions (SECURITY DEFINER)
12. `0012_auth_user_sync.sql` (+ down) — trigger `on_auth_user_created` (AFTER INSERT ON auth.users) → cria `public.users` com tenant_id via metadata ou fallback; SECURITY DEFINER, falha silenciosa

Toda tabela com `tenant_id`, RLS habilitado, índices corretos, soft-delete onde aplicável.

### Pacote `@colheita/db`
- Schema Drizzle espelhando todas as 10 migrations (roles, user_roles, audit_events, regulatory_registrations, asset_collections, product_assets, material_templates, generated_materials, learning_tracks, learning_modules, learning_lessons, learning_progress, certifications, layout_references, layout_blueprints)
- Organizado em arquivos de domínio: `foundation.ts`, `dam.ts`, `generator.ts`, `academia.ts`, `layout-inference.ts`
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
- [x] **DAM** — `/midias`: asset browser com grid responsivo, filtros por tipo (image/video/document/audio/other), empty state
- [x] **DAM** — `/midias/colecoes`: listagem e criação de coleções com server action + slugify automático
- [x] DAM: loading skeletons em assets grid e collections list; sidebar com ícone Mídias
- [x] DAM: botão "Enviar arquivo" desabilitado com tooltip (aguarda Supabase Storage)
- [x] Auth completo: login, logout, middleware de proteção de rotas, callback OAuth
- [x] `@colheita/auth`: `createServerClient`, `requireAuth`, `updateSession` middleware, test suite (19 testes)
- [x] `@colheita/ui`: Button, Badge, Card, Table, Input, Textarea, Sidebar, Skeleton, Breadcrumb, Separator
- [x] Dashboard home com stats (total, publicados, rascunhos, arquivados, categorias) + recentes
- [x] PIM Produtos: listar (busca + filtros status + filtros categoria), criar, editar, ver detalhe
- [x] PIM Produtos: publicar, arquivar, reverter rascunho, com feedback de erro
- [x] PIM Produtos: campos composição, especificações técnicas e **embalagens** (JSON com validação)
- [x] PIM Produtos — detalhe: seção **Indicações por Cultura** (cultura, estádio, dose/ha, observações)
- [x] PIM Produtos — detalhe: `generateMetadata` usa nome real do banco (não slug derivado)
- [x] PIM Produtos — editar: editor dinâmico **Indicações por Cultura** com add/remove por linha (não raw JSON)
- [x] PIM Categorias: listar, criar, editar, excluir (bloqueio se houver produtos)
- [x] Sidebar: Visão geral, Produtos, Categorias, **Academia**, logout com feedback
- [x] Loading states (Skeleton) em todas as páginas assíncronas
- [x] Academia — Trilhas: listar, criar (`/academia/nova`), editar (`/academia/[slug]/editar`)
- [x] Academia — Módulos: criar inline no detalhe da trilha, excluir (com cascade), link para detalhe
- [x] Academia — Lições: listar no detalhe do módulo, criar inline, editar (`/[slug]/[mod]/[lic]/editar`), excluir
- [x] Academia — Server actions: `createTrilha`, `updateTrilha`, `publishTrilha`, `archiveTrilha`, `createModulo`, `updateModulo`, `deleteModulo`, `createLicao`, `updateLicao`, `deleteLicao`
- [x] Academia — Conteúdo dinâmico: artigo (Markdown), vídeo (URL), outros tipos via SDK
- [x] Academia — TrilhaActions: botões Publicar / Arquivar direto no detalhe da trilha
- [x] Academia — edição de módulo: `ModuloEditForm` + página `/[slug]/[mod]/editar` + link "Editar" em `ModuloActions`
- [x] Academia — Loading states Skeleton em todas as páginas (lista, detalhe trilha, detalhe módulo)
- [x] Academia — `certification_validity_days` exibido condicionalmente no formulário de trilha (novo + editar); `createTrilha` também salva os campos de certificação
- [x] Academia — detalhe da trilha exibe `certification_validity_days` no badge "Certificado" (ex: "Certificado · 365d")
- [x] Admin — loading.tsx adicionado para dashboard principal, editar trilha, editar módulo, editar lição, lista de categorias, editar categoria
- [x] Admin — `error.tsx` (error boundary) e `not-found.tsx` globais
- [x] Academia app — loading.tsx para viewer de lição (`[slug]/[modulo]/[licao]`) e `/iniciar`
- [x] Portal — loading.tsx para catálogo público (`(public)/loading.tsx`)
- [x] ADRs 0002–0006: multi-tenancy RLS, Drizzle ORM, connection pooling, Anthropic LLM, Trigger.dev
- [x] Admin — `/auditoria`: log de audit_events paginado (50/pág), filtros por ação + recurso, tabela com color-coding, skeleton loading, sidebar link (ClipboardList)
- [x] Admin — `/distribuidores`: lista de usuários com busca (email/nome), filtro por status (active/invited/suspended), paginação 50/pág, link para detalhe
- [x] Admin — `/distribuidores/[id]`: perfil do distribuidor com queries paralelas (user + certifications + audit_events últimas 20 ações), breadcrumb, badge de status, tabelas de certificações e atividade
- [x] Admin — `/distribuidores`: botão "Convidar distribuidor" via `inviteDistribuidorAction` (Supabase Auth Admin)
- [x] Admin — `/distribuidores/[id]`: `StatusActions` — botão Suspender/Reativar contextual
- [x] Admin — `/compliance`: painel compliance regulatório (MAPA/ANVISA/IBAMA/Estadual), sumário cards, alertas de vencimento (30d/90d), filtros status + autoridade
- [x] Admin — `/academia/certificados`: relatório BI de certificações emitidas, filtros por trilha e status, sumário cards (total, 30d, ativos 30d, trilhas)
- [x] Admin — dashboard: stat card "Reg. vencem em 30d" com alerta laranja linkando para /compliance
- [x] `@colheita/auth` — `createAdminClient()`: cliente service_role para ops admin (bypassa RLS)
- [x] Portal + Academia — callback auth: atualiza `last_seen_at` em `public.users` (fire-and-forget) após login via magic link
- [x] Biome 2.0 limpo + TypeScript strict 0 erros

---

## ✅ apps/api — MVP concluído (2026-04-29)

### Funcionalidades entregues
- [x] `GET /api/health` — health check com versão, timestamp, latência e status DB (retorna 503 se DB indisponível)
- [x] `GET /api/v1/catalog` — catálogo público de produtos (ISR 5min, CORS *, RSC)
- [x] `GET /api/v1/catalog/:slug` — detalhe do produto por slug
- [x] `GET /api/v1/catalog/:slug/ficha-tecnica` — download PDF autenticado (distributores), retorna `application/pdf`
- [x] `GET /api/v1/categories` — categorias de produtos (ISR 10min, CORS *)
- [x] `POST /api/v1/agent` — RAG endpoint: busca produtos + lições via BM25, gera resposta com Claude Haiku; autenticado, multi-tenant, retorna `{ answer, sources, usage }`
- [x] `POST /api/webhooks/safra` — receiver com HMAC-SHA256 (X-Safra-Signature), roteamento tipado por 5 tipos de evento
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
- [x] `?next=` propagado por todo o fluxo de magic link: NavEntrarLink → hidden input no form → `emailRedirectTo` → callback → redirect
- [x] Proteção contra open redirect no callback: `next` validado (`startsWith('/')` e `!startsWith('//')`)
- [x] `NavEntrarLink` — client component com `usePathname()` que preserva a página atual como `?next=` no header
- [x] Middleware: trilhas públicas, `/meu-progresso` protegido
- [x] Dashboard `/meu-progresso`: atividade recente + certificações ativas (RSC)
- [x] Rota `/trilhas/[slug]/iniciar` redireciona para primeira lição do primeiro módulo
- [x] Botão "Sair" no `/meu-progresso` (signOut server action)
- [x] Auth-aware header nav: "Entrar" (com ?next=) para guests, "Meu Progresso" + "Sair" para autenticados
- [x] MarkCompleteButton chama `router.refresh()` após upsert — UI atualiza imediatamente
- [x] Markdown renderer SSR-safe (`components/markdown.tsx`) — headings, listas, tabelas, code blocks, blockquotes, inline bold/italic/code
- [x] Navegação prev/next entre lições (busca parallel, ordenação por módulo+lição sort_order)
- [x] `generateMetadata` da lição usa título real do banco (title + track title)
- [x] Indicadores de progresso na trilha: ✓ nas lições concluídas + contador "X/N"
- [x] Emissão automática de certificação ao concluir todas as lições obrigatórias da trilha (`grants_certification` + `certification_no` `ARGHO-{ano}-{hex8}`, validade por `certification_validity_days`)
- [x] Página de detalhe do certificado: `/meu-progresso/certificados/[certificateNo]` (layout visual com faixa, validade, expiração, link para trilha)
- [x] Cards de certificação no `/meu-progresso` linkam para detalhe
- [x] Loading state para página de certificado
- [x] Páginas de erro e 404 globais
- [x] Chat widget flutuante (Assistente IA) para usuários autenticados — chama `/api/v1/agent`
- [x] Chat widget: streaming SSE, multi-turn history (10 turnos), ChatMarkdown, botão "Limpar conversa"
- [x] Biome 2.0 limpo + TypeScript strict 0 erros

---

## ✅ apps/portal — MVP concluído (2026-04-29)

### Funcionalidades entregues
- [x] Catálogo público: listagem por categoria, cards com link para detalhe
- [x] Detalhe do produto: composição garantida (dual-format), specs técnicas, embalagens, **Indicações por Cultura**
- [x] Auth magic link: `/entrar` com `useActionState` + `signInWithMagicLink` server action
- [x] `?next=` propagado por todo o fluxo: link "Entrar" → hidden input → `emailRedirectTo` → callback → redirect
- [x] Proteção contra open redirect no callback: validação `startsWith('/') && !startsWith('//')`
- [x] Detalhe do produto: botão "Baixar Ficha Técnica (PDF)" para autenticados; CTA login com `?next=` para anônimos
- [x] Rota portal-local `GET /produtos/:slug/ficha-tecnica` — resolve cookie cross-domain sem depender de `apps/api`
- [x] Callback OAuth: `/auth/callback` troca code por sessão, redireciona para `next` ou `/conta`
- [x] Middleware customizado: catálogo público, `/conta/*` protegido, `/entrar` redireciona autenticados
- [x] Área do distribuidor: `/conta` com progresso Academia, certificações, produtos disponíveis (stats, listas reais)
- [x] Botão "Sair" no `/conta` (signOut server action)
- [x] Auth-aware header nav: "Entrar" para guests, "Minha Conta" + "Sair" para autenticados
- [x] Busca por nome/tagline (`?q=`) e filtro por categoria (`?category=slug`) — URL params, sem JS
- [x] Detalhe do produto: botão "Baixar Ficha Técnica (PDF)" para autenticados; CTA login com `?next=` para anônimos
- [x] Loading state para `/conta` (skeleton)
- [x] Chat widget flutuante (Assistente IA) para usuários autenticados — chama `/api/v1/agent`
- [x] Chat widget: streaming SSE, multi-turn history, ChatMarkdown, botão "Limpar conversa"
- [x] Páginas de erro: `not-found.tsx` (404) e `error.tsx` (error boundary)
- [x] Biome 2.0 limpo + TypeScript strict 0 erros

---

## ✅ packages/generator — MVP concluído (2026-04-29)

### Funcionalidades entregues
- [x] `generateFichaTecnica(data, options?) → Promise<{ pdf: Buffer, html: string }>`
- [x] Template `FichaTecnica` (React, inline styles): composição garantida, specs técnicas, embalagens, indicações por cultura
- [x] `renderToPdf()` com playwright-core (Chromium headless, A4 portrait)
- [x] Suporte a logo do tenant, número MAPA, tagline, descrição
- [x] 12 testes unitários (renderToStaticMarkup, sem browser) — todos passando
- [x] TypeScript strict 0 erros; biome limpo
- [x] [ADR 0008](./docs/DECISIONS/0008-generator-pdf-engine.md) — decisão de engine PDF (React → renderToStaticMarkup → Playwright); nota sobre `@sparticuz/chromium` para Vercel serverless

---

## ✅ Fase 3 — Hardening de produção (2026-04-30)

### Rate limiting
- [x] `apps/api` — `/api/v1/agent`: Upstash sliding window 10 req/min por usuário (session.id); fail-open sem UPSTASH_REDIS_REST_*; 429 com `Retry-After` + `X-RateLimit-*` headers
- [x] `apps/api` — `/api/webhooks/safra`: IP-based rate limit 60 req/min (Upstash, fail-open) + timestamp freshness check (rejeita eventos > 10 min antigos)
- [x] `@upstash/ratelimit@^2.0.5` + `@upstash/redis@^1.34.3` adicionados em apps/api

### Security headers
- [x] `securityHeaders()` helper em `@colheita/observability/next-config` — CSP conservador, HSTS (prod-only), X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, Referrer-Policy, Permissions-Policy
- [x] CSP: `unsafe-eval` apenas em dev (HMR), `unsafe-inline` pra hidratação RSC, connect-src inclui Supabase/Sentry/PostHog/Trigger.dev
- [x] Applied via `next.config.ts headers()` em todos os 4 apps (admin, portal, academia, api)

### Testes adicionados (Fase 3)
- [x] `apps/api/src/lib/safra-timestamp.ts` — `isEventFresh()` extraída do handler (injectable `nowMs` + `toleranceMs`)
- [x] `apps/api` — 18 novos testes: freshness window, expired replay, clock skew, invalid timestamps, custom tolerance
- [x] `packages/observability` — 24 novos testes: prod vs dev CSP/HSTS, unsafe-eval dev-only, connect-src, overrides
- [x] `docs/DECISIONS/0010-rate-limiting-upstash.md` — ADR documentando sliding window, fail-open, replay defense

---

## ✅ Fase 4 — Integrações ERP Safra (2026-04-30)

### Safra webhook handlers (packages/jobs)
- [x] `cliente.cadastrado` → `inviteUserByEmail` + `status='invited'`; skip if no email; graceful already-registered
- [x] `inventario.atualizado` → upsert `product_stock` (tenant/safra_codigo/deposito); JOIN com `products.safra_codigo` para `product_id`
- [x] `produto.atualizado` → arquiva produto no PIM se `ativo=false` e `status='published'`
- [x] `packages/jobs/src/lib/supabase-admin.ts` — `buildSupabaseAdmin()` compartilhado entre todos os jobs com acesso a DB
- [x] `embed-content.ts` refatorado para usar `buildSupabaseAdmin` compartilhado
- [x] 10 novos testes (`supabase-admin.test.ts`: 4, `safra-sync.test.ts` schemas: 6) → jobs total: **61 testes**

### Migration 0013
- [x] `products.safra_codigo` — código ERP opcional, índice tenant-scoped
- [x] `product_stock` — tabela de estoque sincronizado (tenant_id, safra_codigo, deposito, estoque, unidade, synced_at, RLS)

### Admin — integração PIM ↔ Safra
- [x] `ProdutoForm`: campo "Código Safra" na seção "Integração ERP" (monospace, hint de sincronização)
- [x] `updateProduto` action: persiste `safra_codigo`
- [x] Produto detalhe: seção "Integração ERP Safra" com `safra_codigo` + tabela de estoque por depósito (verde/cinza por disponibilidade, synced_at); mensagem contextual quando sem mapeamento ou sem dados

### Portal — disponibilidade de estoque
- [x] Produto detalhe: badge "Disponível" (verde) / "Esgotado" (cinza) na sidebar do produto
- [x] Query paralela `product_stock` por `safra_codigo` só quando produto tem código Safra mapeado
- [x] Multi-depósito: exibe "N de M depósitos com estoque" quando mais de um deposito
- [x] Seção oculta quando `safra_codigo` não configurado (sem ruído visual para produtos não sincronizados)

### Drizzle schema + seed
- [x] `packages/db/src/schema/index.ts`: `safraCodigo` em products, tabela `productStock` completa com relações
- [x] `packages/db/src/scripts/seed.ts`: `safraCodigo` para 3 produtos Argho (ARG-XCENSIS, ARG-STRON, ARG-GROW-FILL)

### ADR 0013
- [x] `docs/DECISIONS/0013-safra-erp-sync.md` — decisões: safra_codigo, product_stock, 3 handlers, alternativas rejeitadas

### Migration 0014 — Orders
- [x] `orders`: safra_pedido_id (unique por tenant), status enum, totais, snapshot distribuidor, synced_at, RLS (distribuidor vê apenas seus pedidos)
- [x] `order_items`: snapshot de itens (produto_codigo, quantidade, unidade, preco_unitario, desconto_pct, total), cascata com orders

### Safra handlers completos — todos os 5 eventos implementados
- [x] `pedido.criado` → upsert em `orders` + delete/insert de `order_items` + email fire-and-forget
- [x] `pedido.atualizado` → update de status + status_anterior + motivo em `orders`
- [x] 9 novos testes de schema (pedido.criado com/sem campos opcionais, pedido.atualizado com/sem motivo)

### Admin — /pedidos
- [x] `/pedidos`: lista paginada (50/pág), 5 cards de stats por status (clicáveis como filtro), busca por número/distribuidor, badges coloridos por status
- [x] `/pedidos/[id]`: detalhe completo — dados do pedido, tabela de itens (código/produto/qtd/unidade/preço/desconto/total), resumo financeiro, card distribuidor (link para perfil), metadados de sync
- [x] Sidebar: ícone ShoppingCart + link Pedidos
- [x] `loading.tsx`: skeleton para lista de pedidos

---

## 🏗️ Próximo — Fase 1 continuação

### Apps Next.js
- [x] `apps/admin` — ✅ MVP completo (PIM + auth + dashboard + Assistente IA `/assistente`) — porta 3000
- [x] `apps/portal` — ✅ MVP completo (catálogo público + auth magic link + área do distribuidor + chat widget IA) — porta 3001
- [x] `apps/academia` — ✅ MVP completo (trilhas + lições + progresso + certificações + chat widget IA) — porta 3002
- [x] `apps/api` — ✅ MVP completo (catalog REST + health + webhook Safra HMAC + `/api/v1/agent` RAG) — porta 3003

### Pacotes core
- [x] `packages/tokens` — design tokens OKLCH dark-first (system + argho theme)
- [x] `packages/ui` — 10 componentes shadcn customizados (Button, Badge, Card, Table, Input, Textarea, Sidebar, Skeleton, Breadcrumb, Separator)
- [x] `packages/ui` — 16 compiler blocks: `TenantBrandHeader`, `HeadlineBlock`, `SubheadlineBlock`, `ProductCenterpiece`, `ProductGallery`, `DataGrid`, `FeatureList`, `IconGrid`, `Testimonial`, `CtaBlock`, `TenantFooter`, `BadgeStrip`, `MediaBlock`, `QrCode`, `LegalBlock`, `Decorative`
- [x] `packages/auth` — `createServerClient`, `requireAuth`, `updateSession`, middleware multi-tenant, 19 testes
- [x] `packages/generator` — ✅ Playwright + FichaTecnica + RenderSpecLayout (pipeline completo layout-inference → PDF), 28 testes
- [x] `packages/safra-contracts` — schemas Zod para 5 tipos de evento Safra + tipos TypeScript exportados
- [x] `packages/ai` — ✅ RAG + agents + streaming: BM25InMemoryRetriever, AiGenerator (claude-haiku-4-5), RagPipeline, AiStreamEvent, multi-turn history, askStream(), **48 testes**
- [x] `packages/ui` — `ChatMarkdown`: blocos + inline (bold/italic/code/links/tabelas), streaming cursor, **59 testes**
- [x] `packages/safra-contracts` — **28 testes** para os 5 schemas Zod de eventos Safra (discriminatedUnion, defaults, edge cases)
- [x] `packages/tokens` — **21 testes** para TenantThemeTokensSchema + parseTenantThemeTokens (OKLCH/hex/rgb, radius, fallback)
- [x] `apps/api` — **31 testes**: 13 HMAC (`verifySignature`), 18 freshness (`isEventFresh` — replay protection, clock skew, timestamps inválidos, tolerância customizável)
- [x] `packages/email` — Resend client + 2 templates React (CertificadoEmitido, PedidoConfirmado), integração em academia/actions.ts e api/webhooks/safra, **20 testes** (renderToStaticMarkup, sem deps externas)
- [x] `packages/observability` — Sentry (captureError/Warning/setSentryUser + initClient/Server/Edge), Axiom logger (ColheitaLogger + createLogger), PostHog provider + usePageview, **37 testes** (13 Sentry/Logger + 24 securityHeaders); Sentry config files em todas as 4 apps; PostHog provider em portal + academia layouts; `securityHeaders()` helper com `nodeEnv` injectable para testes
- [x] `packages/jobs` — Trigger.dev v3 background jobs: `sendCertificadoEmitidoJob`, `sendPedidoConfirmadoJob`, `gerarFichaTecnicaJob`, `safraEventoJob`; conditional dispatch (TRIGGER_SECRET_KEY); wired to apps/academia + apps/api; **38 testes** (schema validation Zod + task API)
- [x] `packages/ai` — `SupabaseVectorRetriever`: pgvector HNSW retriever com `EmbeddingProvider` interface; `index()` upsert por chunk_type, `retrieve()` via `match_*` RPCs, `purge()` por tenant; **13 novos testes** (mocks, sem DB real) — ai total: **61 testes**
- [x] `packages/ai` — `VoyageEmbeddingProvider`, `OpenAIEmbeddingProvider`, `MockEmbeddingProvider`: dependency injection para `SupabaseVectorRetriever`; ordem de preferência Voyage → OpenAI → Mock(CI); **19 novos testes** — ai total: **80 testes**
- [x] `packages/jobs` — `embedProdutoJob` (4 chunks: nome, descrição, composição, indicações) e `embedLicaoJob`; retry exponencial (maxAttempts=3, factor=2); dispatch via `.trigger()`; **13 novos testes** — jobs total: **51 testes**
- [x] `docs/DECISIONS/0009-vector-retrieval.md` — ADR documentando pgvector HNSW vs Pinecone/Elasticsearch; custo < $0.01/mês estimado
- [x] `apps/admin` — `createProduto`/`updateProduto`: `embedProdutoJob.trigger()` fire-and-forget após upsert
- [x] `apps/admin` — `createLicao`/`updateLicao`: `embedLicaoJob.trigger()` fire-and-forget após upsert
- [x] `apps/api` — `/api/v1/agent`: auto-seleciona `SupabaseVectorRetriever` (pgvector) quando env vars configuradas; fallback `BM25InMemoryRetriever` para dev/CI
- [x] `apps/portal` — busca `?q=` usa `vectorSearchProductIds()` via pgvector; fallback gracioso para `ilike` quando keys não configuradas
- [x] `packages/jobs/src/scripts/reindex-all.ts` + `pnpm embed:reindex` — bulk reindex de todos os produtos e lições (para primeiro deploy)
- [x] `.env.example` atualizado com `VOYAGE_API_KEY`, `OPENAI_API_KEY`, `SUPABASE_URL` documentados

### Scripts operacionais
- [x] `pnpm db:migrate` — aplica 10 migrations em ordem (0001–0010)
- [x] `pnpm db:seed` — Argho como tenant + Xcensis + 2 trilhas de aprendizado com 7 lições + `applications` (Indicações por Cultura) em 4 produtos + `regulatory_registrations` para 12 produtos MAPA
- [x] `pnpm tenant:create` — CLI `--slug=<slug> --name="<Name>"`

### Integrações Fase 1
- [x] Contratos com Safra — `packages/safra-contracts`: 5 eventos Zod (pedido.criado/atualizado, inventario.atualizado, produto.atualizado, cliente.cadastrado); webhook handler valida schema antes de processar
- [x] Resend pra emails transacionais
- [x] Sentry + Axiom + PostHog

---

## 📐 Decisões registradas

- [ADR 0001](./docs/DECISIONS/0001-layout-inference-engine.md) — Layout Inference Engine
- [ADR 0002–0006](./docs/DECISIONS/) — Multi-tenancy RLS, Drizzle ORM, Connection Pooling, Anthropic LLM, Trigger.dev
- [ADR 0007](./docs/DECISIONS/0007-audit-partitioning.md) — Audit Events particionamento nativo Postgres 16 por mês
- [ADR 0008](./docs/DECISIONS/0008-generator-pdf-engine.md) — Generator PDF engine (React → Playwright)
- [ADR 0009](./docs/DECISIONS/0009-vector-retrieval.md) — Vector Retrieval com pgvector HNSW (vs Pinecone/Elasticsearch)
- [ADR 0010](./docs/DECISIONS/0010-rate-limiting-upstash.md) — Rate Limiting com Upstash Redis (sliding window, fail-open, replay defense)
- [ADR 0011](./docs/DECISIONS/0011-security-headers.md) — Security Headers em Next.js (CSP, HSTS, X-Frame-Options, Permissions-Policy)
- [ADR 0012](./docs/DECISIONS/0012-auth-user-sync.md) — Auth user sync (trigger AFTER INSERT ON auth.users → public.users; SECURITY DEFINER, fallback first-tenant, falha silenciosa)
- [ADR 0013](./docs/DECISIONS/0013-safra-erp-sync.md) — Safra ERP sync: safra_codigo (PIM ↔ ERP mapping), product_stock (multi-depot), 3 handlers (cliente.cadastrado invite, inventario.atualizado upsert, produto.atualizado archive)

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
- [x] Primeiro template de ficha técnica gera PDF do Xcensis — **✅ packages/generator**
- [x] Primeiro upload de layout de referência → blueprint extraído → render — **✅ RenderSpecLayout + generateFromRenderSpec**

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
