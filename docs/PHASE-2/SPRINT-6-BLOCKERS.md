# Sprint 6 — Bloqueadores hard (RLS multi-tenant)

**Status:** Não pode shippar sem fechar todos os itens abaixo.
**Origem:** Auditoria `/hm-engineer scope B` em 2026-05-08.
**Razão:** Sprint 6 ativa o cenário multi-tenant real (distribuidores externos + onboarding de novos tenants). Os findings abaixo são dormentes hoje (1 tenant) e ativos a partir do dia da entrada de Sprint 6.

---

## ✅ Já fechado nesta sessão

### C2 — Vazamento PII em `orders` (LGPD)
- Migration `0015_fix_orders_pii_leak.sql` aplicada em repo + prod
- Removido `OR distribuidor_id IS NULL` das policies de `orders` e `order_items`
- Pedidos não-mapeados são admin-only (service role bypassa RLS)

---

## 🔴 Bloqueadores CRÍTICOS

### C1 — Privilege escalation entre tenants via `users_update_self`
**Tabelas:** `public.users`, `public.app_custom_access_token_hook` (auth hook)

**O quê:** Policy `users_update_self for update using (id = auth.uid())` sem `WITH CHECK` que proteja `tenant_id`. Combinado com auth hook que lê `tenant_id` de `public.users`, qualquer user pode `UPDATE users SET tenant_id = '<outro-tenant>' WHERE id = auth.uid()`, fazer logout/login, e o JWT injeta o `tenant_id` novo → vê tudo do tenant alheio.

**Fix:**
```sql
-- 1. Policy com WITH CHECK explícito
drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- 2. Trigger backstop (defesa em profundidade)
create or replace function prevent_user_tenant_change()
returns trigger language plpgsql as $$
begin
  if old.tenant_id is distinct from new.tenant_id then
    raise exception 'tenant_id is immutable on users';
  end if;
  return new;
end;
$$;

create trigger users_no_tenant_change
  before update on public.users
  for each row execute function prevent_user_tenant_change();
```

**Teste obrigatório (RLS test suite):** criar 2 tenants A e B, autenticar como user de A, tentar `UPDATE users SET tenant_id = '<B-uuid>'`, confirmar que erro `tenant_id is immutable` é levantado.

---

### C3 — `handle_new_auth_user` faz fallback silencioso pro "primeiro tenant"
**Função:** `public.handle_new_auth_user()` (migration 0012)

**O quê:** Quando um auth.users é criado sem `raw_app_meta_data.tenant_id`, a função pega o tenant mais antigo. Hoje só tem Argho — funciona. Sprint 6 onboardar EVOFIT → qualquer signup random vai pra Argho.

**Fix:** Rejeitar signup sem tenant_id explícito quando há > 1 tenant ativo:
```sql
-- substituir bloco de fallback por:
IF _tenant_id IS NULL THEN
  IF (SELECT count(*) FROM public.tenants WHERE status = 'active') > 1 THEN
    RAISE WARNING '[handle_new_auth_user] signup without tenant_id rejected (multi-tenant)';
    RETURN NEW;  -- auth.users criado mas sem public.users → user fica órfão, login falha
  END IF;
  SELECT id INTO _tenant_id FROM public.tenants WHERE status = 'active' LIMIT 1;
END IF;
```

---

## 🟠 Bloqueadores ALTOS

### A1 — `tenants_public_select` expõe TODOS tenants ativos pra anon
**Migration:** 0010_public_read_policies.sql

Anon lê `name`, `slug`, `logo_url`, `primary_domain` de qualquer tenant. Combinado com C1, é vetor de descoberta do `tenant_id` alvo.

**Fix:** Filtrar por host injetado pelo middleware Next.js. Requer:
1. Middleware Next.js setar header/claim com tenant_id baseado em subdomain
2. Função `auth.current_host_tenant_id()` que lê esse claim
3. Policy: `USING (status = 'active' AND id = auth.current_host_tenant_id())`

### A2 — Trilhas de Academia de TODOS tenants visíveis pra anon
**Migration:** 0010_public_read_policies.sql linhas 75-111

Mesmo padrão de A1. Conteúdo de treinamento Argho visível pra distribuidor de outro tenant. **Fix:** mesma estratégia de A1 (filtro por host nas policies `learning_*_public_select`).

### A3 — Tenant owner pode mudar `slug` e `primary_domain` sem WITH CHECK
**Migration:** 0001_foundation.sql linha 169-170

**Fix:** Trigger `prevent_tenant_identity_change` bloqueia mudança via update RLS:
```sql
create or replace function prevent_tenant_identity_change()
returns trigger language plpgsql as $$
begin
  if old.slug is distinct from new.slug then
    raise exception 'tenant slug is immutable';
  end if;
  if old.primary_domain is distinct from new.primary_domain then
    raise exception 'tenant primary_domain managed by platform admin';
  end if;
  return new;
end;
$$;
create trigger tenants_no_identity_change
  before update on public.tenants
  for each row execute function prevent_tenant_identity_change();
```

### A4 — Confirmar status do partitioning de `audit_events`
**Migration:** 0007_audit_partitioning.sql

**O quê:** Migration existe no repo, mas prod foi aplicado via Supabase Management API parcial — preciso confirmar se 0007 rodou.

**Fix:** SQL check antes de Sprint 6:
```sql
SELECT relname, relkind FROM pg_class
WHERE relname LIKE 'audit_events%' AND relkind IN ('p', 'r');
```
Se vazio (relkind != 'p'), aplicar 0007.

---

## 🟡 Itens MÉDIOS para o Sprint 6

- **M1:** `handle_new_auth_user` cast UUID sem regex check (preventivo, baixa probabilidade de ataque mas é hot path).
- **M2:** Index GIN de busca de produtos sem `tenant_id` (performance + leakage timing-side-channel).
- **M3:** `learning_lessons_public_select` não checa `tenant.status = 'active'` (tenant suspenso ainda expõe lições publicadas).

---

## Definition of Done — pré-Sprint 6

- [ ] C1 aplicado + teste RLS automatizado de privilege escalation
- [ ] C3 aplicado (fallback rejeitado em multi-tenant)
- [ ] A1 + A2 + middleware de host context implementados
- [ ] A3 aplicado
- [ ] A4 confirmado em prod (partitioning ativo)
- [ ] **RLS test suite obrigatória** rodando no CI (gate hard)

---

## Por que não fechar agora?

A Fase 1 entregou single-tenant Argho 100%. Os findings acima são **dormentes** — ativam quando há 2+ tenants reais. O foco AGORA é entregar Sprint 1 (Geração de Materiais — o ROI #1 prometido em abril). Esses bloqueadores são honestamente caracterizados como dívida técnica priorizada do Sprint 6 (julho/2026).

**Esse documento existe para garantir que ninguém esqueça.**
