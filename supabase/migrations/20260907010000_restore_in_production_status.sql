-- Restore the 'in_production' status to the orders check constraint.
ALTER TABLE public.orders
  DROP CONSTRAINT orders_status_check,
  ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending','accepted','in_production','ready_for_pickup','completed','cancelled'));