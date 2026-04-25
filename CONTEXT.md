# CONTEXT — Handoff para Claude Code

> Este documento transfere o contexto completo da conversa de planejamento (feita no Claude.ai) para o Claude Code, que vai executar a construção do projeto autonomamente a partir daqui.

---

## Quem está construindo isso

**Wilson Dall Agnol** — CEO e fundador da Argho Agrosciences.
- Toma decisões técnicas e arquiteturais
- Não escreve código — Claude escreve, Wilson aprova
- Padrão exigido: world-class em todas as camadas (segurança, performance, arquitetura, design)
- Referências de design: Apple, Airbnb, Linear, Stripe, Vercel
- Trabalha em PT-BR, mas código/comentários técnicos seguem padrão internacional (inglês quando for convenção)

Ler `CLAUDE.md` ou as preferências do usuário para o padrão completo de comunicação.

---

## O que é o Programa Colheita Argho

Plataforma multi-tenant de operação interna da Argho Agrosciences, com possibilidade de abrigar futuras empresas do grupo (EVOFIT, etc).

**Domínio:** `colheita.arghoagrosciences.com`
**Integra com:** projeto Safra (já em construção)
**Multi-tenant** desde o schema: Argho como primeiro tenant, novos tenants entram sem refactor.

### Camadas (Fase 1 — escopo aprovado)

1. **Visual System** — design tokens, componentes, templates
2. **PIM** (Product Information Management) — catálogo de produtos
3. **DAM** (Digital Asset Management) — biblioteca de mídia
4. **Generator** — geração on-demand de fichas, banners, posts, catálogos (PDF/PNG via Playwright)
5. **Layout Inference Engine** — feature diferenciada: usuário sobe layout de referência (imagem/PDF), Claude Sonnet 4.5 vision extrai blueprint estrutural tenant-agnostic, sistema re-renderiza com identidade do tenant
6. **Academia Argho** — LMS interno com trilhas, certificações e simulações para vendedores e distribuidores

### Fases futuras (NÃO fazer agora)

- Fase 2: Portal de Distribuidores + Knowledge Base com RAG
- Fase 3: CRM agro + BI + Compliance regulatório
- Fase 4: Integrações (ERP, WhatsApp, AgroTools, Climate FieldView)

---

## Stack travada (ver `ARCHITECTURE.md` para detalhes e justificativas)

- **Runtime:** Node 22 LTS (24 funciona, mas 22 é o target)
- **Linguagem:** TypeScript 5.6 strict
- **Monorepo:** Turborepo 2 + pnpm 9
- **Framework:** Next.js 15 (App Router + RSC + Server Actions)
- **UI:** Tailwind v4 + shadcn/ui + Radix
- **Tokens:** Style Dictionary
- **Banco:** Supabase Postgres 16
- **ORM:** Drizzle ORM (não Prisma)
- **Auth:** Supabase Auth + middleware Next.js
- **Storage:** Supabase Storage
- **PDF/PNG:** Playwright server-side
- **Background jobs:** Trigger.dev v3
- **AI/Vision:** Anthropic Claude Sonnet 4.5 via Vercel AI SDK 4
- **Email:** Resend + React Email
- **Observabilidade:** Sentry + Axiom + OpenTelemetry
- **Analytics produto:** PostHog
- **Validação:** Zod 3
- **Testes:** Vitest + Playwright + Testing Library
- **Lint/Format:** Biome 2 (não ESLint+Prettier)
- **Git hooks:** Lefthook (não Husky)
- **CI/CD:** GitHub Actions + Vercel + Trigger.dev
- **Secrets:** Doppler em prod/staging, .env.local em dev
- **Connection pooling em prod:** Supavisor transaction mode (porta 6543)

---

## O que JÁ ESTÁ CONSTRUÍDO

A fundação foi gerada via `/hm-init` no Claude.ai e está nos arquivos deste repositório:

### Documentação
- `README.md` — quick start
- `ARCHITECTURE.md` — stack completa justificada, princípios, bounded contexts
- `STATUS.md` — estado real do projeto, fixes pendentes, roadmap
- `docs/DECISIONS/0001-layout-inference-engine.md` — primeiro ADR
- `docs/DECISIONS/audits/2026-04-23-hm-engineer.md` — relatório completo do `/hm-engineer`

### Configuração
- `package.json`, `pnpm-workspace.yaml`, `turbo.json`
- `packages/config/tsconfig.base.json` (strict + noUncheckedIndexedAccess)
- `biome.json`, `lefthook.yml`
- `.gitignore`, `.env.example`

### Infraestrutura local
- `infra/docker/docker-compose.yml` — Supabase stack (Postgres, Auth, Storage, Studio, Kong, Inbucket)
- `infra/docker/.env.example` — secrets dev-only com prefixo `DEV_ONLY_`

### Banco de dados
- 6 migrations SQL em `infra/supabase/migrations/`
- Toda tabela com `tenant_id` e RLS habilitado (validado: 20/20 tabelas)
- Helpers de segurança hardenizados: `auth.tenant_id()`, `auth.has_role()`, `auth.tenant_id_with_role()`
- Down migration de exemplo em `0006_layout_inference.down.sql`

### Pacotes
- `@colheita/db` — schema Drizzle + cliente com pooling consciente de produção
- `@colheita/layout-inference` — analyzer (Claude Sonnet 4.5 vision) + compiler + schema Zod com refinements + fixture do Xcensis + testes (5/5 passando)

---

## O que JÁ FOI AUDITADO

### `/hm-engineer` rodou e aplicou:

**🔴 CRÍTICOS (2/2 fechados):**
- C1 — RLS helpers com `security definer` + `set search_path = ''` + validação UUID + exception handler
- C2 — Secrets fora do código (env vars com `${VAR:?}`, defaults dev-only marcados)

**🟠 ALTOS (6/6 fechados):**
- A2 — Pooling Supavisor-aware
- A3 — Cost ceiling, retry, validação de input no analyzer
- A4 — Down migration documentada
- A5 — pgvector removido (volta na Fase 2)
- A6 (parcial) — `check (jsonb_typeof(...))` em foundation/PIM/DAM

**🟡 MÉDIOS (0/5 — pendentes para o Claude Code):**
- A6 (resto) — Checks JSONB em migrations 0004, 0005, 0006
- M1 — CI bloqueante em GitHub Actions
- M2 — Tipo `TenantThemeTokens` em `packages/tokens`
- M3 — Particionamento de `audit_events` por mês
- M5 — RLS test suite (CRÍTICO funcionalmente — valida isolamento entre tenants)

**🟢 BAIXOS (1/3 fechado):**
- B3 — README criado
- B1 — Pricing centralizado em `packages/config` (pendente)
- B2 — Já marcado como DEV ONLY no compose

---

## O que FALTA construir (resumo executivo)

### 1. Fechar `/hm-engineer` (urgente, antes de Fase 1)

Aplicar M1, M2, M3, M5, B1 nesta ordem:
1. **M5 primeiro** — RLS test suite (rede de segurança que valida toda a arquitetura)
2. **M1** — CI bloqueante
3. **M2** — Tipos de theme tokens
4. **M3** — Particionamento audit_events
5. **B1** — Pricing centralizado

### 2. Rodar skills restantes (na ordem)

- `/hm-designer` — auditar tokens visuais (extrair do Xcensis), validar contra padrão Apple/Linear/Stripe
- `/hm-qa` — gaps e edge cases (blueprint inválido 3x, race conditions em edição simultânea, etc)
- `/hm-deploy` — validar setup Vercel + Supabase Cloud + Doppler + DNS + Trigger.dev + GitHub Actions
- `auditor-senior` — auditoria final cross-cutting

### 3. Construir Fase 1

**Pacotes core:**
- `packages/tokens` — design tokens (Style Dictionary) extraídos do Xcensis
- `packages/ui` — shadcn customizado + 16 componentes mapeados em `layout-inference/compiler` (`TenantBrandHeader`, `HeadlineBlock`, `ProductCenterpiece`, `DataGrid`, `IconGrid`, `FeatureList`, etc)
- `packages/auth` — middleware Next.js + propagação de tenant_id no JWT
- `packages/generator` — Playwright + templates React → PDF/PNG
- `packages/ai` — RAG + agents (Fase 2, mas estrutura básica já)

**Apps Next.js:**
- `apps/admin` — painel interno Argho
- `apps/portal` — distribuidores
- `apps/academia` — LMS
- `apps/api` — contratos públicos + integração Safra

**Scripts operacionais:**
- `pnpm db:migrate` funcional
- `pnpm db:seed` populando Argho como tenant + Xcensis como produto demo
- `pnpm tenant:create` CLI

**Integrações Fase 1:**
- Contratos com Safra (eventos, webhooks, schema compartilhado)
- Resend pra emails transacionais
- Sentry + Axiom + PostHog

---

## Decisões de produto importantes (já travadas)

1. **Vision model:** Claude Sonnet 4.5 (consistência com stack Anthropic, qualidade superior em análise estrutural). Vendor lock-in mitigado via Vercel AI SDK.
2. **Revisão humana de blueprints:** ligada por default na Fase 1, com toggle pra usuários experientes.
3. **Escopo do Blueprint v1:** captura layout/grid, hierarquia tipográfica, paleta dominante, tipo de elementos. **NÃO** captura animações, ilustrações específicas, composições fotográficas complexas.
4. **Multi-tenancy:** shared database, shared schema, RLS-isolated. Argho é primeiro tenant.
5. **Não migrar do Horizons** — projeto antigo do Hostinger foi descontinuado. Construção é do zero no Claude Code.

---

## Como Wilson trabalha

- Descreve o que precisa ser construído em detalhe — Claude executa
- Não pede confirmação pra decisões óbvias
- Quando fala "revisa isso", quer todas as camadas: segurança, arquitetura, performance, qualidade, escala
- Quando fala "world-class", é sério — não shippa nada que ele não mostraria com orgulho
- Na dúvida, escolhe a opção que um time de engenharia world-class escolheria
- Skills disponíveis: `/hm-init`, `/hm-engineer`, `/hm-designer`, `/hm-qa`, `/hm-deploy`, `/hm-align`

---

## Próximo prompt sugerido para o Claude Code

Quando esta conversa for aberta no Claude Code, o primeiro prompt deve ser:

```
Leia em ordem:
1. CONTEXT.md (este arquivo — handoff da conversa de planejamento)
2. README.md
3. STATUS.md
4. ARCHITECTURE.md
5. docs/DECISIONS/audits/2026-04-23-hm-engineer.md

Depois execute:

FASE A — Fechar /hm-engineer (commits separados, conventional commits):
1. M5: criar tests/rls.test.ts com testcontainers Postgres, 2 tenants,
   validar isolamento (tenant A não lê dados do tenant B,
   bypass via JWT manipulado é negado, auth.tenant_id() retorna NULL com JWT inválido)
2. M1: criar .github/workflows/ci.yml com lint + typecheck + test + RLS test bloqueante
3. M2: criar packages/tokens/ com tipo TenantThemeTokens, referenciar em Drizzle
4. M3: migration nova particionando audit_events por mês com pg_partman
5. B1: criar packages/config/src/pricing.ts versionado
6. A6 resto: checks jsonb_typeof nas migrations 0004, 0005, 0006

Cada item vira um commit. Após cada commit, rode os testes e mostre o resultado.

Se algo não estiver claro, pergunte antes de inventar.
Se uma decisão técnica precisar ser tomada e não estiver no CONTEXT.md
ou ARCHITECTURE.md, pergunte explicitamente em vez de assumir.
```

---

## Notas operacionais para o Claude Code

- **Sempre commitar em pequenos passos** — cada fix é um commit auditável
- **Conventional Commits obrigatório** — `feat:`, `fix:`, `docs:`, `test:`, `chore:`, etc
- **Rodar testes antes de cada commit** — Lefthook já configurado pra isso
- **Atualizar `STATUS.md`** quando concluir items pendentes (mover de pendente pra concluído)
- **Criar ADR novo** em `docs/DECISIONS/` para qualquer decisão arquitetural não-trivial
- **Nunca pular segurança ou testes** — regra absoluta do Wilson
- **Nunca escolher ferramenta porque é popular** — escolher porque é a melhor

Quando terminar a Fase A, pedir aprovação antes de prosseguir para `/hm-designer`.
