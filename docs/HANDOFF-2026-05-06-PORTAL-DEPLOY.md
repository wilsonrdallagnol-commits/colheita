# Handoff — Plataforma Colheita deploy (2026-05-06 noturno → 05-07 manhã)

## TL;DR

- **Site institucional Argho** → continua no ar em https://arghoagrosciences.com (e www) ✅
- **Plataforma Colheita** (apps/portal) ganhou redesign editorial Argho + projeto Vercel próprio
- Próximo passo bloqueante: **configurar Supabase de produção** (item 2 abaixo) pra que o portal pare de servir página vazia

## O que foi feito durante a sessão

1. **Redesign editorial do `apps/portal`** alinhado com brand Argho oficial (paleta blue
   `#183090` + green `#489030`, Geist 700, white-first):
   - `globals.css` reescrito com tokens override (sem tocar no `@colheita/ui` dark)
   - `<TopNav>` e `<Footer>` novos, com logo Argho + tag "Plataforma Colheita"
   - Home (catálogo) com hero editorial split blue/green, search ampliada, chips de
     categoria, cards com nome do produto em CAPS preto + CTA azul
   - `/entrar` com split-screen (gradiente azul Argho + claim "Tecnologia viva para o
     agro brasileiro" à esquerda, formulário magic link à direita)
   - `/conta` agora usa o mesmo TopNav + Footer
   - Header da ficha do produto `/produtos/[slug]` em CAPS preto + eyebrow azul/verde
   - Logos copiados pra `apps/portal/public/`

2. **Novo projeto Vercel `colheita-portal`** (org `evofitia`):
   - Root directory: `apps/portal`
   - Build command custom: `cd ../.. && pnpm --filter=@colheita/portal build`
   - Install command custom: `cd ../.. && pnpm install --frozen-lockfile`
   - Production URL: `colheita-portal.vercel.app`

3. **Branch + merge:**
   - Branch `feat/portal-redesign-argho` criada e mergeada em `main` (commit `47f87a8`)
   - Push para origin/main feito

## Pendências críticas (ordem de prioridade)

### 1. Configurar variáveis de ambiente do `colheita-portal` no Vercel

Sem isso o portal carrega mas não tem dados (queries Supabase falham silenciosamente).

Acesse https://vercel.com/evofitia/colheita-portal/settings/environment-variables
e adicione **no mínimo**:

| Variável | Onde obter | Observação |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase prod | Required |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase prod | Required |
| `SUPABASE_URL` | Supabase prod (mesmo da pública) | Required pra busca vetorial |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase prod | Required pra busca vetorial |
| `VOYAGE_API_KEY` | dash.voyageai.com | Opcional (busca semântica) |
| `OPENAI_API_KEY` | platform.openai.com | Opcional (fallback embeddings) |
| `RESEND_API_KEY` | resend.com | Opcional (emails magic link via Supabase já funcionam sem isso) |
| `NEXT_PUBLIC_PORTAL_URL` | `https://colheita.arghoagrosciences.com` | Recomendado |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | posthog.com | Opcional (analytics) |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | sentry.io | Opcional (observabilidade) |

> ⚠️ Se você não tem Supabase de produção criado ainda, criar projeto novo em
> [supabase.com/dashboard](https://supabase.com/dashboard) → rodar
> `pnpm db:migrate` apontando para a URL de produção → `pnpm db:seed`.
> Veja `STATUS.md` seção "Scripts operacionais".

### 2. Apontar `colheita.arghoagrosciences.com` para o `colheita-portal`

Hoje o subdomínio está apontando para o **projeto `colheita`** (que serve o site
institucional Argho — `apps/website`). Precisa mover para `colheita-portal`.

Passos:

1. Vercel → projeto `colheita` → Settings → Domains → `colheita.arghoagrosciences.com`
   → Remove (apenas remove do projeto, não deleta DNS).
2. Vercel → projeto `colheita-portal` → Settings → Domains → Add Existing →
   `colheita.arghoagrosciences.com`. SSL emite sozinho em ~30s (DNS já aponta para
   Vercel via CNAME `colheita → 794e3974305c9d57.vercel-dns-016.com` na Hostinger).

### 3. Pendências menores

- `apps/admin`, `apps/academia`, `apps/api` ainda **não estão deployados**. Cada um
  precisa do mesmo setup (projeto Vercel próprio + env vars). Apenas o `colheita-portal`
  está em produção agora.
- Testes do portal (E2E Playwright) ainda não existem. Sugestão: adicionar
  `apps/portal/e2e/catalog.spec.ts` validando home + ficha do produto em uma sessão
  futura.

## Arquivos/commits relevantes

- Commit principal: `5f7650e` — `feat(portal): redesign editorial Argho`
- Merge commit: `47f87a8`
- Skill de marca: `~/.claude/skills/argho-brand/`
- Site institucional referência: `apps/website/src/app/`

## Como rodar local

```bash
pnpm install
pnpm --filter @colheita/portal dev   # http://localhost:3001
```

Precisa de `.env.local` em `apps/portal/` com vars Supabase (já tem placeholders pra
local Docker — veja `apps/portal/.env.local`).
