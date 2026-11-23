import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { uploadAssetFile, deleteAssetFile } from '@/lib/storage'
import type { ShopItem, ShopCategory } from '@/types'

/** Thrown when the shop_items table hasn't been created in Supabase yet. */
export class ShopNotSetUpError extends Error {}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export function validateShopImage(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return 'Use a PNG, JPG or WebP image.'
  if (file.size > MAX_IMAGE_BYTES) return 'Image must be 5 MB or smaller.'
  return null
}

/**
 * Pin Shop designs. Public visitors get visible ones only (RLS);
 * pass includeHidden for the admin page (signed-in admins can see all).
 */
export function useShopItems({ includeHidden = false }: { includeHidden?: boolean } = {}) {
  return useQuery<ShopItem[]>({
    queryKey: ['shop-items', includeHidden],
    queryFn: async () => {
      if (!isSupabaseConfigured) throw new ShopNotSetUpError('Supabase keys are missing from .env.local.')
      let query = supabase
        .from('shop_items')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
      if (!includeHidden) query = query.eq('is_active', true)
      const { data, error } = await query
      if (error) {
        // PGRST205 = table not found (migration not applied yet)
        if (error.code === 'PGRST205' || error.code === '42P01') {
          throw new ShopNotSetUpError('The shop_items table is not in Supabase yet.')
        }
        throw error
      }
      return (data ?? []) as ShopItem[]
    },
    retry: false,
  })
}

export interface ShopItemInput {
  name: string
  description: string
  price: number | null
  tint: string
  /** undefined = leave unchanged (e.g. categories not set up yet), null = uncategorised */
  category_id?: string | null
}

/** Upload an image and add a new design at the end of the list. */
export function useCreateShopItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ file, values }: { file: File; values: ShopItemInput }) => {
      const invalid = validateShopImage(file)
      if (invalid) throw new Error(invalid)

      const { path, url } = await uploadAssetFile(file, 'shop')

      const { data: last } = await supabase
        .from('shop_items')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { error } = await supabase.from('shop_items').insert({
        name: values.name.trim(),
        description: values.description.trim() || null,
        price: values.price,
        tint: values.tint,
        ...(values.category_id !== undefined ? { category_id: values.category_id } : {}),
        image_url: url,
        storage_path: path,
        sort_order: (last?.sort_order ?? -1) + 1,
      })
      if (error) {
        await deleteAssetFile(path).catch(() => {}) // don't leave an orphaned upload
        throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shop-items'] })
      toast.success('Design added to the Pin Shop')
    },
    onError: (err: Error) => toast.error(`Couldn't add design: ${err.message}`),
  })
}

/** Edit details, optionally swap the image, or show/hide a design. */
export function useUpdateShopItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ item, values, file, isActive }: {
      item: ShopItem
      values?: ShopItemInput
      file?: File | null
      isActive?: boolean
    }) => {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (values) {
        patch.name = values.name.trim()
        patch.description = values.description.trim() || null
        patch.price = values.price
        patch.tint = values.tint
        if (values.category_id !== undefined) patch.category_id = values.category_id
      }
      if (typeof isActive === 'boolean') patch.is_active = isActive

      let newPath: string | null = null
      if (file) {
        const invalid = validateShopImage(file)
        if (invalid) throw new Error(invalid)
        const uploaded = await uploadAssetFile(file, 'shop')
        newPath = uploaded.path
        patch.image_url = uploaded.url
        patch.storage_path = uploaded.path
      }

      const { error } = await supabase.from('shop_items').update(patch).eq('id', item.id)
      if (error) {
        if (newPath) await deleteAssetFile(newPath).catch(() => {})
        throw error
      }
      // The old image is kept: past orders still show it as their preview.
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['shop-items'] })
      toast.success(
        typeof vars.isActive === 'boolean' && !vars.values
          ? vars.isActive ? 'Design is visible in the shop' : 'Design hidden from the shop'
          : 'Design updated',
      )
    },
    onError: (err: Error) => toast.error(`Couldn't update design: ${err.message}`),
  })
}

/** Move a design one place up or down by swapping sort_order with its neighbour. */
export function useMoveShopItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ a, b }: { a: ShopItem; b: ShopItem }) => {
      const r1 = await supabase.from('shop_items').update({ sort_order: b.sort_order }).eq('id', a.id)
      if (r1.error) throw r1.error
      const r2 = await supabase.from('shop_items').update({ sort_order: a.sort_order }).eq('id', b.id)
      if (r2.error) throw r2.error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shop-items'] }),
    onError: (err: Error) => toast.error(`Couldn't reorder: ${err.message}`),
  })
}

/**
 * Delete a design. Orders that used it keep their record (shop_item_id becomes null)
 * and keep showing the image, so the image file is only removed if no order uses it.
 */
export function useDeleteShopItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (item: ShopItem) => {
      const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('shop_item_id', item.id)

      const { error } = await supabase.from('shop_items').delete().eq('id', item.id)
      if (error) throw error

      if (!count && item.storage_path) await deleteAssetFile(item.storage_path).catch(() => {})
      return { hadOrders: !!count }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shop-items'] })
      toast.success('Design deleted')
    },
    onError: (err: Error) => toast.error(`Couldn't delete design: ${err.message}`),
  })
}

// ─── Categories ──────────────────────────────────────────────────────────────

/** Thrown when the shop_categories table hasn't been created in Supabase yet. */
export class ShopCategoriesNotSetUpError extends Error {}

/** Pin Shop categories in display order. */
export function useShopCategories() {
  return useQuery<ShopCategory[]>({
    queryKey: ['shop-categories'],
    queryFn: async () => {
      if (!isSupabaseConfigured) throw new ShopCategoriesNotSetUpError('Supabase keys are missing from .env.local.')
      const { data, error } = await supabase
        .from('shop_categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01') {
          throw new ShopCategoriesNotSetUpError('The shop_categories table is not in Supabase yet.')
        }
        throw error
      }
      return (data ?? []) as ShopCategory[]
    },
    retry: false,
  })
}

export function useCreateShopCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data: last } = await supabase
        .from('shop_categories')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle()
      const { error } = await supabase
        .from('shop_categories')
        .insert({ name: name.trim(), sort_order: (last?.sort_order ?? -1) + 1 })
      if (error) throw error
    },
    onSuccess: (_d, name) => {
      qc.invalidateQueries({ queryKey: ['shop-categories'] })
      toast.success(`Category "${name.trim()}" added`)
    },
    onError: (err: Error) => toast.error(`Couldn't add category: ${err.message}`),
  })
}

export function useRenameShopCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from('shop_categories').update({ name: name.trim() }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shop-categories'] })
      toast.success('Category renamed')
    },
    onError: (err: Error) => toast.error(`Couldn't rename category: ${err.message}`),
  })
}

/** Swap two categories' places. */
export function useMoveShopCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ a, b }: { a: ShopCategory; b: ShopCategory }) => {
      // Equal sort orders can't be swapped, so fall back to their list positions.
      const [sa, sb] = a.sort_order === b.sort_order ? [b.sort_order + 1, a.sort_order] : [b.sort_order, a.sort_order]
      const r1 = await supabase.from('shop_categories').update({ sort_order: sa }).eq('id', a.id)
      if (r1.error) throw r1.error
      const r2 = await supabase.from('shop_categories').update({ sort_order: sb }).eq('id', b.id)
      if (r2.error) throw r2.error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shop-categories'] }),
    onError: (err: Error) => toast.error(`Couldn't reorder: ${err.message}`),
  })
}

/** Delete a category. Its designs stay in the shop, uncategorised. */
export function useDeleteShopCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shop_categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shop-categories'] })
      qc.invalidateQueries({ queryKey: ['shop-items'] })
      toast.success('Category deleted. Its designs are now uncategorised.')
    },
    onError: (err: Error) => toast.error(`Couldn't delete category: ${err.message}`),
  })
}
