import { AssetCategory } from '@/types'

/**
 * LAYER ORDER — defines the z-index stack of the character rendering.
 * Bottom to top: Background → Pendant → Base → Hair → Glasses → Accessories
 * Lower number = rendered first (further back).
 */
export const LAYER_ORDER: Record<string, number> = {
  background:  0,
  pendants:    1,
  base:        2,
  clothes:     3,
  hair:        4,
  glasses:     5,
  accessories: 6,
  text:        7,
}

/**
 * Category display config: icon and label.
 * All are single-select.
 */
export const CATEGORY_UI: Record<string, { icon: string; label: string }> = {
  background:  { icon: '🌈', label: 'Background' },
  pendants:    { icon: '✨', label: 'Pendant' },
  base:        { icon: '🧸', label: 'Base' },
  clothes:     { icon: '👗', label: 'Clothes' },
  hair:        { icon: '💇', label: 'Hair' },
  glasses:     { icon: '🕶️', label: 'Glasses' },
  accessories: { icon: '🎀', label: 'Accessories' },
  text:        { icon: '✏️', label: 'Text' },
}

/** Names of the active layer slugs, in render order (bottom→top). */
export const LAYER_SLUGS = ['background', 'pendants', 'base', 'clothes', 'hair', 'glasses', 'accessories', 'text']

/**
 * Filter API categories to only our 6 active layers, sorted in render order.
 */
export function filterActiveCategories(categories: AssetCategory[]): AssetCategory[] {
  const order = new Map(LAYER_SLUGS.map((s, i) => [s, i]))
  return categories
    .filter((c) => LAYER_SLUGS.includes(c.slug))
    .sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99))
}

/**
 * Sort categories by their layer order for display (legacy helper).
 */
export function sortCategoriesByLayerOrder(categories: AssetCategory[]): AssetCategory[] {
  return filterActiveCategories(categories)
}
