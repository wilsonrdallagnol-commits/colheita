# ADR 0002 — Multi-tenancy via RLS (shared schema)

**Status:** Accepted
**Data:** 2026-04-23
**Decisores:** Wilson Dall Agnol (CTO)

## Contexto

A Argho é uma plataforma multi-tenant: a mesma codebase serve múltiplas empresas distribuidoras (Argho, futuros clientes B2B). Cada tenant tem seus próprios produtos, usuários, trilhas de aprendizado, materiais gerados e dados analíticos. Vazamento de dados entre tenants é uma falha crítica de segurança.

Três arquiteturas são possíveis para multi-tenancy em banco relacional:

1. **Banco separado por tenant** — isolamento total, mas complexidade operacional altíssima
2. **Schema separado por tenant** — bom isolamento, mas migrations duplicadas e pooling complicado
3. **Schema compartilhado + discriminação por coluna** — mais simples operacionalmente; isolamento via RLS

## Decisão

Adotar **schema compartilhado com `tenant_id` em todas as tabelas + Row Level Security (RLS) no Postgres**.

Toda tabela tem `tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE`. O isolamento é garantido por políticas RLS que verificam `auth.tenant_id()` — uma função `SECURITY DEFINER` que extrai o tenant do JWT da sessão Supabase.

## Decisões específicas

### Função `auth.tenant_id()` hardenizada
- `SECURITY DEFINER` com `SET search_path = ''` para evitar search_path injection
- Valida formato UUID antes de retornar (`regexp_match`)
- Exception handler para erros de JWT — retorna NULL em vez de propagar
- `GRANT EXECUTE` apenas para `authenticated` e `service_role`

### Função `auth.has_role(role_slug text)`
- Verifica se o JWT contém o role solicitado no array `app_metadata.roles`
- Mesmo hardening que `auth.tenant_id()`
- Permite políticas RLS expressivas: `auth.has_role('admin')` para operações destrutivas

### Políticas por tabela
- Tabelas de dados (produtos, trilhas, etc): `SELECT/INSERT/UPDATE/DELETE` exigem `tenant_id = auth.tenant_id()`
- `tenants`: cada tenant vê apenas seu próprio row
- `users`: cada usuário vê apenas usuários do próprio tenant
- Tabelas com leitura pública (ex: `learning_tracks` publicadas): política adicional sem JWT

### RLS para `service_role`
- `service_role` bypassa RLS por design do Supabase
- Usado apenas em scripts de migração e operações de admin (seed, create-tenant)
- Nunca exposto para clientes ou edge functions

## Alternativas consideradas

### A. Banco separado por tenant
- **Rejeitado:** cada novo tenant precisaria de provisionamento manual de banco, connection strings únicas, Supabase project separado. $25/mês por tenant. Inviável para crescimento.

### B. Schema separado por tenant
- **Rejeitado:** migrations precisariam rodar para cada schema. Queries cross-tenant (analytics, billing) impossíveis sem views ou FDW. Overhead de pooling por schema.

### C. Sem RLS — discriminação apenas no código da aplicação
- **Rejeitado:** uma query sem filtro ou um bug na aplicação vaza dados de todos os tenants. Defesa em profundidade exige que o banco seja a última linha de defesa.

## Consequências

### Positivas
- Operacionalmente simples: 1 banco, 1 conjunto de migrations, 1 connection string
- Supabase Auth integra nativamente: JWT já inclui `tenant_id` via `app_metadata`
- Performance: índices em `tenant_id` em todas as tabelas críticas, queries filtram sempre por tenant
- Defesa em profundidade: mesmo se o código da aplicação tiver bug, RLS bloqueia o vazamento

### Negativas / Riscos
- **Vazamento de tenant_id em queries mal escritas**: mitigado pelo RLS, mas é preciso cuidado com `service_role`
- **Performance com muitos tenants**: queries com FULL TABLE SCAN ignoram RLS. Mitigado pelos índices em `(tenant_id, ...)` em todas as tabelas
- **Backups não isolados por tenant**: dump do banco inclui todos os tenants. Para LGPD, `RIGHT TO ERASURE` exige DELETE + vacuum, não apenas exclusão de tenant

## Referências

- `/infra/supabase/migrations/0001_foundation.sql` — funções auth.tenant_id() e auth.has_role()
- `/packages/db/tests/rls.test.ts` — 20 testes de isolamento cross-tenant
- `/packages/db/src/schema/foundation.ts`
