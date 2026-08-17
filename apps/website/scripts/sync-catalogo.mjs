// Gera src/lib/biologicos-catalogo.ts a partir do conteúdo do CATÁLOGO ARGHO 2026.
//
// Por que gerar em vez de digitar: o catálogo é a fonte homologada — o texto dele passou por
// verificação em fonte primária (Lei 15.070/2024, IN MAPA 61/2020) e por decisões do Wilson que
// não podem ser reescritas de memória (sem praga nomeada, sem dose no biológico, sem classe de
// defensivo, art. 36 como enquadramento). Redigitar no site abriria espaço para as duas peças
// divergirem de novo — foi exatamente o que aconteceu com o número de pesquisadores e com os
// 5.000 m², que ficaram no site depois de saírem do catálogo.
//
// Rodar após qualquer mudança em conteudo/copy/ do catálogo:
//   node apps/website/scripts/sync-catalogo.mjs
//
// A saída é COMMITADA: o site não pode depender de uma pasta fora do repositório para buildar.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const SAIDA = join(AQUI, '..', 'src', 'lib', 'biologicos-catalogo.ts');
const COPY =
  'C:/Users/Usuario/Desktop/ARGHO AGROSCIENCES/CATALOGO BIOLOGICOS 2026/conteudo/copy';

const SLUGS = ['biotas', 'troian', 'controx', 'sporax', 'nemax', 'harzon', 'chrom', 'n-import'];

// O catálogo marca ênfase com *asteriscos* (nome científico). No site vira <em> via componente,
// então aqui só normalizo para um marcador explícito que o React consome sem dangerouslySetHTML.
const partesItalico = (texto) =>
  String(texto ?? '')
    .split(/\*([^*]+)\*/g)
    .map((t, i) => ({ t, i: i % 2 === 1 }))
    .filter((p) => p.t !== '');

const faltando = SLUGS.filter((s) => !existsSync(join(COPY, `produto-${s}.json`)));
if (faltando.length) {
  console.error(`Fonte do catálogo não encontrada para: ${faltando.join(', ')}`);
  console.error(`Esperado em: ${COPY}`);
  process.exit(1);
}

const dados = SLUGS.map((slug) => {
  const c = JSON.parse(readFileSync(join(COPY, `produto-${slug}.json`), 'utf8'));
  return {
    slug,
    tipo: c.tipo ?? null,
    categoriaLegal: c.categoria_legal ?? null,
    // só o trecho antes do travessão: o resto é o enquadramento legal, que já vive na nota
    funcaoComposicao: (c.categoria_bioinsumo ?? '').split(' — ')[0] || null,
    oneliner: partesItalico(c.oneliner),
    especies: (c.especies ?? []).map((e) => ({
      nome: partesItalico(e.nome),
      cepa: e.cepa ?? null,
      pct: e.pct ?? null,
      naNatureza: partesItalico(e.na_natureza),
    })),
    sinergia: c.sinergia ? partesItalico(c.sinergia) : null,
    papelNoPrograma: c.papel_no_programa ? partesItalico(c.papel_no_programa) : null,
    doseMultiplicacao: c.specs?.dose_biofabrica ?? null,
    selos: c.selos ?? [],
  };
});

const ts = `// GERADO POR scripts/sync-catalogo.mjs — NÃO EDITAR À MÃO.
// Fonte: CATÁLOGO ARGHO 2026, conteudo/copy/produto-*.json (texto homologado).
// Para mudar qualquer frase daqui, mude no catálogo e rode o script de novo — assim as duas
// peças não voltam a divergir.
//
// \`Trecho.i\` = trecho em itálico (nome científico), do marcador *asterisco* do catálogo.

export type Trecho = { t: string; i: boolean };

export type EspecieCatalogo = {
  nome: Trecho[];
  cepa: string | null;
  pct: string | null;
  naNatureza: Trecho[];
};

export type BiologicoCatalogo = {
  slug: string;
  tipo: string | null;
  categoriaLegal: string | null;
  funcaoComposicao: string | null;
  oneliner: Trecho[];
  especies: EspecieCatalogo[];
  sinergia: Trecho[] | null;
  papelNoPrograma: Trecho[] | null;
  doseMultiplicacao: string | null;
  selos: string[];
};

export const BIOLOGICOS_CATALOGO: Record<string, BiologicoCatalogo> = ${JSON.stringify(
  Object.fromEntries(dados.map((d) => [d.slug, d])),
  null,
  2,
)};

export function catalogoDoBiologico(slug: string): BiologicoCatalogo | undefined {
  return BIOLOGICOS_CATALOGO[slug];
}
`;

writeFileSync(SAIDA, ts, 'utf8');
const nEsp = dados.reduce((a, d) => a + d.especies.length, 0);
console.log(`gerado: ${SAIDA}`);
console.log(`  ${dados.length} biológicos · ${nEsp} espécies com narrativa "na natureza"`);
for (const d of dados) {
  console.log(
    `  ${d.slug.padEnd(9)} ${String(d.especies.length).padStart(2)} esp · ` +
      `${d.sinergia ? 'sinergia ' : '         '}${d.papelNoPrograma ? 'papel ' : '      '}` +
      `· ${d.funcaoComposicao}`,
  );
}
