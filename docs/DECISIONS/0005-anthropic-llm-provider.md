# ADR 0005 — Anthropic como provider único de LLM

**Status:** Accepted
**Data:** 2026-04-23
**Decisores:** Wilson Dall Agnol (CTO)

## Contexto

O produto usa LLMs em dois contextos:
1. **Layout Inference Engine** — análise visual de layouts de referência para gerar blueprints estruturados (multimodal: texto + imagem)
2. **Geração de materiais** — templates preenchidos com dados de produto + instruções de copy (texto)

Fase 2 adicionará RAG + agentes para atendimento ao distribuidor e curadoria de conteúdo.

Os principais providers considerados foram: Anthropic (Claude), OpenAI (GPT-4o), Google (Gemini).

## Decisão

Adotar **Anthropic Claude** como provider único de LLM, usando o **Vercel AI SDK** como camada de abstração para não criar lock-in tecnológico.

Modelos usados:
- **Claude Sonnet 4.5**: layout inference (multimodal), geração de materiais, agentes de Fase 2
- **Claude Haiku 4.5**: classificação, validação, operações de baixo custo onde latência importa
- **Claude Opus 4**: análise profunda de documentos regulatórios (futuro, alto custo)

## Decisões específicas

### Vercel AI SDK como abstração
- Todas as chamadas LLM passam por `@ai-sdk/anthropic` via Vercel AI SDK
- Se precisarmos trocar de provider (por custo, qualidade ou disponibilidade), é mudança em `apps/generator/lib/llm.ts` — nenhuma outra parte do código muda
- Provider-agnostic para streaming, tool calling e structured output

### Claude Sonnet 4.5 como modelo principal
- Melhor relação custo/benefício para análise estruturada de layouts (benchmark interno)
- Vision capability nativa — não precisa de modelo separado para multimodal
- Context window de 200k tokens — suporta documentos técnicos longos e múltiplos blueprints em contexto
- API estável e suporte a structured outputs com function calling

### Cost ceiling por operação
- Configurado em `packages/config/src/pricing.ts`
- Layout inference: máximo $0.50 por análise
- Geração de material: máximo $0.20 por material
- Se o custo estimado ultrapassar o teto, a operação é recusada antes de chamar a API
- Alertas em Sentry/Axiom quando > 80% do teto é atingido (Fase 2)

### Versionamento de prompts
- Constante `ANALYZER_PROMPT_VERSION` em cada módulo que usa LLM
- Persistida no banco junto com a saída (blueprint, material gerado)
- Permite detectar regressões quando prompts são atualizados

### Retry policy
- 3 tentativas com exponential backoff (1s, 2s, 4s)
- Retry apenas em erros `5xx` e `429` (rate limit)
- Erros `4xx` (input inválido) não fazem retry — falham imediatamente

## Alternativas consideradas

### A. OpenAI GPT-4o
- **Considerado, não escolhido:** qualidade comparável para análise de layout; custo similar; API mais madura. Razão da não escolha: Wilson tem mais familiaridade com Claude; maior alinhamento com valores de safety para produto B2B; structured output via Anthropic é mais determinístico em testes preliminares.

### B. Google Gemini 2.0 Flash
- **Considerado, não escolhido:** custo menor para alto volume; latência melhor. Razão da não escolha: ecosystem menos maduro para tool calling complexo; ausência de suporte a `thinking` (needed para raciocínio de Fase 2).

### C. Multi-provider com fallback
- **Rejeitado para v1:** complexidade operacional alta; prompts precisariam de versionamento por provider; custo de manutenção. Pode ser adicionado em Fase 3 se Anthropic tiver problemas de disponibilidade.

### D. Modelo self-hosted (Llama, Mistral via Ollama/Together)
- **Rejeitado:** qualidade insuficiente para análise multimodal de layouts na Fase 1; infraestrutura de GPU não justificada no tamanho atual. Revisitar quando o volume de chamadas justificar o custo de hosting.

## Consequências

### Positivas
- Uma única API key para gerenciar, uma conta para monitorar custos
- Vercel AI SDK permite mudar de provider sem refatoração se necessário
- Claude é o melhor modelo disponível para análise estruturada de documentos e layouts no momento desta decisão
- Preços previsíveis: $3/1M input tokens, $15/1M output tokens (Sonnet 4.5 — sujeito a mudança)

### Negativas / Riscos
- **Dependência de um único vendor**: se a Anthropic tiver downtime, o produto fica sem LLM. Mitigação: circuit breaker + graceful degradation (funcionalidades LLM ficam indisponíveis, resto do produto funciona)
- **Mudança de preços**: Anthropic pode aumentar preços. Cost ceiling limita exposição; Vercel AI SDK facilita migração
- **Rate limits em picos**: conta Tier 1 tem limits de 50 RPM/1M TPM. Para escala, subir para Tier 2+

## Referências

- `/packages/config/src/pricing.ts` — model pricing + cost ceilings
- `/packages/layout-inference/src/analyzer.ts` — uso do AI SDK
- Vercel AI SDK: https://sdk.vercel.ai/docs
- Anthropic pricing: https://anthropic.com/pricing
