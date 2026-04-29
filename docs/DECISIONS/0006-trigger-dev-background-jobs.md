# ADR 0006 — Trigger.dev para Background Jobs

**Status:** Accepted
**Data:** 2026-04-23
**Decisores:** Wilson Dall Agnol (CTO)

## Contexto

O produto tem múltiplas operações que não devem rodar no ciclo request/response da aplicação:

1. **Renderização de PDF** — Playwright + Chromium pode demorar 3–10s
2. **Layout Inference** — chamada para API Anthropic + análise pode demorar 5–30s
3. **Envio de emails transacionais** — magic links, notificações, certificados
4. **Geração de relatórios em lote** — processamento de múltiplos produtos
5. **Particionamento e arquivamento de audit_events** — manutenção de banco (Fase 2)
6. **Webhooks de entrada** — reprocessamento em caso de falha (Safra, futuramente)

Aplicações serverless (Vercel) têm timeout de 30s (Hobby) ou 60s (Pro) por função. Jobs de longa duração precisam ser desacoplados do request handler.

## Decisão

Adotar **Trigger.dev v3** como plataforma de background jobs e workflows.

## Decisões específicas

### Trigger.dev v3 (cloud managed)
- **Tasks** com retry automático, observabilidade nativa e duração de até 1 hora por task
- **Integração Next.js**: `trigger.dev/sdk` disparado via `tasks.trigger()` nos Server Actions
- Dashboard para monitorar execuções, inspecionar payload e reprocessar manualmente
- Cloud gerenciado — sem infraestrutura de fila para operar (Redis, SQS, etc.)

### Tipos de jobs planejados
| Job | Trigger | Timeout estimado |
|---|---|---|
| `render-pdf` | Geração de ficha técnica solicitada | 30s |
| `analyze-layout` | Upload de referência de layout | 60s |
| `send-email` | Evento de autenticação / certificação | 5s |
| `batch-generate` | Agendamento diário ou request manual | 5min |
| `archive-audit-events` | Cron mensal | 15min |
| `process-safra-webhook` | Webhook recebido | 30s |

### Integração com Server Actions
```typescript
// Em Server Action:
import { tasks } from '@trigger.dev/sdk/v3';
import type { renderPdfTask } from '@colheita/jobs';

const run = await tasks.trigger<typeof renderPdfTask>('render-pdf', {
  templateId: template.id,
  tenantId: tenant.id,
});
```

### Retry e error handling
- Default: 3 retries com exponential backoff
- Jobs idempotentes — cada job tem `idempotencyKey` baseado no ID da entidade
- Erros irrecuperáveis (input inválido) não fazem retry — falham imediatamente com log

### Observabilidade
- Trigger.dev Dashboard para status em tempo real
- Integração futura com Sentry para alertas em jobs falhando persistentemente
- Custo por execução visível no dashboard (útil para jobs que chamam LLMs)

## Alternativas consideradas

### A. Vercel Cron + Queue via Supabase realtime
- **Rejeitado:** Vercel Cron tem granularidade de 1 minuto e timeout de 60s. Sem retry automático. Sem observabilidade de payload. Para jobs longos (layout inference, batch), insuficiente.

### B. BullMQ + Redis self-hosted
- **Rejeitado:** mais infraestrutura para operar (Redis, worker process). Trigger.dev resolve o mesmo problema sem ops overhead.

### C. AWS SQS + Lambda
- **Rejeitado:** contexto errado — já estamos no Vercel/Supabase. Adicionar AWS aumenta surface de vendor e custo operacional sem ganho claro para o tamanho atual.

### D. Inngest
- **Considerado:** similar ao Trigger.dev em capacidades. Trigger.dev escolhido por melhor DX para TypeScript monorepo e SDK mais ergonômico para tasks com long-running execution.

### E. Background procesamiento inline com `waitUntil` (Vercel Edge)
- **Rejeitado:** `waitUntil` é adequado apenas para operações curtas (< 10s), sem retry, sem observabilidade. Não serve para PDF rendering ou layout inference.

## Consequências

### Positivas
- Server Actions ficam rápidos — disparam o job e retornam imediatamente com ID do job
- Retry automático com backoff — sem perda de jobs em caso de falha transitória
- Observabilidade nativa — dashboard com histórico de execuções, payload, erros
- Monorepo-friendly: jobs em `packages/jobs/` compartilham types com as apps

### Negativas / Riscos
- **Custo**: plano gratuito do Trigger.dev tem limites de execuções/mês. Com volume alto, custo de $20–100/mês. Monitorar conforme crescimento.
- **Cold starts**: workers Trigger.dev podem ter latência de alguns segundos para iniciar. Aceitável para jobs assíncronos.
- **Vendor dependency**: se Trigger.dev descontinuar o serviço, precisaremos migrar. Mitigado pelo SDK bem encapsulado em `packages/jobs/`.

## Referências

- `/packages/config/src/pricing.ts` — feature cost ceilings (LLM jobs)
- Trigger.dev v3 docs: https://trigger.dev/docs
- ADR 0005 — Anthropic como provider LLM (jobs que chamam LLMs)
