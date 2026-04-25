# ADR 0001 — Layout Inference Engine

**Status:** Accepted
**Data:** 2026-04-23
**Decisores:** Wilson Dall Agnol (CTO)

## Contexto

A Argho precisa gerar uma quantidade significativa de materiais visuais (fichas técnicas, banners, posts sociais, catálogos, apresentações). Existem três fontes de inspiração:

1. **Materiais antigos da própria Argho** que precisam ser modernizados
2. **Layouts de concorrentes ou de outras indústrias** que podem inspirar novos formatos
3. **Referências externas** (Apple, Stripe, Linear, etc) cuja sensibilidade visual queremos absorver

Construir um template manual para cada formato possível é lento e cria fragmentação. Por outro lado, deixar marketing usar geradores de imagem genéricos (Gemini, Midjourney) produz qualidade inconsistente, identidade fraca e zero reutilização.

## Decisão

Implementar um **Layout Inference Engine** como bounded context dedicado, separado do Generator, com pipeline de três etapas:

1. **Análise visual** via Claude Sonnet 4.5 (vision) → produz LayoutBlueprint estruturado
2. **Revisão humana opcional** (default ligado na Fase 1) → permite ajustar antes do render
3. **Compilação tenant-aware** → aplica tokens visuais do tenant ao blueprint abstrato
4. **Render** via Playwright (delegado ao @colheita/generator) → PDF/PNG print-ready

## Decisões específicas

### Modelo de visão: Claude Sonnet 4.5
- **Por quê:** consistência com restante do stack Anthropic; qualidade superior em análise estrutural; custo razoável (~$0.01–0.05 por análise).
- **Trade-off aceito:** vendor lock-in com Anthropic. Mitigado pelo uso do Vercel AI SDK, que abstrai o provider — trocar de modelo é mudança de uma linha.

### Blueprint é tenant-agnostic
- Capturamos ESTRUTURA e INTENÇÃO, nunca cores/fontes/conteúdo específicos.
- Garante que a mesma referência pode gerar materiais para Argho hoje e EVOFIT amanhã sem retrabalho.
- O tema é aplicado no momento do compile/render via @colheita/tokens.

### Revisão humana ligada por default
- Modelos de visão erram. Permitir revisão evita propagar erros para materiais finais.
- Pode ser desligada por usuário experiente via toggle.
- Coletamos dados de quanto a revisão muda o blueprint — isso vira insumo pra melhorar o prompt no futuro.

### Versionamento de blueprints
- Toda edição cria nova versão (linked list via `parent_id`).
- Apenas uma versão é "current" por reference.
- Preserva histórico para auditoria e A/B test.

### Versionamento de prompts
- Constante `ANALYZER_PROMPT_VERSION` no código + persistida em `model_used`/blueprint.
- Permite rastrear regressões quando atualizamos prompt.

## Alternativas consideradas

### A. Geração direta de HTML/CSS via vision model
- **Rejeitado:** qualidade inconsistente, identidade fraca, zero reutilização entre tenants, código não auditável entrando no sistema.

### B. Apenas templates manuais sem inference
- **Rejeitado:** fricção alta para criar novos formatos, depende sempre de engenharia, marketing fica gargalado.

### C. Múltiplos modelos com fallback (Claude + GPT-4o + Gemini)
- **Rejeitado para v1:** complexidade alta sem ganho claro; Sonnet 4.5 cobre o caso de uso. Pode ser adicionado em v2 se precisar de especialização (ex: GPT-4o pra layouts específicos).

## Consequências

### Positivas
- Marketing autônomo para criar novos formatos a partir de qualquer referência
- Identidade visual blindada — todo render passa pelos tokens do tenant
- Reutilização total entre tenants (multi-tenant nativo desde o blueprint)
- Pipeline auditável (referência → blueprint versionado → material gerado)

### Negativas / Riscos
- **Custo recorrente de API** — cada análise custa $0.01–0.05. Mitigação: instrumentar custo por blueprint, limites configuráveis por tenant.
- **Qualidade do blueprint depende do modelo** — regressões em updates do Sonnet podem afetar consistência. Mitigação: versionamento de prompt + suite de tests com fixtures de referências.
- **Curva de aprendizado** — usuários precisam entender o que é "blueprint" para usar bem a feature. Mitigação: UI explicativa com preview lado a lado.

## Referências

- `/infra/supabase/migrations/0006_layout_inference.sql`
- `/packages/layout-inference/`
- `/packages/db/src/schema/layout-inference.ts`
