-- infra/supabase/migrations/0042_learning_tracks_lessons_count.sql
--
-- FIX MÉDIO #13 (auditoria hm-engineer 2026-05-23):
--   /conta/academia faz join triple-nested
--     learning_tracks(learning_modules(learning_lessons(id)))
--   só pra contar lessons por trilha. Em 50 tracks × 10 mods × 20
--   lessons = 10k rows transferidos pra calcular um sum.
--
-- Solução: coluna materializada `lessons_count` em learning_tracks
-- atualizada via trigger AFTER INSERT/DELETE em learning_lessons.
-- Query de catálogo vira simples SELECT lessons_count.

-- 1) Adiciona coluna (idempotente)
ALTER TABLE public.learning_tracks
  ADD COLUMN IF NOT EXISTS lessons_count integer NOT NULL DEFAULT 0;

-- 2) Backfill: popula valores atuais. SAFE — calcula via join e
-- atualiza cada track. Em ambientes vazios é no-op.
WITH counts AS (
  SELECT
    lm.track_id,
    COUNT(ll.id) AS n
  FROM public.learning_modules lm
  LEFT JOIN public.learning_lessons ll ON ll.module_id = lm.id
  GROUP BY lm.track_id
)
UPDATE public.learning_tracks lt
  SET lessons_count = COALESCE(c.n, 0)
  FROM counts c
  WHERE lt.id = c.track_id;

-- 3) Trigger function: atualiza count da trilha pai quando
-- uma lesson é INSERT/DELETE. UPDATE não muda count (só module_id
-- mudaria, e isso é raríssimo + edge-case complexo — ignoramos
-- e deixamos uma reconciliação manual via UPDATE direto se
-- realmente acontecer).
CREATE OR REPLACE FUNCTION public.trg_learning_lessons_recount()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_track_id uuid;
BEGIN
  -- Pega track_id via module_id (lessons só têm module_id direto)
  IF TG_OP = 'INSERT' THEN
    SELECT track_id INTO v_track_id
    FROM public.learning_modules WHERE id = NEW.module_id;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT track_id INTO v_track_id
    FROM public.learning_modules WHERE id = OLD.module_id;
  END IF;

  IF v_track_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Recalcula via aggregate (mais simples e correto que +1/-1
  -- quando há ON CASCADE delete de módulo inteiro)
  UPDATE public.learning_tracks lt
    SET lessons_count = (
      SELECT COUNT(ll.id)
      FROM public.learning_lessons ll
      JOIN public.learning_modules lm ON lm.id = ll.module_id
      WHERE lm.track_id = v_track_id
    )
    WHERE lt.id = v_track_id;

  RETURN COALESCE(NEW, OLD);
END $$;

-- 4) Trigger: AFTER INSERT/DELETE em learning_lessons
DROP TRIGGER IF EXISTS learning_lessons_recount ON public.learning_lessons;
CREATE TRIGGER learning_lessons_recount
  AFTER INSERT OR DELETE ON public.learning_lessons
  FOR EACH ROW EXECUTE FUNCTION public.trg_learning_lessons_recount();

-- 5) Bônus: também recalcula quando módulo é movido entre trilhas
-- (raro, mas previne staleness). Atualiza tanto track antigo quanto
-- novo via gatilho em learning_modules UPDATE.
CREATE OR REPLACE FUNCTION public.trg_learning_modules_track_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.track_id IS DISTINCT FROM OLD.track_id THEN
    -- Recalcula ambas as trilhas
    UPDATE public.learning_tracks lt
      SET lessons_count = (
        SELECT COUNT(ll.id)
        FROM public.learning_lessons ll
        JOIN public.learning_modules lm ON lm.id = ll.module_id
        WHERE lm.track_id = lt.id
      )
      WHERE lt.id IN (OLD.track_id, NEW.track_id);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS learning_modules_track_change ON public.learning_modules;
CREATE TRIGGER learning_modules_track_change
  AFTER UPDATE OF track_id ON public.learning_modules
  FOR EACH ROW EXECUTE FUNCTION public.trg_learning_modules_track_change();

COMMENT ON COLUMN public.learning_tracks.lessons_count IS
  'Total de lições agregadas (módulos × lições). Mantido por trigger.
   Atualiza em INSERT/DELETE de learning_lessons + UPDATE de track_id
   em learning_modules.';
