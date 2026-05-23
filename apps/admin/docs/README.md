# 📋 Docs admin Colheita — Status pós ciclo melhoria contínua

> Sprint 2026-05-22/23 — 24+ commits em 12h. Este README consolida o que
> está pronto, o que precisa de ação manual do Wilson, e onde achar cada coisa.

## ✅ Pronto no código (deploy automático)

### Site institucional (`arghoagrosciences.com`)
- ✅ products.ts com 20 produtos das fichas técnicas oficiais
- ✅ 4 novos: Titan, Grow Filling, Grow NitroP, Up Soil
- ✅ Composições corrigidas: Bovex, Controx, Troian
- ✅ Compliance MAPA renderer alternativo pros 6 biológicos
- ✅ Plataforma Colheita bloqueada via feature flag
- ✅ Mobile responsivo 100% (hero, catálogo, detalhe produto, sobre)

### Admin Colheita (`colheita-admin-evofitia.vercel.app`)
- ✅ Sidebar vira drawer mobile com hamburger
- ✅ AgentDock pill icon-only no mobile + panel quase-fullscreen
- ✅ IA agronômica PhD (Doutor em Fertilidade/Fisiologia/Biológicos)
- ✅ AdminChatPanel envia `contextPath` (awareness da rota)
- ✅ `/configuracoes` com 6 status integrations (Sentry, Upstash, Anthropic, Embeddings, **Gemini**, **Resend**)
- ✅ ReindexButton com aviso provider mock + link "Testar IA"
- ✅ `/produtos/[slug]` renderer alternativo Complexo microbiológico
- ✅ Tables mobile (pedidos items, materiais histórico, leads, assistente histórico) viram cards verticais com labels
- ✅ produto-form helpers JSON contextuais
- ✅ **NOVO**: `/imagens` página de geração via Nano Banana Pro (UI completa)

### Portal Colheita (`colheita.arghoagrosciences.com`)
- ✅ TopNav padding mobile + nav scroll horizontal
- ✅ Grids 1fr 1fr / 2fr 1fr viram 1col mobile
- ✅ Stats cards reduzidos no mobile
- ✅ `/produtos/[slug]` renderer alternativo Complexo microbiológico

### Backend / packages
- ✅ `@colheita/image-gen` package novo (Gemini Nano Banana Pro)
- ✅ Endpoint admin `/api/imagens/gerar` (auth + rate limit + maxDuration 60s)
- ✅ Migration `0034_fichas_tecnicas_sync.sql` (idempotente)

## ⏳ Pendências do fundador (ação manual)

### 🔴 CRÍTICO — IA agronômica responder com dados certos

```sh
# 1. Aplicar migration (segue guia detalhado em aplicar-migration-0034.md)
psql "$DATABASE_URL_DIRECT" -f infra/supabase/migrations/0034_fichas_tecnicas_sync.sql

# 2. Re-indexar embeddings no pgvector
pnpm --filter @colheita/jobs reindex-all

# 3. Smoke test no /assistente:
# "Qual a composição correta do Bovex?"
# Deve responder com Metarhizium anisopliae + Cordyceps fumosorosea
```

Doc completo: **[aplicar-migration-0034.md](./aplicar-migration-0034.md)**

### 🟡 IMPORTANTE — Ativar geração de imagens

```sh
# Pega key em: https://aistudio.google.com/apikey
# Adiciona local + Vercel:

# Local: apps/admin/.env.local
GEMINI_API_KEY=AIzaSy...

# Vercel:
vercel env add GEMINI_API_KEY production
```

Doc completo: **[ativar-nano-banana.md](./ativar-nano-banana.md)**

### 🟢 OPCIONAL — Confirmar configurações de produção

- `ANTHROPIC_API_KEY` setada na Vercel admin (IA agente requer)
- `VOYAGE_API_KEY` ou `OPENAI_API_KEY` na Vercel admin (embeddings RAG)
- `UPSTASH_REDIS_REST_URL` (rate limiting do `/api/agent/ask`)
- `SENTRY_DSN` (observabilidade)
- `RESEND_API_KEY` (e-mails transacionais)

Vê tudo de uma vez em **`/configuracoes`** card "Status operacional".

## 🤔 Decisões pendentes

### "N-Import"
Wilson mencionou que queria adicionar produto N-Import junto com Titan,
mas não enviou ficha técnica. Pode ser:
- (a) Sinônimo interno do **Grow NitroP** (também "nitrogênio")
- (b) Produto separado ainda sem documentação

Por enquanto: não foi adicionado. Aguarda clarificação.

### Produtos legacy `algen` e `grow-sulfur`
Estão no seed.ts antigo mas não no products.ts atual do site
institucional. Mantém ou remove? Migration 0034 não toca neles.

## 📁 Estrutura de docs

```
apps/admin/docs/
├── README.md (este arquivo - índice consolidado)
├── aplicar-migration-0034.md (guia passo-a-passo migration + reindex RAG)
├── ativar-nano-banana.md (guia GEMINI_API_KEY + prompts pra mockups)
└── rag-supabase-sync.md (contexto técnico do gap RAG vs site)

apps/website/docs/
├── biologicos-compliance.md (modelo neutro MAPA - referência regulatória)
└── heart-video-pipeline.md (saga do video heart - 5 abordagens que não funcionaram)
```

## 🎯 Próximos passos sugeridos

1. **Aplicar migration 0034** (5 min) — destrava IA agronômica
2. **Setar GEMINI_API_KEY** (5 min) — destrava geração de imagens
3. **Testar `/assistente`** com perguntas das fichas técnicas
4. **Testar `/imagens`** gerando 2-3 mockups de produto
5. Decidir sobre N-Import + produtos legacy

## 📊 Resumo numérico do ciclo

- **24+ commits** em 12h
- **3 apps** com mobile responsivo profundo (site, admin, portal)
- **6 produtos biológicos** com compliance MAPA validada
- **4 produtos novos** prontos pra entrar em prod via migration
- **1 package novo** (image-gen) + 1 endpoint + 1 UI
- **20 produtos** no portfolio (era 16)
- **6 integrations** monitoradas em status operacional
