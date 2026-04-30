# ADR 0012 — Sincronização auth.users → public.users via Trigger Postgres

**Status:** Aceito  
**Data:** 2026-04-30  
**Contexto:** Distributor Portal + Admin CRM

---

## Contexto

O Supabase Auth gerencia autenticação em `auth.users` (schema separado, controlado pelo Supabase). O domínio de negócio da Colheita precisa de dados estendidos por usuário: `tenant_id`, `status`, `last_seen_at`, roles de negócio e referências cruzadas com certificações e audit_events.

O problema: quando um distribuidor faz login via magic link pela primeira vez, o Supabase cria o registro em `auth.users`, mas `public.users` fica vazio. A listagem de distribuidores no admin (`/distribuidores`) consultava apenas `public.users` e exibia zero registros — usuários reais eram invisíveis para o time Argho.

## Decisão

Criar um trigger `AFTER INSERT ON auth.users` que chama `public.handle_new_auth_user()`. A função:

1. Resolve o `tenant_id` em ordem de prioridade:
   - `raw_app_meta_data->>'tenant_id'` (passado explicitamente em criação via Admin API)
   - Primeiro tenant por `created_at ASC` (fallback single-tenant para Argho)
2. Insere em `public.users` com `ON CONFLICT (id) DO NOTHING` (idempotente)
3. Captura qualquer exceção com `EXCEPTION WHEN OTHERS THEN RETURN NEW` — falha silenciosa para nunca bloquear o fluxo de autenticação

Adicionalmente, o callback de auth (`/auth/callback`) em Portal e Academia atualiza `last_seen_at` de forma fire-and-forget após cada login bem-sucedido.

## Alternativas consideradas

### A — Criar public.users no callback de autenticação (Server Action)

**Prós:** Simples, sem trigger SQL.  
**Contras:** Race condition se o usuário abre múltiplas abas. Falha na network entre login e callback deixa `public.users` sem registro. OAuth providers (futuro) podem não passar pelo mesmo callback.

### B — Webhook via Supabase Auth Hooks (HTTP hook)

**Prós:** Sem trigger no banco, lógica em TypeScript.  
**Contras:** Latência adicional (HTTP round-trip em cada signup). Dependência de disponibilidade do endpoint. Mais infraestrutura para manter. Requer endpoint público autenticado.

### C — Trigger Postgres (escolhida)

**Prós:** Atômico — `auth.users` e `public.users` são criados na mesma transação. Zero latência. Resiliente a falhas de rede. Funciona para qualquer provider de auth. SECURITY DEFINER com `set search_path = ''` segue o padrão C1 do projeto.  
**Contras:** SQL fora do ORM Drizzle (mas migrations já são SQL puro). Falha silenciosa pode esconder bugs de configuração de tenant.

## Consequências

- Todo novo usuário autenticado via Supabase (magic link, OAuth, Admin API) recebe registro em `public.users` automaticamente.
- Admin CRM (`/distribuidores`) mostra todos os distribuidores reais sem lag.
- Invite via Admin API (`inviteUserByEmail`) + update posterior de `status='invited'` é o padrão para onboarding controlado.
- Down migration remove o trigger e a função sem perda de dados de `public.users`.
- Futuros providers OAuth precisam apenas que o Supabase configure o callback — nada muda no código.

## Segurança

- `SECURITY DEFINER` com `SET search_path = ''`: padrão C1 do projeto. A função roda com privilégios de `postgres` mas não expõe o search_path ao caller.
- `ON CONFLICT (id) DO NOTHING`: re-runs de migration ou retries não duplicam registros.
- Fallback para primeiro tenant só é seguro em deployment single-tenant (Argho). Multi-tenant real requer `raw_app_meta_data->>'tenant_id'` explícito via Admin API.
