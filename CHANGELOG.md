# Changelog — Programa Colheita / Argho

Tudo que muda em prod fica aqui. Formato segue [Keep a Changelog](https://keepachangelog.com/).
Versionamento por **data + sprint** (sem semver — projeto interno single-tenant).

---

## Sprint 2026-05-23 #3 — Hardening pós-auditoria hm-engineer + perf

**Foco**: aplicar 12 findings da auditoria hm-engineer no portal
distribuidor (3 críticos, 4 altos, 5 médios) + perceived perf + SEO.
Resultado: 8 commits + 4 migrations (0039–0042).

### Corrigido — críticos (auditoria)

- **Migration 0039**: ADD COLUMN `source` em `conversation_logs`.
  Sem ela, todo turno de chat IA do portal falhava persistência em
  prod silenciosamente e o histórico ficava sempre vazio. Index
  parcial `user_source_created` pra histórico filtrado. (`d5c96e1`)
- **`changePassword` sessão hijack**: `signInWithPassword` no client
  do cookieStore sobrescrevia JWT/refresh_token da sessão atual.
  Novo `createIsolatedClient()` usa `@supabase/supabase-js` direto
  com `persistSession=false` — verifica posse sem tocar cookies.
  (`d5c96e1`)
- **Rate limit em 6 server actions**: changePassword (5/h),
  updateProfile (20/h), createSupportTicket (10/h — caro pq dispara
  email Resend), replyToOwnTicket (30/h), exportMyData (2/h — 9
  selects paralelos), requestAccountDeletion (1/h — anti-spam LGPD).
  Reusa `buildRateLimiter` existente (Upstash Redis, fail-open dev).
  (`d5c96e1`)

### Corrigido — altos (auditoria)

- **`escapeHtml` no email Resend**: user.email, productSlug,
  CATEGORY_LABEL e URGENCY_LABEL agora escapados antes de
  interpolar no HTML pro time interno Argho. Defesa contra
  spear-phishing via campos do form. (`d5c96e1`)
- **Migration 0040**: REVOKE UPDATE total + GRANT UPDATE (read_at)
  em notifications. PostgREST direto não pode mais envenenar
  title/body/link das próprias notif. (`d5c96e1`)
- **LGPD subject slice**: emails RFC5321 podem ter até 254 chars,
  estourando CHECK 4-200 do `support_tickets.subject`. Slice
  defensivo `subject.slice(0, 200)`. (`d5c96e1`)
- **SELECT join sem email staff**: `/conta/suporte/[id]` embed
  pega só `full_name` (sem email). Evita leak de emails da equipe
  Argho via spear-phishing target list. (`d5c96e1`)

### Corrigido — médios (auditoria)

- **Migration 0041**: SET search_path = public, pg_temp nas 3
  funções SECURITY DEFINER (0037, 0038). Hardening Supabase. (`3bb064b`)
- **revalidatePath('/', 'layout') em mark-read**: badge bell no
  TopNav/sidebar vinha do layout SSR — sem revalidate, mostrava
  contagem stale até próxima nav. (`3bb064b`)
- **`getUnreadNotifsCount` via `unstable_cache`**: cada page nav
  fazia query DB extra pro badge. Cache TTL 30s tagged como
  `notif:${userId}`, invalidado em mark-read via `revalidateTag`.
  Latência -150ms por nav, custo Supabase auth -10x em sessões
  navegadas. Espelho admin+portal pra simetria. (`58837a2`)
- **SSE chat IA com abort signal**: `request.signal` +
  `ReadableStream.cancel()` marcam flag `aborted` — loop for-await
  quebra early. Sem isso, fechar aba no meio da geração deixava
  Anthropic streamando tokens órfãos = $ desperdiçado. (`4a7671f`)
- **Migration 0042**: materializa `lessons_count` em learning_tracks
  via trigger AFTER INSERT/DELETE + AFTER UPDATE OF track_id.
  Substitui join triple-nested no `/conta/academia`. 10k rows → 250
  em 50 tracks. (`8d1f001`)

### Adicionado

- **`robots.ts` + `sitemap.ts`** portal: SEO Next.js convention.
  Bloqueia `/conta/*`, `/entrar`, `/auth/*`, `/api/*`. Sitemap
  dinâmico com até 500 produtos publicados (`lastmod=updated_at`).
  Fallback resiliente se Supabase indisponível em build. (`b519959`)
- **`loading.tsx` skeletons granulares** pra `/conta/pedidos`,
  `/conta/suporte`, `/conta/academia` (mimica layout final pra
  perceived perf melhor que skeleton global). (`cd7b01d`)

### Pendências de prod (Wilson — manual)

- Aplicar 9 migrations encadeadas via psql DATABASE_URL_DIRECT:
  `0034 + 0035 + 0036 + 0037 + 0038 + 0039 + 0040 + 0041 + 0042`
  (doc em `apps/admin/docs/aplicar-migration-0034.md`)
- Reindex RAG: `pnpm --filter @colheita/jobs reindex-all`
- Env vars Vercel:
  - `UPSTASH_REDIS_REST_URL` + `_TOKEN` (rate limit fail-open sem)
  - `SUPPORT_INBOX_EMAIL`, `NEXT_PUBLIC_ACADEMIA_URL`
  - `GEMINI_API_KEY` (admin)
  - Confirmar `ANTHROPIC_API_KEY` + `RESEND_API_KEY`

---

## Sprint 2026-05-23 #2 — Plataforma Colheita (portal distribuidor end-to-end)

**Foco**: fechar gaps do portal distribuidor pra rodar ciclo completo sem
admin Argho. Resultado: 13 commits cobrindo perfil/senha/pedidos/academia
no portal, suporte humano end-to-end (admin + portal + thread + email +
notif), inbox unificada, LGPD self-service, histórico IA.

### Adicionado

#### Conta do distribuidor (portal)

- **`/conta/perfil`** + `/conta/senha`: edição de full_name/phone/company
  (merge em `users.preferences` jsonb) + troca de senha com verificação
  da posse via `signInWithPassword` (defesa session hijack). Email
  read-only (chave de login Supabase). (commit `8f67aa7`)
- **`/conta/academia`**: hub de trilhas + certificações com progresso por
  trilha calculado de `learning_progress`. Cards linkam pro app Academia
  externo via `NEXT_PUBLIC_ACADEMIA_URL`. (commit `289ab62`)
- **`/conta/pedidos`** + `/conta/pedidos/[id]`: lista paginada (20/pg)
  com filtros status + detalhe completo com itens, subtotal/desconto,
  observações Safra. RLS + filtro `distribuidor_id` explícito como
  defesa em profundidade. (commit `58d530e`)
- **`/conta/assistente/historico`**: distribuidor revisa próprias
  conversas com IA, filtra por user_id + source=portal + status (OK
  + no_context). Warning amarelo "fale com agrônomo humano" quando
  RAG não achou contexto. (commit `0f796f9`)
- **`/conta/privacidade`** LGPD self-service: exportMyData agrega
  perfil/orders/academia/tickets/AI/notif em JSON e baixa via Blob
  URL (art 18 V portabilidade). requestAccountDeletion cria
  support_ticket categoria platform urgency high — time Argho
  verifica identidade + anonimiza em 15 dias úteis (art 18 IV).
  (commit `99ece75`)

#### Suporte humano end-to-end

- **Migration 0036** (`support_tickets.sql`): tabela + 3 enums
  (status/urgency/category) + 3 RLS policies + trigger updated_at.
- **Migration 0037** (`support_ticket_messages.sql`): thread de
  mensagens com `is_internal` (nota privada staff) + `is_from_staff`.
  Trigger SQL atualiza status pai automático:
  - user responde ticket waiting_user → vira in_progress
  - staff envia msg pública → vira waiting_user
- **`/conta/suporte`** portal: form com 6 categorias, 4 urgências,
  campo produto opcional (deep-link de `/produtos/[slug]` via
  `?produto=slug`). Email best-effort pro SUPPORT_INBOX_EMAIL via
  Resend. Lista 10 últimos chamados. (commit `5352486`)
- **`/conta/suporte/[id]`** portal: thread com mensagens, badge
  Argho em respostas staff, reply form que valida ownership e
  status != closed. (commit `f2d5cef`)
- **`/suporte`** admin: lista paginada (30/pg) com counters por
  status, filtros, ordem urgency DESC + created_at DESC. Sidebar
  ganhou item "Suporte" ícone LifeBuoy. (commit `06371e4`)
- **`/suporte/[id]`** admin: thread com badge "NOTA INTERNA"
  tracejado amarelo, status select inline com useTransition, reply
  form com checkbox is_internal. Email pro distribuidor quando
  staff responde publicamente. Audit log com 4 novos AuditAction
  enums. **Auto-assign** na primeira resposta staff sem assignee
  (race-safe via WHERE `assigned_to IS NULL`). (commit `06371e4`)
- **CTAs no detalhe do produto**: distribuidor logado vê 3 botões:
  ↓ Ficha Técnica + ✨ Agrônomo IA + Falar com agrônomo humano
  (deep-link com produto pre-populado). (commit `1019d66`)

#### Inbox unificada de notificações

- **Migration 0038** (`notifications.sql`): tabela `notifications`
  + 2 triggers SECURITY DEFINER no Postgres:
  - `trg_notify_on_ticket_message`: staff publica → notif pro
    distribuidor; user responde → notif pro assignee
  - `trg_notify_on_certification_issued`: certification.issued
    com link `/conta/academia`
- **Portal**: sino com badge (99+) no TopNav visível em layouts
  conta+public quando logado. `/conta/notificacoes` separa unread/
  read + "Marcar todas como lidas". (commit `dc488b4`)
- **Admin**: `lib/notifications.ts` ganhou kind `personal` que
  agrega notif do DB. `/notificacoes` inbox pessoal completa.
  Sidebar mostra intercaladas com operacionais. (commit `345d4f4`)

### Pendências de prod (Wilson — manual)

- Aplicar 5 migrations encadeadas via psql DATABASE_URL_DIRECT:
  `0034 + 0035 + 0036 + 0037 + 0038`
  (doc em `apps/admin/docs/aplicar-migration-0034.md`)
- Reindex RAG: `pnpm --filter @colheita/jobs reindex-all`
- Env vars Vercel:
  - `SUPPORT_INBOX_EMAIL` (default `suporte@arghoagrosciences.com`)
  - `NEXT_PUBLIC_ACADEMIA_URL` (URL do app Academia em prod)
  - `GEMINI_API_KEY` (admin)
  - Confirmar `ANTHROPIC_API_KEY` + `RESEND_API_KEY`

---

## Sprint 2026-05-22/23 — Ciclo de melhoria contínua (Argho + Colheita)

**Foco**: ciclo autônomo pedido pelo fundador "até amanhã 9h, intervalo
máx 2min entre ações". Resultado: 20+ commits em 12h cobrindo mobile
responsivo de 3 apps, IA agronômica PhD, Nano Banana Pro, sync RAG,
compliance MAPA biológicos. Workflow: ciclos de ~30min via ScheduleWakeup,
cada ciclo entregando ≥1 commit validado em prod.

### Adicionado

- **Migration 0034 (`fichas_tecnicas_sync.sql`)**: DO block idempotente
  PostgreSQL pra UPSERT 4 produtos novos (Bovex, Controx, Nemax, Titan) +
  UPDATE composição correta de Troian (era Trichoderma+Bacillus, é
  multi-Bacillus subtilis+velezensis+amyloliquefaciens). Resolve gap RAG
  documentado em `apps/admin/docs/rag-supabase-sync.md`. Aplicação:
  `psql $DATABASE_URL_DIRECT -f infra/supabase/migrations/0034_fichas_tecnicas_sync.sql`
  seguido de `pnpm --filter @colheita/jobs reindex-all`. (commits `c5e630c`,
  `1d6c861`)
- **`@colheita/image-gen` (Nano Banana Pro)**: package novo com provider
  Gemini 2.5 Flash Image preview (`@google/genai 2.6.0`). Endpoint admin
  `/api/imagens/gerar` POST com auth + rate limit 10/min/user + maxDuration
  60s. UI `/imagens` completa com form (prompt, negative, aspect ratio,
  num imagens 1-4), 3 templates rápidos, preview inline com download PNG,
  error handling gracioso (link direto pro AI Studio se key faltando).
  Sidebar admin ganhou item "Imagens IA · Nano Banana". (commits `fc9ba91`,
  `bff8b57`)
- **Status operacional `/configuracoes`** expandido: novos checks pra
  Gemini Nano Banana + Resend, refinamento Embeddings com provider
  ativo (Voyage/OpenAI). (commit `81dd9b6`)
- **ReindexButton com follow-up**: aviso vermelho se provider mock
  detectado, link "Testar no Assistente IA →" após sucesso. (commit
  `b27bbc2`)

### Corrigido

- **IA agronômica PhD**: system prompt do `AiGenerator` reescrito como
  "Agrônomo Argho — Doutor em Fertilidade de Solos, Fisiologia Vegetal
  e Biológicos". Portfólio Argho memorizado (20 produtos com composição
  + janela fenológica), combinações estratégicas do Programa Argho
  (Stron→Impuch, Stron+MoB+, Lifeon+Biovas), restrições regulatórias
  inegociáveis pros 6 biológicos. AdminChatPanel envia `contextPath`
  via usePathname → agente tem awareness da rota. INITIAL_MESSAGES +
  SUGGESTED_QUERIES reescritos pra simular perguntas de campo real.
  (commits `a2e5820`, `1d6c861`)
- **Compliance MAPA renderer alternativo** nos 3 lugares (site/admin/
  portal): detecta `product_type === 'Complexo microbiológico'` e
  renderiza "Composição microbiológica" como lista de espécies em
  itálico (sem `1%` inadequado pros 6 biológicos). (commits `16c6ee3`,
  `d65998a`)
- **Mobile responsivo profundo** (site institucional, admin, portal):
  - Site: 15 classes em `apps/website/src/app/globals.css` com `@media
    max-width:768px` (hero-grid, sidebar-hero-right, sobre-metrics-grid,
    slug-app-grid etc).
  - Admin: sidebar fixa 240px vira drawer off-canvas com hamburger
    trigger + backdrop (packages/ui/sidebar.tsx). Tables com grid
    inline-style viram cards verticais com labels via `::before content`
    (`/pedidos/[id]` items, `/materiais/historico`, `/assistente/
    historico`, `/leads`). AgentDock pill vira icon-only + panel
    quase-fullscreen.
  - Portal: TopNav padding reduzido + nav itens com scroll horizontal
    isolado, headlines redimensionados, grids 2col viram 1col, footer
    grid vira 1col. (commits `2a6f302`, `15cb15d68`, `f5f46f8`, `d42ed26`,
    `bca40e4`, `f823daf`, `311d337`, `b72497a`, `74ac3f6`)
- **products.ts conforme 16 fichas técnicas oficiais Argho**: composições
  precisas dos 16 produtos atuais (Defon Cu 5,5%+S 2,5%, Grow Calcium
  Ca 5,5%, Grow MoB+ Mo 7%+B 8%+P2O5 24%, etc), correção composições
  erradas de Bovex/Controx/Troian, adição de 4 novos (Titan, Grow
  Filling, Grow NitroP, Up Soil). Portfolio 16→20 produtos. Tagline
  reescritas usando as frases técnicas de posicionamento das próprias
  fichas. (commit `db631e2`)
- **Site institucional bloqueia Plataforma Colheita**: feature flag
  `FEATURES.colheitaPlatform = false` (lib/features.ts) esconde 6 pontos
  (nav header, footer link, hero CTA, seção dedicada inteira ~250 linhas,
  /sobre CTA dupla). Plataforma continua acessível via URL direta, só
  não exposta publicamente. Reativação trivial: muda flag pra true.
  (commit `814bf7f`)

### Doc

- `apps/website/docs/biologicos-compliance.md`: referência completa pra
  futuras edições não regredirem (Lei 6.894/80, Decreto 4.954/04, Lei
  7.802/89, Lei 15.070/24 marco bioinsumos).
- `apps/admin/docs/rag-supabase-sync.md`: documenta gap RAG + 2 opções
  de sync (migration SQL ou script TS) + decisões pendentes.
- `apps/admin/src/components/produtos/produto-form.tsx`: helper hints
  inline + exemplos JSON contextuais pra `product_type`.

### Pendências do fundador

- Aplicar migration `0034_fichas_tecnicas_sync.sql` em prod via psql
  Supavisor session mode + rodar `pnpm --filter @colheita/jobs reindex-all`
  (custo ~$0,02 Voyage embeddings).
- Setar `GEMINI_API_KEY` em `apps/admin/.env.local` e Vercel project
  `colheita-admin` (pega em https://aistudio.google.com/apikey).
- Confirmar `ANTHROPIC_API_KEY` setado em prod pra IA agronômica
  responder.
- Confirmar se "N-Import" é o mesmo produto que Grow NitroP ou outro
  produto separado (ficha técnica não disponível ainda).

---

## Sprint 2026-05-21 — Heart video saga (site institucional)

**Foco**: corrigir display do coracao digital Argho em iPhone Safari. 9
commits ao longo do dia, cada fix revelando o proximo problema.

### Corrigido

- **Heart video sumindo no iPhone**: a saga em camadas — RESOLVIDO em prod.
  1. **Bg off-white visivel** (`037d744`, `8d27942`): video tinha bg
     `RGB(253,253,253)` (uniforme em quadrados grandes que pareciam checker
     no iPhone vs page `#ffffff`). Pipeline ffmpeg final usa filtro `geq`
     condicional: pixels grayscale (R=G=B) >= 250 viram 255 puro, pixels
     coloridos (heart com leve variacao RGB) ficam intactos. Doc em
     `apps/website/docs/heart-video-pipeline.md`.
  2. **WebM container ignorado por iOS < 17.4** (`6fbe42c`): root cause real.
     iOS Safari antigo nao suporta container WebM (mesmo com VP9 dentro) —
     video element ficava sem source utilizavel. Fix: gerar MP4 H.264
     Constrained Baseline + yuv420p + faststart como fallback. Adicionado
     como segundo `<source>` em hero-heart.tsx e heart-intro.tsx.
  3. **`aspect-ratio` CSS falhando em iOS antigo** (`619a787`): container
     colapsava pra altura 0 -> video invisivel. Fix: `padding-bottom: 150%`
     hack (funciona desde 2010 em qualquer browser) + poster como
     `background-image` no container como fallback ultimo nivel.
  4. **Nesting do padding-bottom hack** (`e9dd4d9`): bug sutil — `padding-
     bottom %` eh relativo ao **pai do container**, nao ao container. Como
     o pai (grid column) podia ser maior que `maxWidth: 560`, aspect ratio
     quebrava em desktop. Fix: separar em dois divs — externo limita
     largura, interno aplica padding-bottom.
  5. **Source order iOS Safari** (`783a5e1`): ultimo bug. Apos todos os
     fixes acima, video aparecia (poster) mas nao animava no iPhone. Causa:
     iOS Safari < 17.4 tenta carregar o primeiro `<source>` mesmo quando
     `type=webm` e ele nao suporta -> falha silenciosa -> fica em error
     state. Fix: inverter ordem. MP4 H.264 baseline PRIMEIRO, WebM segundo.
     Bonus: MP4 (2.0MB) eh ate menor que WebM (2.2MB) -> zero perda.

- **Componentes refatorados**:
  - `hero-heart.tsx`: removido glow ambient + SVG rings + shimmer dots
    (criavam halo difuso atras do video que aparecia como pattern no iPhone).
  - `heart-intro.tsx`: tudo branco — bg `#ffffff` + textos azul Argho + logo
    color + usa mesmo `argho-heart-hero.webm/mp4` do hero.
  - Hero section page.tsx: grid tecnico decorativo removido.

### Adicionado

- **Cache headers immutable** (`bd08215`) em `.webm`/`.mp4`/poster PNG via
  `next.config.ts headers()`. `max-age=31536000, immutable` — versionamento
  manual via filename quando mudar conteudo.
- **`apps/website/docs/heart-video-pipeline.md`**: documenta pipeline ffmpeg
  completo + 5 caminhos que NAO funcionaram (VP9-alpha, chromakey, lutrgb)
  pra nao repetir nas proximas iteracoes.

### Belt-and-suspenders final (3 camadas de fallback)

1. **MP4 H.264 Constrained Baseline** (primeiro `<source>`) — universal Apple
2. **WebM VP9** (segundo `<source>`) — modernos pra qualidade maxima
3. **Poster PNG** como `background-image` no container — visivel mesmo se
   ambos videos falharem completamente

Verificado em prod no iPhone do fundador: heart aparece + anima corretamente.

---

## Sprint 2026-05-20 — Polishing operacional

**Foco**: 10 itens de melhoria pos-MVP. Tira o admin de "shippable" pra
"client-ready".

### Adicionado

- **Sentry observability hardening**: warn 1x por processo em prod sem `SENTRY_DSN`
  setado; novo helper `isSentryEnabled()`; card "Status operacional" em
  `/configuracoes` com indicadores OK/OFF dos 4 integrations criticos (Sentry,
  Upstash, Anthropic, Embeddings). (commit `0996caa`)
- **`SETUP.md`** consolidado: guia passo-a-passo de Sentry, Upstash, Trigger.dev,
  Resend, PostHog em prod. Inclui snapshot do estado Argho atual.
- **Upload inline de MSDS/certificados** em `/produtos/[slug]`: dropdown de role
  (FISPQ/Certificado/Doc regulatorio/Foto/etc) + file input + upload via
  `/api/midias/upload` existente + `attachProductAsset` action. (`29c65ac`)
- **CRUD completo de regulatory_registrations** em `/compliance/novo` e
  `/compliance/[id]/editar`: form com produto, autoridade, numero, datas,
  status, doc URL, observacoes. Server actions `createRegistro`, `updateRegistro`,
  `updateRegistroStatus`, `softDeleteRegistro`. (`8795c29`)
- **User management UI com roles**: card "Permissoes" em `/distribuidores/[id]`
  com 7 checkboxes (tenant_owner, admin, product_manager, asset_manager,
  design_admin, academy_admin, sales). Action `setUserRoles` defensiva
  (verifica caller eh admin/tenant_owner + target no mesmo tenant). (`dfef0e9`)
- **Rate limiting** em todos endpoints custosos via `buildRateLimiter` helper:
  agent (15/min), catalogo (3/min), dossie (3/min), banner (10/min),
  ficha-tecnica (10/min), upload (30/min), reindex (2/5min), proposta (5/min).
  (`b7c6f6d`)
- **Inbox de notificacoes** no sidebar header: sino com badge de criticos +
  dropdown com alertas de compliance vencendo, leads parados >14d, geracoes
  com falha nas ultimas 24h. (`8f5fd80`)
- **Audit log consistente**: novo `lib/audit.ts` com helper `logAuditEvent`
  + cobertura em 20+ actions (produtos CRUD, leads CRUD, categorias CRUD,
  regulatorio CRUD, distribuidores invite/suspend/reactivate/setRoles,
  attach/detach product_asset). (`541d637`)
- **UI de historico de conversas IA** em `/assistente/historico`: 5 KPIs
  agregados + filtros por status + lista paginada com expansao de query/answer
  completos. Util pra debugar qualidade da IA. (`5c227b0`)
- **Troca de senha** logado em `/configuracoes`: form inline com senha atual
  (verificada via signInWithPassword) + nova + confirmar. (`bac5b37`)
- **Soft delete de produto**: botao "Excluir" no `ProdutoActions` com window.confirm,
  marca `deleted_at = now()` e volta pra /produtos. Audit trail preservado. (`bac5b37`)
- **Build job no CI**: roda `pnpm -r --filter "./apps/*" build` apos typecheck.

### Corrigido

- **JWT stale**: `/configuracoes` detecta sessao sem claims `tenant_id`/`roles`
  e mostra banner amarelo com botao explicito "Sair e entrar". (`e27016d`)
- **`createProduto` sem tenant_id**: insert falhava por NOT NULL + RLS. Fix:
  resolve tenant_id via lookup em users igual createCategoria/createLead. (`efd7ee8`)
- **`createColecao` sem tenant_id**: mesmo bug, mesma correcao.
- **Roles vazios em prod**: migration `0032` seed 7 system roles para tenant
  Argho + atribui todas ao admin + hook injeta `roles` array no JWT.
- **Hook RLS bypass**: migration `0033` adiciona `set row_security = off`
  no `app_custom_access_token_hook` (defesa em profundidade).
- **PostgREST injection** em 5 paginas: helper `sanitizeSearchQuery` aplicado
  em produtos, pedidos, distribuidores, midias, leads. (`53aae87`)
- **AI agent event types**: drift entre packages/ai (`delta`/`done`) e UI
  (`text_delta`/`sources`). Corrigido em 3 arquivos. (`edfa637`)
- **AdminChatPanel endpoint errado**: chamava `NEXT_PUBLIC_API_URL/api/v1/agent`
  (rota inexistente). Agora chama `/api/agent/ask` same-origin. (`edfa637`)
- **Links quebrados na home**: `/materiais` (404) -> `/materiais/historico`,
  Layout Inference shortcut `/assistente` -> `/layout-inference`. (`19f2e9b`)

### Migrations aplicadas em prod

- `0032_bootstrap_roles_and_hook.sql` — seed roles + hook injetando claims
- `0033_hook_bypass_rls.sql` — defesa em profundidade no hook

### Testes

- +10 cases de `sanitizeSearchQuery` (admin agora tem 30 testes)
- 512+ testes passando across 17 workspaces

---

## Sprint 2026-05-17/18 — Generator serverless + RAG retrieval

**Foco**: destravar Geracao de Materiais (PDF/PNG via Chromium serverless)
e RAG retrieval pos-Anthropic credits recarga.

3 bugs distintos na geracao PDF/PNG, cada fix revelou o proximo:

1. `Cannot find module 'playwright-core'` — pnpm strict nao expoe deps
   transitivas ao app. Fix (`5cbd9ba`): declarar como deps diretas.
2. `Pass userDataDir parameter to launchPersistentContext` — Playwright
   rejeita `--user-data-dir` em `launch()`. Fix (`449f214`): remover esse arg.
3. `libnss3.so: cannot open shared object file` — `@sparticuz/chromium` so
   extrai os .so quando detecta AWS Lambda. Vercel nao seta `AWS_EXECUTION_ENV`.
   Fix (`f31f83a`): `process.env.AWS_LAMBDA_JS_RUNTIME ??= 'nodejs20.x'`.

Bug RAG: agente respondia mas com `sources: []`. Causa: funcoes SQL
`match_*` filtravam por `tenant_id = app_tenant_id()` mas eram chamadas
via service_role (sem JWT). Fix (`9a14644`): migration `0030` adiciona
`p_tenant_id uuid` param + filtro `coalesce(p_tenant_id, app_tenant_id())`.

Security: 5 particoes de `audit_events` tinham RLS off (so o parent foi
habilitado em 0007) + grants pra anon em 0029. Fix: migration `0031`
habilita RLS + revoke nas particoes.

---

## Sprint 2026-05-09 — Auditoria /hm-engineer sprint 6

**Foco**: fechar findings da auditoria (PostgREST injection portal,
Playwright RAM leak, BI order/limit, DAM versioning sha256).

Detalhes em commits `21a5a7d` em diante. CRITICOS C1+C2 fechados.

---

## Pre-fundacao (2026-05-07)

MVP shipped: 9 camadas Fase 1 (Visual System, PIM, DAM, Generator, Layout
Inference, Academia LMS, Identity & Access, Multi-tenancy, Integracoes)
+ Camada 6 RAG/Knowledge Base. ~502 testes passando.

---

## Convencoes

- **Commits**: conventional commits (`feat(scope):`, `fix(scope):`, etc).
  Validados via lefthook pre-commit hook.
- **Co-Author**: todo commit assistido por IA inclui linha `Co-Authored-By: Claude...`.
- **Migrations**: numeradas sequencialmente em `infra/supabase/migrations/`.
  Aplicadas em prod via Postgres direct (pooler session mode) por causa do
  Supabase Free 2025+ que removeu DDL no schema auth via PAT.
