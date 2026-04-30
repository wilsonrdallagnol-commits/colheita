# ADR 0013 — Integração Safra ERP: sincronização de inventário e clientes

**Data:** 2026-04-30  
**Status:** Accepted  
**Contexto:** Fase 4 — Integrações

---

## Contexto

O Safra é o ERP/CRM utilizado pela Argho para gestão de pedidos, inventário e cadastro de clientes. A plataforma Colheita precisa consumir eventos do Safra para:

1. **Cadastro de distribuidores** — quando um novo cliente é cadastrado no Safra, convidá-lo automaticamente para o portal
2. **Estoque** — manter visibilidade em tempo real do estoque por depósito, por produto
3. **Produtos** — refletir descontinuações de produto (ativo=false) no PIM

O canal de integração já existe: `POST /api/webhooks/safra` (migration 0001, ADR 0006) valida HMAC-SHA256 e despacha `safraEventoJob` via Trigger.dev.

---

## Problema

### Mapeamento PIM ↔ ERP
O PIM do Colheita e o Safra possuem bases de produtos independentes com IDs distintos. Sem um campo de mapeamento explícito, os eventos `inventario.atualizado` e `produto.atualizado` não conseguem localizar o produto correto no PIM.

### Estoque sem tabela dedicada
Sem uma tabela de estoque, os dados de inventário do Safra precisariam ser embarcados nos próprios registros de produto — o que viola separação de responsabilidades (o PIM é fonte da verdade para metadados editoriais; o Safra é fonte da verdade para disponibilidade comercial).

### Convite de distribuidores
O Safra envia `cliente.cadastrado` quando um distribuidor é cadastrado no ERP. Sem automação, o admin precisaria convidar o distribuidor manualmente pelo painel — processo propício a esquecimento.

---

## Decisão

### 1. Campo `safra_codigo` em `products` (migration 0013)

```sql
alter table public.products add column safra_codigo text;
create index products_safra_codigo_idx on public.products (tenant_id, safra_codigo)
  where safra_codigo is not null;
```

- **Nullable** — mapeamento é opcional. Produtos sem `safra_codigo` simplesmente não recebem sincronização automática de estoque/status.
- **Configurável pelo admin** — campo no formulário de edição do produto na seção "Integração ERP".
- **Índice parcial** — somente para produtos com código Safra, minimizando overhead.
- **Chave natural do Safra** — usamos o `produto_codigo` do Safra como identificador, evitando dependência de IDs internos mutáveis.

### 2. Tabela `product_stock` (migration 0013)

```sql
create table public.product_stock (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  safra_codigo text not null,
  deposito     text not null default 'principal',
  estoque      numeric(12,3) not null default 0 check (estoque >= 0),
  unidade      text not null default 'un',
  synced_at    timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (tenant_id, safra_codigo, deposito)
);
```

**Motivação para tabela separada (vs. coluna em `products`):**
- Um produto pode ter múltiplos depósitos com estoques independentes
- Existem entradas de estoque sem produto mapeado no PIM (produtos no Safra que ainda não têm página no catálogo)
- A frequência de atualização de estoque (diária/semanal) é muito maior que a frequência de edição de metadados de produto — colunas separadas evitam contenção de lock
- RLS independente: distribuidores podem consultar estoque sem precisar ler toda a tabela de produtos

**Chave única por** `(tenant_id, safra_codigo, deposito)` — permite upsert idempotente.

### 3. Handler `handleClienteCadastrado` no job `safra-sync-evento`

```
cliente.cadastrado → inviteUserByEmail(email, { redirectTo: portalUrl/auth/callback })
                   → public.users.status = 'invited'
```

- Usa `buildSupabaseAdmin()` (service role, bypass RLS) — mesmo padrão dos embed jobs
- **Skip silencioso** se email ausente (campo opcional no schema Safra)
- **Graceful handling** de "already registered" — não relança erro (idempotente)
- Outros erros relançados → retry exponencial do Trigger.dev (máx 5 tentativas)

### 4. Handler `handleInventarioAtualizado`

```
inventario.atualizado → upsert product_stock (tenant_id, safra_codigo, deposito)
                      → SET product_id via JOIN em products.safra_codigo (ou null)
```

### 5. Handler `handleProdutoAtualizado`

```
produto.atualizado, ativo=false → archive product WHERE safra_codigo=? AND status='published'
produto.atualizado, ativo=true  → no-op (admin controla publicação)
```

**Rationale:** O Safra é autoritativo sobre disponibilidade comercial (ativo/inativo). O PIM admin é autoritativo sobre conteúdo editorial. Arquivamento automático quando `ativo=false` preserva a intenção do ERP sem sobrescrever decisões editoriais do admin.

---

## Alternativas descartadas

### A. Sync bidirecional (PIM → Safra)
**Rejeitado** — O Safra é o sistema de registro para estoque e preços. Modificações originárias do PIM sobrescrevendo dados do ERP causariam inconsistências graves. A integração é intencionalmente one-way: Safra → Colheita.

### B. Coluna `estoque_atual` em `products`
**Rejeitado** — Não suporta múltiplos depósitos. Cria contenção de escrita entre edições de produto e sync de estoque. Perde histórico de depósitos quando o produto muda.

### C. Sincronização via polling (cron job)
**Rejeitado** — O Safra já tem webhook push. Polling adicionaria latência desnecessária e custo de API. O padrão webhook + `safraEventoJob` já existe e funciona.

### D. Sincronização síncrona no webhook handler
**Rejeitado** — Violaria o SLA de resposta do Safra (< 3s). Jobs Trigger.dev com retry são mais resilientes a falhas transitórias de DB.

---

## Consequências

**Positivas:**
- Distribuidores veem disponibilidade de estoque em tempo real no portal
- Novos clientes cadastrados no Safra recebem convite automático — elimina processo manual
- Admin pode ver estoque por depósito na página de detalhe do produto
- Produtos descontinuados no ERP são automaticamente removidos do catálogo publicado
- `safra_codigo` nulo = sem sincronização = sem efeito colateral para produtos sem mapeamento

**Negativas / Trade-offs:**
- Admin precisa configurar `safra_codigo` manualmente para cada produto — não há auto-match por nome
- `produto.atualizado` não sincroniza campos como preço ou nome (Safra → PIM) — decisão intencional mas pode ser solicitada no futuro
- Estoque de produtos sem `safra_codigo` permanece invisível — aceito como limitação da fase atual

---

## Referências

- Migration 0013: `infra/supabase/migrations/0013_safra_product_stock.sql`
- Job handler: `packages/jobs/src/jobs/safra-sync.ts`
- Shared admin client: `packages/jobs/src/lib/supabase-admin.ts`
- Admin PIM form: `apps/admin/src/components/produtos/produto-form.tsx`
- Admin detalhe produto: `apps/admin/src/app/(dashboard)/produtos/[slug]/page.tsx`
- ADR relacionados: [0006 Trigger.dev](./0006-trigger-dev-background-jobs.md), [0012 Auth User Sync](./0012-auth-user-sync.md)
