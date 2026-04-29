-- infra/supabase/migrations/0011_vectors.sql
--
-- Fase 2: Knowledge Base via pgvector.
-- Habilita a extensão pgvector e cria tabelas de embeddings para
-- produtos e lições. Estas tabelas alimentam o RAG pipeline em
-- packages/ai (SupabaseVectorRetriever).
--
-- DEPENDÊNCIAS: 0002_pim.sql (products), 0005_academia.sql (learning_lessons)
--
-- SEGURANÇA: RLS habilitado, isolamento por tenant_id.
-- MODELO: text-embedding-3-small (1536 dims) — OpenAI/Voyage compatível.
-- Para trocar de modelo, ajuste a dimensão da coluna embedding (alter type vector).

-- ============================================================================
-- Extensão pgvector
-- ============================================================================

create extension if not exists vector;

-- ============================================================================
-- Embeddings de produtos (PIM → RAG)
-- ============================================================================

create table if not exists public.product_embeddings (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  product_id   uuid not null references public.products(id) on delete cascade,

  -- Chunk de texto que gerou o embedding (para debug e re-embedding)
  chunk_text   text not null,

  -- Tipo de chunk: 'name', 'description', 'composition', 'specs', 'application'
  chunk_type   text not null default 'description',

  -- Vetor de embedding (1536 dims = text-embedding-3-small)
  embedding    vector(1536) not null,

  -- Modelo e dimensão usados para geração (permite detecção de desatualização)
  model        text not null default 'text-embedding-3-small',

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- Índice único por produto + tipo de chunk para evitar duplicatas no upsert
  constraint product_embeddings_unique unique (product_id, chunk_type)
);

-- Índice de similaridade coseno (HNSW — melhor performance em produção que IVFFlat)
-- ef_construction=128, m=16 é o trade-off recomendado para produção
create index product_embeddings_hnsw_idx
  on public.product_embeddings
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 128);

-- Índice para filtrar por tenant antes do kNN
create index product_embeddings_tenant_idx
  on public.product_embeddings (tenant_id);

create trigger product_embeddings_updated_at
  before update on public.product_embeddings
  for each row execute function set_updated_at();

alter table public.product_embeddings enable row level security;

create policy product_embeddings_select
  on public.product_embeddings for select
  using (tenant_id = auth.tenant_id());

-- ============================================================================
-- Embeddings de lições da Academia (learning_lessons → RAG)
-- ============================================================================

create table if not exists public.lesson_embeddings (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  lesson_id    uuid not null references public.learning_lessons(id) on delete cascade,

  -- Chunk de texto (título + conteúdo da lição, ou fragmento se lição grande)
  chunk_text   text not null,
  chunk_type   text not null default 'content',

  -- Vetor de embedding
  embedding    vector(1536) not null,
  model        text not null default 'text-embedding-3-small',

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint lesson_embeddings_unique unique (lesson_id, chunk_type)
);

create index lesson_embeddings_hnsw_idx
  on public.lesson_embeddings
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 128);

create index lesson_embeddings_tenant_idx
  on public.lesson_embeddings (tenant_id);

create trigger lesson_embeddings_updated_at
  before update on public.lesson_embeddings
  for each row execute function set_updated_at();

alter table public.lesson_embeddings enable row level security;

create policy lesson_embeddings_select
  on public.lesson_embeddings for select
  using (tenant_id = auth.tenant_id());

-- ============================================================================
-- Função: match_product_embeddings
-- Busca os K produtos mais similares ao vetor de query.
-- Filtra por tenant_id do JWT (RLS) e por distância mínima (threshold).
-- ============================================================================

create or replace function match_product_embeddings(
  query_embedding  vector(1536),
  match_count      int     default 5,
  similarity_threshold float default 0.7
)
returns table (
  product_id   uuid,
  chunk_text   text,
  chunk_type   text,
  similarity   float
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    pe.product_id,
    pe.chunk_text,
    pe.chunk_type,
    1 - (pe.embedding <=> query_embedding) as similarity
  from public.product_embeddings pe
  where
    pe.tenant_id = auth.tenant_id()
    and 1 - (pe.embedding <=> query_embedding) >= similarity_threshold
  order by pe.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function match_product_embeddings to authenticated;

-- ============================================================================
-- Função: match_lesson_embeddings
-- Busca as K lições mais similares ao vetor de query.
-- ============================================================================

create or replace function match_lesson_embeddings(
  query_embedding  vector(1536),
  match_count      int     default 5,
  similarity_threshold float default 0.7
)
returns table (
  lesson_id    uuid,
  chunk_text   text,
  chunk_type   text,
  similarity   float
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    le.lesson_id,
    le.chunk_text,
    le.chunk_type,
    1 - (le.embedding <=> query_embedding) as similarity
  from public.lesson_embeddings le
  where
    le.tenant_id = auth.tenant_id()
    and 1 - (le.embedding <=> query_embedding) >= similarity_threshold
  order by le.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function match_lesson_embeddings to authenticated;
