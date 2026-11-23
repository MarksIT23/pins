-- ============================================================
-- Pin Shop categories (managed from Admin > Pin Shop)
-- Run once in Supabase > SQL Editor (safe to re-run).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.shop_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL CHECK (length(trim(name)) > 0),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_categories_sort ON public.shop_categories(sort_order);

ALTER TABLE public.shop_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can see the categories (TO public, as in the earlier migrations)
DROP POLICY IF EXISTS "public_read_shop_categories" ON public.shop_categories;
CREATE POLICY "public_read_shop_categories" ON public.shop_categories
  FOR SELECT TO public
  USING (TRUE);

-- Signed-in admins can add, rename, reorder and delete them
DROP POLICY IF EXISTS "admin_all_shop_categories" ON public.shop_categories;
CREATE POLICY "admin_all_shop_categories" ON public.shop_categories
  FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

-- Each design can belong to one category. Deleting a category keeps its designs
-- (they become uncategorised).
ALTER TABLE public.shop_items
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.shop_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_shop_items_category ON public.shop_items(category_id);

-- Make PostgREST pick up the new table and column straight away
NOTIFY pgrst, 'reload schema';
