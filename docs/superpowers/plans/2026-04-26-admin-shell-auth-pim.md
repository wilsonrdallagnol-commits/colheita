# Admin Shell + Auth + PIM Read-Only — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir `apps/admin` com autenticação magic link e visualização read-only do portfólio Argho — lista com busca/filtro e detalhe de produto.

**Architecture:** `packages/auth` encapsula `@supabase/ssr` expondo helpers tipados; `packages/ui` fornece componentes shadcn customizados com design system Argho; `apps/admin` usa RSC-first com queries via Supabase JS client (RLS automático por JWT) e tipos importados do `@colheita/db`. Migration 0009 injeta `tenant_id` no JWT via `custom_access_token_hook`.

**Tech Stack:** Next.js 15 App Router, @supabase/ssr 0.5+, Tailwind v4 (@tailwindcss/postcss), shadcn/ui (Radix), class-variance-authority, TypeScript strict, pnpm workspaces, Vitest

---

## Mapa de arquivos

### Criar

```
infra/supabase/migrations/
  0009_auth_hook.sql
  0009_auth_hook.down.sql

packages/auth/
  package.json
  tsconfig.json
  src/
    env.d.ts          ← tipos das env vars
    client.ts         ← createBrowserClient()
    server.ts         ← createServerClient(), getSession(), getUser(), requireAuth()
    middleware.ts     ← updateSession()
    index.ts          ← re-exports públicos

packages/ui/
  package.json
  tsconfig.json
  src/
    globals.css       ← CSS custom properties dos tokens
    lib/utils.ts      ← cn() helper
    components/
      button.tsx
      badge.tsx
      separator.tsx
      skeleton.tsx
      breadcrumb.tsx
      card.tsx
      table.tsx
      input.tsx       ← "use client"
      sidebar.tsx     ← "use client"
    index.ts          ← re-exports públicos

apps/admin/
  package.json
  tsconfig.json
  next.config.ts
  postcss.config.mjs
  src/
    middleware.ts
    app/
      globals.css
      layout.tsx                              ← root layout (fonts, metadata)
      (auth)/
        login/
          page.tsx
          actions.ts                          ← Server Action: signInWithOtp
        auth/callback/
          route.ts                            ← PKCE code exchange
      (dashboard)/
        layout.tsx                            ← sidebar + slot
        page.tsx                              ← redirect → /produtos
        produtos/
          page.tsx                            ← lista RSC
          loading.tsx                         ← 9 skeletons
          [slug]/
            page.tsx                          ← detalhe RSC
            loading.tsx
    components/
      nav/
        app-sidebar.tsx                       ← "use client", sidebar colapsável
      produtos/
        produto-card.tsx
        produto-grid.tsx
        produto-filters.tsx                   ← "use client", busca + categoria
        produto-detail.tsx
```

### Modificar

```
packages/db/tests/helpers/setup.ts  ← adicionar 0009 à lista de migrations
```

---

## Task 1: Migration 0009 — Auth Hook

**Files:**
- Create: `infra/supabase/migrations/0009_auth_hook.sql`
- Create: `infra/supabase/migrations/0009_auth_hook.down.sql`
- Modify: `packages/db/tests/helpers/setup.ts`

- [ ] **Step 1: Criar a migration**

```sql
-- infra/supabase/migrations/0009_auth_hook.sql
-- Auth Hook: injeta tenant_id no JWT de cada usuário autenticado.
-- Ativado em: Supabase Dashboard → Authentication → Hooks → custom_access_token_hook
-- SEGURANÇA: SECURITY DEFINER + search_path = '' + exception handler defensivo.

CREATE OR REPLACE FUNCTION auth.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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
  -- Falha silenciosa: token emitido sem o claim extra em vez de bloquear o login
  RETURN event;
END;
$$;

-- supabase_auth_admin é o role que invoca o hook
GRANT EXECUTE ON FUNCTION auth.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT ON public.users TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION auth.custom_access_token_hook FROM authenticated, anon, public;
```

- [ ] **Step 2: Criar o rollback**

```sql
-- infra/supabase/migrations/0009_auth_hook.down.sql
REVOKE EXECUTE ON FUNCTION auth.custom_access_token_hook FROM supabase_auth_admin;
REVOKE SELECT ON public.users FROM supabase_auth_admin;
DROP FUNCTION IF EXISTS auth.custom_access_token_hook;
```

- [ ] **Step 3: Adicionar 0009 à lista de migrations dos testes**

Em `packages/db/tests/helpers/setup.ts`, localizar `MIGRATION_FILES` e adicionar ao final:

```typescript
// Antes (último item):
'0008_fk_indexes.sql',

// Depois:
'0008_fk_indexes.sql',
'0009_auth_hook.sql',
```

- [ ] **Step 4: Verificar que os testes RLS ainda passam**

```bash
# Requer DATABASE_URL apontando para Postgres 16 local (pnpm infra:up)
pnpm --filter @colheita/db test
```

Expected: todos os testes passam (a função é criada no schema auth, não afeta RLS de tenants).

Se não tiver Postgres rodando: os testes são skipados graciosamente (`describe.skip`). OK.

- [ ] **Step 5: Commit**

```bash
git add infra/supabase/migrations/0009_auth_hook.sql \
        infra/supabase/migrations/0009_auth_hook.down.sql \
        packages/db/tests/helpers/setup.ts
git commit -m "feat(db): migration 0009 — custom_access_token_hook injeta tenant_id no JWT"
```

---

## Task 2: `packages/auth` — scaffold

**Files:**
- Create: `packages/auth/package.json`
- Create: `packages/auth/tsconfig.json`
- Create: `packages/auth/src/env.d.ts`

- [ ] **Step 1: Criar package.json**

```json
{
  "name": "@colheita/auth",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./middleware": "./src/middleware.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "biome check src"
  },
  "dependencies": {
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.45.0"
  },
  "peerDependencies": {
    "next": ">=15.0.0"
  },
  "devDependencies": {
    "@colheita/config": "workspace:*",
    "@types/node": "22.7.0",
    "next": "15.3.1",
    "typescript": "5.6.3"
  }
}
```

- [ ] **Step 2: Criar tsconfig.json**

```json
{
  "extends": "@colheita/config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "baseUrl": "."
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Criar src/env.d.ts**

```typescript
// packages/auth/src/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  }
}
```

- [ ] **Step 4: Instalar dependências**

```bash
pnpm install
```

---

## Task 3: `packages/auth` — server helpers

**Files:**
- Create: `packages/auth/src/server.ts`

- [ ] **Step 1: Criar src/server.ts**

```typescript
// packages/auth/src/server.ts
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export function createServerClient(cookieStore: ReadonlyRequestCookies) {
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Server Components não podem setar cookies.
          // O middleware (updateSession) é responsável por renovar a sessão.
        },
      },
    },
  );
}

export async function getSession(cookieStore: ReadonlyRequestCookies) {
  const supabase = createServerClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser(cookieStore: ReadonlyRequestCookies) {
  const supabase = createServerClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Requer autenticação. Redireciona para /login se não autenticado.
 * ATENÇÃO: Só pode ser chamado de Server Components e Server Actions.
 * Não usar em Route Handlers — redirect() não funciona lá.
 */
export async function requireAuth(cookieStore: ReadonlyRequestCookies) {
  const user = await getUser(cookieStore);
  if (!user) redirect('/login');
  return user;
}
```

---

## Task 4: `packages/auth` — middleware + browser client + exports

**Files:**
- Create: `packages/auth/src/middleware.ts`
- Create: `packages/auth/src/client.ts`
- Create: `packages/auth/src/index.ts`

- [ ] **Step 1: Criar src/middleware.ts**

```typescript
// packages/auth/src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() valida o token com o servidor Supabase — não usar getSession() aqui
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublicRoute =
    pathname.startsWith('/login') || pathname.startsWith('/auth/callback');

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/produtos', request.url));
  }

  return supabaseResponse;
}
```

- [ ] **Step 2: Criar src/client.ts**

```typescript
// packages/auth/src/client.ts
import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 3: Criar src/index.ts**

```typescript
// packages/auth/src/index.ts
export { createBrowserClient } from './client.js';
export { createServerClient, getSession, getUser, requireAuth } from './server.js';
export { updateSession } from './middleware.js';
```

- [ ] **Step 4: Rodar typecheck**

```bash
pnpm --filter @colheita/auth typecheck
```

Expected: sem erros. Se Next.js não estiver instalado ainda, instale: `pnpm install`.

- [ ] **Step 5: Commit**

```bash
git add packages/auth/
git commit -m "feat(auth): package @colheita/auth — createBrowserClient, createServerClient, updateSession, requireAuth"
```

---

## Task 5: `packages/ui` — scaffold + globals.css + utils

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/globals.css`
- Create: `packages/ui/src/lib/utils.ts`

- [ ] **Step 1: Criar package.json**

```json
{
  "name": "@colheita/ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./globals.css": "./src/globals.css"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "biome check src",
    "test": "vitest run --passWithNoTests"
  },
  "dependencies": {
    "@colheita/tokens": "workspace:*",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-separator": "^1.1.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4"
  },
  "peerDependencies": {
    "react": ">=19.0.0",
    "react-dom": ">=19.0.0"
  },
  "devDependencies": {
    "@colheita/config": "workspace:*",
    "@types/node": "22.7.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "react": "^19.0.0",
    "typescript": "5.6.3",
    "vitest": "2.1.4"
  }
}
```

- [ ] **Step 2: Criar tsconfig.json**

```json
{
  "extends": "@colheita/config/tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "baseUrl": "."
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Criar src/globals.css**

Este arquivo define todas as CSS custom properties do design system.
O `apps/admin/src/app/globals.css` importará este arquivo.

```css
/* packages/ui/src/globals.css
   CSS custom properties do design system Colheita.
   Gerado a partir de @colheita/tokens — não editar valores aqui diretamente.
   Para mudanças: editar packages/tokens/src/ e atualizar aqui. */

:root {
  /* Superfícies */
  --colheita-surface-background: oklch(0.08 0.004 148);
  --colheita-surface-elevated: oklch(0.11 0.004 148);
  --colheita-surface-card: oklch(0.13 0.004 148);
  --colheita-surface-overlay: oklch(0.16 0.004 148);
  --colheita-surface-hover: oklch(0.18 0.004 148);
  --colheita-border-subtle: oklch(0.22 0.003 148);
  --colheita-border: oklch(0.27 0.003 148);
  --colheita-border-strong: oklch(0.38 0.003 148);

  /* Texto */
  --colheita-text-primary: oklch(0.97 0 0);
  --colheita-text-secondary: oklch(0.65 0 0);
  --colheita-text-tertiary: oklch(0.48 0 0);
  --colheita-text-disabled: oklch(0.35 0 0);
  --colheita-text-inverse: oklch(0.10 0 0);

  /* Brand Argho — substituir por query ao DB em fase multi-tenant */
  --colheita-brand-primary: oklch(0.58 0.165 148);
  --colheita-brand-primary-fg: oklch(0.98 0 0);
  --colheita-brand-secondary: oklch(0.73 0.135 78);
  --colheita-brand-secondary-fg: oklch(0.10 0 0);
  --colheita-brand-accent: oklch(0.64 0.13 195);
  --colheita-brand-accent-fg: oklch(0.98 0 0);

  /* Semântico */
  --colheita-success: oklch(0.65 0.18 145);
  --colheita-warning: oklch(0.75 0.16 78);
  --colheita-danger: oklch(0.58 0.21 22);
  --colheita-info: oklch(0.64 0.14 250);

  /* Radius */
  --colheita-radius-sm: 4px;
  --colheita-radius-md: 8px;
  --colheita-radius-lg: 12px;
  --colheita-radius-xl: 16px;
  --colheita-radius-full: 9999px;

  /* Transições */
  --colheita-transition-fast: 100ms ease;
  --colheita-transition-base: 200ms ease;
  --colheita-transition-slow: 300ms ease;
}
```

- [ ] **Step 4: Criar src/lib/utils.ts**

```typescript
// packages/ui/src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: Instalar dependências**

```bash
pnpm install
```

---

## Task 6: `packages/ui` — Button, Badge, Separator

**Files:**
- Create: `packages/ui/src/components/button.tsx`
- Create: `packages/ui/src/components/badge.tsx`
- Create: `packages/ui/src/components/separator.tsx`

- [ ] **Step 1: Criar button.tsx**

```tsx
// packages/ui/src/components/button.tsx
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../lib/utils.js';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[var(--colheita-radius-md)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--colheita-brand-primary)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--colheita-brand-primary)] text-[var(--colheita-brand-primary-fg)] hover:opacity-90',
        ghost:
          'hover:bg-[var(--colheita-surface-hover)] text-[var(--colheita-text-secondary)] hover:text-[var(--colheita-text-primary)]',
        outline:
          'border border-[var(--colheita-border)] bg-transparent text-[var(--colheita-text-primary)] hover:bg-[var(--colheita-surface-hover)]',
        destructive:
          'bg-[var(--colheita-danger)] text-[var(--colheita-brand-primary-fg)] hover:opacity-90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 px-3 text-xs',
        lg: 'h-11 px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
```

- [ ] **Step 2: Criar badge.tsx**

```tsx
// packages/ui/src/components/badge.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../lib/utils.js';

const badgeVariants = cva(
  'inline-flex items-center rounded-[var(--colheita-radius-full)] px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--colheita-brand-primary)] text-[var(--colheita-brand-primary-fg)]',
        secondary:
          'bg-[var(--colheita-surface-elevated)] text-[var(--colheita-text-secondary)] border border-[var(--colheita-border-subtle)]',
        success:
          'bg-[var(--colheita-success)]/15 text-[var(--colheita-success)]',
        warning:
          'bg-[var(--colheita-warning)]/15 text-[var(--colheita-warning)]',
        destructive:
          'bg-[var(--colheita-danger)]/15 text-[var(--colheita-danger)]',
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
```

- [ ] **Step 3: Criar separator.tsx**

```tsx
// packages/ui/src/components/separator.tsx
'use client';

import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as React from 'react';
import { cn } from '../lib/utils.js';

export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-[var(--colheita-border-subtle)]',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className,
    )}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;
```

---

## Task 7: `packages/ui` — Skeleton, Breadcrumb

**Files:**
- Create: `packages/ui/src/components/skeleton.tsx`
- Create: `packages/ui/src/components/breadcrumb.tsx`

- [ ] **Step 1: Criar skeleton.tsx**

```tsx
// packages/ui/src/components/skeleton.tsx
import * as React from 'react';
import { cn } from '../lib/utils.js';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[var(--colheita-radius-md)] bg-[var(--colheita-surface-hover)]',
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Criar breadcrumb.tsx**

```tsx
// packages/ui/src/components/breadcrumb.tsx
import { ChevronRight } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/utils.js';

export function Breadcrumb({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn('flex items-center', className)}
      {...props}
    />
  );
}

export function BreadcrumbList({
  className,
  ...props
}: React.HTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className={cn(
        'flex flex-wrap items-center gap-1.5 text-sm text-[var(--colheita-text-tertiary)]',
        className,
      )}
      {...props}
    />
  );
}

export function BreadcrumbItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn('inline-flex items-center gap-1.5', className)} {...props} />
  );
}

export function BreadcrumbLink({
  className,
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className={cn(
        'hover:text-[var(--colheita-text-primary)] transition-colors',
        className,
      )}
      {...props}
    />
  );
}

export function BreadcrumbSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden
      className={cn('text-[var(--colheita-border-strong)]', className)}
      {...props}
    >
      <ChevronRight className="h-3.5 w-3.5" />
    </span>
  );
}

export function BreadcrumbPage({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-current="page"
      className={cn('text-[var(--colheita-text-primary)] font-medium', className)}
      {...props}
    />
  );
}
```

**Nota:** `lucide-react` é necessário. Adicionar ao `packages/ui/package.json` em `dependencies`:
```json
"lucide-react": "^0.468.0"
```
E rodar `pnpm install`.

---

## Task 8: `packages/ui` — Card, Table

**Files:**
- Create: `packages/ui/src/components/card.tsx`
- Create: `packages/ui/src/components/table.tsx`

- [ ] **Step 1: Criar card.tsx**

```tsx
// packages/ui/src/components/card.tsx
import * as React from 'react';
import { cn } from '../lib/utils.js';

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-[var(--colheita-radius-lg)] border border-[var(--colheita-border-subtle)] bg-[var(--colheita-surface-card)] shadow-sm transition-colors hover:border-[var(--colheita-border)]',
      className,
    )}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5 p-5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-base font-semibold leading-snug tracking-tight text-[var(--colheita-text-primary)]',
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('px-5 pb-5', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center px-5 pb-5', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';
```

- [ ] **Step 2: Criar table.tsx**

```tsx
// packages/ui/src/components/table.tsx
import * as React from 'react';
import { cn } from '../lib/utils.js';

export const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('[&_tr]:border-b [&_tr]:border-[var(--colheita-border-subtle)]', className)}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-[var(--colheita-border-subtle)] transition-colors hover:bg-[var(--colheita-surface-hover)]',
      className,
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-10 px-4 text-left align-middle text-xs font-medium text-[var(--colheita-text-tertiary)] uppercase tracking-wide',
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'px-4 py-3 align-middle text-[var(--colheita-text-primary)] font-mono text-sm',
      className,
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';
```

---

## Task 9: `packages/ui` — Input (Client Component)

**Files:**
- Create: `packages/ui/src/components/input.tsx`

- [ ] **Step 1: Criar input.tsx**

```tsx
// packages/ui/src/components/input.tsx
'use client';

import * as React from 'react';
import { cn } from '../lib/utils.js';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-[var(--colheita-radius-md)] border border-[var(--colheita-border)] bg-[var(--colheita-surface-elevated)] px-3 py-1 text-sm text-[var(--colheita-text-primary)] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--colheita-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--colheita-brand-primary)] focus-visible:border-[var(--colheita-brand-primary)] disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
```

---

## Task 10: `packages/ui` — Sidebar (Client Component)

**Files:**
- Create: `packages/ui/src/components/sidebar.tsx`

- [ ] **Step 1: Criar sidebar.tsx**

```tsx
// packages/ui/src/components/sidebar.tsx
'use client';

import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import { cn } from '../lib/utils.js';

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => undefined,
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return React.useContext(SidebarContext);
}

export function Sidebar({ className, children }: React.HTMLAttributes<HTMLElement>) {
  const { collapsed } = useSidebar();
  return (
    <aside
      style={{
        width: collapsed ? '60px' : '240px',
        backgroundColor: 'var(--colheita-surface-elevated)',
        borderRight: '1px solid var(--colheita-border-subtle)',
        transition: 'width var(--colheita-transition-base)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
      className={cn(className)}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center px-4 py-4 border-b border-[var(--colheita-border-subtle)]', className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-1 overflow-y-auto py-2', className)} {...props} />;
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-t border-[var(--colheita-border-subtle)] px-4 py-3', className)}
      {...props}
    />
  );
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn('flex flex-col gap-0.5 px-2', className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn('', className)} {...props} />;
}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  asChild?: boolean;
}

export function SidebarMenuButton({
  className,
  isActive,
  asChild = false,
  children,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '6px 10px',
        borderRadius: 'var(--colheita-radius-md)',
        fontSize: '0.875rem',
        fontWeight: isActive ? '500' : '400',
        color: isActive
          ? 'var(--colheita-text-primary)'
          : 'var(--colheita-text-secondary)',
        backgroundColor: isActive ? 'var(--colheita-surface-hover)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color var(--colheita-transition-fast), color var(--colheita-transition-fast)',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'var(--colheita-surface-hover)';
          e.currentTarget.style.color = 'var(--colheita-text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--colheita-text-secondary)';
        }
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
```

---

## Task 11: `packages/ui` — index.ts + typecheck + commit

**Files:**
- Create: `packages/ui/src/index.ts`

- [ ] **Step 1: Criar src/index.ts**

```typescript
// packages/ui/src/index.ts
export { Badge, type BadgeProps } from './components/badge.js';
export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './components/breadcrumb.js';
export { Button, buttonVariants, type ButtonProps } from './components/button.js';
export { Card, CardContent, CardFooter, CardHeader, CardTitle } from './components/card.js';
export { Input, type InputProps } from './components/input.js';
export { Separator } from './components/separator.js';
export { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, useSidebar } from './components/sidebar.js';
export { Skeleton } from './components/skeleton.js';
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/table.js';
export { cn } from './lib/utils.js';
```

- [ ] **Step 2: Rodar typecheck**

```bash
pnpm --filter @colheita/ui typecheck
```

Expected: sem erros. Se erros de tipo aparecerem em imports do Radix, verificar que `pnpm install` foi executado.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/
git commit -m "feat(ui): package @colheita/ui — 9 componentes base (Button, Badge, Card, Table, Input, Sidebar, Skeleton, Breadcrumb, Separator)"
```

---

## Task 12: `apps/admin` — scaffold

**Files:**
- Create: `apps/admin/package.json`
- Create: `apps/admin/tsconfig.json`
- Create: `apps/admin/next.config.ts`
- Create: `apps/admin/postcss.config.mjs`

- [ ] **Step 1: Criar package.json**

```json
{
  "name": "@colheita/admin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "biome check src"
  },
  "dependencies": {
    "@colheita/auth": "workspace:*",
    "@colheita/db": "workspace:*",
    "@colheita/tokens": "workspace:*",
    "@colheita/ui": "workspace:*",
    "geist": "^1.3.1",
    "lucide-react": "^0.468.0",
    "next": "15.3.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@colheita/config": "workspace:*",
    "@tailwindcss/postcss": "^4.1.5",
    "@types/node": "22.7.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.1.5",
    "typescript": "5.6.3"
  }
}
```

- [ ] **Step 2: Criar tsconfig.json**

```json
{
  "extends": "@colheita/config/tsconfig.base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Criar next.config.ts**

```typescript
// apps/admin/next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@colheita/auth', '@colheita/ui', '@colheita/tokens', '@colheita/db'],
};

export default nextConfig;
```

- [ ] **Step 4: Criar postcss.config.mjs**

```js
// apps/admin/postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

- [ ] **Step 5: Criar .env.local para dev**

```bash
# apps/admin/.env.local (não commitar — já está no .gitignore via *.local)
# Copiar os valores do .env.example da raiz e ajustar:
```

Conteúdo mínimo para dev local:
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLWRlbW8iLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTc5OTUzNTYwMH0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
NEXT_PUBLIC_ADMIN_URL=http://localhost:3000
```

`NEXT_PUBLIC_ADMIN_URL` é usado em `login/actions.ts` para construir o `emailRedirectTo` do magic link.
O anon key acima é o default público do Supabase local (seguro commitar em `.env.example`, nunca em `.env.local`).

- [ ] **Step 6: Instalar dependências**

```bash
pnpm install
```

---

## Task 13: `apps/admin` — root layout + globals.css

**Files:**
- Create: `apps/admin/src/app/globals.css`
- Create: `apps/admin/src/app/layout.tsx`

- [ ] **Step 1: Criar globals.css**

```css
/* apps/admin/src/app/globals.css */
@import "tailwindcss";
@import "@colheita/ui/globals.css";

/* Tailwind v4: definir tokens customizados para uso em classes utilitárias */
@theme {
  --color-brand: var(--colheita-brand-primary);
  --color-brand-fg: var(--colheita-brand-primary-fg);
  --color-surface: var(--colheita-surface-background);
  --color-surface-elevated: var(--colheita-surface-elevated);
  --color-surface-card: var(--colheita-surface-card);
  --color-border: var(--colheita-border);
  --color-border-subtle: var(--colheita-border-subtle);
  --color-text: var(--colheita-text-primary);
  --color-text-secondary: var(--colheita-text-secondary);
  --color-text-tertiary: var(--colheita-text-tertiary);

  --font-display: var(--font-geist-sans), "Inter", -apple-system, system-ui, sans-serif;
  --font-body: "Inter", -apple-system, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
}

html,
body {
  background-color: var(--colheita-surface-background);
  color: var(--colheita-text-primary);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}
```

- [ ] **Step 2: Criar layout.tsx**

```tsx
// apps/admin/src/app/layout.tsx
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Argho Admin',
    template: '%s — Argho Admin',
  },
  description: 'Painel administrativo Argho Agrosciences',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
```

---

## Task 14: `apps/admin` — middleware

**Files:**
- Create: `apps/admin/src/middleware.ts`

- [ ] **Step 1: Criar middleware.ts**

```typescript
// apps/admin/src/middleware.ts
import { updateSession } from '@colheita/auth/middleware';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Exclui: estáticos Next.js, imagens, assets, /login e /auth/callback.
  // /login e /auth/callback são rotas públicas — não precisam de updateSession().
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|login|auth/callback).*)',
  ],
};
```

---

## Task 15: `apps/admin` — login page + Server Action

**Files:**
- Create: `apps/admin/src/app/(auth)/login/page.tsx`
- Create: `apps/admin/src/app/(auth)/login/actions.ts`

- [ ] **Step 1: Criar actions.ts**

```typescript
// apps/admin/src/app/(auth)/login/actions.ts
'use server';

import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';

export async function signInWithMagicLink(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = formData.get('email');
  if (typeof email !== 'string' || !email.includes('@')) {
    return { error: 'Email inválido.' };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_ADMIN_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: 'Erro ao enviar o link. Tente novamente.' };
  }

  return {};
}
```

- [ ] **Step 2: Criar page.tsx**

```tsx
// apps/admin/src/app/(auth)/login/page.tsx
'use client';

import { Button } from '@colheita/ui';
import { Input } from '@colheita/ui';
import { useActionState } from 'react';
import { signInWithMagicLink } from './actions.js';

export default function LoginPage() {
  const [state, action, pending] = useActionState(signInWithMagicLink, null);

  // Magic link enviado com sucesso
  if (state && !state.error && state !== null) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--colheita-surface-background)',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '360px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--colheita-radius-full)',
              backgroundColor: 'var(--colheita-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'var(--colheita-text-primary)',
              marginBottom: '8px',
              letterSpacing: '-0.01em',
            }}
          >
            Link enviado
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)', lineHeight: '1.5' }}>
            Verifique seu email e clique no link para acessar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--colheita-surface-background)',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '360px' }}>
        {/* Logo / marca */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--colheita-radius-md)',
                backgroundColor: 'var(--colheita-brand-primary)',
              }}
            />
            <span
              style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--colheita-text-primary)',
                letterSpacing: '-0.025em',
              }}
            >
              Argho
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-tertiary)' }}>
            Painel administrativo
          </p>
        </div>

        {/* Card do formulário */}
        <div
          style={{
            backgroundColor: 'var(--colheita-surface-card)',
            border: '1px solid var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            padding: '28px',
          }}
        >
          <h1
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--colheita-text-primary)',
              marginBottom: '4px',
              letterSpacing: '-0.015em',
            }}
          >
            Entrar
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--colheita-text-secondary)',
              marginBottom: '24px',
            }}
          >
            Receba um link de acesso no seu email.
          </p>

          <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: '500',
                  color: 'var(--colheita-text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                required
                disabled={pending}
              />
            </div>

            {state?.error && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--colheita-danger)' }}>
                {state.error}
              </p>
            )}

            <Button type="submit" disabled={pending} style={{ marginTop: '4px' }}>
              {pending ? 'Enviando...' : 'Enviar link de acesso'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

---

## Task 16: `apps/admin` — auth callback route

**Files:**
- Create: `apps/admin/src/app/(auth)/auth/callback/route.ts`

- [ ] **Step 1: Criar route.ts**

```typescript
// apps/admin/src/app/(auth)/auth/callback/route.ts
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/produtos';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', origin));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message);
    return NextResponse.redirect(new URL('/login?error=auth_failed', origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
```

---

## Task 17: `apps/admin` — dashboard layout + AppSidebar

**Files:**
- Create: `apps/admin/src/components/nav/app-sidebar.tsx`
- Create: `apps/admin/src/app/(dashboard)/layout.tsx`
- Create: `apps/admin/src/app/(dashboard)/page.tsx`

- [ ] **Step 1: Criar app-sidebar.tsx**

```tsx
// apps/admin/src/components/nav/app-sidebar.tsx
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@colheita/ui';
import { Package } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/produtos', label: 'Produtos', icon: Package },
];

interface AppSidebarProps {
  userEmail?: string;
}

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--colheita-radius-md)',
              backgroundColor: 'var(--colheita-brand-primary)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '0.9375rem',
              fontWeight: '600',
              color: 'var(--colheita-text-primary)',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            Argho
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
              >
                <Link
                  href={item.href}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}
                >
                  <item.icon
                    size={16}
                    style={{ flexShrink: 0, color: 'inherit' }}
                  />
                  <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {userEmail && (
        <SidebarFooter>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--colheita-text-tertiary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {userEmail}
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
```

- [ ] **Step 2: Criar (dashboard)/layout.tsx**

```tsx
// apps/admin/src/app/(dashboard)/layout.tsx
import { requireAuth } from '@colheita/auth';
import { SidebarProvider } from '@colheita/ui';
import { cookies } from 'next/headers';
import { AppSidebar } from '@/components/nav/app-sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);

  return (
    <SidebarProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar userEmail={user.email} />
        <main style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
```

- [ ] **Step 3: Criar (dashboard)/page.tsx**

```typescript
// apps/admin/src/app/(dashboard)/page.tsx
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  redirect('/produtos');
}
```

---

## Task 18: `apps/admin` — /produtos (lista + filtros + loading)

**Files:**
- Create: `apps/admin/src/components/produtos/produto-filters.tsx`
- Create: `apps/admin/src/components/produtos/produto-card.tsx`
- Create: `apps/admin/src/components/produtos/produto-grid.tsx`
- Create: `apps/admin/src/app/(dashboard)/produtos/loading.tsx`
- Create: `apps/admin/src/app/(dashboard)/produtos/page.tsx`

- [ ] **Step 1: Criar produto-filters.tsx**

```tsx
// apps/admin/src/components/produtos/produto-filters.tsx
// Valores iniciais vêm do Server Component via props (não useSearchParams).
// Isso evita Suspense boundary e é o padrão correto para RSC + Client Components.
'use client';

import { Input } from '@colheita/ui';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

interface ProdutoFiltersProps {
  categorias: Array<{ slug: string; name: string }>;
  initialQ: string;
  initialCategoria: string;
}

export function ProdutoFilters({ categorias, initialQ, initialCategoria }: ProdutoFiltersProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(initialQ);
  const [currentCategoria, setCurrentCategoria] = useState(initialCategoria);

  const updateURL = useCallback(
    (newQ: string, newCat: string) => {
      const params = new URLSearchParams();
      if (newQ) params.set('q', newQ);
      if (newCat) params.set('categoria', newCat);
      startTransition(() => {
        router.push(`/produtos?${params.toString()}`, { scroll: false });
      });
    },
    [router],
  );

  const handleCategoryChange = (cat: string) => {
    setCurrentCategoria(cat);
    updateURL(q, cat);
  };

  // Debounce da busca por texto
  const handleSearchChange = useCallback(
    (value: string) => {
      setQ(value);
      const timeout = setTimeout(() => updateURL(value, currentCategoria), 300);
      return () => clearTimeout(timeout);
    },
    [currentCategoria, updateURL],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Busca */}
      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search
          size={15}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--colheita-text-tertiary)',
            pointerEvents: 'none',
          }}
        />
        <Input
          type="search"
          placeholder="Buscar produtos..."
          value={q}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={{ paddingLeft: '32px' }}
        />
      </div>

      {/* Filtros de categoria */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <button
          onClick={() => handleCategoryChange('')}
          style={{
            padding: '4px 12px',
            borderRadius: 'var(--colheita-radius-full)',
            fontSize: '0.8125rem',
            border: `1px solid ${currentCategoria === '' ? 'var(--colheita-brand-primary)' : 'var(--colheita-border)'}`,
            backgroundColor:
              currentCategoria === ''
                ? 'var(--colheita-brand-primary)'
                : 'transparent',
            color:
              currentCategoria === ''
                ? 'var(--colheita-brand-primary-fg)'
                : 'var(--colheita-text-secondary)',
            cursor: 'pointer',
            transition: 'all var(--colheita-transition-fast)',
          }}
        >
          Todos
        </button>

        {categorias.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => handleCategoryChange(cat.slug)}
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--colheita-radius-full)',
              fontSize: '0.8125rem',
              border: `1px solid ${currentCategoria === cat.slug ? 'var(--colheita-brand-primary)' : 'var(--colheita-border)'}`,
              backgroundColor:
                currentCategoria === cat.slug
                  ? 'var(--colheita-brand-primary)'
                  : 'transparent',
              color:
                currentCategoria === cat.slug
                  ? 'var(--colheita-brand-primary-fg)'
                  : 'var(--colheita-text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--colheita-transition-fast)',
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Criar produto-card.tsx**

```tsx
// apps/admin/src/components/produtos/produto-card.tsx
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@colheita/ui';
import Link from 'next/link';

interface ProdutoCardProps {
  produto: {
    slug: string;
    name: string;
    tagline: string | null;
    status: 'draft' | 'published' | 'archived';
    category: { name: string } | null;
  };
}

const STATUS_DOT: Record<string, string> = {
  published: 'var(--colheita-success)',
  draft: 'var(--colheita-warning)',
  archived: 'var(--colheita-text-disabled)',
};

export function ProdutoCard({ produto }: ProdutoCardProps) {
  return (
    <Link href={`/produtos/${produto.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <Card style={{ height: '100%', cursor: 'pointer' }}>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <CardTitle style={{ flex: 1 }}>{produto.name}</CardTitle>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: 'var(--colheita-radius-full)',
                backgroundColor: STATUS_DOT[produto.status] ?? STATUS_DOT.archived,
                flexShrink: 0,
                marginTop: '5px',
              }}
              title={produto.status}
            />
          </div>
          {produto.category && (
            <Badge variant="secondary" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
              {produto.category.name}
            </Badge>
          )}
        </CardHeader>
        {produto.tagline && (
          <CardContent>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--colheita-text-secondary)',
                lineHeight: '1.5',
              }}
            >
              {produto.tagline}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
```

- [ ] **Step 3: Criar produto-grid.tsx**

```tsx
// apps/admin/src/components/produtos/produto-grid.tsx
import { ProdutoCard } from './produto-card.js';

interface ProdutoGridProps {
  produtos: Array<{
    id: string;
    slug: string;
    name: string;
    tagline: string | null;
    status: 'draft' | 'published' | 'archived';
    category: { name: string } | null;
  }>;
}

export function ProdutoGrid({ produtos }: ProdutoGridProps) {
  if (produtos.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '64px 24px',
          color: 'var(--colheita-text-tertiary)',
        }}
      >
        <p style={{ fontSize: '0.9375rem', marginBottom: '8px' }}>
          Nenhum produto encontrado.
        </p>
        <p style={{ fontSize: '0.8125rem' }}>
          Tente outros termos de busca ou limpe os filtros.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}
    >
      {produtos.map((p) => (
        <ProdutoCard key={p.id} produto={p} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Criar loading.tsx**

```tsx
// apps/admin/src/app/(dashboard)/produtos/loading.tsx
import { Skeleton } from '@colheita/ui';

export default function ProdutosLoading() {
  return (
    <div style={{ padding: '32px' }}>
      {/* Filtros skeleton */}
      <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Skeleton style={{ height: '36px', maxWidth: '400px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} style={{ height: '26px', width: '80px', borderRadius: '9999px' }} />
          ))}
        </div>
      </div>

      {/* Grid skeleton — 9 cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{
              borderRadius: 'var(--colheita-radius-lg)',
              border: '1px solid var(--colheita-border-subtle)',
              padding: '20px',
              backgroundColor: 'var(--colheita-surface-card)',
            }}
          >
            <Skeleton style={{ height: '20px', marginBottom: '10px', width: '70%' }} />
            <Skeleton style={{ height: '22px', width: '90px', borderRadius: '9999px', marginBottom: '16px' }} />
            <Skeleton style={{ height: '14px', marginBottom: '6px' }} />
            <Skeleton style={{ height: '14px', width: '80%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Criar page.tsx (lista RSC)**

```tsx
// apps/admin/src/app/(dashboard)/produtos/page.tsx
import { createServerClient } from '@colheita/auth';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@colheita/ui';
import { cookies } from 'next/headers';
import { ProdutoFilters } from '@/components/produtos/produto-filters';
import { ProdutoGrid } from '@/components/produtos/produto-grid';

interface SearchParams {
  q?: string;
  categoria?: string;
}

export const metadata = { title: 'Produtos' };

async function fetchProdutos(supabase: ReturnType<typeof createServerClient>, q?: string, categoria?: string) {
  // Buscar categorias para os filtros
  const { data: categorias } = await supabase
    .from('product_categories')
    .select('id, slug, name')
    .order('name');

  // Buscar ID da categoria se filtro ativo
  let categoryId: string | undefined;
  if (categoria && categorias) {
    const cat = categorias.find((c) => c.slug === categoria);
    categoryId = cat?.id;
  }

  // Buscar produtos com join de categoria
  let query = supabase
    .from('products')
    .select('id, slug, name, tagline, status, category:product_categories(id, name)')
    .is('deleted_at', null)
    .order('name');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (q) {
    query = query.or(`name.ilike.%${q}%,tagline.ilike.%${q}%`);
  }

  const { data: produtos } = await query;

  return {
    categorias: categorias ?? [],
    produtos: (produtos ?? []).map((p) => ({
      ...p,
      status: p.status as 'draft' | 'published' | 'archived',
      category: Array.isArray(p.category) ? (p.category[0] ?? null) : (p.category ?? null),
    })),
  };
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, categoria } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { categorias, produtos } = await fetchProdutos(supabase, q, categoria);

  return (
    <div style={{ padding: '32px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span style={{ color: 'var(--colheita-text-tertiary)', fontSize: '0.8125rem' }}>Argho</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Produtos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.025em',
            marginBottom: '4px',
          }}
        >
          Produtos
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
          {produtos.length} {produtos.length === 1 ? 'produto' : 'produtos'}
        </p>
      </div>

      {/* Filtros — valores iniciais passados como props do Server Component.
          Não usa useSearchParams(), não precisa de Suspense. */}
      <div style={{ marginBottom: '28px' }}>
        <ProdutoFilters
          categorias={categorias}
          initialQ={q ?? ''}
          initialCategoria={categoria ?? ''}
        />
      </div>

      {/* Grid — dados já resolvidos pelo Server Component pai; loading.tsx cuida do estado de carregamento */}
      <ProdutoGrid produtos={produtos} />
    </div>
  );
}
```

---

## Task 19: `apps/admin` — /produtos/[slug] (detalhe + loading)

**Files:**
- Create: `apps/admin/src/components/produtos/produto-detail.tsx`
- Create: `apps/admin/src/app/(dashboard)/produtos/[slug]/loading.tsx`
- Create: `apps/admin/src/app/(dashboard)/produtos/[slug]/page.tsx`

- [ ] **Step 1: Criar produto-detail.tsx**

```tsx
// apps/admin/src/components/produtos/produto-detail.tsx
import { Badge, Separator, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@colheita/ui';
import type { ProductComposition, ProductPackaging } from '@colheita/db';

interface ProdutoDetailProps {
  produto: {
    name: string;
    tagline: string | null;
    description: string | null;
    status: string;
    composition: ProductComposition;
    technicalSpecs: Record<string, unknown>;
    packaging: ProductPackaging;
    category: { name: string } | null;
    registrationNo: string | null;
  };
}

function MetaItem({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.875rem', color: 'var(--colheita-text-primary)', fontFamily: 'var(--font-mono)' }}>
        {value}
      </span>
    </div>
  );
}

function packagingLabel(p: ProductPackaging[number]) {
  if (p.weightKg) return `${p.type} ${p.weightKg} kg`;
  if (p.volumeL) return `${p.type} ${p.volumeL} L`;
  return p.type;
}

export function ProdutoDetail({ produto }: ProdutoDetailProps) {
  const allNutrients = {
    ...produto.composition.macros,
    ...produto.composition.micros,
    ...produto.composition.others,
  };

  const hasComposition = Object.keys(allNutrients).length > 0;
  const physicalState = produto.technicalSpecs['physical_state'] as string | undefined;
  const origin = produto.technicalSpecs['origin'] as string | undefined;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: '40px',
        alignItems: 'start',
      }}
    >
      {/* Conteúdo principal (esquerda) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Nome e tagline */}
        <div>
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: '600',
              color: 'var(--colheita-text-primary)',
              letterSpacing: '-0.025em',
              marginBottom: '8px',
            }}
          >
            {produto.name}
          </h1>
          {produto.tagline && (
            <p style={{ fontSize: '1rem', color: 'var(--colheita-text-secondary)', lineHeight: '1.6' }}>
              {produto.tagline}
            </p>
          )}
        </div>

        {/* Descrição */}
        {produto.description && (
          <div>
            <h2
              style={{
                fontSize: '0.8125rem',
                fontWeight: '500',
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '12px',
              }}
            >
              Descrição
            </h2>
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--colheita-text-secondary)',
                lineHeight: '1.65',
                whiteSpace: 'pre-line',
              }}
            >
              {produto.description}
            </p>
          </div>
        )}

        {/* Composição garantida */}
        {hasComposition && (
          <div>
            <h2
              style={{
                fontSize: '0.8125rem',
                fontWeight: '500',
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '12px',
              }}
            >
              Composição garantida
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nutriente</TableHead>
                  <TableHead>Teor (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(allNutrients).map(([nutrient, value]) => (
                  <TableRow key={nutrient}>
                    <TableCell style={{ fontFamily: 'inherit' }}>{nutrient}</TableCell>
                    <TableCell>{String(value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Sidebar de metadados (direita) */}
      <div
        style={{
          backgroundColor: 'var(--colheita-surface-card)',
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          position: 'sticky',
          top: '24px',
        }}
      >
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)', marginBottom: '4px' }}>
            Status
          </p>
          <Badge
            variant={produto.status === 'published' ? 'success' : 'secondary'}
            style={{ fontSize: '0.75rem' }}
          >
            {produto.status === 'published' ? 'Publicado' : produto.status === 'draft' ? 'Rascunho' : 'Arquivado'}
          </Badge>
        </div>

        <Separator />

        {produto.category && (
          <MetaItem label="Categoria" value={produto.category.name} />
        )}

        {produto.registrationNo && (
          <MetaItem label="Registro MAPA" value={produto.registrationNo} />
        )}

        {physicalState && (
          <MetaItem label="Estado físico" value={physicalState} />
        )}

        {origin && (
          <MetaItem label="Origem" value={origin} />
        )}

        {produto.packaging.length > 0 && (
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Embalagens
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {produto.packaging.map((p, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--colheita-text-secondary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {packagingLabel(p)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Criar loading.tsx**

```tsx
// apps/admin/src/app/(dashboard)/produtos/[slug]/loading.tsx
import { Skeleton } from '@colheita/ui';

export default function ProdutoLoading() {
  return (
    <div style={{ padding: '32px' }}>
      <Skeleton style={{ height: '16px', width: '200px', marginBottom: '32px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '40px' }}>
        <div>
          <Skeleton style={{ height: '36px', width: '60%', marginBottom: '12px' }} />
          <Skeleton style={{ height: '20px', width: '80%', marginBottom: '32px' }} />
          <Skeleton style={{ height: '160px', marginBottom: '32px' }} />
          <Skeleton style={{ height: '200px' }} />
        </div>
        <Skeleton style={{ height: '300px', borderRadius: 'var(--colheita-radius-lg)' }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Criar page.tsx (detalhe RSC)**

```tsx
// apps/admin/src/app/(dashboard)/produtos/[slug]/page.tsx
import { createServerClient, requireAuth } from '@colheita/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@colheita/ui';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { ProductComposition, ProductPackaging } from '@colheita/db';
import { ProdutoDetail } from '@/components/produtos/produto-detail';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return { title: slug.replace(/-/g, ' ') };
}

export default async function ProdutoPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();

  await requireAuth(cookieStore);

  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      tagline,
      description,
      status,
      composition,
      technical_specs,
      packaging,
      category:product_categories(name),
      registrations:regulatory_registrations(registration_no)
    `)
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    notFound();
  }

  const registration = Array.isArray(data.registrations)
    ? (data.registrations[0] ?? null)
    : null;

  const category = Array.isArray(data.category)
    ? (data.category[0] ?? null)
    : (data.category ?? null);

  return (
    <div style={{ padding: '32px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '28px' }}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span style={{ color: 'var(--colheita-text-tertiary)', fontSize: '0.8125rem' }}>Argho</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/produtos" style={{ fontSize: '0.8125rem' }}>
              Produtos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>{data.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ProdutoDetail
        produto={{
          name: data.name,
          tagline: data.tagline ?? null,
          description: data.description ?? null,
          status: data.status,
          composition: (data.composition ?? {}) as ProductComposition,
          technicalSpecs: (data.technical_specs ?? {}) as Record<string, unknown>,
          packaging: (data.packaging ?? []) as ProductPackaging,
          category,
          registrationNo: registration?.registration_no ?? null,
        }}
      />
    </div>
  );
}
```

---

## Task 20: Typecheck, lint e verificação final

- [ ] **Step 1: Rodar typecheck em todos os packages novos**

```bash
pnpm --filter @colheita/auth typecheck
pnpm --filter @colheita/ui typecheck
pnpm --filter @colheita/admin typecheck
```

Expected: sem erros em nenhum. Corrigir antes de seguir.

- [ ] **Step 2: Rodar lint**

```bash
pnpm lint
```

Expected: sem warnings. Se biome reportar erros de formatação, rodar `pnpm check` (biome format + check auto-fix).

- [ ] **Step 3: Verificar que os testes existentes ainda passam**

```bash
pnpm test
```

Expected: 51+ testes passando (26 layout-inference + 25 db).

- [ ] **Step 4: Verificar o dev server**

```bash
# Pré-requisito: pnpm infra:up + pnpm db:migrate + pnpm db:seed
pnpm --filter @colheita/admin dev
```

Acessar `http://localhost:3000` e verificar:

| Rota | Comportamento esperado |
|---|---|
| `/` (não autenticado) | Redireciona para `/login` |
| `/login` | Exibe formulário de magic link |
| `/login` (autenticado) | Redireciona para `/produtos` |
| `/produtos` (não autenticado) | Redireciona para `/login` |
| `/produtos` (autenticado) | Grid com cards dos 18 produtos Argho |
| `/produtos?q=xcensis` | Filtra por nome |
| `/produtos?categoria=fertilizantes-minerais` | Filtra por categoria |
| `/produtos/xcensis` | Detalhe com composição e metadados MAPA |

- [ ] **Step 5: Commit final**

```bash
git add apps/admin/ packages/auth/ packages/ui/ \
        infra/supabase/migrations/0009_auth_hook.sql \
        infra/supabase/migrations/0009_auth_hook.down.sql \
        packages/db/tests/helpers/setup.ts
git commit -m "feat(admin): apps/admin — shell + auth magic link + PIM read-only (Fase 1, sub-projeto B)"
```

---

## Critério de conclusão

- [ ] `pnpm typecheck` — sem erros em todos os packages
- [ ] `pnpm lint` — sem warnings
- [ ] `pnpm test` — 51+ testes passando
- [ ] `/login` — formulário abre, magic link pode ser enviado (Inbucket local em `localhost:54324`)
- [ ] `/produtos` — grid carrega os 18 produtos do seed Argho
- [ ] Busca por nome funciona (`?q=`)
- [ ] Filtro de categoria funciona (`?categoria=`)
- [ ] `/produtos/xcensis` — detalhe exibe composição garantida e metadados MAPA
- [ ] RLS ativo — nenhum produto de outro tenant aparece

---

## Referências

- Spec: `docs/superpowers/specs/2026-04-26-admin-shell-auth-pim-design.md`
- Schema Drizzle: `packages/db/src/schema/index.ts`
- Tokens: `packages/tokens/src/system.ts`, `packages/tokens/src/argho.ts`
- Supabase SSR docs: `@supabase/ssr` — createBrowserClient, createServerClient, updateSession pattern
- Next.js 15 App Router: cookies(), searchParams e params são agora assíncronos (retornam Promise)
- Tailwind v4: usa `@import "tailwindcss"` + `@theme {}` em CSS; sem `tailwind.config.js`
