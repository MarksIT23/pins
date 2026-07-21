-- Remove mouth, eyes, eyebrows categories and their assets (cascade)
DELETE FROM asset_categories WHERE slug IN ('mouth', 'eyes', 'eyebrows');
