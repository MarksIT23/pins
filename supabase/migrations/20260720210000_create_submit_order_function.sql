-- SECURITY DEFINER function: allows anon users to insert orders via RPC
-- This bypasses PostgREST RLS issues with the anon key
CREATE OR REPLACE FUNCTION public.submit_order(
  p_id UUID,
  p_order_number TEXT,
  p_full_name TEXT,
  p_contact_number TEXT,
  p_quantity INTEGER DEFAULT 1,
  p_facebook_name TEXT DEFAULT NULL,
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
    id, order_number, full_name, facebook_name, student_id,
    contact_number, quantity, notes, status, character_config, preview_image_url
  ) VALUES (
    p_id, p_order_number, p_full_name, p_facebook_name, p_student_id,
    p_contact_number, p_quantity, p_notes, 'pending', p_character_config, p_preview_image_url
  )
  RETURNING to_jsonb(orders.*) INTO v_order;

  RETURN v_order;
END;
$$;

-- Grant execute to anon role
GRANT EXECUTE ON FUNCTION public.submit_order TO anon;
