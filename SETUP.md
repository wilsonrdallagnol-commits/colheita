# SETUP.md — Colheita / Argho

Guia rapido pra configurar Sentry, Upstash, Trigger.dev e demais integrations
em producao. Pra desenvolvimento local, ver `.env.example` na raiz.

A pagina `/configuracoes` mostra um card "Status operacional" com indicadores
verde (OK) / cinza (OFF) pra cada um dos services abaixo. Use isso como
checklist pos-configuracao.

---

## 1. Sentry (rastreamento de erros) — CRITICO

Sem isso, `captureError()` eh no-op. Erros em prod sao invisiveis ate o cliente
reportar. Free tier (5k eventos/mes) cobre projeto pequeno.

### Setup

1. Criar conta em https://sentry.io (free tier: 5k errors/mes, 50 replays/mes)
2. Criar 3 projetos (admin, portal, api) ou 1 unico (dependendo da granularidade)
3. Copiar DSN do projeto (formato: `https://<key>@<org>.ingest.sentry.io/<id>`)
4. Setar vars no Vercel **para cada projeto** (admin, portal, api):

```bash
# Via Vercel CLI:
vercel env add SENTRY_DSN production
# Cole o DSN quando perguntado

vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Mesmo valor — versao publica usada pelo browser

# Opcional pra source maps (recomendado):
vercel env add SENTRY_AUTH_TOKEN production
vercel env add SENTRY_ORG production    # ex: argho
vercel env add SENTRY_PROJECT production # ex: colheita-admin
```

5. Re-deploy: `vercel --prod` em cada app
6. Verificar em `/configuracoes` — status "Sentry" deve estar verde

### Validacao

Force um erro proposital (ex: navegue para uma URL invalida no admin),
abra Sentry dashboard. Erro deve aparecer em ~30s.

---

## 2. Upstash Redis (rate limiting) — ALTO

Sem isso, `/api/agent/ask` e endpoints de geracao sao fail-open. Bug
client-side pode chamar em loop e queimar creditos Anthropic.

### Setup

1. Criar conta em https://console.upstash.com
2. Criar database Redis (region: us-east-1, mais proximo da Vercel default)
3. Copiar `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` do dashboard
4. Setar no Vercel admin:

```bash
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
```

5. Re-deploy `vercel --prod`
6. Verificar em `/configuracoes` — status "Upstash Redis" deve estar verde

### Limites configurados

- `/api/agent/ask`: 15 req/min/user
- `/leads/[id]/proposta/gerar`: 5 req/min/user

Editar em `apps/admin/src/app/api/agent/ask/route.ts:33` ou
`apps/admin/src/app/(dashboard)/leads/[id]/proposta/gerar/route.ts:42`.

---

## 3. Trigger.dev (background jobs) — MEDIO

Sem isso, `embedProdutoJob` e `embedLicaoJob` nao rodam apos criar/editar
produto/licao. O RAG fica desatualizado ate alguem clicar em "Reindexar"
manualmente em `/configuracoes`.

### Setup

1. Criar conta em https://trigger.dev
2. Criar projeto, copiar `TRIGGER_SECRET_KEY` e `TRIGGER_PROJECT_REF`
3. Setar no Vercel admin + api:

```bash
vercel env add TRIGGER_SECRET_KEY production
vercel env add TRIGGER_PROJECT_REF production
```

4. Deploy dos jobs: `pnpm --filter @colheita/jobs trigger:deploy`
5. Verificar dashboard Trigger.dev — task `embed-produto` deve aparecer

---

## 4. Resend (emails transacionais) — MEDIO

Sem isso, certificados de Academia nao sao enviados por email, alertas
de compliance nao chegam.

### Setup

1. Criar conta em https://resend.com
2. Verificar dominio (ex: `arghoagrosciences.com`) via DNS records
3. Criar API key, copiar
4. Setar no Vercel admin + api:

```bash
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production   # ex: noreply@arghoagrosciences.com
vercel env add RESEND_NOTIFY_EMAIL production # ex: alertas@argho.com.br
vercel env add RESEND_TENANT_NAME production  # ex: "Argho AgriSciences"
```

---

## 5. PostHog (analytics + feature flags) — BAIXO

Opcional. Tracking de eventos de UI, funnels, A/B test. Free tier 1M
eventos/mes.

### Setup

1. Criar conta em https://posthog.com (cloud EU pra LGPD)
2. Copiar project API key
3. Setar:

```bash
vercel env add NEXT_PUBLIC_POSTHOG_KEY production
vercel env add NEXT_PUBLIC_POSTHOG_HOST production # https://eu.i.posthog.com
```

---

## Status atual do ambiente Argho (snapshot 2026-05-20)

Verificado via `vercel env ls production` no projeto `colheita-admin`:

| Service        | Status | Observacao                                  |
| -------------- | ------ | ------------------------------------------- |
| Supabase       | OK     | URL/keys configuradas                       |
| Anthropic      | OK     | API key configurada                         |
| OpenAI         | OK     | API key configurada (fallback de embeddings)|
| Sentry         | OFF    | Nao configurado — erros invisiveis em prod  |
| Upstash Redis  | OFF    | Nao configurado — sem rate limiting         |
| Trigger.dev    | OFF    | Nao configurado — RAG nao atualiza sozinho  |
| Resend         | OFF    | Nao configurado — emails nao saem           |
| Voyage AI      | OFF    | OK — OpenAI cobre como fallback             |
| PostHog        | OFF    | Opcional, nao impacta funcionalidade        |

Pra setar tudo de uma vez, seguir as secoes acima na ordem (1 → 2 → 3 → 4).
