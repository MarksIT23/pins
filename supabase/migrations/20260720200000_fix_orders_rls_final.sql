DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
DROP POLICY IF EXISTS "admin_all_orders" ON orders;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- TO public = all roles including anon (TO anon doesn't work with sb_publishable_ key format)
CREATE POLICY "anon_insert_orders" ON orders
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "admin_all_orders" ON orders
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
