import { supabase } from './supabase'

const ASSETS_BUCKET = 'assets'
const PREVIEWS_BUCKET = 'previews'

/**
 * Upload an asset file to Supabase Storage
 */
export async function uploadAssetFile(
  file: File,
  categorySlug: string
): Promise<{ path: string; url: string }> {
  const ext = file.name.split('.').pop()
  const filename = `${crypto.randomUUID()}.${ext}`
  const path = `${categorySlug}/${filename}`

  const { error } = await supabase.storage
    .from(ASSETS_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type })

  if (error) throw error

  const { data } = supabase.storage.from(ASSETS_BUCKET).getPublicUrl(path)
  return { path, url: data.publicUrl }
}

/**
 * Upload a preview PNG blob for an order
 */
export async function uploadPreviewImage(
  blob: Blob,
  orderId: string
): Promise<string> {
  const path = `${orderId}/preview.png`

  const { error } = await supabase.storage
    .from(PREVIEWS_BUCKET)
    .upload(path, blob, { upsert: true, contentType: 'image/png' })

  if (error) throw error

  const { data } = supabase.storage.from(PREVIEWS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Delete an asset file from storage
 */
export async function deleteAssetFile(storagePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(ASSETS_BUCKET)
    .remove([storagePath])

  if (error) throw error
}

/**
 * Get public URL for any storage path
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
