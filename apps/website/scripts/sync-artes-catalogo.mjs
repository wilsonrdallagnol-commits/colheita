// Exporta para public/ as artes de "MODO DE AÇÃO" que o catálogo usa em cada biológico.
//
// São as mesmas imagens da pgProdutoB do catálogo (a página que mostra o mecanismo de cada
// cepa). O site descrevia os microrganismos só em texto; a arte é o que torna o mecanismo
// legível para quem não é microbiologista.
//
// Rodar: node apps/website/scripts/sync-artes-catalogo.mjs
//
// Não força um recorte comum: cinco artes são ilustrações quadradas em fundo branco e três
// são fotos em 16:9 escuras. Recortar as quadradas para uma faixa larga decepa o assunto (no
// BIOTAS, a parte aérea da planta). Cada uma sai no seu próprio aspecto e o layout do site
// acomoda — como no catálogo, onde a arte ocupa um bloco próprio ao lado do texto.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const DEST = join(AQUI, '..', 'public', 'products', 'modo-acao');
const CAT = 'C:/Users/Usuario/Desktop/ARGHO AGROSCIENCES/CATALOGO BIOLOGICOS 2026/imagens';
const REWORK = 'C:/Users/Usuario/Desktop/ARGHO AGROSCIENCES/APRESENTAÇÕES/_REWORK NOVA COMPLETA';

// Espelha o mapa CENA de build/gerar-catalogo.mjs — se lá mudar, mude aqui.
const ARTES = {
  biotas: `${CAT}/arte-biotas-v2.png`,
  troian: `${CAT}/arte-troian-v2.png`,
  controx: `${CAT}/arte-controx-v3.png`,
  sporax: `${CAT}/arte-sporax.png`,
  nemax: `${CAT}/arte-nemax-v3.png`,
  harzon: `${REWORK}/imagens/harzon-abertura.png`,
  chrom: `${REWORK}/imagens/chrom-abertura.png`,
  'n-import': `${REWORK}/imagens/nimport/cena.png`,
};

const LADO_MAX = 1280; // exibida em ~520px; 1280 cobre retina sem inflar o peso da página

mkdirSync(DEST, { recursive: true });

const faltando = Object.entries(ARTES).filter(([, p]) => !existsSync(p));
if (faltando.length) {
  console.error('arte não encontrada:');
  for (const [s, p] of faltando) console.error(`  ${s}: ${p}`);
  process.exit(1);
}

const py = `
import sys, json, os
from PIL import Image
sys.stdout.reconfigure(encoding='utf-8')
artes = json.loads(sys.argv[1]); dest = sys.argv[2]; lado = int(sys.argv[3])
meta = {}
for slug, src in artes.items():
    im = Image.open(src).convert('RGB')
    im.thumbnail((lado, lado), Image.LANCZOS)
    out = os.path.join(dest, slug + '.jpg')
    im.save(out, 'JPEG', quality=86, optimize=True, progressive=True)
    meta[slug] = {'w': im.width, 'h': im.height, 'kb': round(os.path.getsize(out)/1024)}
    print(f'  {slug:9s} {im.width}x{im.height}  {meta[slug]["kb"]:4d} KB')
print('__META__' + json.dumps(meta))
`;

const saida = execFileSync('py', ['-c', py, JSON.stringify(ARTES), DEST, String(LADO_MAX)], {
  encoding: 'utf8',
});
const linhas = saida.split('\n');
console.log(linhas.filter((l) => !l.startsWith('__META__')).join('\n').trim());
const meta = JSON.parse(linhas.find((l) => l.startsWith('__META__')).slice(8));

// Dimensões vão para o TS: <Image> do Next exige width/height para não causar layout shift.
const ts = `// GERADO POR scripts/sync-artes-catalogo.mjs — NÃO EDITAR À MÃO.
// Artes de "Modo de ação" dos biológicos, exportadas do CATÁLOGO ARGHO 2026.

export type ArteModoAcao = { src: string; width: number; height: number };

export const ARTE_MODO_ACAO: Record<string, ArteModoAcao> = ${JSON.stringify(
  Object.fromEntries(
    Object.entries(meta).map(([s, m]) => [
      s,
      { src: `/products/modo-acao/${s}.jpg`, width: m.w, height: m.h },
    ]),
  ),
  null,
  2,
)};
`;
writeFileSync(join(AQUI, '..', 'src', 'lib', 'artes-modo-acao.ts'), ts, 'utf8');
console.log(`\n${Object.keys(meta).length} artes exportadas para public/products/modo-acao/`);
