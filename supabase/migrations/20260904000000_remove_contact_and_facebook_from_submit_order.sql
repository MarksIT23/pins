-- Remove facebook_name and contact_number from submit_order
-- The columns remain in the table for historical orders, but new orders no longer collect them.
-- contact_number must be made nullable since new orders no longer provide it.
ALTER TABLE public.orders
  ALTER COLUMN contact_number DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.submit_order(
  p_id UUID,
  p_order_number TEXT,
  p_full_name TEXT,
  p_quantity INTEGER DEFAULT 1,
  p_student_id TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_character_config JSONB DEFAULT '{}',
  p_preview_image_url TEXT DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_order JSONB;
BEGIN
  INSERT INTO orders (
    id, order_number, full_name, student_id,
    quantity, notes, status, character_config, preview_image_url
  ) VALUES (
    p_id, p_order_number, p_full_name, p_student_id,
    p_quantity, p_notes, 'pending', p_character_config, p_preview_image_url
  )
  RETURNING to_jsonb(orders.*) INTO v_order;

  RETURN v_order;
END;
$$;

-- Grant execute to anon role
GRANT EXECUTE ON FUNCTION public.submit_order TO anon;
