-- Add creator categories: Eyes, Eyebrows, Lips, Christmas Outfit.
-- (Eyes/eyebrows were removed in 20260720150000; this brings them back.)
-- Run once in Supabase > SQL Editor. Safe to re-run.
--
-- layer_order mirrors src/utils/layerOrder.ts (bottom → top):
-- background 0, pendants 1, pendant-bg 2, base 3, eyes 4, lips 5, eyebrows 6,
-- clothes 7, christmas-outfit 8, hair 9, glasses 10, college 11, accessories 12

INSERT INTO asset_categories (name, slug, layer_order, icon, is_active) VALUES
  ('Eyes',             'eyes',             4, NULL, TRUE),
  ('Lips',             'lips',             5, NULL, TRUE),
  ('Eyebrows',         'eyebrows',         6, NULL, TRUE),
  ('Christmas Outfit', 'christmas-outfit', 8, NULL, TRUE)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, layer_order = EXCLUDED.layer_order, is_active = TRUE;

-- Keep the existing categories' layer_order in step with the new stack.
UPDATE asset_categories SET layer_order = 3  WHERE slug = 'base';
UPDATE asset_categories SET layer_order = 7  WHERE slug = 'clothes';
UPDATE asset_categories SET layer_order = 9  WHERE slug = 'hair';
UPDATE asset_categories SET layer_order = 10 WHERE slug = 'glasses';
UPDATE asset_categories SET layer_order = 11 WHERE slug = 'college';
UPDATE asset_categories SET layer_order = 12 WHERE slug = 'accessories';
