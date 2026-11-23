-- Public order lookup by order number.
--
-- Anonymous users still cannot SELECT from orders (see 20260720160000_fix_orders_data_exposure.sql).
-- This SECURITY DEFINER function returns ONE order by its exact order number, and only
-- non-sensitive fields: no student ID, no notes, and the name is masked ("Gerard T.").
-- Order numbers are guessable (date + 4 digits), so never add personal data here.

CREATE OR REPLACE FUNCTION public.get_order_status(p_order_number TEXT)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'order_number',      o.order_number,
    'status',            o.status,
    'quantity',          o.quantity,
    'date_ordered',      o.date_ordered,
    'updated_at',        o.updated_at,
    'preview_image_url', o.preview_image_url,
    -- First name + last initial, e.g. "Maria Santos" -> "Maria S."
    'display_name',      trim(
                           split_part(trim(o.full_name), ' ', 1) || ' ' ||
                           CASE
                             WHEN position(' ' IN trim(o.full_name)) > 0
                             THEN upper(left(regexp_replace(trim(o.full_name), '^.*\s', ''), 1)) || '.'
                             ELSE ''
                           END
                         )
  )
  FROM orders o
  WHERE upper(o.order_number) = upper(trim(p_order_number))
  LIMIT 1;
$$;

-- Same access model as submit_order (callable with the publishable key).
GRANT EXECUTE ON FUNCTION public.get_order_status(TEXT) TO anon, authenticated;
