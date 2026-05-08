# Fase 2 — Programa Colheita Argho

**Status:** Iniciada em 2026-05-07
**Owner:** Wilson Dall Agnol (fundador)
**Pré-requisito:** Fase 1 concluída (PIM no ar em colheita.arghoagrosciences.com com 18 produtos, multi-tenant, auth hook, RLS, 21 testes vitest)

---

## 1. Princípio de escopo

A Fase 2 fecha o gap entre **"PIM público read-only"** (estado atual) e **"plataforma operacional interna multi-tenant"** (visão original de abril/2026).

Nenhum módulo da Fase 2 introduz nova fundação. Todos consomem schema, auth e tenancy já em produção. O trabalho é **majoritariamente UI sobre dados que já existem**, mais um worker de geração de PDF que é a única peça de infra nova.

**Fora de escopo da Fase 2** (entram em Fase 3):
- CRM agro completo
- BI / dashboards de inteligência de mercado
- Integração ERP / Safra
- WhatsApp Business
- Compliance regulatório automatizado

---

## 2. Módulos da Fase 2

Ordem definida por **ROI / risco / dependências**, não por preferência:

| # | Módulo | ROI | Risco técnico | Dependências |
|---|---|---|---|---|
| 1 | Geração de Materiais | Alto | Baixo (stack madura) | PIM (pronto) |
| 2 | Layout Inference UI | Alto | Médio (modelo de visão) | Geração (#1) |
| 3 | Academia UI | Médio | Baixo | Schema seedado (pronto) |
| 4 | DAM UX completo | Médio | Baixo | Storage (pronto) |
| 5 | Knowledge Base RAG | Alto | Alto (embedding pipeline + qualidade) | pgvector (pronto), DAM (#4) |
| 6 | Portal de Distribuidores | Alto | Médio (auth externa, perms) | Todos acima |

---

## 3. Sprint plan

Cada sprint = 2 semanas. Cada módulo tem **gate de validação** antes do próximo começar.

### Sprint 1 — Geração de Materiais (PDF/PNG print-ready)
**Entrega:** marketing roda 1 botão no admin, sai PDF de ficha técnica do Xcensis branded Argho, salvo em `generated_materials`, downloadável.

**Stack adicional:**
- `@colheita/generator` — pacote novo, Playwright server-side em worker dedicado
- Trigger.dev v3 — fila de geração (já decidido em ADR 0006)
- 1 template inicial: `ficha-tecnica` consumindo PIM real

**Definition of Done:**
- 18 produtos do catálogo geram PDF sem erro
- PDF passa validação visual (paleta Argho, tipografia Geist 700, tokens CSS aplicados)
- Tempo médio < 8s por geração (Playwright cold start incluído)
- Cost ceiling: $0 (Playwright local, sem API externa)
- Worker tem retry policy (max 2) e timeout 30s
- Material gerado é versionado (toda versão salva em `generated_materials`, sem overwrite)
- 1 ADR novo: `0015-generator-template-system.md` (estrutura de templates, naming, registry)

**Gate de saída:** designer Argho aprova qualidade do PDF lado a lado com a referência Xcensis original.

---

### Sprint 2 — Layout Inference UI
**Entrega:** marketing sobe imagem de referência, sistema extrai blueprint, mostra editor lado a lado, gera material com identidade Argho.

**Stack adicional:** nenhuma — pacote `@colheita/layout-inference` já existe e tem testes. Falta só superfície UI.

**Definition of Done:**
- Rota `/admin/inspiracoes` lista referências subidas
- Upload aceita PNG/JPG/PDF (1-página), salva em `assets`, vincula a `layout_references`
- Pipeline dispara: análise Claude Sonnet vision → blueprint salvo → status `draft`
- Editor mostra referência ↔ blueprint extraído (regiões, hierarquia, paleta detectada)
- Usuário ajusta blueprint, marca como `reviewed` → `approved`
- Botão "Gerar com identidade Argho" dispara Sprint 1 worker com blueprint como input
- Cost ceiling: **$0.05 por análise**, **$10 por tenant/dia** (hard stop)
- Métricas registradas: tokens, duração, USD por análise (já tem schema)

**Gate de saída:** 5 referências reais (3 concorrentes + 2 históricas Argho) viram materiais Argho aprovados pelo fundador.

---

### Sprint 3 — Academia UI
**Entrega:** equipe interna acessa trilhas, lê lições, marca progresso. Sem certificação formal ainda (Sprint 5).

**Stack adicional:** nenhuma — schema seedado tem 2 trilhas + 7 lições.

**Definition of Done:**
- Rota `/academia` lista trilhas do tenant
- Trilha abre em layout editorial (mesma identidade do portal)
- Lição renderiza markdown + assets do DAM
- Progresso por usuário salvo em `user_lesson_progress`
- Gate por pré-requisito (lição 2 trava se lição 1 não foi completada)
- Cost ceiling: $0 (sem AI nesta sprint)

**Gate de saída:** 1 vendedor da Argho percorre trilha completa "Linha Xcensis" sem suporte.

---

### Sprint 4 — DAM UX completo
**Entrega:** upload, busca, tagging, versionamento de assets. Single source of truth visual.

**Stack adicional:** nenhuma — Supabase Storage + tabela `assets` já em prod.

**Definition of Done:**
- Upload drag-and-drop em `/admin/midias`
- Busca por nome, tag, categoria, produto vinculado
- Versionamento: nova upload com mesmo nome cria v2, v1 fica como `superseded`
- Vinculação asset ↔ produto (many-to-many via `product_assets`)
- Direitos de uso documentados em metadata (jsonb)
- Cost ceiling: $0 base + Storage Supabase ($0.021/GB)

**Gate de saída:** 50 assets reais (hero shots dos 18 produtos + logos + ícones) catalogados e taggeados.

---

### Sprint 5 — Knowledge Base RAG
**Entrega:** "Tenho soja com deficiência de Zn no Mato Grosso, o que indicar?" → resposta com produto + dose + janela + fonte.

**Stack adicional:**
- Embedding pipeline (Trigger.dev): chunk PIM + Academia → embeddings → pgvector
- Provider: Voyage-3 (já decidido em ADR 0009)
- Reranker: Cohere Rerank v3 ou Voyage Reranker

**Definition of Done:**
- Pipeline indexa 18 produtos + 7 lições + assets com texto extraído
- HNSW index funcional (`match_*` functions já em prod)
- UI `/admin/conhecimento` com chat
- Toda resposta cita fonte (produto, lição, asset)
- Cost ceiling: **$0.0001 por embedding**, **$0.005 por pergunta**, **$5 por tenant/dia**
- Eval suite com 30 perguntas reais agro, ground truth marcada manualmente, métrica de acerto > 80%

**Gate de saída:** agrônomo da Argho valida 20 respostas de campo reais. Aprovação direta.

---

### Sprint 6 — Portal de Distribuidores
**Entrega:** distribuidor faz login externo, acessa fichas dos produtos da sua linha, baixa materiais brandeded, abre ticket técnico.

**Stack adicional:**
- Tabela `distributor_users` (extends auth.users) com perms granulares
- Magic link já funciona — só adicionar fluxo de convite
- Tabela `support_tickets` (mínima: subject, body, status, priority)

**Definition of Done:**
- Tenant Argho cadastra distribuidor → email convite
- Distribuidor faz login → vê só produtos vinculados ao seu cadastro
- Download de materiais registra audit event (quem, quando, qual)
- Ticket abre, vai pra fila do tenant, notifica responsável
- Cost ceiling: $0 base + email transacional ($0.001 por send via Resend)

**Gate de saída:** 1 distribuidor real Argho usa portal por 1 semana. NPS > 8.

---

## 4. Cost ceilings consolidados (por tenant/dia)

| Item | Limite hard | Limite soft (alerta) |
|---|---|---|
| Layout Inference (vision) | $10 | $5 |
| Knowledge Base (embeddings + queries) | $5 | $2 |
| Storage (DAM) | sem hard limit, alerta em 50GB | 20GB |
| Email transacional (distribuidores) | 1000 sends | 500 |

**Telemetria obrigatória:** toda chamada a API externa registra em `tenant_usage_quotas` (criar se não existir). Worker checa cota antes de despachar.

---

## 5. Stack additions (resumo)

Nada de fundação nova. Apenas:

- `@colheita/generator` (pacote novo, Sprint 1) — Playwright + templates
- Trigger.dev v3 conectado em prod (ADR 0006 já decidiu, falta deploy)
- Voyage-3 + reranker (ADR 0009 já decidiu, falta integrar)
- Resend conectado em prod (Sprint 6)

Tudo o resto é **UI consumindo schema existente**.

---

## 6. Validações e gates entre sprints

Após cada sprint:

1. **/hm-engineer** roda no código novo do sprint (zero CRÍTICO permitido pra avançar)
2. **/hm-qa** valida edge cases e fluxos do usuário
3. **/hm-designer** valida identidade visual antes de marcar como done
4. **Gate de saída do sprint** (definido acima) precisa ser explicitamente aprovado pelo fundador
5. Commit final do sprint com tag `phase-2-sprint-N` no git

Sem atalhos. Se gate falha, sprint estende — não pula.

---

## 7. Riscos identificados

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Playwright cold start em serverless | Média | Alto (UX lenta) | Worker dedicado long-running em vez de Vercel Functions |
| Vision model falha em PDFs complexos | Alta | Médio | Pipeline aceita imagem renderizada como fallback |
| RAG dá resposta errada em campo agrícola | Média | **CRÍTICO** (responsabilidade técnica) | Toda resposta cita fonte + disclaimer obrigatório + eval suite com agrônomo |
| Custo de embedding explode em re-indexação total | Baixa | Alto | Indexação incremental por hash, nunca full reindex automático |
| Distribuidor vê produto de outro tenant (bug RLS) | Baixa | **CRÍTICO** | RLS test suite obrigatória antes de Sprint 6 (faltava da Fase 1, virou bloqueador) |

---

## 8. Marcos temporais (estimativa)

- **Sprint 1:** 2026-05-08 → 2026-05-21 (Geração de Materiais)
- **Sprint 2:** 2026-05-22 → 2026-06-04 (Layout Inference UI)
- **Sprint 3:** 2026-06-05 → 2026-06-18 (Academia UI)
- **Sprint 4:** 2026-06-19 → 2026-07-02 (DAM UX)
- **Sprint 5:** 2026-07-03 → 2026-07-23 (Knowledge Base RAG — sprint estendido por risco)
- **Sprint 6:** 2026-07-24 → 2026-08-06 (Distribuidores)

**Conclusão prevista da Fase 2:** 2026-08-06 (~3 meses).

Adiamentos esperados: Sprint 5 (RAG) tem alta probabilidade de estender. Demais sprints são bem mapeados.

---

## 9. Definition of Done — Fase 2 inteira

Fase 2 está concluída quando:

- [ ] Marketing Argho gera 100% dos materiais comerciais via Colheita (zero Canva/PowerPoint paralelo)
- [ ] Equipe interna fez onboarding completo via Academia (8 vendedores treinados)
- [ ] DAM tem 100% dos assets oficiais Argho catalogados
- [ ] Knowledge Base responde dúvidas técnicas internas com > 80% de acerto
- [ ] Pelo menos 3 distribuidores ativos no portal
- [ ] Zero CRÍTICOS abertos na auditoria /hm-engineer
- [ ] RLS test suite obrigatória rodando no CI (gate da Fase 3)

---

## 10. Próxima ação

**Sprint 1 começa com `/hm-init` específico do módulo `@colheita/generator`.**

Comando inaugural:
```
/feature-dev:feature-dev sprint-1-generator
```

Antes disso: revisão deste roadmap pelo fundador, aprovação explícita, commit inicial deste documento + ADR 0015 na main.
