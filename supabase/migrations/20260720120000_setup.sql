-- ============================================================
-- PINS APP — Complete Supabase SQL Setup
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ─── 1. Asset Categories ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  layer_order INTEGER NOT NULL DEFAULT 0,
  icon        TEXT DEFAULT '🎀',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Assets ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID NOT NULL REFERENCES asset_categories(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  file_url      TEXT NOT NULL,
  storage_path  TEXT NOT NULL,
  thumbnail_url TEXT,
  tags          TEXT[],
  gender        TEXT DEFAULT 'unisex' CHECK (gender IN ('male', 'female', 'unisex')),
  is_active     BOOLEAN DEFAULT TRUE,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_active ON assets(is_active);
CREATE INDEX IF NOT EXISTS idx_assets_sort ON assets(sort_order);

-- ─── 3. Orders ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      TEXT UNIQUE NOT NULL,
  full_name         TEXT NOT NULL,
  facebook_name     TEXT,
  facebook_link     TEXT,
  contact_number    TEXT NOT NULL,
  quantity          INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  notes             TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','in_production','ready_for_pickup','completed','cancelled')),
  character_config  JSONB NOT NULL DEFAULT '{}',
  preview_image_url TEXT,
  date_ordered      TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date_ordered DESC);

-- ─── 4. Order Items (for future multi-character orders) ────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  character_config  JSONB NOT NULL,
  preview_image_url TEXT,
  quantity          INTEGER NOT NULL DEFAULT 1,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. Seed Default Asset Categories ────────────────────────────────────────
INSERT INTO asset_categories (name, slug, layer_order, icon) VALUES
  ('Base',        'base',        0, '🧸'),
  ('Hair',        'hair',        1, '💇'),
  ('Clothes',     'clothes',     2, '👗'),
  ('Glasses',     'glasses',     3, '🕶️'),
  ('Accessories', 'accessories', 4, '🎀'),
  ('Pendants',    'pendants',    5, '✨')
ON CONFLICT (slug) DO NOTHING;

-- ─── 6. Storage Buckets (run in Dashboard > Storage or via CLI) ────────────
-- Create two public buckets:
--   "assets"   → for character part images
--   "previews" → for order preview PNGs
--
-- Or run in SQL (if using Supabase admin API):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('previews', 'previews', true);

-- ─── 7. Row Level Security (RLS) ─────────────────────────────────────────────
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public can read active categories
DROP POLICY IF EXISTS "public_read_categories" ON asset_categories;
CREATE POLICY "public_read_categories" ON asset_categories
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

-- Public can read active assets
DROP POLICY IF EXISTS "public_read_assets" ON assets;
CREATE POLICY "public_read_assets" ON assets
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

-- Authenticated (admin) can do everything on categories
DROP POLICY IF EXISTS "admin_all_categories" ON asset_categories;
CREATE POLICY "admin_all_categories" ON asset_categories
  FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

-- Authenticated (admin) can do everything on assets
DROP POLICY IF EXISTS "admin_all_assets" ON assets;
CREATE POLICY "admin_all_assets" ON assets
  FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

-- Anonymous can INSERT orders (to submit orders without login)
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders
  FOR INSERT TO public
  WITH CHECK (TRUE);

-- Anonymous can SELECT their own orders
DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders
  FOR SELECT TO public
  USING (TRUE);

-- Authenticated (admin) can read/update orders
DROP POLICY IF EXISTS "admin_all_orders" ON orders;
CREATE POLICY "admin_all_orders" ON orders
  FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

-- Authenticated can read order_items
DROP POLICY IF EXISTS "admin_all_order_items" ON order_items;
CREATE POLICY "admin_all_order_items" ON order_items
  FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);
