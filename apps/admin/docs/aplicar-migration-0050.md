# Aplicar a migration 0050 (Catálogo Argho 2026) — passo a passo

**Já está no ar:** o site institucional está com os dados do catálogo 2026 (nomes, espécies, cepas,
concentrações e imagens novas). Ele lê de arquivo estático, então subiu junto com o deploy.

**Falta:** o **portal** e o **admin** leem do Supabase, e o banco ainda tem os dados antigos
(Biovas, Bovex, Titan, sem CHROM). Este documento alinha os dois.

**Enquanto não rodar, nada quebra.** Os redirects dos slugs novos estão desligados de propósito
(env `CATALOGO_2026_MIGRADO`), então o portal segue funcional com os dados antigos.

> **Sobre os links deste documento:** os caminhos de menu foram conferidos na documentação oficial
> do Supabase e da Vercel em 13/08/2026. O identificador do projeto (`htoqhomunwkrnizibusc`) e a
> organização Vercel (`evofitia`) vêm dos registros deste projeto — **confira se batem** com o que
> aparece na URL quando você abre cada painel. Se o seu for diferente, troque na URL.

---

## Passo 1 — Aplicar a migration

Pelo **SQL Editor** do painel, que não exige instalar nada. (O `psql` não está instalado nesta
máquina — verifiquei.)

**🔗 Abrir direto:** https://supabase.com/dashboard/project/htoqhomunwkrnizibusc/sql/new

1. O link acima já abre uma query nova no SQL Editor
2. Abra este arquivo no editor de texto, selecione tudo e copie:
   ```
   C:\Users\Usuario\Desktop\colheita\infra\supabase\migrations\0050_catalogo_2026_produtos.sql
   ```
   (28 KB, 367 linhas — cabe numa query sem problema)
3. Cole no editor e clique em **Run** (ou `Ctrl+Enter`)

### Como saber se deu certo

A última mensagem tem que ser esta:

```
NOTICE:  Migration 0050 concluida: biologicos renomeados e corrigidos (+CHROM),
         organominerais e doses Operate alinhados ao catalogo 2026.
         RODAR AGORA: pnpm --filter @colheita/jobs reindex-all
```

Antes dela aparecem duas contagens normais:

```
NOTICE:  Migration 0050: applications zerado em N produto(s).
NOTICE:  Migration 0050: N chunk(s) "application" removidos do pgvector.
```

**A migration se autoconfere.** Se algo sair do previsto ela emite `WARNING` em vez de passar
batido — "esperava 8 biologicos, encontrei N", "N produto(s) ainda com slug antigo" ou
"N descricao(oes) ainda com termo corrigido". **Qualquer `WARNING` desses: pare e me mande o
retorno.**

Há um `WARNING` que é esperado e não impede nada: o que avisa que lições da Academia ainda citam
Biovas/Bovex. É texto de curso e precisa de revisão humana — me avise que eu trato.

> A migration é **idempotente**: rodar duas vezes não duplica nem quebra.

### Se preferir linha de comando

Requer PostgreSQL client instalado (hoje não está). A string de conexão fica no botão **Connect**,
no topo da página do projeto — não em Settings:

**🔗 Abrir direto:** https://supabase.com/dashboard/project/htoqhomunwkrnizibusc?showConnect=true

Escolha **Direct connection** (é a indicada pela documentação para migrations; os modos de pooler
podem recusar o bloco `DO` que esta migration usa).

```bash
cd /c/Users/Usuario/Desktop/colheita && psql "COLE_AQUI_A_STRING_DE_CONEXAO" -f infra/supabase/migrations/0050_catalogo_2026_produtos.sql
```

---

## Passo 2 — Reindexar o agente de IA

Sem isso o assistente continua respondendo com os dados velhos: as respostas dele saem de um índice
vetorial gerado a partir das descrições antigas.

### 2.1 — Pegar a chave secreta

**🔗 Abrir direto:** https://supabase.com/dashboard/project/htoqhomunwkrnizibusc/settings/api-keys

Nessa tela há duas abas. A chave que o script usa é a **`service_role`**, que fica na aba
**Legacy API Keys**. (O Supabase está migrando para "Secret keys" no formato `sb_secret_…` na aba
**API Keys**; as `service_role` seguem válidas até o fim de 2026.)

### 2.2 — Preencher o `.env`

Crie ou complete `C:\Users\Usuario\Desktop\colheita\.env`:

```
SUPABASE_URL=https://htoqhomunwkrnizibusc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<a chave da aba Legacy API Keys>
OPENAI_API_KEY=<a mesma que o projeto já usa>
```

> São exatamente os três nomes que o script lê (`packages/jobs/src/scripts/reindex-all.ts`).
> A `service_role` dá acesso total ao banco: ela fica só no `.env` local, que não vai para o Git.
> Não cole essa chave em nenhum site ou chat.

### 2.3 — Rodar

```bash
cd /c/Users/Usuario/Desktop/colheita && pnpm --filter @colheita/jobs reindex-all
```

---

## Passo 3 — Ligar os redirects do portal

Só depois dos passos 1 e 2 — senão os links antigos passam a apontar para produtos que ainda não
existem no banco.

### 3.1 — Criar a variável

**🔗 Abrir direto:** https://vercel.com/evofitia/colheita-portal/settings/environment-variables

1. Em **Name**, escreva `CATALOGO_2026_MIGRADO`
2. Em **Value**, escreva `1`
3. Marque o ambiente **Production**
4. **Save**

### 3.2 — Redeployar

Variável nova só vale para deploy novo — a Vercel não reaplica em deploys anteriores.

**🔗 Abrir direto:** https://vercel.com/evofitia/colheita-portal/deployments

1. Localize o deployment mais recente de Production
2. Clique no ícone de **reticências (…)** à direita dele
3. Selecione **Redeploy**
4. Na janela **Redeploy to Production**, escolha se quer usar o Build Cache e confirme em
   **Redeploy**

A partir daí, quem abrir `/produtos/biovas`, `/produtos/bovex` ou `/produtos/titan` é levado ao
produto renomeado em vez de tomar 404.

---

## Conferir que funcionou

No **portal**, abra os biológicos:

| Produto | O que tem que aparecer |
|---|---|
| N-IMPORT | *Methylobacterium* sp. **SEMIA 658** (e não *Herbaspirillum seropedicae*) |
| NEMAX | *Metarhizium anisopliae* **IBCB 425** (sem *Purpureocillium lilacinum*) |
| CONTROX | *Bacillus thuringiensis* subsp. **aizawai** DC 38 (não var. *thuringiensis*) |
| TROIAN | 3,0 × 10⁸ UFC/mL (não 2,0 × 10¹⁰) |
| SPORAX | 5,0 × 10⁸ UFC/mL (não 2,5 × 10¹⁰) |
| CHROM | precisa **existir** — é produto novo |
| HARZON | embalagens **1 L e 5 L** |

E no assistente de IA, pergunte "quais biológicos a Argho tem?" — devem vir os oito nomes novos,
incluindo CHROM.

---

## Se algo der errado

| Sintoma | O que é | O que fazer |
|---|---|---|
| `Tenant argho nao existe` | o seed inicial nunca rodou nesse banco | pare e me avise antes de rodar qualquer outra coisa |
| erro de sintaxe no `DO $$` | conexão em modo pooler (6543) | use **Direct connection** (5432) |
| portal com 404 nos biológicos | os redirects foram ligados antes da migration | apague a env `CATALOGO_2026_MIGRADO` e redeploye — volta ao normal na hora |
| assistente citando Biovas/Bovex | o reindex do passo 2 não rodou | rode o passo 2 |

Qualquer saída diferente da esperada, me mande que eu analiso.
