# Programa Colheita Argho — Arquitetura

> Plataforma multi-tenant de operação interna da Argho Agrosciences.
> Visual System, PIM, DAM, Geração de Materiais, Portal de Distribuidores e Academia — sobre uma fundação única.

---

## Princípios

1. **Multi-tenant desde o schema.** Toda tabela com dado de tenant carrega `tenant_id` e RLS obrigatório. Não existe "adicionar multi-tenancy depois".
2. **Type-safety end-to-end.** TypeScript strict, Zod nas bordas, Drizzle no banco. Erro de tipo em runtime é bug arquitetural.
3. **Server-first.** React Server Components por padrão. Client components só quando há interatividade real.
4. **Hexagonal nos módulos críticos.** PIM, Generator e Knowledge Base seguem ports/adapters. Resto pode ser pragmático.
5. **Dados são sagrados.** Migrations versionadas, backups automáticos, soft-delete em entidades de negócio, audit log em mutações sensíveis.
6. **Custo é restrição de design.** Cada chamada de LLM, cada job pesado, cada query N+1 é decisão consciente — não acidente.
7. **Auditável.** Qualquer engenheiro sênior entende o projeto em 10 minutos lendo este doc + o `apps/admin/README.md`.

---

## Stack

| Camada | Escolha | Por quê |
|---|---|---|
| **Runtime** | Node.js 22 LTS | Estável, suporte longo, compatibilidade com Vercel/Cloudflare |
| **Linguagem** | TypeScript 5.6 strict | Type-safety inegociável; strict mode desde o commit zero |
| **Monorepo** | Turborepo 2 + pnpm 9 | Cache de builds, paralelismo, workspace nativo. Melhor DX que Nx pra esse porte. |
| **Frontend/Backend** | Next.js 15 (App Router + RSC + Server Actions) | Frontend e backend num codebase, deploy edge, RSC reduz JS no cliente |
| **UI** | Tailwind v4 + shadcn/ui + Radix primitives | Controle total sobre design; sem CSS-in-JS runtime; acessibilidade nativa |
| **Design tokens** | Style Dictionary + CSS variables | Tokens versionados, multi-tenant theming, multi-output (web, PDF, futuramente mobile) |
| **Banco** | Supabase Postgres 16 | Postgres puro + RLS multi-tenant + Auth + Storage + Realtime numa stack só |
| **ORM** | Drizzle ORM | Type-safe, SQL-first, sem mágica, melhor performance que Prisma, suporta RLS limpo |
| **Auth** | Supabase Auth + middleware Next.js | SSO, magic link, OAuth; integra com RLS nativamente |
| **Storage** | Supabase Storage (S3-compatible) | DAM, PDFs gerados, uploads de distribuidores; políticas por tenant |
| **Geração PDF/PNG** | Playwright + React templates | Render server-side de componentes React → PDF print-ready (300dpi) e PNG 4K |
| **Background jobs** | Trigger.dev v3 | Jobs longos (geração de catálogos, sync, processamento de assets) com observabilidade |
| **AI / RAG** | Vercel AI SDK 4 + Anthropic Claude (Sonnet 4.5) + pgvector | RAG nativo no Postgres; sem vendor adicional; Claude pra raciocínio agronômico |
| **Email** | Resend + React Email | Transacionais com templates React; alta deliverability |
| **Observabilidade** | Sentry + Axiom + OpenTelemetry | Erros, logs estruturados, tracing distribuído |
| **Analytics produto** | PostHog Cloud (EU region) | Feature flags, session replay, funnels — self-hosted depois se justificar |
| **Validação** | Zod 3 | Schema único entre API, forms e DB |
| **Testes** | Vitest + Playwright + Testing Library | Unit + E2E + componente; rápido, ESM nativo |
| **Linting** | Biome 2 | 10x mais rápido que ESLint+Prettier, config única |
| **Git hooks** | Lefthook | Mais rápido que Husky, config YAML |
| **CI/CD** | GitHub Actions + Vercel + Trigger.dev deploy | Deploy automático por branch, preview environments |
| **Infra local** | Docker Compose (Supabase local stack) | Paridade com produção; um comando sobe tudo |
| **Secrets** | Doppler (prod/staging) + .env.local (dev) | Nunca commitar secret; rotação centralizada |
| **Feature flags** | PostHog | Rollout gradual, A/B, kill-switches |

### Justificativas críticas

**Por que Supabase e não Postgres puro + serviços separados?**
Multi-tenancy via RLS é cidadão de primeira classe no Supabase. Auth + Storage + DB num só lugar reduz superfície operacional drasticamente. Argho é empresa de produto, não de infra — Supabase resolve 80% da plumbing com qualidade world-class.

**Por que Drizzle e não Prisma?**
Drizzle é SQL-first, gera bundles 10x menores, suporta RLS sem hacks, e tem melhor type-inference. Prisma adiciona uma camada de abstração que atrapalha quando você precisa de queries não-triviais (que vai precisar no PIM e no RAG).

**Por que Next.js 15 e não Remix/SvelteKit?**
RSC + Server Actions em produção, ecossistema massivo, deploy edge em qualquer lugar (Vercel, Cloudflare, AWS). Remix v3 ainda está estabilizando, SvelteKit tem ecossistema menor pra integrações enterprise.

**Por que Anthropic Claude e não OpenAI/Gemini?**
Você já usa Claude em todo o stack (Code, Desktop, Projects). Consistência de fornecedor, qualidade superior em raciocínio técnico (agronomia exige isso), e Sonnet 4.5 tem melhor custo-benefício pra RAG do portfólio Argho.

**Por que Trigger.dev e não Inngest/BullMQ?**
v3 tem DX superior, observabilidade nativa, retries inteligentes, e roda jobs longos (>5min) sem hacks. Crítico pra geração de catálogos PDF de 100+ páginas.

---

## Estrutura do monorepo

```
colheita/
├── apps/
│   ├── admin/           # Painel interno Argho (PIM, DAM, gestão)
│   ├── portal/          # Portal de distribuidores (auth externa)
│   ├── academia/        # LMS — trilhas, certificações, simulações
│   └── api/             # API pública (integrações, Safra↔Colheita, webhooks)
│
├── packages/
│   ├── ui/              # Componentes shadcn customizados + tokens
│   ├── tokens/          # Design tokens (Style Dictionary)
│   ├── db/              # Schema Drizzle + migrations + seeds
│   ├── auth/            # Helpers de auth + middleware multi-tenant
│   ├── ai/              # SDK interno: RAG, agents, prompts versionados
│   ├── layout-inference/ # Vision analyzer + blueprint compiler (ADR 0001)
│   ├── generator/       # Templates React → PDF/PNG via Playwright
│   └── config/          # Configs compartilhadas (tsconfig, biome, tailwind base)
│
├── infra/
│   ├── docker/          # docker-compose.yml + serviços locais
│   └── supabase/        # Migrations SQL, RLS policies, seeds
│
├── docs/
│   ├── ARCHITECTURE.md  # Este arquivo
│   ├── DECISIONS/       # ADRs — Architecture Decision Records
│   ├── RUNBOOKS/        # Procedimentos operacionais
│   └── DOMAIN/          # Modelagem de domínio (PIM, DAM, Academia)
│
├── .github/workflows/   # CI/CD
├── turbo.json           # Pipeline Turborepo
├── pnpm-workspace.yaml
└── package.json
```

### Boundaries

- **apps/** consomem **packages/**. Nunca o contrário.
- **packages/** podem depender entre si seguindo a hierarquia: `tokens → ui`, `db → auth`, `ai/generator` consomem `db`.
- **apps/admin** e **apps/portal** compartilham `packages/ui` mas têm temas, layouts e auth distintos.
- **apps/api** é stateless, expõe contratos versionados, consome `packages/db` e `packages/auth`.

---

## Multi-tenancy

### Modelo

**Shared database, shared schema, RLS-isolated.**

Todos os tenants vivem no mesmo banco, nas mesmas tabelas, isolados por `tenant_id` + Row-Level Security do Postgres. Modelo mais eficiente em custo e mais seguro quando RLS é configurado corretamente.

### Implementação

1. Toda tabela de domínio tem coluna `tenant_id uuid not null references tenants(id)`.
2. RLS habilitado em **toda** tabela, sem exceção.
3. Policies padrão: `USING (tenant_id = auth.jwt() ->> 'tenant_id'::uuid)`.
4. Service role bypassa RLS — usado apenas em jobs administrativos auditados.
5. Tenant context é injetado no JWT no login e propagado em todo request.
6. Storage segue mesma regra: paths começam com `{tenant_id}/...` e policies de bucket validam.

### Tenant lifecycle

- **Criação:** via CLI admin (`pnpm tenant:create`) — provisiona tenant, cria admin inicial, seed de tema padrão, bucket de storage.
- **Tema:** cada tenant tem design tokens próprios sobrepondo o tema base. Argho é o primeiro tema; novos tenants herdam e customizam.
- **Domínios:** subdomain por tenant (`argho.colheita.app`) ou domínio próprio (CNAME) com SSL automático via Vercel.

---

## Domínios de negócio (Bounded Contexts)

### 1. Identity & Access
Tenants, usuários, roles, permissões, sessões, audit log.

### 2. Visual System
Design tokens, temas por tenant, biblioteca de componentes, templates de materiais.

### 3. PIM — Product Information Management
Produtos, composições NPK/micro, indicações por cultura, embalagens, registros regulatórios, fotos vinculadas ao DAM.

### 4. DAM — Digital Asset Management
Assets (imagens, vídeos, docs), versões, tags, direitos de uso, derivativos (thumbnails, formatos).

### 5. Generator
Geração on-demand de fichas técnicas, banners, posts sociais, catálogos PDF, apresentações comerciais a partir do PIM + Templates.

### 6. Distributor Portal
Distribuidores autenticados acessam catálogo, baixam materiais cobrandeded, pedem amostras, abrem tickets técnicos.

### 7. Academia
Trilhas de aprendizado, módulos, lições, quizzes, simulações de campo, certificações com validade, leaderboard, progresso.

### 8. Layout Inference
Análise de layouts de referência (uploads de marketing) via vision model, extração de blueprints estruturais tenant-agnostic, re-render com identidade do tenant. Pipeline: upload → análise → blueprint → revisão humana → compile → render. Ver [ADR 0001](./docs/DECISIONS/0001-layout-inference-engine.md).

### 9. Integrations
Contratos com Safra, ERP, WhatsApp Business, n8n, Google Workspace.

---

## Segurança

- **Auth:** Supabase Auth com magic link + OAuth (Google Workspace pra equipe interna).
- **MFA:** obrigatório pra roles `admin` e `tenant_owner`.
- **RLS:** habilitado em 100% das tabelas. Teste automatizado em CI valida que nenhuma tabela escapa.
- **Secrets:** zero secrets no código. Doppler em prod/staging, `.env.local` em dev (gitignored).
- **CSP + headers:** strict CSP, HSTS, X-Frame-Options, Referrer-Policy via middleware Next.js.
- **Rate limiting:** Upstash Redis na borda da API (`apps/api`).
- **Audit log:** tabela `audit_events` registra mutações sensíveis (criação/edição de produtos, geração de materiais, mudanças de permissão).
- **Backups:** Supabase PITR (point-in-time recovery) habilitado, snapshots diários, retenção 30 dias.
- **Dependências:** Dependabot + `pnpm audit` em CI; PR bloqueado em vulnerabilidade alta/crítica.

---

## Performance

- **RSC por padrão:** menos JS no cliente, TTFB melhor.
- **Streaming:** Suspense boundaries em rotas pesadas.
- **Image optimization:** `next/image` + Supabase Storage com transformações on-the-fly.
- **DB:** índices em todo `tenant_id`, `created_at`, FKs; query plans revisados em PR de migration.
- **Cache:** React `cache()` em queries de leitura frequente; Vercel Data Cache pra dados públicos.
- **Geração de PDF:** background job via Trigger.dev; usuário recebe notificação quando pronto. Síncrono apenas pra previews de 1 página.

---

## Custo (estimativa inicial)

| Serviço | Plano inicial | Custo/mês estimado |
|---|---|---|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 |
| Trigger.dev | Hobby → Pro | $0 → $20 |
| Anthropic API | Pay-as-you-go | $50–200 (depende de uso RAG) |
| Resend | Free → Pro | $0 → $20 |
| Sentry | Team | $26 |
| Axiom | Pro | $25 |
| Doppler | Team | $0 (até 5 users) |
| PostHog | Free | $0 (até 1M events) |
| **Total inicial** | | **~$200–350/mês** |

Custos crescem com uso. Cada operação cara (geração de catálogo de 100 páginas, query RAG complexa) é instrumentada e tem custo por execução documentado.

---

## Roadmap de fases

- **Fase 0 (init):** Fundação — auth, banco, storage, design system, deploy, CI/CD, observabilidade. **Você está aqui.**
- **Fase 1:** Visual System + PIM + Generator + DAM + Academia (núcleo).
- **Fase 2:** Portal de Distribuidores + Knowledge Base com RAG.
- **Fase 3:** CRM agro + BI + Compliance regulatório.
- **Fase 4:** Integrações (ERP, WhatsApp, AgroTools, Climate FieldView).

---

## Como rodar

```bash
# Pré-requisitos: Node 22, pnpm 9, Docker Desktop
pnpm install
pnpm infra:up          # sobe Supabase local
pnpm db:migrate        # roda migrations
pnpm db:seed           # popula Argho como tenant inicial + dados demo
pnpm dev               # sobe todas as apps em paralelo
```

URLs locais:
- Admin: http://localhost:3000
- Portal: http://localhost:3001
- Academia: http://localhost:3002
- API: http://localhost:3003
- Supabase Studio: http://localhost:54323
