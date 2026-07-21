-- Replace facebook_link with student_id
ALTER TABLE orders ADD COLUMN IF NOT EXISTS student_id TEXT;
