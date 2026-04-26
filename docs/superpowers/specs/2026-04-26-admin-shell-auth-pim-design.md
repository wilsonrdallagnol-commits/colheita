# Admin Shell + Auth + PIM Read-Only — Design Spec

**Sub-projeto:** B — Shell + Autenticação + PIM (lista, detalhe, busca/filtro)
**Data:** 2026-04-26
**Status:** Aprovado pelo usuário

---

## Objetivo

Construir o primeiro app funcional do Programa Colheita: o painel administrativo da Argho (`apps/admin`), com autenticação via magic link e visualização read-only do portfólio de produtos.

Ao final deste sub-projeto, um usuário autenticado da Argho consegue:
- Fazer login com magic link (email)
- Navegar pela lista de produtos com busca por nome e filtro por categoria
- Ver o detalhe completo de um produto (composição, registro MAPA, embalagens)

---

## Arquitetura

### Tenant único por enquanto

A Argho é o único tenant. O tenant_id é injetado no JWT pelo Supabase Auth Hook (migration 0009) e propagado via `@colheita/auth` para cada request. Não há seleção de tenant por URL — a navegação é por breadcrumb (Argho > Admin > Produtos > [Nome]).

### Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 + App Router |
| Renderização | RSC-first; Client Components apenas onde há interação (filtros) |
| Auth | Supabase Auth — magic link via `@supabase/ssr` |
| DB | Drizzle ORM + `@colheita/db` (direto no Server Component, sem API layer) |
| UI | `@colheita/ui` (shadcn/ui + Tailwind v4 + Radix) |
| Tokens | `@colheita/tokens` (OKLCH, dark-first, verde floresta + ouro + teal) |
| Middleware | `@colheita/auth` → `updateSession` |

---

## Seção 1 — `packages/auth`

### Responsabilidade

Encapsula toda interação com Supabase Auth, expondo uma API limpa para os apps consumirem. Nenhum app importa `@supabase/ssr` diretamente.

### API exportada

```typescript
// Browser (Client Components)
createBrowserClient(): SupabaseClient

// Server (Server Components, Route Handlers, Server Actions)
createServerClient(cookieStore: ReadonlyRequestCookies): SupabaseClient

// Middleware
updateSession(request: NextRequest): Promise<NextResponse>

// Helpers
getSession(cookieStore): Promise<Session | null>
getUser(cookieStore): Promise<User | null>

// requireAuth: chama redirect('/login') de 'next/navigation' se não autenticado.
// Só pode ser chamado de Server Components e Server Actions — nunca de Client Components
// nem de funções chamadas dentro de Route Handlers que não suportam redirect().
requireAuth(cookieStore): Promise<User>
```

### Migration 0009 — Auth Hook

Função `auth.custom_access_token_hook` injetada no JWT antes de cada emissão de token. Busca o `tenant_id` do usuário na tabela `public.users` (coluna `tenant_id` — existe desde `0001_foundation.sql`) e adiciona ao claim `tenant_id`. Exception handler defensivo: se qualquer erro ocorrer, o token é emitido sem o claim extra (nunca bloqueia o login).

```sql
CREATE OR REPLACE FUNCTION auth.custom_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE _tenant_id uuid;
BEGIN
  SELECT u.tenant_id INTO _tenant_id
  FROM public.users u
  WHERE u.id = (event->>'user_id')::uuid
  LIMIT 1;

  IF _tenant_id IS NOT NULL THEN
    event := jsonb_set(event, '{claims,tenant_id}', to_jsonb(_tenant_id::text));
  END IF;

  RETURN event;
EXCEPTION WHEN OTHERS THEN
  RETURN event;
END;
$$;

-- supabase_auth_admin executa a função e precisa ler public.users
GRANT EXECUTE ON FUNCTION auth.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT ON public.users TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION auth.custom_access_token_hook FROM authenticated, anon, public;
```

Ativado no Supabase Dashboard: Authentication → Hooks → `custom_access_token_hook`.

### Middleware behavior

```
GET /qualquer-rota
  → updateSession() atualiza cookie se token expirado
  → se não autenticado e rota não é /login nem /auth/callback → redirect /login
  → se autenticado e rota é /login → redirect /produtos
```

Matcher exato (usa URLs reais, não nomes de route groups):

```typescript
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/callback|login).*)'],
}
```

---

## Seção 2 — `packages/ui`

### Responsabilidade

Biblioteca de componentes compartilhados. Cada app configura seu próprio `components.json` apontando para este pacote como source. Componentes vivem em `packages/ui/src/components/`.

### Componentes do escopo deste sub-projeto

| Componente | Tipo | Descrição |
|---|---|---|
| `Button` | Server | Variantes: default, ghost, outline |
| `Input` | Client | Input com forward ref |
| `Badge` | Server | Categorias de produto |
| `Card` | Server | Wrapper com hover state |
| `Skeleton` | Server | Placeholder de loading |
| `Breadcrumb` | Server | Navegação hierárquica |
| `Separator` | Server | Divisor visual |
| `Table` | Server | Composição garantida |
| `Sidebar` | Client | Navegação lateral colapsável |

### Design system

- **Dark-first** — background `oklch(0.12 0.02 150)` (verde escuro), não preto puro
- **Tipografia** — Geist Sans (UI), Inter (corpo), JetBrains Mono (dados técnicos)
- **Cor primária** — verde floresta `oklch(0.45 0.15 150)`
- **Cor accent** — ouro `oklch(0.75 0.12 85)`
- **Radius** — `0.5rem` padrão, `0.75rem` em cards
- CSS variables via `@colheita/tokens`, injetadas no `:root`

**Importante:** `packages/ui` não pode ser desenvolvido/testado em isolamento sem as CSS variables dos tokens. O pacote deve incluir um `src/globals.css` próprio que importa `@colheita/tokens` e define as variables no `:root`. O `apps/admin/src/app/globals.css` importa esse mesmo CSS. Nenhum componente de `packages/ui` usa valores OKLCH hardcoded — tudo via CSS var.

---

## Seção 3 — `apps/admin`

### Estrutura de rotas

```
/login                     → (auth)/login/page.tsx
/auth/callback             → (auth)/auth/callback/route.ts
/                          → redirect → /produtos
/produtos                  → (dashboard)/produtos/page.tsx
/produtos/[slug]           → (dashboard)/produtos/[slug]/page.tsx
```

### Layout do dashboard

```
┌─────────────────────────────────────────────────────┐
│ Sidebar (240px)        │ Main content               │
│                        │                            │
│ [Logo Argho]           │ Breadcrumb                 │
│ ─────────────          │ ─────────────              │
│ • Produtos  ←          │ [Busca] [Filtros]          │
│   Xcensis              │                            │
│   Bioamin              │ ┌──────┐ ┌──────┐ ┌──────┐ │
│   ...                  │ │Card  │ │Card  │ │Card  │ │
│                        │ └──────┘ └──────┘ └──────┘ │
│ ─────────────          │ ...                        │
│ [Avatar] Wilson        │                            │
└─────────────────────────────────────────────────────┘
```

### PIM — lista de produtos (`/produtos`)

**Server Component** — busca todos os produtos da Argho diretamente via Drizzle. Recebe `searchParams` do Next.js para filtros.

- **Busca** (`?q=`): filtro `ilike` no nome e tagline
- **Categoria** (`?categoria=`): filtro exato na coluna `category_id`
- **Grid**: 3 colunas (lg), 2 (md), 1 (sm)
- **Loading**: `<Suspense>` com 9 `<Skeleton>` cards
- **Empty state**: mensagem + botão de limpar filtros se busca ativa

**Card de produto**:
- Nome (heading)
- Categoria (Badge)
- Tagline (texto secundário)
- Status (dot: verde=published, amarelo=draft)
- Link para detalhe

### PIM — detalhe de produto (`/produtos/[slug]`)

**Server Component** — renderização dinâmica (sem `generateStaticParams`). RLS requer JWT para qualquer query em `products`, e `generateStaticParams` roda em build time sem sessão — retornaria zero rows silenciosamente. `dynamicParams = true` é o comportamento padrão do App Router; cada detalhe é renderizado no primeiro acesso.

Layout 2 colunas:

**Esquerda (70%)**:
- Nome + tagline
- Descrição completa
- Tabela de composição garantida (macros, micros)
- Modos de aplicação (quando disponível)

**Direita (30%) — sidebar de metadados**:
- Número de registro MAPA — coluna `registration_no` da tabela `regulatory_registrations` (join por `product_id`)
- Estado físico — `technical_specs->>'physical_state'` (jsonb em `products.technical_specs`)
- Origem — `technical_specs->>'origin'` (jsonb em `products.technical_specs`)
- Embalagens disponíveis — `products.packaging` (jsonb, array de objetos `{ type: string, weight_kg?: number, volume_l?: number }` — ex: `[{ "type": "bag", "weight_kg": 25 }, { "type": "ibc", "volume_l": 1000 }]`)
- Categoria — `products.category_id` → nome da `product_categories`
- Status — `products.status`

Campos ausentes no jsonb (chave não existe) são omitidos silenciosamente no render — sem exibir "undefined" ou label vazio.

**Breadcrumb**: Argho › Admin › Produtos › [Nome do Produto]

### Filtro de categoria (Client Component)

`produto-filters.tsx` — único Client Component na lista. Usa `useRouter` + `useSearchParams` para atualizar URL sem page reload. Debounce de 300ms no input de busca.

---

## Fluxo de autenticação

```
1. Usuário acessa /produtos (não autenticado)
2. Middleware → redirect /login
3. Usuário digita email → submete
4. Server Action chama supabase.auth.signInWithOtp({ email })
5. Usuário recebe email → clica link
6. /auth/callback?code=... → troca code por session (PKCE)
7. Redirect → /produtos
8. Middleware verifica session → OK → página carrega
9. Server Component chama requireAuth() → OK
10. Drizzle query filtrada por tenant_id (via RLS no JWT)
```

---

## Fora do escopo deste sub-projeto

- CRUD de produtos (criação, edição, exclusão)
- Upload de assets (DAM)
- Multi-tenancy via URL
- Academia / LMS
- Geração de materiais (generator)
- Layout inference engine (UI)
- apps/portal, apps/api, apps/academia

---

## Ordem de construção

1. `migration 0009` — Auth Hook SQL
2. `packages/auth` — createBrowserClient, createServerClient, updateSession, helpers
3. `packages/ui` — componentes do escopo (Button, Input, Badge, Card, Skeleton, Breadcrumb, Separator, Table, Sidebar)
4. `apps/admin` — next.config, globals.css, middleware, root layout
5. `apps/admin` — (auth) routes: login + callback
6. `apps/admin` — (dashboard) layout: sidebar + header
7. `apps/admin` — /produtos: lista + filtros + skeletons
8. `apps/admin` — /produtos/[slug]: detalhe

---

## Critério de conclusão

- [ ] `pnpm dev` sobe `apps/admin` sem erro
- [ ] Login com magic link funciona (em ambiente local com Supabase Docker)
- [ ] Lista de produtos carrega os 19 produtos do seed (com busca e filtro funcionando)
- [ ] Detalhe de produto exibe composição garantida e metadados MAPA
- [ ] RLS garante que só produtos do tenant Argho aparecem
- [ ] Middleware redireciona corretamente (não autenticado → login, autenticado + /login → /produtos)
- [ ] TypeScript sem erros (`pnpm typecheck`)
- [ ] Biome sem warnings (`pnpm lint`)
