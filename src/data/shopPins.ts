/**
 * Pin Shop designs now live in Supabase (table: shop_items) and are managed from
 * Admin > Pin Shop. This file only holds the shape the shop UI uses and the mapper.
 */
import type { ShopItem } from '@/types'

export interface ShopPin {
  id: string
  name: string
  description: string
  image: string
  /** Soft background behind the pin on its card. */
  tint: string
  price: number | null
}

export function toShopPin(item: ShopItem): ShopPin {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    image: item.image_url,
    tint: item.tint,
    price: item.price,
  }
}

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
export const formatPeso = (n: number) => peso.format(n)
