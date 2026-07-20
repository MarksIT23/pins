-- Create previews storage bucket for order preview images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('previews', 'previews', true, 5242880, '{image/png}'::text[])
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous users to upload to previews bucket
CREATE POLICY "anon_upload_previews" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'previews');

-- Allow anonymous users to read from previews bucket
CREATE POLICY "anon_select_previews" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'previews');

-- Allow authenticated (admin) full access to previews bucket
CREATE POLICY "admin_all_previews" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'previews')
  WITH CHECK (bucket_id = 'previews');
