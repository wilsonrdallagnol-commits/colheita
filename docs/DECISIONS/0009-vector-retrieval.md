# ADR 0009: Vector Retrieval com pgvector para Knowledge Base

**Status:** Aceito  
**Data:** 2026-04-29  
**Decisores:** Time Colheita

---

## Contexto

O `/api/v1/agent` endpoint do RAG pipeline usava `BM25InMemoryRetriever` — adequado para desenvolvimento e catálogos pequenos (< 10k chunks), mas com limitações para produção:

1. **Qualidade lexical vs. semântica**: BM25 não captura sinônimos ou variações de termo. "Xcensis" e "fertilizante organomineral" podem ser semanticamente relacionados, mas o BM25 não sabe disso.
2. **In-memory**: Re-indexação necessária em cada inicialização do servidor. Não escala além de um único processo.
3. **Multi-idioma**: Agronômico mescla PT-BR, nomes comerciais e termos técnicos em inglês. BM25 com tokenização simples perde precisão.

Com o aumento do catálogo da Argho (40+ produtos no seed, potencialmente centenas) e o objetivo de Fase 2 de Knowledge Base robusta, era necessário um retriever persistente e semântico.

## Decisão

**pgvector com HNSW** como retriever de produção, mantendo BM25 para testes unitários.

### Componentes:

1. **Migration 0011**: `product_embeddings` + `lesson_embeddings` com `vector(1536)` e índice HNSW (`m=16, ef_construction=128`).
2. **SQL functions**: `match_product_embeddings()` e `match_lesson_embeddings()` — `SECURITY DEFINER` com filtro `tenant_id = auth.tenant_id()`.
3. **`SupabaseVectorRetriever`**: Implementa a interface `Retriever` existente — drop-in replacement sem mudanças no `RagPipeline`.
4. **`EmbeddingProvider` interface**: Agnóstico de modelo — `VoyageEmbeddingProvider`, `OpenAIEmbeddingProvider`, `MockEmbeddingProvider`.
5. **Jobs de re-indexação**: `embedProdutoJob` e `embedLicaoJob` — disparo via Trigger.dev quando produto/lição é criado/atualizado.

### Modelo de embedding: Voyage AI (primário)

- `voyage-3-lite`: 1024 dims, ~$0.02/1M tokens.
- Recomendado pela Anthropic para uso conjunto com Claude.
- Superior a OpenAI text-embedding-3-small em benchmarks de recuperação em PT-BR e português agronômico.
- Fallback: OpenAI `text-embedding-3-small` (1536 dims) se `VOYAGE_API_KEY` não configurada.

**NOTA**: A migração usa `vector(1536)` por padrão (compatível com OpenAI e alguns modelos Voyage). Se `voyage-3-lite` for a escolha final em produção (1024 dims), alterar via: `ALTER TABLE product_embeddings ALTER COLUMN embedding TYPE vector(1024);` antes de indexar.

## Alternativas Consideradas

| Alternativa | Prós | Contras | Por que rejeitado |
|---|---|---|---|
| Manter BM25 | Zero infra | Sem semântica, in-memory | Não escala além de dev |
| Pinecone/Weaviate | Gerenciado, features avançadas | Vendor adicional, custo ~$70-200/mês | Supabase já tem pgvector; custo desnecessário |
| Elasticsearch | FTS + vetor híbrido | Infra pesada, K8s, $120+/mês | Overkill para catálogo de ~1k documentos |
| pgvector com IVFFlat | Mais rápido para index creation | pior recall que HNSW | HNSW recomendado para produção pelo pgvector |

## Consequências

### Positivas
- Busca semântica persiste entre deploys (tabelas no banco).
- Isolamento multi-tenant via RLS (sem mudança de código — SQL function filtra por `auth.tenant_id()`).
- `SupabaseVectorRetriever` é drop-in: `RagPipeline(retriever, generator)` não muda.
- `EmbeddingProvider` interface permite trocar de modelo sem alterar o retriever.
- Jobs de re-indexação permitem reconstrução incremental sem downtime.

### Negativas / Trade-offs
- **Custo de embedding**: ~$0.02/1M tokens (Voyage). Catálogo de 500 produtos × 4 chunks/produto = 2k embeddings por re-indexação total = < $0.01. Negligível.
- **Latência do retriever**: HNSW add ~5-15ms vs. BM25 ~1ms. Imperceptível no contexto do LLM (~2-5s).
- **Dependência de Voyage/OpenAI**: Para geração de embeddings. Mitigado pelo `EmbeddingProvider` interface e fallback.
- **HNSW index**: Mais lento para inserção em bulk do que IVFFlat. Aceitável pois re-indexação é incremental via jobs.

## Configuração

```bash
# .env — provedor de embeddings (um dos dois obrigatório em produção)
VOYAGE_API_KEY=pa-...           # Primário (recomendado)
OPENAI_API_KEY=sk-...           # Fallback

# Supabase — necessário nos jobs de re-indexação
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Bypass RLS para leitura dos dados
```

## Custo estimado adicional

| Operação | Frequência | Custo |
|---|---|---|
| Re-indexação total (500 produtos × 4 chunks) | 1× na migração | ~$0.01 |
| Indexação incremental (novo produto) | Por evento | ~$0.00005 |
| Embedding de query (por chamada ao agent) | Por request | ~$0.000001 |
| **Total mensal** (100 req/dia + 10 produtos novos) | — | **< $0.01** |

Custo de embedding é desprezível comparado ao Claude Haiku (~$0.25/1M tokens).
