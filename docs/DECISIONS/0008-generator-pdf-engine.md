# ADR 0008 — Generator: React → PDF via Playwright

**Status:** Accepted  
**Date:** 2026-04-29  
**Deciders:** Argho Engineering

---

## Contexto

O Colheita precisa gerar fichas técnicas de produtos em PDF para distribuidores e para uso em campo. O processo deve:

- Produzir documentos com layout preciso e branding do tenant
- Ser acionável sob demanda via API ou background job
- Rodar no mesmo ambiente Node.js dos apps, sem dependência de serviços externos pagos
- Permitir customização de templates sem conhecimento de LaTeX ou ferramentas proprietárias

---

## Decisão

Implementamos o pacote `@colheita/generator` com a seguinte pipeline:

```
Dados do produto (PIM)
    │
    ▼
React component (JSX) — template com inline styles
    │
    ▼ renderToStaticMarkup (Node.js, sem browser)
HTML string (A4 layout, fontes via @import)
    │
    ▼ Playwright (Chromium headless, page.pdf())
Buffer PDF
```

O template `FichaTecnica` é um componente React puro que recebe `FichaTecnicaData` e produz HTML via `renderToStaticMarkup`. O Playwright abre uma página em branco, injeta o HTML como conteúdo, aguarda networkidle, e exporta em formato A4 portrait.

A função pública é:

```typescript
generateFichaTecnica(data: FichaTecnicaData, options?: GeneratorOptions): Promise<{ pdf: Buffer; html: string }>
```

---

## Alternativas consideradas

| Abordagem | Prós | Contras | Decisão |
|---|---|---|---|
| **Playwright + React** (escolhida) | Fidelidade total do layout, templates em TSX familiar, sem serviço externo | Chromium pesado (~130 MB), não funciona em serverless | ✅ Escolhida |
| **PDFKit / jsPDF** | Leve, sem browser | API baixo nível, posicionamento manual, difícil de manter | ❌ Descartada |
| **Puppeteer** | Similar ao Playwright | Menos ativo, API similar mas quirks diferentes | ❌ Descartada |
| **WeasyPrint / wkhtmltopdf** | HTML → PDF sem JS | Python/Qt como dependência, sem suporte a CSS moderno | ❌ Descartada |
| **Serviço SaaS (PDFShift, API2PDF)** | Zero infraestrutura | Custo por geração, latência de rede, PII enviado externamente | ❌ Descartada |
| **@react-pdf/renderer** | React puro, sem browser | Subconjunto CSS limitado, fontes problemáticas, tabelas ruins | ❌ Descartada |

---

## Consequências

### Positivas

- Templates em React/TSX: qualquer desenvolvedor front-end pode criar/editar templates
- Suporte completo a CSS moderno (grid, flexbox, custom properties)
- HTML gerado pode ser exibido diretamente no browser (preview antes de baixar)
- Sem custo por geração
- Testes unitários rápidos com `renderToStaticMarkup` (sem Chromium, 12 testes < 200ms)

### Negativas

- `playwright-core` é pesado (~130 MB): não pode rodar em Vercel Edge Functions ou lambdas com limite de 50 MB
- Deve rodar em container com Chromium instalado (imagem Docker ou Vercel Node.js serverless function com camada adicional)
- Tempo de geração: ~500–1500ms por PDF (Chromium cold start + render)

---

## Implantação

O `@colheita/generator` é consumido pelo `apps/admin` via Server Action ou pelo `apps/api` via endpoint `POST /api/v1/catalog/:slug/ficha-tecnica`.

Para produção no Vercel: usar `@sparticuz/chromium` (versão compactada para serverless) com `playwright-core`. Para ambiente Docker local: Chromium do sistema via `playwright install chromium`.

A Fase 2 incluirá:
- Templates adicionais (`BulaProduto`, `CertificadoAnalise`)
- Múltiplos idiomas (PT-BR, ES)
- Branding por tenant (logo, paleta de cores via `TenantThemeTokens`)
- Geração assíncrona via Trigger.dev com entrega por e-mail (Resend)
