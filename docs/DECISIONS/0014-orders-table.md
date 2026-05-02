# ADR 0014 — Orders Table (Pedidos Safra ERP)

**Data:** 2026-04-30  
**Status:** Aceito  
**Contexto:** Integração com Safra ERP — persistência e rastreamento de pedidos recebidos via webhook

---

## Contexto

O Safra ERP envia dois tipos de eventos relacionados a pedidos:
- `pedido.criado` — novo pedido emitido para um distribuidor
- `pedido.atualizado` — mudança de status (rascunho → confirmado → faturado → entregue | cancelado)

Precisamos persistir esses pedidos para:
1. Exibir histórico de pedidos para distribuidores no portal
2. Permitir que admins acompanhem pedidos no painel
3. Manter rastreabilidade de status mesmo se o Safra ERP ficar indisponível

---

## Decisão

### Duas tabelas: `orders` + `order_items`

`orders` armazena o cabeçalho do pedido com snapshot do distribuidor:
- `safra_pedido_id` — ID do pedido no ERP (unique por tenant)
- `status` — enum: rascunho | confirmado | faturado | entregue | cancelado
- `status_anterior` — estado anterior (para auditoria de transições)
- `distribuidor_nome`, `distribuidor_cpf_cnpj` — snapshot (não FK quebrável)
- `distribuidor_id` — FK opcional para `public.users` (pode ser null se usuário não cadastrado ainda)
- Totais: `total_bruto`, `total_desconto`, `total_liquido`
- `synced_at` — timestamp do evento ERP (não `updated_at` do banco)

`order_items` usa **snapshot pattern**: delete-then-insert a cada `pedido.criado` recebido.  
Motivo: o ERP pode reenviar o evento com itens corrigidos; o snapshot garante consistência sem lógica de diff.

### Upsert idempotente

`pedido.criado` usa `.upsert()` com `onConflict: 'tenant_id,safra_pedido_id'`.  
Garantia: eventos duplicados (retry do ERP, reprocessamento de webhook) não criam pedidos duplicados.

### Linkagem lazy ao distribuidor

No momento do `pedido.criado`, tentamos resolver `distribuidor_id` via lookup por UUID no evento.  
Se o usuário ainda não foi convidado (cliente.cadastrado chegou depois), `distribuidor_id` fica null.  
Não há reconciliação retroativa — aceitável para MVP.

### Guard de status desconhecido

`pedido.atualizado` valida o `status_novo` contra o enum antes de fazer UPDATE.  
Se o Safra ERP enviar um status não mapeado, o evento é silenciosamente ignorado (sem throw).  
Motivo: evitar falha de webhook que causaria retry loop por violação de check constraint no Postgres.

---

## Alternativas consideradas

### A: Apenas `orders`, sem `order_items` (flat JSON)
Rejeitado. JSON de itens impede queries SQL sobre produto/quantidade/total por item e dificulta relatórios futuros de BI.

### B: FK obrigatória `distribuidor_id NOT NULL`
Rejeitado. Ordem de chegada de eventos não é garantida — `pedido.criado` pode chegar antes de `cliente.cadastrado`.

### C: Merge incremental de items (UPDATE por item)
Rejeitado. Complexidade desnecessária para MVP. O Safra reenvia o conjunto completo de itens no evento; delete-then-insert é mais simples e correto.

---

## Consequências

- Distribuidores veem apenas seus próprios pedidos via RLS (`distribuidor_id = auth.uid()`)
- Pedidos sem distribuidor linkado (`distribuidor_id IS NULL`) são visíveis apenas para admins
- A seção "Meus Pedidos" no `/conta` do portal mostra os últimos 5 pedidos em tempo real
- O admin `/pedidos` tem filtros por status, busca por número/distribuidor, paginação 50/pág
