# Prompt inicial para o Claude Code

Cole o texto abaixo (entre as linhas tracejadas) como **primeira mensagem** ao Claude Code, depois de rodar `claude` dentro da pasta `colheita`.

O Claude Code vai ler todo o histórico desta conversa via os arquivos do projeto e executar a continuação automaticamente.

---

```
Sou Wilson, CEO da Argho Agrosciences. Este projeto é a fundação do Programa
Colheita Argho, gerada via /hm-init em conversa anterior no Claude.ai.

Antes de qualquer coisa, leia nesta ordem:
1. CONTEXT.md — handoff completo da conversa de planejamento
2. README.md — quick start
3. STATUS.md — o que está pronto e o que falta
4. ARCHITECTURE.md — stack e princípios
5. docs/DECISIONS/audits/2026-04-23-hm-engineer.md — relatório de auditoria

Depois execute a Fase A descrita em CONTEXT.md (fechar /hm-engineer):

1. M5 — RLS test suite com testcontainers (CRÍTICO: valida isolamento multi-tenant)
2. M1 — GitHub Actions CI bloqueante
3. M2 — packages/tokens com tipo TenantThemeTokens
4. M3 — migration particionando audit_events com pg_partman
5. B1 — packages/config/pricing.ts versionado
6. A6 resto — checks jsonb_typeof nas migrations 0004, 0005, 0006

Regras:
- Cada item vira um commit separado seguindo Conventional Commits
- Rode os testes antes de cada commit
- Atualize STATUS.md movendo items concluídos
- Crie ADRs novos pra decisões arquiteturais não-triviais
- Se algo não estiver claro no contexto, pergunte em vez de inventar
- Padrão é world-class — não shippe trabalho que não mostraria com orgulho
- Não execute Fase B (/hm-designer) sem minha aprovação após Fase A

Comece lendo os arquivos. Depois me confirme o entendimento antes de executar.
```

---

## Antes de colar o prompt, garanta que:

1. ✅ Você está dentro da pasta `colheita` no PowerShell
2. ✅ Rodou `git init && git add . && git commit -m "feat: fundação inicial via /hm-init"`
3. ✅ Rodou `pnpm install` (vai baixar todas as dependências — demora 2-5 minutos)
4. ✅ Configurou variáveis de ambiente:
   - Copiou `.env.example` pra `.env.local`
   - Copiou `infra/docker/.env.example` pra `infra/docker/.env`
   - Adicionou sua chave da Anthropic em `ANTHROPIC_API_KEY` no `.env.local`

5. ✅ Rodou `claude` e está dentro do Claude Code

## Depois de colar o prompt

O Claude Code vai:
1. Ler todos os arquivos de contexto
2. Confirmar entendimento contigo
3. Executar M5 (RLS test) → commit → M1 (CI) → commit → ...
4. Pedir aprovação antes de avançar pra Fase B (`/hm-designer`)

Se em algum ponto ele travar ou pedir uma decisão que você não sabe responder, manda screenshot ou texto aqui no Claude.ai e eu te ajudo a desbloquear.
