-- infra/supabase/migrations/0010_public_read_policies.sql
-- Políticas de leitura pública para conteúdo publicado.
--
-- Contexto:
--   Os apps portal, api e academia expõem catálogos públicos que precisam
--   ser lidos por usuários anônimos. As políticas anteriores exigem
--   auth.tenant_id(), que retorna NULL sem JWT autenticado — bloqueando
--   leituras anônimas legítimas.
--
-- Estratégia:
--   Para cada tabela com conteúdo público, adicionamos uma política
--   adicional que permite SELECT em registros published/active sem exigir
--   autenticação. As políticas existentes (tenant_id = auth.tenant_id())
--   continuam funcionando para usuários autenticados (OR semântico do RLS).
--
-- Escopo: tenants ativos + produtos publicados + conteúdo de aprendizado publicado.
-- Tabelas sensíveis (users, roles, assets, audit_events) permanecem privadas.
--
-- IMPORTANTE: a política de tenants_public deve vir ANTES das demais porque as
-- subqueries de produtos/trilhas fazem EXISTS em tenants. Sem essa política,
-- o role anon não consegue SELECT em tenants e as subqueries retornam vazio.

-- ============================================================================
-- TENANTS — leitura pública de tenants ativos (necessária para subqueries abaixo)
-- ============================================================================
CREATE POLICY tenants_public_select ON public.tenants
  FOR SELECT
  USING (status = 'active');

-- ============================================================================
-- PRODUTO CATEGORIES — leitura pública (necessário para filtros no portal)
-- ============================================================================
CREATE POLICY product_categories_public_select ON public.product_categories
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = product_categories.tenant_id
        AND t.status = 'active'
    )
  );

-- ============================================================================
-- PRODUCTS — leitura pública apenas de registros publicados
-- ============================================================================
CREATE POLICY products_public_select ON public.products
  FOR SELECT
  USING (
    status = 'published'
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = products.tenant_id
        AND t.status = 'active'
    )
  );

-- ============================================================================
-- REGULATORY REGISTRATIONS — leitura pública (complementa produtos)
-- ============================================================================
CREATE POLICY regulatory_public_select ON public.regulatory_registrations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = regulatory_registrations.product_id
        AND p.status = 'published'
        AND p.deleted_at IS NULL
    )
  );

-- ============================================================================
-- LEARNING TRACKS — leitura pública de trilhas publicadas
-- ============================================================================
CREATE POLICY learning_tracks_public_select ON public.learning_tracks
  FOR SELECT
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = learning_tracks.tenant_id
        AND t.status = 'active'
    )
  );

-- ============================================================================
-- LEARNING MODULES — leitura pública (segue visibilidade da trilha)
-- ============================================================================
CREATE POLICY learning_modules_public_select ON public.learning_modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_tracks lt
      WHERE lt.id = learning_modules.track_id
        AND lt.status = 'published'
    )
  );

-- ============================================================================
-- LEARNING LESSONS — leitura pública (segue visibilidade do módulo)
-- ============================================================================
CREATE POLICY learning_lessons_public_select ON public.learning_lessons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_modules lm
      JOIN public.learning_tracks lt ON lt.id = lm.track_id
      WHERE lm.id = learning_lessons.module_id
        AND lt.status = 'published'
    )
  );
