import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Asset, AssetCategory } from '@/types'
import { LAYER_SLUGS } from '@/utils/layerOrder'

/** Fetch all active categories */
export function useCategories() {
  return useQuery<AssetCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_categories')
        .select('*')
        .eq('is_active', true)
        .order('layer_order', { ascending: true })
      if (error) throw error
      // Sort by layer order for display
      return (data ?? []).sort((a, b) => {
        const ai = LAYER_SLUGS.indexOf(a.slug)
        const bi = LAYER_SLUGS.indexOf(b.slug)
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
      })
    },
    staleTime: 5 * 60 * 1000,
  })
}

/** Fetch all active categories (including inactive for admin) */
export function useAllCategories() {
  return useQuery<AssetCategory[]>({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_categories')
        .select('*')
        .order('layer_order', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

/** Fetch assets for a given category slug */
export function useAssetsByCategory(categoryId: string | undefined, gender?: string) {
  return useQuery<Asset[]>({
    queryKey: ['assets', categoryId, gender],
    queryFn: async () => {
      if (!categoryId) return []
      let query = supabase
        .from('assets')
        .select('*, category:asset_categories(id,name,slug,layer_order,icon,is_active,created_at)')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (gender && gender !== 'all') {
        query = query.in('gender', [gender, 'unisex'])
      }

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000,
  })
}

/** Fetch ALL assets (admin) */
export function useAllAssets() {
  return useQuery<Asset[]>({
    queryKey: ['assets', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*, category:asset_categories(id,name,slug,layer_order,icon,is_active,created_at)')
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

/** Fetch a single asset by ID */
export function useAssetById(id: string | null) {
  return useQuery<Asset | null>({
    queryKey: ['asset', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

/** Categories a fresh design starts filled in. */
export const STARTER_SLUGS = ['base', 'eyes', 'eyebrows', 'lips', 'clothes'] as const

/**
 * The part a category starts with: the one marked default in the admin,
 * otherwise the first one as listed in the picker (by name).
 */
export function pickDefault(assets: Asset[]): Asset | undefined {
  return assets.find((a) => a.is_default) ?? [...assets].sort((a, b) => a.name.localeCompare(b.name))[0]
}

/** Default asset per starter category, fetched in one request. Keyed by category slug. */
export function useStarterDefaults(categories: AssetCategory[]) {
  const starters = categories.filter((c) => (STARTER_SLUGS as readonly string[]).includes(c.slug))
  const ids = starters.map((c) => c.id)
  return useQuery<Record<string, string>>({
    queryKey: ['starter-defaults', ids.join(',')],
    queryFn: async () => {
      if (ids.length === 0) return {}
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .in('category_id', ids)
        .eq('is_active', true)
      if (error) throw error
      const out: Record<string, string> = {}
      for (const cat of starters) {
        const pick = pickDefault((data ?? []).filter((a) => a.category_id === cat.id) as Asset[])
        if (pick) out[cat.slug] = pick.id
      }
      return out
    },
    enabled: categories.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}