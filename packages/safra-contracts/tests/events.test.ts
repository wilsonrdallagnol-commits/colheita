// packages/safra-contracts/tests/events.test.ts
/**
 * Valida os schemas Zod dos eventos Safra.
 * Testa: parse de payloads válidos, rejeição de inválidos e discriminação por `event`.
 */
import { describe, expect, it } from 'vitest';
import {
  SafraClienteCadastradoSchema,
  SafraEventSchema,
  SafraInventarioAtualizadoSchema,
  SafraPedidoAtualizadoSchema,
  SafraPedidoCriadoSchema,
  SafraProdutoAtualizadoSchema,
} from '../src/events.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TENANT_ID = '00000000-0000-0000-0000-000000000001';
const NOW = '2026-04-29T12:00:00.000Z';

const BASE = {
  version: '1',
  timestamp: NOW,
  tenant_id: TENANT_ID,
};

const PEDIDO_CRIADO_PAYLOAD = {
  ...BASE,
  event: 'pedido.criado',
  data: {
    pedido_id: 'PED-001',
    numero: 'PED-2026-00001',
    distribuidor_nome: 'Agro Distribuidora LTDA',
    status: 'confirmado',
    emitido_em: NOW,
    itens: [
      {
        produto_codigo: 'XCN-001',
        produto_nome: 'Xcensis 10-00-06',
        quantidade: 10,
        unidade: 'L',
        preco_unitario: 120.0,
        total: 1200.0,
      },
    ],
    total_bruto: 1200.0,
    total_desconto: 0,
    total_liquido: 1200.0,
  },
};

const PEDIDO_ATUALIZADO_PAYLOAD = {
  ...BASE,
  event: 'pedido.atualizado',
  data: {
    pedido_id: 'PED-001',
    numero: 'PED-2026-00001',
    status_anterior: 'confirmado',
    status_novo: 'faturado',
    atualizado_em: NOW,
  },
};

const INVENTARIO_ATUALIZADO_PAYLOAD = {
  ...BASE,
  event: 'inventario.atualizado',
  data: {
    produto_codigo: 'XCN-001',
    produto_nome: 'Xcensis 10-00-06',
    estoque_anterior: 100,
    estoque_atual: 90,
    unidade: 'L',
    atualizado_em: NOW,
  },
};

const PRODUTO_ATUALIZADO_PAYLOAD = {
  ...BASE,
  event: 'produto.atualizado',
  data: {
    produto_codigo: 'XCN-001',
    produto_nome: 'Xcensis 10-00-06',
    ativo: true,
    atualizado_em: NOW,
  },
};

const CLIENTE_CADASTRADO_PAYLOAD = {
  ...BASE,
  event: 'cliente.cadastrado',
  data: {
    cliente_id: 'CLI-001',
    nome: 'Fazenda São João',
    cadastrado_em: NOW,
  },
};

// ── pedido.criado ─────────────────────────────────────────────────────────────

describe('SafraPedidoCriadoSchema', () => {
  it('parseia payload válido', () => {
    const result = SafraPedidoCriadoSchema.safeParse(PEDIDO_CRIADO_PAYLOAD);
    expect(result.success).toBe(true);
  });

  it('aplica desconto_pct default 0 em item sem desconto', () => {
    const result = SafraPedidoCriadoSchema.safeParse(PEDIDO_CRIADO_PAYLOAD);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data.itens[0]?.desconto_pct).toBe(0);
    }
  });

  it('aplica version default "1" quando omitida', () => {
    const { version: _, ...withoutVersion } = PEDIDO_CRIADO_PAYLOAD;
    const result = SafraPedidoCriadoSchema.safeParse(withoutVersion);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.version).toBe('1');
  });

  it('rejeita quando itens está vazio', () => {
    const invalid = {
      ...PEDIDO_CRIADO_PAYLOAD,
      data: { ...PEDIDO_CRIADO_PAYLOAD.data, itens: [] },
    };
    const result = SafraPedidoCriadoSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejeita quantidade negativa em item', () => {
    const invalid = {
      ...PEDIDO_CRIADO_PAYLOAD,
      data: {
        ...PEDIDO_CRIADO_PAYLOAD.data,
        itens: [{ ...PEDIDO_CRIADO_PAYLOAD.data.itens[0], quantidade: -1 }],
      },
    };
    const result = SafraPedidoCriadoSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejeita status inválido', () => {
    const invalid = {
      ...PEDIDO_CRIADO_PAYLOAD,
      data: { ...PEDIDO_CRIADO_PAYLOAD.data, status: 'pendente' },
    };
    const result = SafraPedidoCriadoSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejeita tenant_id inválido (não-UUID)', () => {
    const invalid = { ...PEDIDO_CRIADO_PAYLOAD, tenant_id: 'nao-e-uuid' };
    const result = SafraPedidoCriadoSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejeita timestamp malformado', () => {
    const invalid = { ...PEDIDO_CRIADO_PAYLOAD, timestamp: '29/04/2026' };
    const result = SafraPedidoCriadoSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('aceita campos opcionais ausentes (distribuidor_id, cpf_cnpj, etc)', () => {
    const result = SafraPedidoCriadoSchema.safeParse(PEDIDO_CRIADO_PAYLOAD);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data.distribuidor_id).toBeUndefined();
      expect(result.data.data.observacoes).toBeUndefined();
    }
  });
});

// ── pedido.atualizado ─────────────────────────────────────────────────────────

describe('SafraPedidoAtualizadoSchema', () => {
  it('parseia payload válido', () => {
    const result = SafraPedidoAtualizadoSchema.safeParse(PEDIDO_ATUALIZADO_PAYLOAD);
    expect(result.success).toBe(true);
  });

  it('rejeita sem pedido_id', () => {
    const { pedido_id: _, ...withoutId } = PEDIDO_ATUALIZADO_PAYLOAD.data;
    const invalid = { ...PEDIDO_ATUALIZADO_PAYLOAD, data: withoutId };
    const result = SafraPedidoAtualizadoSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// ── inventario.atualizado ─────────────────────────────────────────────────────

describe('SafraInventarioAtualizadoSchema', () => {
  it('parseia payload válido', () => {
    const result = SafraInventarioAtualizadoSchema.safeParse(INVENTARIO_ATUALIZADO_PAYLOAD);
    expect(result.success).toBe(true);
  });

  it('rejeita estoque_atual negativo', () => {
    const invalid = {
      ...INVENTARIO_ATUALIZADO_PAYLOAD,
      data: { ...INVENTARIO_ATUALIZADO_PAYLOAD.data, estoque_atual: -5 },
    };
    const result = SafraInventarioAtualizadoSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// ── produto.atualizado ────────────────────────────────────────────────────────

describe('SafraProdutoAtualizadoSchema', () => {
  it('parseia payload válido com campos opcionais ausentes', () => {
    const result = SafraProdutoAtualizadoSchema.safeParse(PRODUTO_ATUALIZADO_PAYLOAD);
    expect(result.success).toBe(true);
  });

  it('parseia payload com todos os campos opcionais', () => {
    const full = {
      ...PRODUTO_ATUALIZADO_PAYLOAD,
      data: {
        ...PRODUTO_ATUALIZADO_PAYLOAD.data,
        registro_mapa: 'BR-12345',
        fabricante: 'Empresa X',
        preco_tabela: 250.0,
        unidade_venda: 'L',
      },
    };
    const result = SafraProdutoAtualizadoSchema.safeParse(full);
    expect(result.success).toBe(true);
  });

  it('rejeita quando ativo está ausente', () => {
    const { ativo: _, ...withoutAtivo } = PRODUTO_ATUALIZADO_PAYLOAD.data;
    const invalid = { ...PRODUTO_ATUALIZADO_PAYLOAD, data: withoutAtivo };
    const result = SafraProdutoAtualizadoSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// ── cliente.cadastrado ────────────────────────────────────────────────────────

describe('SafraClienteCadastradoSchema', () => {
  it('parseia payload mínimo válido', () => {
    const result = SafraClienteCadastradoSchema.safeParse(CLIENTE_CADASTRADO_PAYLOAD);
    expect(result.success).toBe(true);
  });

  it('rejeita email inválido quando fornecido', () => {
    const invalid = {
      ...CLIENTE_CADASTRADO_PAYLOAD,
      data: { ...CLIENTE_CADASTRADO_PAYLOAD.data, email: 'nao-e-email' },
    };
    const result = SafraClienteCadastradoSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejeita estado com mais de 2 caracteres', () => {
    const invalid = {
      ...CLIENTE_CADASTRADO_PAYLOAD,
      data: { ...CLIENTE_CADASTRADO_PAYLOAD.data, estado: 'SPA' },
    };
    const result = SafraClienteCadastradoSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('aceita email e estado válidos', () => {
    const full = {
      ...CLIENTE_CADASTRADO_PAYLOAD,
      data: {
        ...CLIENTE_CADASTRADO_PAYLOAD.data,
        email: 'fazenda@example.com',
        estado: 'SP',
      },
    };
    const result = SafraClienteCadastradoSchema.safeParse(full);
    expect(result.success).toBe(true);
  });
});

// ── SafraEventSchema (discriminatedUnion) ─────────────────────────────────────

describe('SafraEventSchema — discriminated union', () => {
  it('roteia pedido.criado corretamente', () => {
    const result = SafraEventSchema.safeParse(PEDIDO_CRIADO_PAYLOAD);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.event).toBe('pedido.criado');
  });

  it('roteia pedido.atualizado corretamente', () => {
    const result = SafraEventSchema.safeParse(PEDIDO_ATUALIZADO_PAYLOAD);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.event).toBe('pedido.atualizado');
  });

  it('roteia inventario.atualizado corretamente', () => {
    const result = SafraEventSchema.safeParse(INVENTARIO_ATUALIZADO_PAYLOAD);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.event).toBe('inventario.atualizado');
  });

  it('roteia produto.atualizado corretamente', () => {
    const result = SafraEventSchema.safeParse(PRODUTO_ATUALIZADO_PAYLOAD);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.event).toBe('produto.atualizado');
  });

  it('roteia cliente.cadastrado corretamente', () => {
    const result = SafraEventSchema.safeParse(CLIENTE_CADASTRADO_PAYLOAD);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.event).toBe('cliente.cadastrado');
  });

  it('rejeita evento desconhecido', () => {
    const unknown = { ...BASE, event: 'evento.inexistente', data: {} };
    const result = SafraEventSchema.safeParse(unknown);
    expect(result.success).toBe(false);
  });

  it('rejeita payload completamente inválido (string)', () => {
    const result = SafraEventSchema.safeParse('nao-e-um-objeto');
    expect(result.success).toBe(false);
  });

  it('rejeita payload null', () => {
    const result = SafraEventSchema.safeParse(null);
    expect(result.success).toBe(false);
  });
});
