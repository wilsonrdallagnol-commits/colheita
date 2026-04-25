# Programa Colheita Argho

> Plataforma multi-tenant de operação interna da Argho Agrosciences.
> Visual System · PIM · DAM · Geração de Materiais · Layout Inference · Portal de Distribuidores · Academia.

---

## Status

**Fase 0 — Fundação (init):** em construção. Ver [`STATUS.md`](./STATUS.md) para o estado real, fixes pendentes e próximos passos.

Esta é a fundação inicial gerada via `/hm-init`. Antes de adicionar features, ler:

1. [`ARCHITECTURE.md`](./ARCHITECTURE.md) — stack, decisões e princípios
2. [`STATUS.md`](./STATUS.md) — o que está pronto, o que falta, ordem de execução
3. [`docs/DECISIONS/`](./docs/DECISIONS/) — ADRs (Architecture Decision Records)

---

## Quick start

```bash
# Pré-requisitos: Node 22, pnpm 9, Docker Desktop
pnpm install

# Configura local stack
cp .env.example .env.local
cp infra/docker/.env.example infra/docker/.env

# Sobe Supabase local (Postgres + Auth + Storage + Studio)
pnpm infra:up

# Aplica migrations + popula tenant Argho
pnpm db:migrate
pnpm db:seed

# Sobe todas as apps em paralelo
pnpm dev
```

URLs locais:
- Admin: http://localhost:3000
- Portal: http://localhost:3001
- Academia: http://localhost:3002
- API: http://localhost:3003
- Supabase Studio: http://localhost:54323
- Inbucket (emails dev): http://localhost:54324

---

## Skills

Este projeto segue os padrões Higher Mind. Use as skills via `/hm-*`:

- `/hm-init` — início de projeto (já aplicado)
- `/hm-engineer` — auditoria de código world-class
- `/hm-designer` — validação de interface
- `/hm-qa` — gaps, edge cases, breakages
- `/hm-deploy` — validação de deploy
- `/hm-align` — checa se é a coisa certa pra construir

---

## Estrutura

```
colheita/
├── apps/                     # admin · portal · academia · api
├── packages/
│   ├── ui/                   # design system (shadcn + tokens)
│   ├── tokens/               # design tokens multi-tenant
│   ├── db/                   # Drizzle schema + migrations
│   ├── auth/                 # middleware multi-tenant
│   ├── ai/                   # RAG, agents, prompts versionados
│   ├── layout-inference/     # vision analyzer + blueprint compiler
│   ├── generator/            # templates React → PDF/PNG (Playwright)
│   └── config/               # tsconfig, biome, configs compartilhadas
├── infra/
│   ├── docker/               # Supabase local stack
│   └── supabase/migrations/  # SQL migrations (source of truth)
├── docs/
│   ├── DECISIONS/            # ADRs
│   ├── DOMAIN/               # modelagem de domínios
│   └── RUNBOOKS/             # procedimentos operacionais
└── .github/workflows/        # CI/CD
```

---

## Princípios

1. Multi-tenant via RLS desde o schema. Não adiciona depois.
2. Type-safety end-to-end. TypeScript strict, Zod nas bordas, Drizzle no banco.
3. Server-first. RSC por padrão, client só quando necessário.
4. Hexagonal nos módulos críticos (PIM, Generator, Knowledge Base).
5. Dados são sagrados. Migrations versionadas, soft-delete, audit log.
6. Custo é restrição de design. Não otimização futura.
7. Auditável. Engenheiro sênior entende o sistema em 30 minutos.
