import { AssetCategory } from '@/types'

/**
 * LAYER ORDER — defines the z-index stack of the character rendering.
 * Bottom to top. Lower number = rendered first (further back).
 */
export const LAYER_ORDER: Record<string, number> = {
  background:   0,
  pendants:     1,
  'pendant-bg': 2,
  base:         3,
  clothes:      4,
  hair:         5,
  glasses:      6,
  accessories:  7,
  text:         8,
}

/**
 * Category display config: icon and label.
 */
export const CATEGORY_UI: Record<string, { icon: string; label: string }> = {
  background:   { icon: '🌈', label: 'Background' },
  pendants:     { icon: '✨', label: 'Pendant' },
  'pendant-bg': { icon: '🖼️', label: 'Pendant BG' },
  base:         { icon: '🧸', label: 'Base' },
  clothes:      { icon: '👗', label: 'Clothes' },
  hair:         { icon: '💇', label: 'Hair' },
  glasses:      { icon: '🕶️', label: 'Glasses' },
  accessories:  { icon: '🎀', label: 'Accessories' },
  text:         { icon: '✏️', label: 'Text' },
}

/** Names of the active layer slugs, in render order (bottom→top). */
export const LAYER_SLUGS = [
  'background',
  'pendants',
  'pendant-bg',
  'base',
  'clothes',
  'hair',
  'glasses',
  'accessories',
  'text',
]

/** Button display order (can differ from render order). */
export const BUTTON_ORDER = [
  'background',
  'base',
  'pendants',
  'pendant-bg',
  'clothes',
  'hair',
  'glasses',
  'accessories',
  'text',
]

/**
 * Filter API categories to only our active layers, sorted in button display order.
 */
export function filterActiveCategories(categories: AssetCategory[]): AssetCategory[] {
  const order = new Map(BUTTON_ORDER.map((s, i) => [s, i]))
  return categories
    .filter((c) => LAYER_SLUGS.includes(c.slug))
    .sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99))
}

/**
 * Sort categories by their button order for display (legacy helper).
 */
export function sortCategoriesByLayerOrder(categories: AssetCategory[]): AssetCategory[] {
  return filterActiveCategories(categories)
}
