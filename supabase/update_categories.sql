-- ============================================================
-- Update categories to match new layer stack:
--   Background → Pendant → Base → Clothes → Hair → Glasses → Accessories
-- ============================================================

-- 1. Add Background category
INSERT INTO asset_categories (name, slug, layer_order, icon)
VALUES ('Background', 'background', 0, '🌈')
ON CONFLICT (slug) DO NOTHING;

-- 2. Rename "Pendants" → "Pendant" and move to layer 1
UPDATE asset_categories SET name = 'Pendant', layer_order = 1 WHERE slug = 'pendants';

-- 3. Update remaining active categories to correct layer order
UPDATE asset_categories SET layer_order = 2 WHERE slug = 'base';
UPDATE asset_categories SET name = 'Outfit', layer_order = 3 WHERE slug = 'clothes';
UPDATE asset_categories SET layer_order = 4 WHERE slug = 'hair';
UPDATE asset_categories SET layer_order = 5 WHERE slug = 'glasses';
UPDATE asset_categories SET layer_order = 6 WHERE slug = 'accessories';

-- 4. Deactivate unused categories
UPDATE asset_categories SET is_active = false WHERE slug IN ('eyes', 'eyebrows', 'mouth');

-- 5. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
