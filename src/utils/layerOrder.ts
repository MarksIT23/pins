import { Mountain, Star, Image as ImageIcon, User, Shirt, Scissors, Glasses, GraduationCap, Gift, Type, type LucideIcon } from 'lucide-react'
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
  college:      7,
  accessories:  8,
  text:         9,
}

/**
 * Category display config: icon and label.
 */
export const CATEGORY_UI: Record<string, { icon: LucideIcon; label: string }> = {
  background:   { icon: Mountain,       label: 'Background' },
  pendants:     { icon: Star,           label: 'Pendant' },
  'pendant-bg': { icon: ImageIcon,      label: 'Pendant BG' },
  base:         { icon: User,           label: 'Base' },
  clothes:      { icon: Shirt,          label: 'Clothes' },
  hair:         { icon: Scissors,       label: 'Hair' },
  glasses:      { icon: Glasses,        label: 'Glasses' },
  college:      { icon: GraduationCap,  label: 'College' },
  accessories:  { icon: Gift,           label: 'Accessories' },
  text:         { icon: Type,           label: 'Text' },
}

export const FALLBACK_ICON: LucideIcon = Star

/** Names of the active layer slugs, in render order (bottom→top). */
export const LAYER_SLUGS = [
  'background',
  'pendants',
  'pendant-bg',
  'base',
  'clothes',
  'hair',
  'glasses',
  'college',
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
  'college',
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
