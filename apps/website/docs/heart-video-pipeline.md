# Argho Heart Video Pipeline

Documentação do pipeline para gerar os assets do **coração digital ARGHO**
(`argho-heart-*.webm` + poster). Salva o histórico dos erros que cometemos
pra não repetir.

## Source

`mp_.mp4` (canonical) — fornecido pelo Wilson em maio/2026. Especificações:
- H.264 (yuv420p), 720x1280, 8s, 5.9MB
- **Padding preto** no topo/bottom de 104px cada (conteúdo real é 720x1072)
- **Fundo `RGB(253,253,253)`** (off-white, NÃO branco puro 255)
- Heart com cores variadas: cyan brilhante, gray pipes, verde-musgo, etc.

Caminho local quando trabalhamos: `C:\Users\Usuario\Downloads\mp_.mp4`

## Output

3 arquivos commitados em `public/`:
- `argho-heart-hero.webm` (~2.2MB) — desktop
- `argho-heart-hero-mobile.webm` (~1.4MB) — mobile (540x810)
- `argho-heart-poster-hero.png` (~940KB) — fallback pra `<video poster>`

## Pipeline ffmpeg

### Filtro key — `geq` condicional

O bg do source é 253 (off-white). Em página `#ffffff` puro, o retângulo do
video aparece como cinza claro sutil. Solução: forçar bg do video pra 255
**sem tocar nos pipes brancos do heart** (que também são >= 250).

Lógica: substitui pixels que são **grayscale puro (R=G=B) E >= 250** por 255.
Heart tem cores variadas (R≠G≠B), então fica intacto.

```
geq=
  r='if(eq(r(X\,Y)\,g(X\,Y))*eq(g(X\,Y)\,b(X\,Y))*gte(r(X\,Y)\,250),255,r(X\,Y))':
  g='if(eq(r(X\,Y)\,g(X\,Y))*eq(g(X\,Y)\,b(X\,Y))*gte(r(X\,Y)\,250),255,g(X\,Y))':
  b='if(eq(r(X\,Y)\,g(X\,Y))*eq(g(X\,Y)\,b(X\,Y))*gte(r(X\,Y)\,250),255,b(X\,Y))'
```

### Comando completo — desktop

```bash
ffmpeg -y -i mp_.mp4 \
  -vf "crop=720:1072:0:104,scale=720:1080:flags=lanczos,geq=...precise_filter..." \
  -c:v libvpx-vp9 -b:v 1500k -an \
  argho-heart-hero.webm
```

### Comando completo — mobile

```bash
ffmpeg -y -i mp_.mp4 \
  -vf "crop=720:1072:0:104,scale=540:810:flags=lanczos,geq=...precise_filter..." \
  -c:v libvpx-vp9 -b:v 900k -an \
  argho-heart-hero-mobile.webm
```

### Poster

```bash
ffmpeg -y -ss 2 -i argho-heart-hero.webm \
  -frames:v 1 \
  argho-heart-poster-hero.png
```

## Erros que cometemos (não repetir)

### ❌ Tentativa 1 — VP9-alpha

Codificar com `pix_fmt yuva420p` pra ter canal alpha. iOS Safari ignora o
plano alpha do VP9 e renderiza o RGB direto — heart fica com bg verde
(do chromakey) baked-in.

### ❌ Tentativa 2 — composite sobre dark blue

Pra HERO (página branca) ficava um retângulo escuro destoante. Cliente
reclamou de "moldura" ao redor do heart.

### ❌ Tentativa 3 — chromakey white

Source com fundo branco + chromakey 0xffffff. Threshold de 0.20 (similarity)
comia partes brancas/claras do heart (pipes, casing) deixando buracos.
Resultado: heart com furos pixelados.

### ❌ Tentativa 4 — `lutrgb` 248+ → 255

Forçar qualquer pixel com canal >= 248 pra 255. **Comeu os pipes brancos
do heart** (que tinham canais 250-254), tornando-os 255 puro = invisíveis
no bg branco. Heart "sumiu" parcialmente.

### ❌ Tentativa 5 — chromakey green

Usar source com fundo verde + chromakey 0x87D166. Funcionou na intro (page
dark), mas pro hero (page branca) precisava composite sobre branco que
trazia de volta o problema do retângulo cinza.

### ✅ Tentativa 6 — filtro `geq` condicional grayscale

A solução. Discrimina bg (grayscale puro >= 250) de pipes do heart
(grayscale com leve variação RGB devido a cores). Bg vira 255 puro, heart
preserva todos detalhes. Funciona em qualquer browser, qualquer codec.

## CSS dependent

A página usa `backgroundColor: '#ffffff'` (default).
A intro usa `backgroundColor: '#ffffff'`.

Não precisa de mix-blend-mode, alpha, ou qualquer hack. O video casa
pixel-perfect com `#ffffff`.

## Cache headers

`next.config.ts` aplica `Cache-Control: public, max-age=31536000, immutable`
em `*.webm` e `argho-heart-poster-*.png`. Se mudar o conteúdo, **mude o
nome do arquivo** (ex: `argho-heart-hero-v2.webm`) pra invalidar cache.

## Re-gerar tudo

Script bash de uma linha (ajuste o path do SRC):

```bash
SRC="$HOME/Downloads/mp_.mp4"
FILTER="geq=r='if(eq(r(X\,Y)\,g(X\,Y))*eq(g(X\,Y)\,b(X\,Y))*gte(r(X\,Y)\,250),255,r(X\,Y))':g='if(eq(r(X\,Y)\,g(X\,Y))*eq(g(X\,Y)\,b(X\,Y))*gte(r(X\,Y)\,250),255,g(X\,Y))':b='if(eq(r(X\,Y)\,g(X\,Y))*eq(g(X\,Y)\,b(X\,Y))*gte(r(X\,Y)\,250),255,b(X\,Y))'"

# Hero desktop
ffmpeg -y -i "$SRC" -vf "crop=720:1072:0:104,scale=720:1080:flags=lanczos,$FILTER" -c:v libvpx-vp9 -b:v 1500k -an apps/website/public/argho-heart-hero.webm

# Hero mobile
ffmpeg -y -i "$SRC" -vf "crop=720:1072:0:104,scale=540:810:flags=lanczos,$FILTER" -c:v libvpx-vp9 -b:v 900k -an apps/website/public/argho-heart-hero-mobile.webm

# Poster
ffmpeg -y -ss 2 -i apps/website/public/argho-heart-hero.webm -frames:v 1 apps/website/public/argho-heart-poster-hero.png
```

## Verificação visual

```bash
# Sample bg corners (devem ser ff ff ff)
ffmpeg -i apps/website/public/argho-heart-poster-hero.png -vf "crop=10:10:0:0" -f rawvideo -pix_fmt rgb24 - 2>/dev/null | xxd | head -1
# Esperado: ffff ffff ffff ffff ffff ffff ffff ffff
```
