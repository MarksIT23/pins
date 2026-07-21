-- Force-clean all orders RLS policies and recreate
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
DROP POLICY IF EXISTS "anon_select_orders" ON orders;
DROP POLICY IF EXISTS "admin_all_orders" ON orders;
DROP POLICY IF EXISTS "public_read_orders" ON orders;

-- Ensure anon role has base INSERT privilege
GRANT INSERT ON orders TO anon;

-- Re-enable RLS (idempotent)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow anonymous INSERT (for public order submission) — both anon + public for safety
CREATE POLICY "anon_insert_orders" ON orders
  FOR INSERT TO anon, public
  WITH CHECK (true);

-- Admin can do everything
CREATE POLICY "admin_all_orders" ON orders
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
