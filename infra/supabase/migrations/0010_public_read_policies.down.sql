-- infra/supabase/migrations/0010_public_read_policies.down.sql
DROP POLICY IF EXISTS tenants_public_select ON public.tenants;
DROP POLICY IF EXISTS product_categories_public_select ON public.product_categories;
DROP POLICY IF EXISTS products_public_select ON public.products;
DROP POLICY IF EXISTS regulatory_public_select ON public.regulatory_registrations;
DROP POLICY IF EXISTS learning_tracks_public_select ON public.learning_tracks;
DROP POLICY IF EXISTS learning_modules_public_select ON public.learning_modules;
DROP POLICY IF EXISTS learning_lessons_public_select ON public.learning_lessons;
