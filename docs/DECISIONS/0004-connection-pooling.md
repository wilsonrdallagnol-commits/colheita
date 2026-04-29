# ADR 0004 — Connection Pooling via Supavisor

**Status:** Accepted
**Data:** 2026-04-23
**Decisores:** Wilson Dall Agnol (CTO)

## Contexto

Aplicações serverless (Next.js em Vercel, Edge Functions) criam e destroem conexões com o banco de dados em alta frequência. Postgres tem um limite de conexões simultâneas baseado em memória (`max_connections`, default 100 no Supabase Free, 200 no Pro). Em produção com múltiplas instâncias serverless, cada função pode abrir sua própria conexão — facilmente esgotando o pool.

O Supabase oferece o **Supavisor**, um connection pooler gerenciado, via porta `:6543` (transaction mode) e `:5432` (direct/session mode).

## Decisão

Usar **Supavisor em transaction mode** (`:6543`) para todas as conexões de produção das aplicações Next.js. Usar **conexão direta** (`:5432`) apenas para scripts de migração e seed, onde precisamos de sessões persistentes (prepared statements, `SET LOCAL`, transações longas).

## Decisões específicas

### Transaction mode (`:6543`) para aplicações
- **Transaction mode**: Supavisor mantém um pool de conexões com o Postgres. A conexão do cliente é alocada apenas durante a transação e devolvida ao pool ao final.
- Suporta dezenas de milhares de clientes simultâneos com um pool pequeno (~20 conexões reais com o Postgres)
- Sem overhead de `pgbouncer.ini` — Supavisor é gerenciado pelo Supabase

### Restrições do transaction mode
- **Sem prepared statements**: cada query deve ser enviada sem `?` nomeados que dependem de estado de sessão. Drizzle/supabase-js já geram queries parametrizadas compatíveis.
- **Sem `SET SESSION`**: configurações de sessão não persistem entre queries. Relevante para `SET app.tenant_id` — por isso usamos JWT em vez de parâmetros de sessão para RLS.
- **Sem advisory locks** de sessão: use `pg_advisory_xact_lock` (scoped à transação) em vez de `pg_advisory_lock` (scoped à sessão)

### Conexão direta para migrations
- Scripts de `drizzle-kit` e seed usam `DATABASE_URL` com porta `:5432` diretamente
- Migrations podem usar `DO $$ ... $$` blocks, `BEGIN/COMMIT` explícitos, e features que exigem sessão persistente
- Scripts rodam em CI via `pnpm db:migrate` antes de qualquer deploy

### Variáveis de ambiente
```
# Produção — transaction mode para apps
DATABASE_URL=postgresql://...@host:6543/postgres?pgbouncer=true

# Migrations — direct connection
DATABASE_DIRECT_URL=postgresql://...@host:5432/postgres
```

O `?pgbouncer=true` é necessário para o Drizzle/Prisma não usar prepared statements com nome.

## Alternativas consideradas

### A. Direct connection para tudo
- **Rejeitado:** em Vercel/serverless, cada instância da função abre sua própria conexão. 100 requisições simultâneas = 100 conexões Postgres. Com `max_connections=200` (Supabase Pro), o banco fica saturado rapidamente.

### B. PgBouncer auto-hospedado
- **Rejeitado:** adiciona infraestrutura para manter. Supavisor oferece o mesmo resultado sem operação.

### C. Prisma Data Proxy / Accelerate
- **Rejeitado:** vendor lock-in adicional; custo extra; complexidade desnecessária quando o Supavisor já está disponível.

## Consequências

### Positivas
- Aplicações em produção nunca esgotam o pool de conexões, mesmo com picos de tráfego
- Zero operação — Supavisor é gerenciado pelo Supabase
- Queries SQL geradas pelo ORM não precisam de modificação

### Negativas / Riscos
- **Bugs sutis com prepared statements**: se uma lib tentar usar prepared statements nomeados em transaction mode, as queries vão falhar silenciosamente ou dar erro. Mitigado pelo `?pgbouncer=true` na connection string.
- **Sem SET SESSION para RLS manual**: todo isolamento de tenant deve vir do JWT, não de `SET app.current_tenant`. Isso já é nosso design — `auth.tenant_id()` lê do JWT.

## Referências

- `/packages/db/src/client.ts` — lógica de escolha de connection string por ambiente
- `/infra/docker/docker-compose.yml` — stack local com pgBouncer emulado via Supabase Studio
- Supabase docs: [Supavisor](https://supabase.com/docs/guides/database/connecting-to-postgres)
