# ADR 0003 — Drizzle ORM sobre Prisma

**Status:** Accepted
**Data:** 2026-04-23
**Decisores:** Wilson Dall Agnol (CTO)

## Contexto

O projeto precisa de um ORM para interagir com Postgres de forma tipada. Os dois candidatos principais para o ecosistema TypeScript/Node são Prisma e Drizzle ORM. Também existe a opção de usar o cliente Supabase diretamente (PostgREST via `supabase-js`) ou SQL raw com `postgres.js`.

O stack usa Supabase como plataforma, mas os scripts de migração/seed e os testes de RLS precisam de acesso direto ao Postgres — não apenas via API REST do Supabase.

## Decisão

Adotar **Drizzle ORM** para scripts operacionais (migrate, seed, tenant:create) e testes de RLS. Para as aplicações Next.js (admin, portal, academia), manter o **cliente Supabase** (`supabase-js` via `@supabase/ssr`) como fonte principal de dados, já que integra nativamente com Auth, RLS e Row-level Realtime.

O schema Drizzle em `packages/db/src/schema/` funciona como **fonte única de verdade** para os tipos TypeScript — os tipos `$inferSelect` e `$inferInsert` são exportados e usados por toda a codebase.

## Decisões específicas

### Drizzle para scripts, Supabase client para apps
- Scripts de seed e migração precisam de transações e controle fino — Drizzle + `postgres.js` é mais adequado
- Apps Next.js consomem dados via `supabase-js` que já gerencia JWT/sessão/RLS automaticamente
- Schema Drizzle = source of truth para tipos; as tabelas são criadas pelas migrations SQL, não pelo `drizzle-kit push`

### Sem geração automática de migrations
- Migrations são escritas à mão em `/infra/supabase/migrations/`
- `drizzle-kit` não é usado para gerar SQL — evita surpresas com diferenças de dialeto Supabase vs Postgres vanilla
- O schema Drizzle espelha as migrations já existentes (retroativo), não as gera

### Organização em arquivos de domínio
- `foundation.ts`, `pim.ts` (em index.ts), `dam.ts`, `generator.ts`, `academia.ts`, `layout-inference.ts`
- Imports circulares controlados: arquivos de domínio importam `{ tenants, users }` de `./index.js`, e `index.ts` re-exporta todos os arquivos de domínio — safe porque Node.js avalia módulos lazily

### Tipo `$inferSelect` exportado como fonte de verdade
- Aplicações usam `LearningTrack`, `LearningLesson`, etc. importados de `@colheita/db`
- Evita duplicação de types entre ORM e aplicações

## Alternativas consideradas

### A. Prisma
- **Rejeitado:** schema.prisma duplicaria as migrations SQL; geração de tipos via reflection (slow on cold start); `prisma generate` como build step adicional; menos controle sobre SQL gerado; incompatibilidade com alguns tipos Postgres avançados (partitioned tables, custom functions)

### B. SQL raw com `postgres.js` puro
- **Rejeitado:** sem inferência de tipos, sem validação em compile time, cursor para queries complexas vira trabalho manual

### C. Supabase client para tudo (incluindo scripts)
- **Rejeitado:** `supabase-js` é cliente REST — não tem acesso a transações, não pode rodar DDL, não integra com o sistema de conexão direta necessário para testes de RLS com múltiplos usuários simulados

## Consequências

### Positivas
- TypeScript strict funciona: `$inferSelect` propaga tipos corretos pelo monorepo
- Scripts operacionais têm controle total sobre transações e conexão
- Schema Drizzle serve como documentação viva do banco de dados
- `drizzle-kit studio` disponível para inspeção visual do schema (opcional)

### Negativas / Riscos
- **Duas formas de acessar o banco**: apps usam `supabase-js`, scripts usam Drizzle. Risco de divergência se um query precisa de RLS (usar supabase-js) vs bypass (usar Drizzle com service_role)
- **Schema manual = risco de drift**: o schema Drizzle precisa ser mantido sincronizado com as migrations SQL. Mitigado por code review e pelo fato de os tipos do TypeScript falharem se o schema estiver errado

## Referências

- `/packages/db/src/schema/`
- `/packages/db/src/client.ts`
- `/packages/db/src/scripts/`
