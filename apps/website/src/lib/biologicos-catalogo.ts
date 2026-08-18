// GERADO POR scripts/sync-catalogo.mjs — NÃO EDITAR À MÃO.
// Fonte: CATÁLOGO ARGHO 2026, conteudo/copy/produto-*.json (texto homologado).
// Para mudar qualquer frase daqui, mude no catálogo e rode o script de novo — assim as duas
// peças não voltam a divergir.
//
// `Trecho.i` = trecho em itálico (nome científico), do marcador *asterisco* do catálogo.

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
  concentracao: string | null;
  validade: string | null;
  embalagens: string | null;
  doseMultiplicacao: string | null;
  selos: string[];
};

export const BIOLOGICOS_CATALOGO: Record<string, BiologicoCatalogo> = {
  "biotas": {
    "slug": "biotas",
    "tipo": "BLEND MICROBIOLÓGICO",
    "categoriaLegal": "INÓCULO DE BIOINSUMO",
    "funcaoComposicao": "Consórcio bacteriano de rizosfera",
    "oneliner": [
      {
        "t": "Cinco cepas de ",
        "i": false
      },
      {
        "t": "Bacillus",
        "i": true
      },
      {
        "t": " e ",
        "i": false
      },
      {
        "t": "Priestia",
        "i": true
      },
      {
        "t": " em um único inóculo: a diversidade bacteriana da rizosfera como ponto de partida.",
        "i": false
      }
    ],
    "especies": [
      {
        "nome": [
          {
            "t": "Bacillus velezensis",
            "i": true
          }
        ],
        "cepa": "DC 101",
        "pct": "20%",
        "naNatureza": [
          {
            "t": "Produz um arsenal de lipopeptídeos naturais — iturinas, fengicinas, surfactinas — que suprimem microrganismos concorrentes por antibiose, e forma biofilmes protetores sobre a superfície da raiz.",
            "i": false
          }
        ]
      },
      {
        "nome": [
          {
            "t": "Bacillus subtilis",
            "i": true
          }
        ],
        "cepa": "DC 107",
        "pct": "10%",
        "naNatureza": [
          {
            "t": "A espécie-modelo do gênero: coloniza raízes, solubiliza nutrientes, produz sideróforos que capturam ferro do ambiente e esporos que resistem a calor, seca e radiação.",
            "i": false
          }
        ]
      },
      {
        "nome": [
          {
            "t": "Priestia megaterium",
            "i": true
          }
        ],
        "cepa": "DC 93",
        "pct": "20%",
        "naNatureza": [
          {
            "t": "Solubilizadora clássica de fósforo: libera fosfatases e ácidos orgânicos que convertem o P fixado no solo em formas absorvíveis pela planta.",
            "i": false
          }
        ]
      },
      {
        "nome": [
          {
            "t": "Bacillus licheniformis",
            "i": true
          }
        ],
        "cepa": "DC 40",
        "pct": "20%",
        "naNatureza": [
          {
            "t": "Decompositora vigorosa de matéria orgânica (celulases, proteases): acelera a ciclagem de nutrientes e opera em ampla faixa de temperatura.",
            "i": false
          }
        ]
      },
      {
        "nome": [
          {
            "t": "Priestia aryabhattai",
            "i": true
          }
        ],
        "cepa": "DC 26",
        "pct": "30%",
        "naNatureza": [
          {
            "t": "Documentada como promotora de crescimento: produz auxinas (AIA) e ACC-deaminase — enzima que modula o etileno da planta sob estresse — com tolerância a seca e salinidade.",
            "i": false
          }
        ]
      }
    ],
    "sinergia": [
      {
        "t": "Cinco especialistas em consórcio: antibiose por lipopeptídeos, solubilização de fósforo, ciclagem de matéria orgânica, síntese de fitormônios (AIA e ACC-deaminase) e biofilme radicular. O consórcio se estabelece como comunidade na rizosfera — nutrição desbloqueada e raiz guarnecida pelo mesmo blend, com funções que se complementam em vez de competir.",
        "i": false
      }
    ],
    "papelNoPrograma": [
      {
        "t": "BIOTAS é a base bacteriana do programa de produção própria: um único inóculo estabelece cinco populações distintas de ",
        "i": false
      },
      {
        "t": "Bacillus",
        "i": true
      },
      {
        "t": " e ",
        "i": false
      },
      {
        "t": "Priestia",
        "i": true
      },
      {
        "t": " no meio de cultivo. O produtor multiplica na própria estrutura — 4 L de inóculo para cada 1000 L de meio de cultivo — e posiciona o volume produzido conforme orientação da equipe técnica Argho.",
        "i": false
      }
    ],
    "concentracao": "5,0×10⁹ UFC/mL · 5,0×10¹² UFC/L",
    "validade": "18 meses",
    "embalagens": "1 L · 5 L",
    "doseMultiplicacao": "4 L / 1000 L de meio de cultivo",
    "selos": [
      "Produto 100% nacional",
      "Contém microrganismos vivos",
      "Uso próprio — art. 36, Lei 15.070/2024",
      "Seguro ao meio ambiente"
    ]
  },
  "troian": {
    "slug": "troian",
    "tipo": "BLEND MICROBIOLÓGICO",
    "categoriaLegal": "INÓCULO DE BIOINSUMO",
    "funcaoComposicao": "Matriz de Bacillus · antibiose",
    "oneliner": [
      {
        "t": "Inóculo de matriz ",
        "i": false
      },
      {
        "t": "velezensis",
        "i": true
      },
      {
        "t": "-dominante: três cepas de ",
        "i": false
      },
      {
        "t": "Bacillus",
        "i": true
      },
      {
        "t": " com identidade declarada.",
        "i": false
      }
    ],
    "especies": [
      {
        "nome": [
          {
            "t": "Bacillus velezensis",
            "i": true
          }
        ],
        "cepa": "DC 81",
        "pct": "70%",
        "naNatureza": [
          {
            "t": "A linhagem dominante da matriz (70%): colonizadora agressiva de filosfera e rizosfera, forma biofilme, exclui competidores por ocupação de território e antibiose — e é documentada como eliciadora da resistência sistêmica induzida (ISR), preparando as defesas da própria planta.",
            "i": false
          }
        ]
      },
      {
        "nome": [
          {
            "t": "Bacillus velezensis",
            "i": true
          }
        ],
        "cepa": "DC 88",
        "pct": "15%",
        "naNatureza": [
          {
            "t": "Referência mundial em supressão de fungos: a espécie dedica mais de 8% do genoma à síntese de antimicrobianos naturais — iturinas, fengicinas, surfactinas e bacilomicina D.",
            "i": false
          }
        ]
      },
      {
        "nome": [
          {
            "t": "Bacillus pumilus",
            "i": true
          }
        ],
        "cepa": "DC 61",
        "pct": "15%",
        "naNatureza": [
          {
            "t": "Rústico e ubíquo: esporos extremamente resistentes, colonização rápida de superfícies vegetais e produção documentada de metabólitos antifúngicos.",
            "i": false
          }
        ]
      }
    ],
    "sinergia": [
      {
        "t": "Duas linhagens de ",
        "i": false
      },
      {
        "t": "B. velezensis",
        "i": true
      },
      {
        "t": " somam a variabilidade da espécie mais potente do gênero em antibiose — iturinas, fengicinas, surfactinas e bacilomicina D em espectros complementares — e o ",
        "i": false
      },
      {
        "t": "B. pumilus",
        "i": true
      },
      {
        "t": " adiciona rusticidade de estabelecimento. Superfícies vegetais ocupadas e quimicamente defendidas pela própria biologia do blend.",
        "i": false
      }
    ],
    "papelNoPrograma": [
      {
        "t": "No modelo de produção própria, o TROIAN é o inóculo de partida da matriz ",
        "i": false
      },
      {
        "t": "Bacillus velezensis",
        "i": true
      },
      {
        "t": " do programa: 4 L de inóculo dão origem a 1000 L de meio de cultivo — cada litro rende 250 L de bioinsumo para uso próprio. O posicionamento dentro do programa é definido junto à equipe técnica Argho, conforme a estrutura e o calendário de cada operação.",
        "i": false
      }
    ],
    "concentracao": "3,0×10⁸ UFC/mL · 3,0×10¹¹ UFC/L",
    "validade": "18 meses",
    "embalagens": "1 L · 5 L",
    "doseMultiplicacao": "4 L / 1000 L de meio de cultivo",
    "selos": [
      "Produto 100% nacional",
      "Contém microrganismos vivos",
      "Uso próprio — art. 36, Lei 15.070/2024",
      "Seguro ao meio ambiente"
    ]
  },
  "controx": {
    "slug": "controx",
    "tipo": "BLEND MICROBIOLÓGICO",
    "categoriaLegal": "INÓCULO DE BIOINSUMO",
    "funcaoComposicao": "Bacillus thuringiensis · cristais Cry",
    "oneliner": [
      {
        "t": "Duas subespécies clássicas de ",
        "i": false
      },
      {
        "t": "Bacillus thuringiensis",
        "i": true
      },
      {
        "t": " em partes iguais — um inóculo de identidade dupla.",
        "i": false
      }
    ],
    "especies": [
      {
        "nome": [
          {
            "t": "Bacillus thuringiensis",
            "i": true
          },
          {
            "t": " subsp. ",
            "i": false
          },
          {
            "t": "aizawai",
            "i": true
          }
        ],
        "cepa": "DC 38",
        "pct": "50%",
        "naNatureza": [
          {
            "t": "Produz cristais de proteínas Cry de espectro característico: ingeridos pelo hospedeiro suscetível, dissolvem-se no intestino alcalino, ligam-se a receptores específicos da membrana intestinal e a rompem — o inseto para de se alimentar em horas.",
            "i": false
          }
        ]
      },
      {
        "nome": [
          {
            "t": "Bacillus thuringiensis",
            "i": true
          },
          {
            "t": " subsp. ",
            "i": false
          },
          {
            "t": "kurstaki",
            "i": true
          }
        ],
        "cepa": "DC 41",
        "pct": "50%",
        "naNatureza": [
          {
            "t": "A subespécie mais estudada do mundo: seu conjunto de proteínas Cry (famílias Cry1A e Cry2A) complementa o espectro da aizawai, com décadas de uso documentado globalmente.",
            "i": false
          }
        ]
      }
    ],
    "sinergia": [
      {
        "t": "Duas subespécies, dois pacotes de proteínas Cry (δ-endotoxinas) com sítios de ligação distintos no epitélio intestinal: espectro mais amplo e menor pressão de seleção de resistência do que qualquer subespécie isolada — com a seletividade característica do mecanismo Cry, dependente de receptores específicos e documentadamente inócuo para organismos que não os possuem.",
        "i": false
      }
    ],
    "papelNoPrograma": [
      {
        "t": "Na unidade de produção, CONTROX é o inóculo que leva a genética de ",
        "i": false
      },
      {
        "t": "B. thuringiensis",
        "i": true
      },
      {
        "t": " ao meio de cultivo: 4 L iniciam 1000 L de bioinsumo para uso próprio. Entra no programa como o componente bacteriano esporulante de identidade dupla da linha, combinado aos demais inóculos conforme o desenho de manejo de cada operação, com acompanhamento da equipe técnica Argho.",
        "i": false
      }
    ],
    "concentracao": "1,0×10⁹ UFC/mL · 1,0×10¹² UFC/L",
    "validade": "18 meses",
    "embalagens": "1 L · 5 L",
    "doseMultiplicacao": "4 L / 1000 L de meio de cultivo",
    "selos": [
      "Produto 100% nacional",
      "Contém microrganismos vivos",
      "Uso próprio — art. 36, Lei 15.070/2024",
      "Seguro ao meio ambiente"
    ]
  },
  "sporax": {
    "slug": "sporax",
    "tipo": "BLEND MICROBIOLÓGICO",
    "categoriaLegal": "INÓCULO DE BIOINSUMO",
    "funcaoComposicao": "Fungos entomopatogênicos",
    "oneliner": [
      {
        "t": "Três gêneros de fungos entomopatogênicos da natureza — ",
        "i": false
      },
      {
        "t": "Beauveria",
        "i": true
      },
      {
        "t": ", ",
        "i": false
      },
      {
        "t": "Metarhizium",
        "i": true
      },
      {
        "t": " e ",
        "i": false
      },
      {
        "t": "Cordyceps",
        "i": true
      },
      {
        "t": " — reunidos em um único inóculo.",
        "i": false
      }
    ],
    "especies": [
      {
        "nome": [
          {
            "t": "Beauveria bassiana",
            "i": true
          }
        ],
        "cepa": "IBCB 66",
        "pct": "35%",
        "naNatureza": [
          {
            "t": "Fungo entomopatogênico com o espectro de artrópodes mais amplo documentado entre os fungos do gênero. Na natureza, seus conídios aderem à cutícula dos insetos, germinam e penetram o tegumento por pressão mecânica e ação enzimática (proteases, quitinases); o fungo coloniza o hospedeiro, que morre em poucos dias, e esporula sobre o cadáver — realimentando o ciclo no ambiente.",
            "i": false
          }
        ]
      },
      {
        "nome": [
          {
            "t": "Metarhizium anisopliae",
            "i": true
          }
        ],
        "cepa": "IBCB 425",
        "pct": "30%",
        "naNatureza": [
          {
            "t": "Entomopatógeno de solo amplamente documentado. Infecta por contato: o conídio germina sobre a cutícula, forma apressório, penetra e multiplica-se na hemolinfa como blastosporos, levando o hospedeiro à morte por colonização e por toxinas naturais (destruxinas). Persiste no solo e na rizosfera entre ciclos.",
            "i": false
          }
        ]
      },
      {
        "nome": [
          {
            "t": "Cordyceps fumosorosea",
            "i": true
          }
        ],
        "cepa": "DC 134",
        "pct": "35%",
        "naNatureza": [
          {
            "t": "Entomopatógeno de ciclo rápido, com afinidade documentada na literatura por insetos de corpo mole e estágios jovens. Germina sobre a cutícula, coloniza o hospedeiro e o recobre de micélio e novos conídios, com forte dispersão secundária no dossel.",
            "i": false
          }
        ]
      }
    ],
    "sinergia": [
      {
        "t": "Três entomopatógenos com velocidades de ciclo, nichos térmicos e afinidades de hospedeiro complementares: ",
        "i": false
      },
      {
        "t": "Beauveria",
        "i": true
      },
      {
        "t": " e ",
        "i": false
      },
      {
        "t": "Cordyceps",
        "i": true
      },
      {
        "t": " dominam a parte aérea, ",
        "i": false
      },
      {
        "t": "Metarhizium",
        "i": true
      },
      {
        "t": " persiste no solo e na rizosfera. A sobreposição de mecanismos amplia a janela de infecção e reduz escape — cobertura de ovo a adulto, do solo ao dossel, com três rotas independentes de adesão e penetração cuticular atuando em conjunto.",
        "i": false
      }
    ],
    "papelNoPrograma": [
      {
        "t": "No programa de produção própria, SPORAX é o inóculo dedicado aos fungos entomopatogênicos do portfólio Argho. A partir de 4 L de inóculo, o produtor multiplica 1.000 L de meio de cultivo — cada litro rende 250 L de bioinsumo produzido na propriedade. Autonomia de volume e de calendário, com orientação da equipe técnica Argho.",
        "i": false
      }
    ],
    "concentracao": "5,0×10⁸ UFC/mL · 5,0×10¹¹ UFC/L",
    "validade": "12 meses",
    "embalagens": "1 L · 5 L",
    "doseMultiplicacao": "4 L / 1000 L de meio de cultivo",
    "selos": [
      "Produto 100% nacional",
      "Contém microrganismos vivos",
      "Uso próprio — art. 36, Lei 15.070/2024",
      "Seguro ao meio ambiente"
    ]
  },
  "nemax": {
    "slug": "nemax",
    "tipo": "BLEND MICROBIOLÓGICO",
    "categoriaLegal": "INÓCULO DE BIOINSUMO",
    "funcaoComposicao": "Micoparasitismo e entomopatogenia",
    "oneliner": [
      {
        "t": "Inóculo blend que reúne três cepas de ",
        "i": false
      },
      {
        "t": "Trichoderma",
        "i": true
      },
      {
        "t": " e uma de ",
        "i": false
      },
      {
        "t": "Metarhizium anisopliae",
        "i": true
      },
      {
        "t": " — diversidade fúngica identificada.",
        "i": false
      }
    ],
    "especies": [
      {
        "nome": [
          {
            "t": "Trichoderma harzianum",
            "i": true
          }
        ],
        "cepa": "IB 19/17",
        "pct": "40%",
        "naNatureza": [
          {
            "t": "Micoparasita agressivo: localiza quimicamente hifas de outros fungos, enrola-se nelas e degrada suas paredes com um arsenal de enzimas líticas — quitinases, proteases e glucanases — ocupando o território. Produz metabólitos antifúngicos naturais (como os peptaibóis) e domina a rizosfera por competição por espaço, nutrientes e exsudatos.",
            "i": false
          }
        ]
      },
      {
        "nome": [
          {
            "t": "Trichoderma harzianum",
            "i": true
          }
        ],
        "cepa": "DC 133",
        "pct": "20%",
        "naNatureza": [
          {
            "t": "Segunda linhagem de ",
            "i": false
          },
          {
            "t": "T. harzianum",
            "i": true
          },
          {
            "t": " da matriz, somando variabilidade de desempenho: reforça a colonização radicular e a produção de metabólitos antifúngicos em diferentes condições de solo e temperatura.",
            "i": false
          }
        ]
      },
      {
        "nome": [
          {
            "t": "Trichoderma asperellum",
            "i": true
          }
        ],
        "cepa": "URM 5911",
        "pct": "20%",
        "naNatureza": [
          {
            "t": "Colonizador precoce de raízes. Além do micoparasitismo, é documentado por ativar a resistência sistêmica induzida (ISR) da própria planta: a cultura reconhece a presença do fungo e passa a responder mais rápido a invasores, com efeito conhecido de estímulo ao enraizamento.",
            "i": false
          }
        ]
      },
      {
        "nome": [
          {
            "t": "Metarhizium anisopliae",
            "i": true
          }
        ],
        "cepa": "IBCB 425",
        "pct": "20%",
        "naNatureza": [
          {
            "t": "Entomopatógeno de solo com ação também documentada na literatura sobre ovos e formas juvenis presentes no perfil do solo — adere a essas estruturas, penetra e as coloniza.",
            "i": false
          }
        ]
      }
    ],
    "sinergia": [
      {
        "t": "Trichoderma",
        "i": true
      },
      {
        "t": " multicepa guarnece a raiz e suprime fungos por micoparasitismo e competição, enquanto o ",
        "i": false
      },
      {
        "t": "M. anisopliae",
        "i": true
      },
      {
        "t": " patrulha o perfil do solo sobre insetos e formas juvenis. Três frentes simultâneas — raiz colonizada, rizosfera ocupada, solo biologicamente ativo — com quitinases, glucanases e metabólitos antifúngicos operando de forma combinada.",
        "i": false
      }
    ],
    "papelNoPrograma": [
      {
        "t": "Na unidade de produção, o NEMAX é o inóculo fúngico de base do programa: 4 L iniciam 1000 L de meio de cultivo — cada litro de inóculo rende 250 L de bioinsumo produzido na propriedade, para uso próprio. O posicionamento dentro do programa é flexível e definido junto à equipe técnica Argho, conforme o desenho de cada produtor.",
        "i": false
      }
    ],
    "concentracao": "2,0×10⁹ UFC/mL · 2,0×10¹² UFC/L",
    "validade": "12 meses",
    "embalagens": "1 L · 5 L",
    "doseMultiplicacao": "4 L / 1000 L de meio de cultivo",
    "selos": [
      "Produto 100% nacional",
      "Contém microrganismos vivos",
      "Uso próprio — art. 36, Lei 15.070/2024",
      "Seguro ao meio ambiente"
    ]
  },
  "harzon": {
    "slug": "harzon",
    "tipo": "ISOLADO MICROBIOLÓGICO",
    "categoriaLegal": "INÓCULO DE BIOINSUMO",
    "funcaoComposicao": "Trichoderma · micoparasitismo",
    "oneliner": [
      {
        "t": "Uma cepa só, com nome e sobrenome.",
        "i": false
      }
    ],
    "especies": [
      {
        "nome": [
          {
            "t": "Trichoderma harzianum",
            "i": true
          }
        ],
        "cepa": "IB 19/17",
        "pct": "100%",
        "naNatureza": [
          {
            "t": "Micoparasita por excelência: localiza quimicamente hifas de outros fungos, enrola-se nelas, perfura as paredes com quitinases e β-glucanases e consome o conteúdo. Na raiz, coloniza superfície e córtex externo — e a literatura documenta que a planta reconhece essa presença e antecipa as próprias defesas (priming), além de melhorar o aproveitamento de nutrientes.",
            "i": false
          }
        ]
      }
    ],
    "sinergia": null,
    "papelNoPrograma": [
      {
        "t": "O building block de ",
        "i": false
      },
      {
        "t": "Trichoderma",
        "i": true
      },
      {
        "t": " da linha: a mesma cepa IB 19/17 que lidera o NEMAX, em cultura pura, para quem compõe o próprio programa com precisão. ",
        "i": false
      },
      {
        "t": "Trichoderma",
        "i": true
      },
      {
        "t": " não é fonte de nutriente: ocupa o nicho e melhora o aproveitamento do que já está no solo. Vocação de micoparasitismo e de raiz.",
        "i": false
      }
    ],
    "concentracao": "1,0×10⁹ UFC/mL · 1,0×10¹² UFC/L",
    "validade": "12 meses",
    "embalagens": "1 L · 5 L",
    "doseMultiplicacao": "4 L / 1000 L de meio de cultivo",
    "selos": [
      "Produto 100% nacional",
      "Contém microrganismos vivos",
      "Uso próprio — art. 36, Lei 15.070/2024",
      "Seguro ao meio ambiente"
    ]
  },
  "chrom": {
    "slug": "chrom",
    "tipo": "ISOLADO MICROBIOLÓGICO",
    "categoriaLegal": "INÓCULO DE BIOINSUMO",
    "funcaoComposicao": "Chromobacterium · metabólitos bioativos",
    "oneliner": [
      {
        "t": "Chromobacterium subtsugae",
        "i": true
      },
      {
        "t": " em cultura pura — um gênero raro no mercado brasileiro, disponível como inóculo.",
        "i": false
      }
    ],
    "especies": [
      {
        "nome": [
          {
            "t": "Chromobacterium subtsugae",
            "i": true
          }
        ],
        "cepa": "DC 43",
        "pct": "100%",
        "naNatureza": [
          {
            "t": "Bactéria de solo descrita em 2007, de pigmento violeta (violaceína). A literatura documenta que, ingerida por insetos mastigadores e sugadores, seus metabólitos rompem o funcionamento do intestino; o gênero produz um conjunto de compostos bioativos único entre as bactérias de uso agrícola.",
            "i": false
          }
        ]
      }
    ],
    "sinergia": null,
    "papelNoPrograma": [
      {
        "t": "O ativo mais exclusivo do portfólio — gênero praticamente ausente do mercado brasileiro, com modo de ação distinto de Bt e de fungos entomopatogênicos: a peça de rotação de mecanismos do programa.",
        "i": false
      }
    ],
    "concentracao": "1,0×10⁸ UFC/mL · 1,0×10¹¹ UFC/L",
    "validade": "12 meses",
    "embalagens": "1 L",
    "doseMultiplicacao": "4 L / 1000 L de meio de cultivo",
    "selos": [
      "Produto 100% nacional",
      "Contém microrganismos vivos",
      "Uso próprio — art. 36, Lei 15.070/2024",
      "Seguro ao meio ambiente"
    ]
  },
  "n-import": {
    "slug": "n-import",
    "tipo": "ISOLADO MICROBIOLÓGICO",
    "categoriaLegal": "INÓCULO DE BIOINSUMO",
    "funcaoComposicao": "Methylobacterium · fitormônios naturais",
    "oneliner": [
      {
        "t": "O isolado de ",
        "i": false
      },
      {
        "t": "Methylobacterium",
        "i": true
      },
      {
        "t": " da linha Argho: uma bactéria metilotrófica rosa-pigmentada, cepa da coleção SEMIA, entregue como inóculo puro.",
        "i": false
      }
    ],
    "especies": [
      {
        "nome": [
          {
            "t": "Methylobacterium",
            "i": true
          },
          {
            "t": " sp.",
            "i": false
          }
        ],
        "cepa": "SEMIA 658",
        "pct": "100%",
        "naNatureza": [
          {
            "t": "Bactéria rosa-pigmentada e metilotrófica: vive das emissões naturais de metanol das folhas e coloniza a filosfera e os tecidos internos da planta. O gênero é documentado como produtor de fitormônios (auxinas, citocininas) e cofatores associados a germinação, enraizamento e vigor.",
            "i": false
          }
        ]
      }
    ],
    "sinergia": null,
    "papelNoPrograma": [
      {
        "t": "Procedência de coleção de referência brasileira (SEMIA). Vocação fisiológica: estímulo de germinação, enraizamento e vigor pela via hormonal natural do gênero, operando da filosfera para a planta.",
        "i": false
      }
    ],
    "concentracao": "1,0×10⁸ UFC/mL · 1,0×10¹¹ UFC/L",
    "validade": "12 meses",
    "embalagens": "1 L",
    "doseMultiplicacao": "4 L / 1000 L de meio de cultivo",
    "selos": [
      "Produto 100% nacional",
      "Contém microrganismos vivos",
      "Uso próprio — art. 36, Lei 15.070/2024",
      "Seguro ao meio ambiente"
    ]
  }
};

export function catalogoDoBiologico(slug: string): BiologicoCatalogo | undefined {
  return BIOLOGICOS_CATALOGO[slug];
}
