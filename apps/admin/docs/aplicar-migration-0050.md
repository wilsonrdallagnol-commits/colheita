# Aplicar a migration 0050 (Catálogo Argho 2026) — passo a passo

**O que já está no ar:** o site institucional (arghoagrosciences.com) já está com os dados do
catálogo 2026 — nomes, espécies, cepas, concentrações e imagens novas. Ele lê de arquivo estático,
então subiu junto com o deploy.

**O que falta:** o **portal** e o **admin** leem do Supabase, e o banco ainda tem os dados antigos
(Biovas, Bovex, Titan, sem CHROM). Este documento é para alinhá-los.

**Enquanto não rodar, nada quebra.** Os redirects dos slugs novos ficaram desligados de propósito
(`CATALOGO_2026_MIGRADO`), então o portal segue funcionando com os dados antigos.

---

## Antes de começar: o que você precisa em mãos

**A senha do banco.** No painel do Supabase, no projeto do Colheita (pelos meus registros o ID é
`htoqhomunwkrnizibusc` — confirme, é o que aparece na URL do painel):
**Settings → Database → Connection string**. Guarde a URI de conexão. Se não lembrar a senha, é
nessa mesma tela que se gera uma nova ("Reset database password").

> ⚠️ Use a porta **5432** (session mode), não a 6543. A 6543 não aceita o bloco `DO` que a
> migration usa — é o padrão já documentado neste projeto.

---

## Passo 1 — Aplicar a migration

Existem dois caminhos. **O A não exige instalar nada** e é o que eu recomendo, porque o `psql` não
está instalado nesta máquina (verifiquei).

### Caminho A — SQL Editor do Supabase (recomendado)

1. Abra o painel do Supabase, no projeto do Colheita
2. Vá em **SQL Editor** → **New query**
3. Abra o arquivo abaixo, selecione tudo e copie:
   ```
   C:\Users\Usuario\Desktop\colheita\infra\supabase\migrations\0050_catalogo_2026_produtos.sql
   ```
   (28 KB, 367 linhas — cabe de sobra numa query)
4. Cole no editor e clique em **Run**

**Deu certo se a última linha for esta:**

```
NOTICE:  Migration 0050 concluida: biologicos renomeados e corrigidos (+CHROM),
         organominerais e doses Operate alinhados ao catalogo 2026.
         RODAR AGORA: pnpm --filter @colheita/jobs reindex-all
```

Antes dela aparecem dois avisos normais, de contagem:

```
NOTICE:  Migration 0050: applications zerado em N produto(s).
NOTICE:  Migration 0050: N chunk(s) "application" removidos do pgvector.
```

**A migration se autoconfere no final.** Se algo tiver saído do esperado, ela emite `WARNING` em
vez de ficar em silêncio — por exemplo "esperava 8 biologicos, encontrei N", "N produto(s) ainda
com slug antigo" ou "N descricao(oes) ainda com termo corrigido". Se aparecer qualquer `WARNING`,
**pare e me mande o retorno**: significa que o banco estava num estado diferente do previsto.

Um `WARNING` é esperado e não impede nada: o que avisa que lições da Academia ainda citam
Biovas/Bovex. Esse conteúdo é texto de curso e precisa de revisão humana — me avise que eu trato.

### Caminho B — psql (só se você já usa)

Requer PostgreSQL client instalado (hoje não está). Com a URI em mãos:

```bash
cd /c/Users/Usuario/Desktop/colheita && psql "postgresql://postgres.<ID-DO-PROJETO>:<SENHA>@aws-0-sa-east-1.pooler.supabase.com:5432/postgres" -f infra/supabase/migrations/0050_catalogo_2026_produtos.sql
```

> A migration é **idempotente**: rodar duas vezes não duplica nem quebra nada.

---

## Passo 2 — Reindexar o agente de IA

Sem isso, o assistente continua respondendo com os dados antigos, porque as respostas dele saem de
um índice vetorial que foi gerado a partir das descrições velhas.

O script precisa de três variáveis. Crie (ou complete) o arquivo
`C:\Users\Usuario\Desktop\colheita\.env` com:

```
SUPABASE_URL=https://<ID-DO-PROJETO>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<Settings → API → service_role, "secret">
OPENAI_API_KEY=<a mesma que o projeto já usa>
```

Depois rode:

```bash
cd /c/Users/Usuario/Desktop/colheita && pnpm --filter @colheita/jobs reindex-all
```

> A `service_role` dá acesso total ao banco — ela fica só no seu `.env` local, que não vai para o
> Git. Não cole essa chave em lugar nenhum online.

---

## Passo 3 — Ligar os redirects do portal

Só depois dos passos 1 e 2, senão os links antigos passam a apontar para produtos que ainda não
existem no banco.

1. Vercel → projeto **colheita-portal** → **Settings** → **Environment Variables**
2. Adicione `CATALOGO_2026_MIGRADO` com valor `1`, no ambiente **Production**
3. **Deployments** → no deploy mais recente, **Redeploy**

A partir daí, quem abrir um link antigo (`/produtos/biovas`, `/produtos/bovex`, `/produtos/titan`)
é levado ao produto renomeado, em vez de tomar 404.

---

## Como conferir que deu certo

No **portal**, abra um biológico e verifique:

| Produto | O que tem que aparecer |
|---|---|
| N-IMPORT | *Methylobacterium* sp. **SEMIA 658** (e não *Herbaspirillum seropedicae*) |
| NEMAX | *Metarhizium anisopliae* **IBCB 425** (sem *Purpureocillium lilacinum*) |
| CONTROX | *Bacillus thuringiensis* subsp. **aizawai** DC 38 (não var. *thuringiensis*) |
| TROIAN | 3,0 × 10⁸ UFC/mL (não 2,0 × 10¹⁰) |
| CHROM | deve **existir** — é produto novo |
| HARZON | embalagens **1 L e 5 L** |

E no **assistente de IA**, pergunte "quais biológicos a Argho tem?" — a resposta deve trazer os
oito nomes novos, incluindo CHROM.

---

## Se algo der errado

- **"Tenant argho nao existe"** — o seed inicial nunca rodou nesse banco. Me avise antes de rodar
  qualquer outra coisa.
- **Erro de sintaxe em `DO $$`** — está conectando pela porta 6543. Troque para 5432.
- **O portal mostra 404 nos biológicos** — os redirects foram ligados antes da migration. Remova a
  env `CATALOGO_2026_MIGRADO` e redeploye; volta ao normal na hora.

Qualquer retorno diferente do esperado, me mande a saída que eu analiso.
