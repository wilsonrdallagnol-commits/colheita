/**
 * M5 — RLS Isolation Test Suite
 *
 * Valida que Row Level Security isola dados entre tenants corretamente.
 * Requer DATABASE_URL apontando para Postgres 16.
 *
 * Todos os testes rodam contra um banco real — sem mocks.
 * JWT é simulado via set_config('request.jwt.claims', ...) por transação.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  closeDb,
  createTenantWithProducts,
  queryAsTenant,
  setupDb,
  type TenantFixture,
} from './helpers/setup.js';

const DB_URL = process.env.DATABASE_URL;
const describeRls = DB_URL ? describe : describe.skip;

let tenantA: TenantFixture;
let tenantB: TenantFixture;

describeRls('RLS isolation tests', () => {
  beforeAll(async () => {
    await setupDb();
    tenantA = await createTenantWithProducts('argho', 'Argho Agrosciences');
    tenantB = await createTenantWithProducts('rival', 'Rival Corp');
  }, 60_000);

  afterAll(async () => {
    await closeDb();
  });

  // ==========================================================================
  // auth.tenant_id() helper
  // ==========================================================================

  describe('auth.tenant_id()', () => {
    it('retorna NULL quando nenhuma claim JWT está configurada', async () => {
      const tenantId = await queryAsTenant(null, async (sql) => {
        const [row] = await sql`SELECT auth.tenant_id() AS tenant_id`;
        return row?.tenant_id ?? null;
      });
      expect(tenantId).toBeNull();
    });

    it('retorna NULL quando tenant_id no JWT não é UUID válido', async () => {
      const tenantId = await queryAsTenant({ tenantId: 'not-a-valid-uuid' }, async (sql) => {
        const [row] = await sql`SELECT auth.tenant_id() AS tenant_id`;
        return row?.tenant_id ?? null;
      });
      expect(tenantId).toBeNull();
    });

    it('retorna NULL quando tenant_id no JWT é string vazia', async () => {
      const tenantId = await queryAsTenant({ tenantId: '' }, async (sql) => {
        const [row] = await sql`SELECT auth.tenant_id() AS tenant_id`;
        return row?.tenant_id ?? null;
      });
      expect(tenantId).toBeNull();
    });

    it('retorna o UUID correto quando JWT tem tenant_id válido', async () => {
      const tenantId = await queryAsTenant({ tenantId: tenantA.id }, async (sql) => {
        const [row] = await sql`SELECT auth.tenant_id() AS tenant_id`;
        return row?.tenant_id ?? null;
      });
      expect(tenantId).toBe(tenantA.id);
    });
  });

  // ==========================================================================
  // auth.has_role() helper
  // ==========================================================================

  describe('auth.has_role()', () => {
    it('retorna false quando não há roles no JWT', async () => {
      const hasRole = await queryAsTenant({ tenantId: tenantA.id }, async (sql) => {
        const [row] = await sql`SELECT auth.has_role('admin') AS has_role`;
        return row?.has_role ?? null;
      });
      expect(hasRole).toBe(false);
    });

    it('retorna true quando role está presente no JWT', async () => {
      const hasRole = await queryAsTenant(
        { tenantId: tenantA.id, roles: ['admin'] },
        async (sql) => {
          const [row] = await sql`SELECT auth.has_role('admin') AS has_role`;
          return row?.has_role ?? null;
        },
      );
      expect(hasRole).toBe(true);
    });

    it('retorna false quando roles existe mas não contém a role pedida', async () => {
      const hasRole = await queryAsTenant(
        { tenantId: tenantA.id, roles: ['viewer'] },
        async (sql) => {
          const [row] = await sql`SELECT auth.has_role('admin') AS has_role`;
          return row?.has_role ?? null;
        },
      );
      expect(hasRole).toBe(false);
    });

    it('retorna false para role null ou vazia', async () => {
      const hasRole = await queryAsTenant(
        { tenantId: tenantA.id, roles: ['admin'] },
        async (sql) => {
          const [row] = await sql`SELECT auth.has_role('') AS has_role`;
          return row?.has_role ?? null;
        },
      );
      expect(hasRole).toBe(false);
    });
  });

  // ==========================================================================
  // RLS — tenants table
  // ==========================================================================

  describe('RLS — tenants', () => {
    it('sem JWT: SELECT em tenants retorna vazio', async () => {
      const rows = await queryAsTenant(null, async (sql) => {
        return sql`SELECT id FROM public.tenants`;
      });
      expect(rows).toHaveLength(0);
    });

    it('Tenant A vê apenas o próprio row em tenants', async () => {
      const rows = await queryAsTenant({ tenantId: tenantA.id }, async (sql) => {
        return sql`SELECT id FROM public.tenants`;
      });
      expect(rows).toHaveLength(1);
      expect(rows[0]?.id).toBe(tenantA.id);
    });

    it('Tenant A não consegue ler o row do Tenant B', async () => {
      const rows = await queryAsTenant({ tenantId: tenantA.id }, async (sql) => {
        return sql`SELECT id FROM public.tenants WHERE id = ${tenantB.id}`;
      });
      expect(rows).toHaveLength(0);
    });
  });

  // ==========================================================================
  // RLS — products table (principal barreira de isolamento)
  // ==========================================================================

  describe('RLS — products', () => {
    it('sem JWT: SELECT em products retorna vazio', async () => {
      const rows = await queryAsTenant(null, async (sql) => {
        return sql`SELECT id FROM public.products`;
      });
      expect(rows).toHaveLength(0);
    });

    it('Tenant A vê apenas os próprios produtos', async () => {
      const rows = await queryAsTenant({ tenantId: tenantA.id }, async (sql) => {
        return sql`SELECT id, tenant_id FROM public.products`;
      });
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.tenant_id).toBe(tenantA.id);
      }
    });

    it('Tenant A não vê produtos do Tenant B via SELECT direto', async () => {
      const rows = await queryAsTenant({ tenantId: tenantA.id }, async (sql) => {
        return sql`SELECT id FROM public.products WHERE tenant_id = ${tenantB.id}`;
      });
      expect(rows).toHaveLength(0);
    });

    it('Tenant B vê apenas os próprios produtos', async () => {
      const rows = await queryAsTenant({ tenantId: tenantB.id }, async (sql) => {
        return sql`SELECT id, tenant_id FROM public.products`;
      });
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.tenant_id).toBe(tenantB.id);
      }
    });

    it('Tenant B não vê produtos do Tenant A', async () => {
      const rows = await queryAsTenant({ tenantId: tenantB.id }, async (sql) => {
        return sql`SELECT id FROM public.products WHERE tenant_id = ${tenantA.id}`;
      });
      expect(rows).toHaveLength(0);
    });

    it('UUID falso no JWT não revela produtos de nenhum tenant', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const rows = await queryAsTenant({ tenantId: fakeId }, async (sql) => {
        return sql`SELECT id FROM public.products`;
      });
      expect(rows).toHaveLength(0);
    });
  });

  // ==========================================================================
  // RLS — roles table
  // ==========================================================================

  describe('RLS — roles', () => {
    it('Tenant A não vê roles do Tenant B', async () => {
      const rows = await queryAsTenant({ tenantId: tenantA.id }, async (sql) => {
        return sql`SELECT id FROM public.roles WHERE tenant_id = ${tenantB.id}`;
      });
      expect(rows).toHaveLength(0);
    });

    it('sem JWT: SELECT em roles retorna vazio', async () => {
      const rows = await queryAsTenant(null, async (sql) => {
        return sql`SELECT id FROM public.roles`;
      });
      expect(rows).toHaveLength(0);
    });
  });

  // ==========================================================================
  // RLS — product_categories table
  // ==========================================================================

  describe('RLS — product_categories', () => {
    it('Tenant A não vê categorias do Tenant B', async () => {
      const rows = await queryAsTenant({ tenantId: tenantA.id }, async (sql) => {
        return sql`SELECT id FROM public.product_categories WHERE tenant_id = ${tenantB.id}`;
      });
      expect(rows).toHaveLength(0);
    });
  });

  // ==========================================================================
  // SPRINT-6-BLOCKERS — C1: privilege escalation via users tenant_id
  // ==========================================================================
  //
  // Cenario: user de Tenant A tenta fazer UPDATE na propria row mudando
  // tenant_id pro tenant B. Sem o trigger users_no_tenant_change, atacante
  // conseguiria migrar entre tenants apos relogar (auth hook le tenant_id
  // de public.users e injeta no JWT).
  //
  // Trigger esperado: prevent_user_tenant_change que RAISE exception se
  // old.tenant_id != new.tenant_id.

  describe('SPRINT-6-BLOCKERS — C1: tenant_id imutavel em users', () => {
    it('UPDATE users SET tenant_id = <outro tenant> deve falhar', async () => {
      // Simula um user existente ligado ao tenant A. Usamos fixture.
      // Como os fixtures nao criam users em public.users por design (cuidam
      // de tenants + products), vamos inserir um user de teste via service
      // role primeiro.
      const fakeUserId = '11111111-1111-1111-1111-111111111111';
      // Usa o postgres direto (bypass RLS) pra criar o user de teste
      const setupSql = (await import('postgres')).default(
        process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/colheita_test',
        { max: 1, onnotice: () => {} },
      );
      try {
        await setupSql`
          INSERT INTO auth.users (id, email)
          VALUES (${fakeUserId}::uuid, 'attacker@test.com')
          ON CONFLICT (id) DO NOTHING
        `;
        await setupSql`
          INSERT INTO public.users (id, tenant_id, email)
          VALUES (${fakeUserId}::uuid, ${tenantA.id}::uuid, 'attacker@test.com')
          ON CONFLICT (id) DO NOTHING
        `;

        // Agora tenta fazer o ataque: user logado como ele mesmo, tentando
        // mover-se pro tenant B.
        let raised: Error | null = null;
        try {
          await queryAsTenant({ tenantId: tenantA.id, sub: fakeUserId }, async (txSql) => {
            await txSql`UPDATE public.users SET tenant_id = ${tenantB.id}::uuid WHERE id = ${fakeUserId}::uuid`;
          });
        } catch (err) {
          raised = err as Error;
        }

        expect(raised).not.toBeNull();
        expect(raised?.message ?? '').toMatch(/tenant_id is immutable on users/);
      } finally {
        await setupSql.end();
      }
    });
  });

  // ==========================================================================
  // SPRINT-6-BLOCKERS — A3: tenant slug e primary_domain imutaveis
  // ==========================================================================
  //
  // Cenario: tenant_owner via UI tenta editar slug do proprio tenant. Sem o
  // trigger, mudanca quebra URLs externas e pode causar colisao com outros
  // tenants. Slug + primary_domain sao identidade — gestao via service role.

  describe('SPRINT-6-BLOCKERS — A3: tenant identity imutavel', () => {
    it('UPDATE tenants SET slug = ... deve falhar', async () => {
      const setupSql = (await import('postgres')).default(
        process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/colheita_test',
        { max: 1, onnotice: () => {} },
      );
      try {
        let raised: Error | null = null;
        try {
          await setupSql`UPDATE public.tenants SET slug = 'evil-slug' WHERE id = ${tenantA.id}::uuid`;
        } catch (err) {
          raised = err as Error;
        }

        expect(raised).not.toBeNull();
        expect(raised?.message ?? '').toMatch(/tenant slug is immutable/);
      } finally {
        await setupSql.end();
      }
    });

    it('UPDATE tenants SET primary_domain = ... deve falhar', async () => {
      const setupSql = (await import('postgres')).default(
        process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/colheita_test',
        { max: 1, onnotice: () => {} },
      );
      try {
        let raised: Error | null = null;
        try {
          await setupSql`UPDATE public.tenants SET primary_domain = 'evil.example.com' WHERE id = ${tenantA.id}::uuid`;
        } catch (err) {
          raised = err as Error;
        }

        expect(raised).not.toBeNull();
        expect(raised?.message ?? '').toMatch(/tenant primary_domain managed by platform admin/);
      } finally {
        await setupSql.end();
      }
    });
  });
});
