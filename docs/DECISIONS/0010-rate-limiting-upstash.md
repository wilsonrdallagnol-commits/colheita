# ADR 0010 — Rate Limiting com Upstash Redis

**Status:** Aceito  
**Data:** 2026-04-30  
**Autores:** Time Colheita

---

## Contexto

O endpoint `/api/v1/agent` executa inferência via Claude Haiku por request — custo real de API por chamada. Sem rate limiting, um único usuário ou ataque de força bruta pode gerar custos significativos. O webhook `/api/webhooks/safra` recebe dados externos de sistemas terceiros, necessitando de proteção contra replay attacks e flooding.

## Decisão

Usar **Upstash Redis** via `@upstash/ratelimit` para rate limiting serverless nos endpoints críticos da API.

### Configuração por endpoint

| Endpoint | Algoritmo | Limite | Chave | Proteção |
|---|---|---|---|---|
| `POST /api/v1/agent` | Sliding window | 10 req/min | `session.id` (por usuário autenticado) | Custo de LLM |
| `POST /api/webhooks/safra` | Sliding window | 60 req/min | IP (`x-forwarded-for`) | Flooding/DDoS |

### Proteção adicional no webhook

Além do rate limiting por IP, o webhook implementa **timestamp freshness check**: eventos com `timestamp` anterior a 10 minutos são rejeitados com HTTP 400. Isso previne replay attacks onde um request capturado (com assinatura HMAC válida) é reenviado horas depois.

```
Sequência de validação no /api/webhooks/safra:
1. Rate limiting por IP (60/min, fail-open)
2. HMAC-SHA256 signature (X-Safra-Signature: sha256=...)
3. Schema Zod (SafraEventSchema)
4. Timestamp freshness (< 10 minutos)
5. Dispatch para Trigger.dev
```

## Alternativas consideradas

### 1. Middleware Next.js com Redis próprio
**Descartado**: Requer gerenciar instância Redis — Upstash oferece serverless HTTP REST sem conexão TCP persistente, compatível com Next.js Edge Runtime e Vercel.

### 2. Vercel KV (baseado em Upstash)
**Descartado**: Lock-in com Vercel. Usando Upstash diretamente preserva portabilidade para outros runtimes (Cloudflare, Railway).

### 3. Rate limiting em memória (sem Redis)
**Descartado**: Não funciona em múltiplas instâncias serverless — cada cold start tem estado zerado.

### 4. Cloudflare WAF / API Gateway
**Descartado**: Adiciona infra. Upstash é mais simples e suficiente para a escala atual.

## Padrão de implementação

### Fail-open
**Criticamente importante**: quando `UPSTASH_REDIS_REST_URL` ou `UPSTASH_REDIS_REST_TOKEN` não estão configurados, nenhum rate limit é aplicado. Isso garante que:
- Desenvolvimento local funciona sem Redis
- CI/CD não quebra por ausência de credenciais
- Falhas do Redis em produção não bloqueiam requests legítimos

```typescript
function buildRateLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null; // fail-open
  // ...
}
```

### Resposta HTTP 429
Inclui headers padrão RFC 7231:
- `Retry-After: <segundos>` — tempo até o próximo slot disponível
- `X-RateLimit-Limit` — limite configurado
- `X-RateLimit-Remaining` — slots restantes
- `X-RateLimit-Reset` — timestamp Unix do reset (apenas no /api/v1/agent)

## Consequências

**Positivas:**
- Zero infraestrutura adicional para gerenciar (serverless REST)
- Custo baixo: Upstash free tier cobre 10.000 req/dia; plano Pay-as-you-go ~$0.20/100k comandos
- Fail-open garante que ausência de Redis não quebra o sistema
- Sliding window distribui melhor que fixed window (evita burst no início de cada janela)
- Timestamp check no webhook é independente do Redis — funciona sem Upstash

**Negativas/Trade-offs:**
- Rate limit por usuário no `/api/v1/agent` não protege contra ataques distribuídos (muitos usuários legítimos diferentes)
- Sliding window tem custo ligeiramente maior no Redis vs fixed window
- `unsafe-eval` em CSP de dev pode mascarar problemas de eval em produção (risco baixo)

## Variáveis de ambiente

```bash
# Upstash Redis — rate limiting (opcional; sem estas vars o sistema opera sem limite)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

Documentadas em `.env.example`.

## Referências

- [Upstash Rate Limit docs](https://upstash.com/docs/oss/sdks/ts/ratelimit/overview)
- [@upstash/ratelimit sliding window algorithm](https://upstash.com/docs/oss/sdks/ts/ratelimit/algorithms)
- RFC 7231 §6.5.29 — 429 Too Many Requests
- [OWASP Replay Attack prevention](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
