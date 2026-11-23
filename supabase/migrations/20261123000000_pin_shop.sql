-- ============================================================
-- Pin Shop: ready-made designs + recording their orders
-- Run once in Supabase > SQL Editor (safe to re-run).
-- ============================================================

-- ─── 1. Shop items (managed from Admin > Pin Shop) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT NOT NULL,
  storage_path  TEXT,                         -- path in the "assets" bucket (shop/…)
  price         NUMERIC(10,2) CHECK (price IS NULL OR price >= 0),
  tint          TEXT NOT NULL DEFAULT '#FFF1CC', -- card background colour
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,  -- hidden items stay in old orders
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_items_active_sort ON public.shop_items(is_active, sort_order);

ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

-- Everyone can see visible designs (TO public, matching the publishable-key note in earlier migrations)
DROP POLICY IF EXISTS "public_read_shop_items" ON public.shop_items;
CREATE POLICY "public_read_shop_items" ON public.shop_items
  FOR SELECT TO public
  USING (is_active = TRUE);

-- Signed-in admins can do everything, including seeing hidden designs
DROP POLICY IF EXISTS "admin_all_shop_items" ON public.shop_items;
CREATE POLICY "admin_all_shop_items" ON public.shop_items
  FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

-- ─── 2. Orders: record what kind of order it is ─────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'custom',
  ADD COLUMN IF NOT EXISTS shop_item_id UUID REFERENCES public.shop_items(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_order_type_check') THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_order_type_check CHECK (order_type IN ('custom', 'shop'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_type ON public.orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_shop_item ON public.orders(shop_item_id);

-- ─── 3. submit_order: accept shop orders ────────────────────────────────────
-- Drop the old signature first so PostgREST doesn't see two overloads.
DROP FUNCTION IF EXISTS public.submit_order(UUID, TEXT, TEXT, INTEGER, TEXT, TEXT, JSONB, TEXT);

CREATE OR REPLACE FUNCTION public.submit_order(
  p_id UUID,
  p_order_number TEXT,
  p_full_name TEXT,
  p_quantity INTEGER DEFAULT 1,
  p_student_id TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_character_config JSONB DEFAULT '{}',
  p_preview_image_url TEXT DEFAULT NULL,
  p_order_type TEXT DEFAULT 'custom',
  p_shop_item_id UUID DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_order JSONB;
  v_preview TEXT := p_preview_image_url;
BEGIN
  IF p_order_type = 'shop' THEN
    -- Only visible designs can be ordered; use the design's own image as the preview.
    SELECT image_url INTO v_preview
    FROM shop_items
    WHERE id = p_shop_item_id AND is_active = TRUE;

    IF v_preview IS NULL THEN
      RAISE EXCEPTION 'This Pin Shop design is not available.';
    END IF;
  END IF;

  INSERT INTO orders (
    id, order_number, full_name, student_id,
    quantity, notes, status, character_config, preview_image_url,
    order_type, shop_item_id
  ) VALUES (
    p_id, p_order_number, p_full_name, p_student_id,
    p_quantity, p_notes, 'pending', p_character_config, v_preview,
    COALESCE(p_order_type, 'custom'), CASE WHEN p_order_type = 'shop' THEN p_shop_item_id END
  )
  RETURNING to_jsonb(orders.*) INTO v_order;

  RETURN v_order;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_order(UUID, TEXT, TEXT, INTEGER, TEXT, TEXT, JSONB, TEXT, TEXT, UUID) TO anon, authenticated;

-- ─── 4. Order tracking: include the order type and design name ──────────────
-- (Replaces the version from 20261120000000_order_lookup_function.sql.)
CREATE OR REPLACE FUNCTION public.get_order_status(p_order_number TEXT)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'order_number',      o.order_number,
    'status',            o.status,
    'quantity',          o.quantity,
    'date_ordered',      o.date_ordered,
    'updated_at',        o.updated_at,
    'preview_image_url', o.preview_image_url,
    'order_type',        o.order_type,
    'shop_item_name',    s.name,
    'display_name',      trim(
                           split_part(trim(o.full_name), ' ', 1) || ' ' ||
                           CASE
                             WHEN position(' ' IN trim(o.full_name)) > 0
                             THEN upper(left(regexp_replace(trim(o.full_name), '^.*\s', ''), 1)) || '.'
                             ELSE ''
                           END
                         )
  )
  FROM orders o
  LEFT JOIN shop_items s ON s.id = o.shop_item_id
  WHERE upper(o.order_number) = upper(trim(p_order_number))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_status(TEXT) TO anon, authenticated;

-- ─── 5. Storage ─────────────────────────────────────────────────────────────
-- Shop images go in the existing public "assets" bucket under shop/.
-- Admins already upload there for character parts, so no new bucket is needed.
