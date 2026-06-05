# Como ativar Nano Banana Pro (geração de imagens via Gemini)

**Status:** backend e UI prontos (`fc9ba91` + `bff8b57`), faltando apenas
setar `GEMINI_API_KEY` no env.

## Por quê

Wilson pediu integração com Nano Banana Pro (Gemini 2.5 Flash Image) para
gerar mockups foto-real de embalagens, ilustrações técnicas, fotos de
produto sob demanda. Custo aproximado: **$0,04 por imagem**.

UI completa em `/imagens` no admin (sidebar Geração → "Imagens IA ·
Nano Banana"). Inclui templates rápidos, preview inline, download PNG,
error handling gracioso.

## Passos

### 1. Pegar API key no Google AI Studio

Acessa **https://aistudio.google.com/apikey** e:
1. Login com sua conta Google
2. Click "Create API key"
3. Selecione projeto Google Cloud (ou crie novo gratuito)
4. Copia a key (formato `AIzaSy...`)

> Free tier do Gemini: 15 requests/min + 1500 requests/dia. Suficiente
> pra testes iniciais. Pra produção contínua, ativar billing.

### 2. Setar local (`apps/admin/.env.local`)

```sh
# Adicionar no fim do arquivo:
GEMINI_API_KEY=AIzaSy_sua_key_aqui
```

Reiniciar dev server (`pnpm --filter @colheita/admin dev`) pra recarregar
env vars.

### 3. Setar Vercel (produção)

```sh
# Via CLI (se instalado):
vercel env add GEMINI_API_KEY production
# Cola a key quando perguntar

# Ou via dashboard:
# https://vercel.com/<seu-org>/colheita-admin/settings/environment-variables
# Add: GEMINI_API_KEY = AIzaSy... (Production)
```

Redeploy automático ao salvar a env var (ou trigger manual).

### 4. Validar via /configuracoes admin

Acessa `/configuracoes` → card "Status operacional". Deve mostrar:

> ✓ **Gemini Nano Banana** (geração de imagens) — endpoint /api/imagens/gerar pronto

Se ainda aparecer cinza com "/imagens não gera — setar GEMINI_API_KEY",
significa que a key ainda não chegou no processo (cache de build Vercel
ou env não foi salvo).

### 5. Testar via /imagens admin

Acessa `/imagens` no admin (sidebar Geração → "Imagens IA · Nano Banana"):

1. Click num template rápido (ex: "Mockup foto-real frasco 1L")
2. Aspecto: 3:4 (retrato) — bom pra produtos
3. Quantidade: 1 imagem
4. Click "Gerar imagem"
5. Aguarda 10-30s
6. Preview aparece + botão "Baixar PNG"

**Custo desse teste:** $0,04.

## Prompt engineering pra mockups Argho

Pro caso de uso de **mockup foto-real de produto**, prompts em **inglês**
performam melhor (Gemini foi treinado majoritariamente em EN):

```
Photo-realistic 3D render of a 1L plastic agricultural product bottle,
white background with subtle gradient, soft studio lighting, gentle drop
shadow underneath. The label is clean and minimal with a blue gradient
and white text reading "BIOVAS". Product photography style, ultra high
resolution, professional catalog quality, white seamless backdrop.
```

Para **ilustrações técnicas agronômicas**:

```
Technical scientific illustration of a plant root system with rhizosphere
microbiome, soft watercolor style, biology textbook aesthetic, labeled
with subtle Latin annotations, white background. Detailed mycorrhizae
and bacterial colonies visible. Editorial illustration.
```

Para **fotos de campo**:

```
Aerial photography of a soybean field in full flowering stage, golden
hour light, shallow depth of field, professional agricultural photography,
vibrant green leaves with delicate white-purple flowers, atmospheric
and editorial.
```

## Negative prompts úteis

Em Brazilian Portuguese ou inglês:

```
text, watermark, blurry, low quality, distorted, deformed, ugly, generic
stock photo style, AI-generated look, plasticky, oversaturated
```

## Rate limit

- **Endpoint admin**: 10 requests/min por usuário (~$0,40/min máximo)
- **Gemini API**: 15 req/min (free) ou 60 req/min (paid)

## Troubleshooting

### "GEMINI_API_KEY não configurado"

→ Env var não setada ou processo não reiniciou. Verifica `/configuracoes`.

### "Gemini retornou resposta sem imagens"

Possíveis causas:
- **Safety filter**: prompt foi bloqueado (palavras sensíveis). Reescreve
  evitando termos médicos/violentos/políticos.
- **Quota excedida**: free tier 1500/dia. Esperar 24h ou ativar billing.
- **Modelo errado**: confirmar que `gemini-2.5-flash-image` está
  disponível na sua região (pode estar em allowlist).

### Imagem gerada com texto borrado

Gemini tem dificuldade renderizando texto pequeno. Pra labels precisos:
- Use prompts simples ("label with single word BIOVAS in bold")
- Considere editar texto depois em Photoshop/Canva
- Ou tente Recraft (futuro provider — bom em logos/texto)

## Próximos providers (futuro)

`@colheita/image-gen` foi projetado pra suportar múltiplos providers via
roteador. Próximas integrações justificáveis:

- **Recraft V3**: melhor em logos, texto, branding ($0,06 por imagem)
- **Flux Pro Ultra**: máxima qualidade foto-real ($0,06 por imagem)
- **OpenAI gpt-image-1**: melhor edição de imagem existente ($0,02-0,19)

Roteamento ideal: Recraft pra branding, Flux pra foto-real, Gemini pra
geral (mais barato).
