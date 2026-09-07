-- Remove the deprecated 'in_production' status from the orders check constraint.
ALTER TABLE public.orders
  DROP CONSTRAINT orders_status_check,
  ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending','accepted','ready_for_pickup','completed','cancelled'));