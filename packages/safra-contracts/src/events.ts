/**
 * @colheita/safra-contracts — Schemas de eventos do webhook Safra
 *
 * Safra é o sistema ERP/CRM da Argho para gestão de pedidos e inventário.
 * Webhooks são enviados via POST para /api/webhooks/safra com assinatura
 * HMAC-SHA256 no header X-Safra-Signature: sha256=<hex>.
 *
 * Todos os eventos têm:
 *   - event: identificador do tipo (ex: "pedido.criado")
 *   - version: versão do schema do evento
 *   - timestamp: ISO 8601
 *   - tenant_id: UUID do tenant Colheita receptor
 *   - data: payload específico do evento
 */

import { z } from 'zod';

// ── Base ──────────────────────────────────────────────────────────────────────

const BaseEventSchema = z.object({
  event: z.string(),
  version: z.string().default('1'),
  timestamp: z.string().datetime(),
  tenant_id: z.string().uuid(),
});

// ── Pedido ────────────────────────────────────────────────────────────────────

export const SafraPedidoItemSchema = z.object({
  produto_codigo: z.string(),
  produto_nome: z.string(),
  quantidade: z.number().positive(),
  unidade: z.string(), // ex: "kg", "L", "sc"
  preco_unitario: z.number().nonnegative(),
  desconto_pct: z.number().min(0).max(100).default(0),
  total: z.number().nonnegative(),
});

export const SafraPedidoCriadoSchema = BaseEventSchema.extend({
  event: z.literal('pedido.criado'),
  data: z.object({
    pedido_id: z.string(),
    numero: z.string(), // número legível ex: "PED-2026-00123"
    distribuidor_id: z.string().uuid().optional(), // user_id do portal
    distribuidor_nome: z.string(),
    distribuidor_cpf_cnpj: z.string().optional(),
    status: z.enum(['rascunho', 'confirmado', 'faturado', 'entregue', 'cancelado']),
    emitido_em: z.string().datetime(),
    prazo_entrega: z.string().datetime().optional(),
    itens: z.array(SafraPedidoItemSchema).min(1),
    total_bruto: z.number().nonnegative(),
    total_desconto: z.number().nonnegative(),
    total_liquido: z.number().nonnegative(),
    observacoes: z.string().optional(),
  }),
});

export const SafraPedidoAtualizadoSchema = BaseEventSchema.extend({
  event: z.literal('pedido.atualizado'),
  data: z.object({
    pedido_id: z.string(),
    numero: z.string(),
    status_anterior: z.string(),
    status_novo: z.string(),
    atualizado_em: z.string().datetime(),
    motivo: z.string().optional(),
  }),
});

// ── Inventário ────────────────────────────────────────────────────────────────

export const SafraInventarioAtualizadoSchema = BaseEventSchema.extend({
  event: z.literal('inventario.atualizado'),
  data: z.object({
    produto_codigo: z.string(),
    produto_nome: z.string(),
    deposito: z.string().optional(),
    estoque_anterior: z.number().nonnegative(),
    estoque_atual: z.number().nonnegative(),
    unidade: z.string(),
    atualizado_em: z.string().datetime(),
  }),
});

// ── Produto ───────────────────────────────────────────────────────────────────

export const SafraProdutoAtualizadoSchema = BaseEventSchema.extend({
  event: z.literal('produto.atualizado'),
  data: z.object({
    produto_codigo: z.string(),
    produto_nome: z.string(),
    registro_mapa: z.string().optional(),
    fabricante: z.string().optional(),
    preco_tabela: z.number().nonnegative().optional(),
    unidade_venda: z.string().optional(),
    ativo: z.boolean(),
    atualizado_em: z.string().datetime(),
  }),
});

// ── Cliente ───────────────────────────────────────────────────────────────────

export const SafraClienteCadastradoSchema = BaseEventSchema.extend({
  event: z.literal('cliente.cadastrado'),
  data: z.object({
    cliente_id: z.string(),
    nome: z.string(),
    cpf_cnpj: z.string().optional(),
    email: z.string().email().optional(),
    telefone: z.string().optional(),
    municipio: z.string().optional(),
    estado: z.string().max(2).optional(),
    distribuidor_vinculado_id: z.string().optional(), // safra ID do distribuidor responsável
    cadastrado_em: z.string().datetime(),
  }),
});

// ── Union — SafraEvent ────────────────────────────────────────────────────────

export const SafraEventSchema = z.discriminatedUnion('event', [
  SafraPedidoCriadoSchema,
  SafraPedidoAtualizadoSchema,
  SafraInventarioAtualizadoSchema,
  SafraProdutoAtualizadoSchema,
  SafraClienteCadastradoSchema,
]);

export type SafraEvent = z.infer<typeof SafraEventSchema>;
export type SafraPedidoCriado = z.infer<typeof SafraPedidoCriadoSchema>;
export type SafraPedidoAtualizado = z.infer<typeof SafraPedidoAtualizadoSchema>;
export type SafraInventarioAtualizado = z.infer<typeof SafraInventarioAtualizadoSchema>;
export type SafraProdutoAtualizado = z.infer<typeof SafraProdutoAtualizadoSchema>;
export type SafraClienteCadastrado = z.infer<typeof SafraClienteCadastradoSchema>;
export type SafraPedidoItem = z.infer<typeof SafraPedidoItemSchema>;
