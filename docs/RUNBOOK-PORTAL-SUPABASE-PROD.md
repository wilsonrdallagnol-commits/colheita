# Runbook — Conectar Plataforma Colheita ao Supabase de Produção

**Contexto:** apps/portal está deployado em https://colheita.arghoagrosciences.com mostrando
"Catálogo digital chega em breve" porque está com env vars **placeholder**. Este runbook
detalha como trocar pelo Supabase de produção real.

**Tempo estimado:** 30 minutos.

**Custos envolvidos:** Supabase Pro $25/mês.

---

## Passo 1 — Criar projeto Supabase de produção

1. Entrar em https://supabase.com/dashboard
2. **New Project**:
   - Organization: criar uma "Argho Agrosciences" se não existir
   - Name: `colheita-prod`
   - Database Password: gerar senha forte e **GUARDAR no 1Password/Bitwarden**
   - Region: `South America (São Paulo)` — mais próximo de Argho/distribuidores
   - Pricing Plan: **Pro $25/mês** (necessário pra Storage + features prod)
3. Aguardar provisioning (~2min). Anotar:
   - **Project Reference** (`xxxxxxxxxxxx.supabase.co`)
   - Project Settings → API:
     - **URL**
     - **anon (public) key**
     - **service_role (secret) key** ← NUNCA commitar nem expor
   - Project Settings → Database:
     - **Connection string (Transaction)** → porta 6543, modo Supavisor
     - **Connection string (Session)** → porta 5432, direta (pra migrations)

## Passo 2 — Habilitar pgvector e auth hook custom

No Dashboard Supabase → SQL Editor:

```sql
-- pgvector pra busca semântica de produtos
create extension if not exists vector;

-- Auth hook customizado (necessário pra tenant_id no JWT)
-- Migration 0009_auth_hook.sql faz isso, mas precisa habilitar manualmente:
-- Dashboard → Authentication → Hooks → Customize Access Token (Beta)
-- Function: public.custom_access_token_hook
```

## Passo 3 — Aplicar migrations e seed (local → prod)

No seu terminal, na raiz do repo:

```bash
# 1. Setar env vars apontando pro Supabase prod
export DATABASE_URL_DIRECT="postgresql://postgres:<SENHA>@db.<REF>.supabase.co:5432/postgres"
export DATABASE_URL="postgresql://postgres:<SENHA>@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
export NEXT_PUBLIC_SUPABASE_URL="https://<REF>.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="<ANON_KEY>"
export SUPABASE_SERVICE_ROLE_KEY="<SERVICE_ROLE_KEY>"
export SUPABASE_URL="https://<REF>.supabase.co"

# 2. Aplicar 12 migrations em ordem (0001-0012)
pnpm db:migrate

# 3. Seed inicial — Argho como tenant principal
pnpm db:seed
# Cria: Argho tenant + Xcensis cliente + 2 trilhas/7 lições/4 produtos applications
# + 12 produtos com regulatory_registrations MAPA

# 4. (Opcional) Reindexar embeddings dos produtos pra busca semântica
# Requer VOYAGE_API_KEY ou OPENAI_API_KEY exportadas
pnpm embed:reindex
```

## Passo 4 — Configurar env vars no Vercel `colheita-portal`

https://vercel.com/evofitia/colheita-portal/settings/environment-variables

**Substituir** os 3 placeholders existentes:

| Key | Value | Environment |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<REF>.supabase.co` | Production + Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<ANON_KEY>` | Production + Preview |
| `NEXT_PUBLIC_PORTAL_URL` | `https://colheita.arghoagrosciences.com` | Production |

**Adicionar** (necessárias pra busca semântica e ficha técnica):

| Key | Value | Notes |
|---|---|---|
| `SUPABASE_URL` | mesma URL | Server-side |
| `SUPABASE_SERVICE_ROLE_KEY` | `<SERVICE_ROLE_KEY>` | Sensitive |
| `VOYAGE_API_KEY` | sua key | https://dash.voyageai.com (opcional, busca semântica) |
| `RESEND_API_KEY` | sua key | https://resend.com (opcional, magic link Supabase Auth funciona sem isso) |
| `RESEND_FROM_EMAIL` | `noreply@colheita.arghoagrosciences.com` | Opcional |

## Passo 5 — Configurar Supabase Auth redirect URLs

Dashboard Supabase → Authentication → URL Configuration:

- **Site URL**: `https://colheita.arghoagrosciences.com`
- **Redirect URLs** (adicionar todas):
  - `https://colheita.arghoagrosciences.com/auth/callback`
  - `https://colheita.arghoagrosciences.com/conta`
  - `http://localhost:3001/auth/callback` (dev)
  - `http://localhost:3001/conta` (dev)

## Passo 6 — Redeploy

No Vercel `colheita-portal` → Deployments → último → menu → **Redeploy**.
Após ~1min, https://colheita.arghoagrosciences.com deve mostrar **catálogo de produtos**
em vez de "em breve".

## Passo 7 — Smoke tests

```bash
curl -s https://colheita.arghoagrosciences.com | grep -oE '<title>[^<]*</title>'
# Esperado: <title>Catálogo — Plataforma Colheita — Argho</title>

curl -s https://colheita.arghoagrosciences.com | grep -q "em breve" && echo "AINDA PLACEHOLDER" || echo "CATALOGO ATIVO"
# Esperado: CATALOGO ATIVO

# Listar produtos seedados
curl -s https://colheita.arghoagrosciences.com | grep -oE 'href="/produtos/[^"]+"' | sort -u | head
# Esperado: links pros 12 produtos MAPA (impuch, lifeon, etc.)
```

Login com magic link:

1. Acessar https://colheita.arghoagrosciences.com/entrar
2. Digitar email
3. Verificar caixa de email — Supabase envia email com link
4. Clicar no link → deve redirecionar pra `/conta` autenticado

## Passo 8 — (Opcional) Configurar Storage bucket "assets"

Pra fotos de produto, mockups, e PDFs gerados:

Dashboard Supabase → Storage → New bucket:
- Name: `assets`
- Public: ✅ (pra produtos públicos no portal)
- Allowed MIME types: image/png, image/jpeg, image/webp, application/pdf

Policies já estão criadas via migration 0003_dam.sql.

---

## Troubleshooting

**Build falha com "Vulnerable version of Next.js":**
- `apps/portal/package.json` deve ter `"next": "15.3.9"` (já corrigido)

**500 MIDDLEWARE_INVOCATION_FAILED:**
- Env vars `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` faltando ou inválidas
- Middleware tem fallback no-op (commit `a26ce45`), então só acontece se a env var TIVER valor mas inválido. Confirme URL termina em `.supabase.co`.

**Login magic link não chega no email:**
- Verificar Authentication → Logs no Supabase
- Limit do plan free: 4 emails/hora. Pro: maior. Configurar SMTP customizado em Auth → SMTP Settings se necessário.

**Build local falha com peer dependency warnings:**
- Ignorar — são warnings de zod e opentelemetry, não bloqueiam build.

---

## Refs

- **Vercel project Plataforma Colheita:** https://vercel.com/evofitia/colheita-portal
- **Vercel project site institucional:** https://vercel.com/evofitia/colheita
- **Repo:** https://github.com/wilsonrdallagnol-commits/colheita
- **Memória sessão:** `~/.claude/projects/C--Users-Usuario-Desktop-colheita/memory/MEMORY.md`
- **Status arquivo:** `STATUS.md`
- **Handoff:** `docs/HANDOFF-2026-05-06-PORTAL-DEPLOY.md`
