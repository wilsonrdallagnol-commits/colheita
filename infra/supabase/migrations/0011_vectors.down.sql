-- infra/supabase/migrations/0011_vectors.down.sql
-- Reverte a migration 0011_vectors.sql

drop function if exists match_lesson_embeddings;
drop function if exists match_product_embeddings;

drop table if exists public.lesson_embeddings;
drop table if exists public.product_embeddings;

-- Não remove a extensão vector pois pode ser usada por outras features
-- drop extension if exists vector;
