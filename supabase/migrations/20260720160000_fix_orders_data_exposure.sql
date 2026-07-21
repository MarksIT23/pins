-- Security fix: remove anon SELECT on orders (PII exposure)
-- Anon users don't need to read orders — only the admin panel needs it
DROP POLICY IF EXISTS "anon_select_orders" ON orders;
