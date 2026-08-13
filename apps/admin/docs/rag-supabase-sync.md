# Sincronização do RAG com dados das fichas técnicas

> ⚠️ **SUPERSEDIDO EM 2026-08-13 — NÃO rode o SQL desta página.** O plano foi
> executado pela migration 0034 e depois refeito pelo Catálogo Argho 2026: os
> biológicos foram renomeados (`bovex→sporax`, `titan→harzon`,
> `biovas→biotas`), ganharam CHROM e tiveram espécies/cepas/concentrações
> corrigidas. Em particular, a composição do Troian citada abaixo
> (`subtilis + velezensis + amyloliquefaciens`) está **errada** — o correto é
> `B. velezensis DC 81 + DC 88 + B. pumilus DC 61`. Fonte da verdade:
> `infra/supabase/migrations/0050_catalogo_2026_produtos.sql`.

**Status:** histórico — substituído pela migration 0050 (ver aviso acima).

## Contexto

O sistema RAG da Colheita (`/api/agent/ask`) indexa a tabela `products` do
Supabase via `packages/jobs/src/scripts/reindex-all.ts`. Quando o agente PhD
agronômico Argho responde, ele recupera chunks dessa tabela como contexto.

Em 2026-05-22 atualizamos `apps/website/src/lib/products.ts` (dados do site
institucional) com as 16 fichas técnicas oficiais — mas o **Supabase prod**
ainda tem o seed antigo, com:

- 16 produtos (sem Titan, Bovex, Controx, Nemax)
- Composições erradas em 3 biológicos:
  - **Bovex** não existe (precisa criar)
  - **Controx** não existe (precisa criar)
  - **Nemax** não existe (precisa criar)
  - **Troian** existe mas com composição errada (Trichoderma + Bacillus ao
    invés do correto multi-Bacillus subtilis+velezensis+amyloliquefaciens)
- 2 produtos legados que não estão mais no portfolio site:
  - `algen` (linha 275 do seed) — verificar se ainda existe comercialmente
  - `grow-sulfur` (linha 351 do seed) — verificar se ainda existe
- Slug divergente: seed tem `grow-nitro-p`, site tem `grow-nitrop`

## Plano de sincronização

### Opção A — Migration SQL (recomendado, padrão Argho)

Criar `infra/supabase/migrations/0034_fichas_tecnicas_sync.sql`:

```sql
-- Inserir/atualizar produtos novos (idempotente por slug)
INSERT INTO products (tenant_id, slug, name, tagline, description, composition, ...)
VALUES
  ('argho-tenant-uuid', 'bovex', 'Bovex', 'Complexo microbiológico fúngico entomopatogênico', '...', '{...}'::jsonb, ...),
  ('argho-tenant-uuid', 'controx', 'Controx', '...', ...),
  ('argho-tenant-uuid', 'nemax', 'Nemax', '...', ...),
  ('argho-tenant-uuid', 'titan', 'Titan', '...', ...)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  composition = EXCLUDED.composition,
  updated_at = now();

-- Corrigir composição Troian
UPDATE products
SET composition = '{"others": {"Bacillus subtilis": 1, "Bacillus velezensis": 1, "Bacillus amyloliquefaciens": 1}}'::jsonb,
    description = '<descrição correta>'
WHERE slug = 'troian' AND tenant_id = '<argho-tenant-uuid>';

-- Aplicar conforme padrão Argho: psql direto via Supavisor session mode
-- (vide MEMORY.md - Postgres direct pra DDL)
```

### Opção B — Script TypeScript

Criar `packages/jobs/src/scripts/seed-fichas-tecnicas.ts` que faz upsert via
@supabase/supabase-js com service_role. Requer ts-node/tsx local com env vars.

## Após sincronização

1. Rodar `pnpm --filter @colheita/jobs reindex-all`
   - Vai re-embarcar 20 produtos no pgvector
   - Custo: ~$0,10 (4 chunks × 20 produtos × ~$0,001/chunk Voyage)

2. Validar via curl autenticado no admin:
   ```sh
   # Pergunta que requer dados corrigidos:
   POST /api/agent/ask {"query":"Qual a composição correta do Bovex?"}
   # Deve retornar: Beauveria bassiana + Metarhizium anisopliae + Cordyceps fumosorosea
   ```

3. Smoke test pelo /assistente no admin com sugestões PhD agronômico
   (vide admin-chat-panel.tsx SUGGESTED_QUERIES).

## Decisão pendente do fundador

- Manter `algen` e `grow-sulfur` no Supabase (legacy)?
- Aplicar migration agora ou aguardar próxima sprint?
- Custo de re-indexação ~$0,10 — OK?
