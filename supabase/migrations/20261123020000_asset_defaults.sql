-- Default parts: the asset a fresh design starts with, one per category.
-- Set from Admin > Assets (star button). Run once in Supabase > SQL Editor. Safe to re-run.

ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE;

-- At most one default per category
CREATE UNIQUE INDEX IF NOT EXISTS uniq_assets_one_default_per_category
  ON public.assets (category_id)
  WHERE is_default;
