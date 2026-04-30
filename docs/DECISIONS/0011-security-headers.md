# ADR 0011 — Security Headers em Next.js

**Status:** Aceito  
**Data:** 2026-04-30  
**Autores:** Time Colheita

---

## Contexto

As 4 apps Next.js (admin, portal, academia, api) precisam de security headers para mitigar ataques comuns de browser: XSS, clickjacking, MIME sniffing, downgrade attacks (HTTP) e exfiltração de dados via frames ou inline scripts não autorizados.

## Decisão

Implementar security headers via **`headers()` no `next.config.ts`** de cada app, usando um helper compartilhado `securityHeaders()` em `@colheita/observability/next-config`.

### Headers implementados

| Header | Valor | Proteção |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Vazamento de URL em referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), browsing-topics=()` | APIs de hardware e tracking |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` (prod) | HTTPS downgrade |
| `Content-Security-Policy` | Ver abaixo | XSS, injection, data exfiltration |

### CSP por ambiente

**Produção:**
```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https:;
font-src 'self' data:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co
            https://*.sentry.io https://*.ingest.sentry.io
            https://eu.i.posthog.com https://eu-assets.i.posthog.com
            https://*.trigger.dev;
frame-src 'none';
frame-ancestors 'self';
form-action 'self';
base-uri 'self';
object-src 'none';
upgrade-insecure-requests
```

**Desenvolvimento** (adicional ao acima):
- `'unsafe-eval'` em `script-src` — necessário para Next.js HMR (Hot Module Replacement)
- `http://localhost:54321 ws://localhost:54321` em `connect-src` — Supabase local
- HSTS `max-age=0` — desenvolvimento usa HTTP

### Trade-off: `'unsafe-inline'` em script-src

`unsafe-inline` é necessário porque:
1. **RSC (React Server Components)** injeta scripts inline para hidratação
2. **Next.js 15** ainda usa inline scripts para algumas otimizações de carregamento

A alternativa (nonce-based CSP) requer injeção de nonce em middleware + headers de resposta por request — complexidade significativa sem ganho proporcional para a escala atual. Pode ser implementado em Fase 5 como hardening adicional.

## Alternativas consideradas

### 1. Headers no middleware Next.js
**Descartado**: Middleware roda em Edge Runtime para cada request autenticado. Headers estáticos pertencem ao `next.config.ts` (processados pelo servidor HTTP, não pela lógica de autenticação).

### 2. Vercel headers via `vercel.json`
**Descartado**: Lock-in com Vercel. O `next.config.ts` funciona em qualquer plataforma.

### 3. Nonce-based CSP (sem `unsafe-inline`)
**Postergado para Fase 5**: Requer middleware que gera nonce por request, passa via response header, e o layout injeta o nonce em cada `<script>`. Complexidade alta, benefício relativo baixo dado que o código é 100% server-rendered sem input de terceiros.

### 4. Headers individuais por app (sem helper compartilhado)
**Descartado**: 4 apps × 7 headers = 28 duplicações. Qualquer alteração requer atualizar 4 arquivos. `securityHeaders()` centraliza e permite override por app quando necessário.

## Consequências

**Positivas:**
- Zero runtime overhead (headers gerados no build, servidos pelo servidor HTTP)
- Funciona em qualquer plataforma (Vercel, Railway, Docker, bare Node)
- `securityHeaders(nodeEnv)` é testável como função pura (24 testes)
- Override por app via segundo parâmetro: `securityHeaders([{ key: 'X-Frame-Options', value: 'DENY' }])`
- HSTS `preload` elegível após 2 anos (Fase long-term)

**Negativas/Trade-offs:**
- `unsafe-inline` reduz proteção CSP vs nonce-based (aceitável para RSC atual)
- `unsafe-eval` em dev pode ocultar problemas de produção (diferença documentada nos testes)
- Não se aplica a assets servidos por CDN de terceiros (imagens externas ainda passam por `img-src 'self' ... https:`)

## Referências

- [Next.js docs — Security Headers](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [MDN CSP reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [HSTS Preload List](https://hstspreload.org/)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
