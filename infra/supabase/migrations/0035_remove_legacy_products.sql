-- ============================================================================
-- 0035_remove_legacy_products.sql
-- ============================================================================
-- Remove produtos legacy descontinuados (Wilson confirmou em 2026-05-23):
--   - Algen (extrato de algas com P+K) — não trabalha mais
--   - Grow Sulfur (N+S em solução) — não trabalha mais
--
-- Usa SOFT DELETE (deleted_at = now()) em vez de hard DELETE pra preservar:
--   - Foreign keys de pedidos históricos (order_items.product_id)
--   - Foreign keys de embeddings RAG (vector_store.document_id)
--   - Foreign keys de generated_materials.product_ids[]
--   - Foreign keys de leads.product_interest[]
--
-- Após aplicar:
--   pnpm --filter @colheita/jobs reindex-all
--   (remove chunks no pgvector — reindex skip deleted_at IS NOT NULL)
--
-- Idempotente: roda multiplas vezes sem efeito colateral.
-- ============================================================================

DO $$
DECLARE
  v_tenant_id uuid;
  v_algen_id uuid;
  v_sulfur_id uuid;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'argho' LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant argho nao existe';
  END IF;

  -- Soft delete algen
  UPDATE products
  SET
    deleted_at = COALESCE(deleted_at, now()),
    status = 'archived',
    updated_at = now()
  WHERE tenant_id = v_tenant_id
    AND slug = 'algen'
    AND deleted_at IS NULL
  RETURNING id INTO v_algen_id;

  -- Soft delete grow-sulfur
  UPDATE products
  SET
    deleted_at = COALESCE(deleted_at, now()),
    status = 'archived',
    updated_at = now()
  WHERE tenant_id = v_tenant_id
    AND slug = 'grow-sulfur'
    AND deleted_at IS NULL
  RETURNING id INTO v_sulfur_id;

  -- Hard delete chunks no pgvector (RAG) - esses produtos nao devem aparecer
  -- nas respostas do agente agronomico. FK CASCADE nao aplica aqui pq
  -- vector_store.document_id eh logico, nao referencial.
  IF v_algen_id IS NOT NULL THEN
    DELETE FROM vector_store WHERE document_id = v_algen_id;
  END IF;
  IF v_sulfur_id IS NOT NULL THEN
    DELETE FROM vector_store WHERE document_id = v_sulfur_id;
  END IF;

  RAISE NOTICE 'Migration 0035: soft-deleted algen + grow-sulfur e removeu chunks do pgvector.';
END $$;
