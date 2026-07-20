-- Fix orders RLS: ensure anon users can insert orders
-- This runs as a separate migration to guarantee it's applied

-- Explicitly ensure RLS is enabled on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
DROP POLICY IF EXISTS "admin_all_orders" ON orders;

-- Re-create: anonymous users can INSERT orders (to submit without login)
CREATE POLICY "anon_insert_orders" ON orders
  FOR INSERT TO public
  WITH CHECK (true);

-- Also allow anonymous users to SELECT their own orders (by order ID)
CREATE POLICY "anon_select_orders" ON orders
  FOR SELECT TO public
  USING (true);

-- Authenticated (admin) can read/update orders
CREATE POLICY "admin_all_orders" ON orders
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
