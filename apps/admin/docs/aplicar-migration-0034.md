# Como aplicar migrations 0034 + 0035 + 0036 + 0037 + reindex RAG em prod

> **Atualizado 2026-05-23:** agora são 4 migrations encadeadas. Aplicar
> as 4 e fazer 1 único reindex no final.

**Status:** pendente — quando você quiser ativar a IA agronômica com os
dados das fichas técnicas (Bovex, Controx, Nemax, Titan + Troian corrigido).

## Por quê

A migration `0034_fichas_tecnicas_sync.sql` atualiza o Supabase prod com:
- **4 produtos novos**: Bovex, Controx, Nemax, Titan
- **1 correção**: Troian (composição era Trichoderma+Bacillus, agora multi-Bacillus)
- Todos como **Complexo microbiológico** (modelo neutro compliance MAPA)

Sem aplicar, a IA agronômica do `/assistente` (commit `a2e5820`) responde
com dados antigos do seed e a categoria "biologicos" no Supabase fica
incompleta vs o site institucional.

## Passos (Windows / WSL / Linux)

### 1. Verificar variável de ambiente

```sh
# Em apps/admin/.env.local (ou .env do monorepo raiz)
DATABASE_URL_DIRECT=postgresql://postgres.<projeto>:<senha>@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

> Use **porta 5432** (Supavisor session mode) — porta 6543 (transaction
> mode) não aceita DO blocks. Padrão Argho documentado em MEMORY.md.

### 2. Aplicar migrations (encadeadas)

```sh
cd /c/Users/Usuario/Desktop/colheita

# 0034 — UPSERT 4 produtos novos + correção composição Troian
psql "$DATABASE_URL_DIRECT" -f infra/supabase/migrations/0034_fichas_tecnicas_sync.sql

# 0035 — Soft delete algen + grow-sulfur (legacy, Wilson confirmou descontinuar)
psql "$DATABASE_URL_DIRECT" -f infra/supabase/migrations/0035_remove_legacy_products.sql

# 0036 — Tabela support_tickets (suporte humano no portal distribuidor)
psql "$DATABASE_URL_DIRECT" -f infra/supabase/migrations/0036_support_tickets.sql

# 0037 — Thread de mensagens nos tickets (admin responde + distribuidor responde)
psql "$DATABASE_URL_DIRECT" -f infra/supabase/migrations/0037_support_ticket_messages.sql
```

**Output esperado:**
```
NOTICE:  Migration 0034: 4 produtos novos inseridos/atualizados (bovex, controx, nemax, titan) + composição troian corrigida.
DO
NOTICE:  Migration 0035: soft-deleted algen + grow-sulfur e removeu chunks do pgvector.
DO
CREATE TYPE
CREATE TYPE
CREATE TYPE
CREATE TABLE
CREATE INDEX (×3)
CREATE FUNCTION
CREATE TRIGGER
ALTER TABLE
CREATE POLICY (×3)
GRANT
GRANT
COMMENT
```

> A 0036 cria a tabela `support_tickets` (3 enums + tabela + 3 índices +
> trigger updated_at + 3 RLS policies). Sem dado de seed — produção
> começa vazia. Distribuidores criam tickets via `/conta/suporte` no portal.

**Se erro `Tenant argho nao existe`** ou `Categoria biologicos nao existe pro tenant argho`:
- Significa que o seed inicial nunca rodou em prod. Rodar `pnpm db:seed` antes.

### 3. Re-indexar embeddings (RAG)

```sh
# Garantir VOYAGE_API_KEY ou OPENAI_API_KEY setado
pnpm --filter @colheita/jobs reindex-all
```

**Output esperado:**
```
📡  Usando VoyageEmbeddingProvider (voyage-3-lite)
🔍  Buscando produtos...
   Indexando 20 produtos (era 16)...
   ✓ 80 chunks de produto inseridos no pgvector
✓ Reindex completo
```

**Custo:** ~$0,02 (Voyage voyage-3-lite, ~80 chunks × $0,0001).

### 4. Validar via /configuracoes admin

Acessa `colheita-admin-evofitia.vercel.app/configuracoes` e clica em
"Reindexar conteúdo (RAG)" no card Knowledge Base. Deve mostrar:

```
✓ 80 chunks indexados no pgvector
20 produtos (80 chunks) · 0 lições (0 chunks) · provider VoyageEmbeddingProvider
[Testar no Assistente IA →]
```

Se aparecer `MockEmbeddingProvider`, falta setar VOYAGE_API_KEY ou
OPENAI_API_KEY na Vercel.

### 5. Smoke test no /assistente

Acessa `/assistente` e pergunta:
- "Qual a composição correta do Bovex?"
  → Deve responder: Beauveria bassiana + Metarhizium **anisopliae** +
    Cordyceps **fumosorosea** (não "spp.")
- "Qual a diferença técnica entre Stron e Grow MoB+?"
  → Deve usar o conhecimento embarcado do system prompt (`a2e5820`) +
    chunks RAG dos produtos.
- "Quando indicar Troian?"
  → Deve mencionar a composição multi-Bacillus (subtilis + velezensis +
    amyloliquefaciens), NÃO Trichoderma+Bacillus.

## Rollback

A migration é **idempotente** mas **não tem rollback automático** (insere
+ atualiza). Se precisar reverter:

```sql
-- Remove os 4 produtos novos
DELETE FROM products
WHERE slug IN ('bovex', 'controx', 'nemax', 'titan')
  AND tenant_id = (SELECT id FROM tenants WHERE slug = 'argho');

-- Reverter Troian pra composição anterior (manual, precisa do dado original)
UPDATE products SET composition = '<JSON original>' WHERE slug = 'troian';
```

Mas o mais simples se quiser desfazer é rodar a migration ANTERIOR do
seed.ts que mexe nesses produtos.

## Observações

- Não toca em `algen` e `grow-sulfur` (produtos legacy do seed que não
  estão no site institucional). Wilson decide se mantém ou remove depois.
- `safra_codigo` setado como `ARG-{NAME}` (pra integração Safra ERP).
- `packaging` e `applications` setados como mínimos (1 SKU 1L pra os
  biológicos, applications vazio — coerente com modelo neutro MAPA).
