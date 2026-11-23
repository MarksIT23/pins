import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { uploadAssetFile, deleteAssetFile } from '@/lib/storage'
import { AssetUploadPayload, Asset } from '@/types'
import toast from 'react-hot-toast'

/** Upload a new asset */
export function useUploadAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AssetUploadPayload & { categorySlug: string }) => {
      const { path, url } = await uploadAssetFile(payload.file, payload.categorySlug)

      const slug = payload.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      const { data, error } = await supabase.from('assets').insert({
        category_id: payload.category_id,
        name: payload.name,
        slug: `${slug}-${Date.now()}`,
        file_url: url,
        storage_path: path,
        gender: payload.gender,
        tags: payload.tags ?? [],
        is_active: true,
        sort_order: 0,
      }).select().single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success('Asset uploaded')
    },
    onError: (err: Error) => {
      toast.error(`Upload failed: ${err.message}`)
    },
  })
}

/** Delete an asset */
export function useDeleteAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      // Delete from storage
      await deleteAssetFile(storagePath)
      // Delete from DB
      const { error } = await supabase.from('assets').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success('Asset deleted')
    },
    onError: (err: Error) => {
      toast.error(`Delete failed: ${err.message}`)
    },
  })
}

/** Toggle asset active state */
export function useToggleAssetActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('assets')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

/** Update asset sort order */
export function useUpdateAssetOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      for (const u of updates) {
        await supabase
          .from('assets')
          .update({ sort_order: u.sort_order })
          .eq('id', u.id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

/** Update asset name and category */
export function useUpdateAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name, category_id, clearDefault }: { id: string; name: string; category_id: string; clearDefault?: boolean }) => {
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      const { error } = await supabase
        .from('assets')
        .update({
          name,
          slug: `${slug}-${Date.now()}`,
          category_id,
          // Moving to another category drops "default" (each category has its own)
          ...(clearDefault ? { is_default: false } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success('Asset updated')
    },
    onError: (err: Error) => {
      toast.error(`Update failed: ${err.message}`)
    },
  })
}

/** Make an asset the starting part for its category (clears any other default there). */
export function useSetDefaultAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ asset, makeDefault }: { asset: Asset; makeDefault: boolean }) => {
      // Clear first: the database allows one default per category.
      const { error: clearErr } = await supabase
        .from('assets')
        .update({ is_default: false })
        .eq('category_id', asset.category_id)
        .eq('is_default', true)
      if (clearErr) throw clearErr
      if (makeDefault) {
        const { error } = await supabase.from('assets').update({ is_default: true }).eq('id', asset.id)
        if (error) throw error
      }
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['starter-defaults'] })
      toast.success(vars.makeDefault ? `${vars.asset.name} is now the default` : 'Default removed')
    },
    onError: (err: Error) => {
      toast.error(
        /is_default/.test(err.message)
          ? 'Run the asset defaults SQL in Supabase first (20261123020000_asset_defaults.sql).'
          : `Couldn't set default: ${err.message}`,
      )
    },
  })
}

/** Admin sign in */
export function useAdminSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    },
    onError: (err: Error) => {
      toast.error(`Login failed: ${err.message}`)
    },
  })
}

/** Admin sign out */
export function useAdminSignOut() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  })
}
