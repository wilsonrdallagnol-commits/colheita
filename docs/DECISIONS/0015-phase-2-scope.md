# ADR 0015 — Escopo formal da Fase 2

**Status:** Aceito
**Data:** 2026-05-07
**Owner:** Wilson Dall Agnol

## Contexto

A Fase 1 do Programa Colheita Argho foi concluída em 2026-05-07: portal multi-tenant rodando em colheita.arghoagrosciences.com com PIM real (18 produtos, MAPA, RLS, auth hook custom, 21 testes vitest passando). A visão original de abril/2026 previa 6 camadas de funcionalidade — apenas 2 (Visual System + PIM) chegaram a produção.

A Fase 2 precisa fechar esse gap **sem reabrir decisões de fundação**. Tentações a evitar:
- Reescrever stack porque "agora dá pra usar X"
- Adicionar módulos não previstos só porque ficaram populares no mercado
- Empilhar features sem gates de validação

## Decisão

A Fase 2 inclui **exatamente 6 módulos**, na ordem de dependência:

1. Geração de Materiais (Playwright + templates)
2. Layout Inference UI (consome pacote já existente)
3. Academia UI (consome schema seedado)
4. DAM UX completo
5. Knowledge Base RAG
6. Portal de Distribuidores

Cada módulo:
- Vira 1 sprint de 2 semanas (Sprint 5 estende pra 3 por risco)
- Tem cost ceiling explícito por tenant/dia
- Tem gate de saída que precisa de aprovação humana
- Roda /hm-engineer + /hm-qa + /hm-designer antes de marcar done

**Fora de escopo da Fase 2** (Fase 3):
- CRM agro
- BI / dashboards
- Integração ERP / Safra
- WhatsApp Business
- Compliance regulatório automatizado

## Alternativas consideradas

### A. Construir tudo em paralelo
Rejeitada. Sem schema novo significativo, mas com 6 superfícies UI distintas, paralelizar gera retrabalho de design, conflitos de merge e impossibilidade de gates incrementais. Fundador é solo + agentes — paralelismo > 2 trilhas perde qualidade.

### B. Pular Geração de Materiais e ir direto pro RAG
Rejeitada. RAG é o módulo de maior risco (qualidade de resposta em campo agrícola = responsabilidade técnica). Começar pelo módulo mais arriscado sem aquecer o time/agente é receita de retrabalho. Geração de Materiais é stack madura, baixo risco, ROI imediato — sprint ideal pra estabelecer cadência.

### C. Adicionar CRM já na Fase 2
Rejeitada. CRM agro requer entendimento profundo do funil comercial Argho atual, integração com pipeline de vendas existente, e provavelmente integração com WhatsApp. Escopo que merece /hm-init próprio na Fase 3.

### D. Substituir Playwright por Puppeteer ou react-pdf
Rejeitada. Playwright já decidido em ADR 0008. Trade-offs auditados. Sem motivo pra reabrir.

## Consequências

### Positivas
- Fundação não muda — zero risco de quebrar produção
- Cada sprint produz valor demonstrável (PDF, blueprint, trilha completa, asset catalogado, resposta RAG, distribuidor ativo)
- Cost ceilings desde o dia 1 evitam supresas em billing Anthropic/Voyage/Cohere
- Gates obrigatórios entre sprints garantem qualidade antes de empilhar

### Negativas
- Distribuidores esperam até Sprint 6 (~3 meses). Mitigação: entregar acesso manual via login direto no portal atual pra 1-2 distribuidores piloto enquanto Sprint 6 não chega.
- RAG no Sprint 5 pode estender e atrasar Sprint 6. Aceito como risco conhecido.

### Riscos críticos endereçados
- **RLS bypass entre tenants:** RLS test suite virou pré-requisito hard de Sprint 6 (não pode ir pra produção sem isso)
- **RAG resposta errada agrícola:** disclaimer obrigatório + citação de fonte + eval suite com agrônomo + gate de saída exige validação manual de 20 perguntas reais

## Sinal de cumprimento

Fase 2 entregue quando todos os 6 gates forem aprovados explicitamente pelo fundador, com tag git `phase-2-complete` na main e auditoria final /hm-engineer com zero CRÍTICOS.

## Referências

- `docs/PHASE-2/ROADMAP.md` — plano operacional
- `STATUS.md` — estado da Fase 1 ao início da Fase 2
- ADR 0001 — Layout Inference Engine (Sprint 2)
- ADR 0006 — Trigger.dev (Sprints 1 e 5)
- ADR 0008 — Playwright como engine de PDF (Sprint 1)
- ADR 0009 — Voyage-3 + reranker (Sprint 5)
