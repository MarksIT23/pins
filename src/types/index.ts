// ─── Order Status ────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'in_production'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  in_production: 'In Production',
  ready_for_pickup: 'Ready for Pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  accepted: 'bg-sky-50 text-sky-800 border-sky-200',
  in_production: 'bg-amber-50 text-amber-800 border-amber-200',
  ready_for_pickup: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

// ─── Asset Category ───────────────────────────────────────────────────────────
export interface AssetCategory {
  id: string;
  name: string;
  slug: string;
  layer_order: number;
  icon: string;
  is_active: boolean;
  created_at: string;
}

// ─── Asset ────────────────────────────────────────────────────────────────────
export interface Asset {
  id: string;
  category_id: string;
  category?: AssetCategory;
  name: string;
  slug: string;
  file_url: string;
  storage_path: string;
  thumbnail_url?: string | null;
  tags?: string[] | null;
  gender: 'male' | 'female' | 'unisex';
  is_active: boolean;
  /** The part a fresh design starts with (one per category, set in Admin > Assets). */
  is_default?: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ShopCategory {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

// ─── Text Overlay ──────────────────────────────────────────────────────────────
export interface TextOverlay {
  text: string;     // max 12 chars
  font: string;     // font family name
  size: number;     // font multiplier: 0=small, 1=medium, 2=large
  color: string;    // hex color, e.g. "#0F3B2C"
  outline: 'none' | 'white' | 'black'; // text outline style
}

// ─── Character Config ─────────────────────────────────────────────────────────
export interface CharacterConfig {
  background?: string | null;
  pendants?: string | null;
  'pendant-bg'?: string | null;
  base?: string | null;
  eyes?: string | null;
  eyebrows?: string | null;
  lips?: string | null;
  clothes?: string | null;
  'christmas-outfit'?: string | null;
  hair?: string | null;
  glasses?: string | null;
  college?: string | null;
  accessories?: string | null;
  'accessories-2'?: string | null;
  textOverlay?: TextOverlay | null;
  /** Set for Pin Shop orders (a ready-made design instead of a custom build). */
  shopItem?: { id: string; name: string } | null;
}

// ─── Layer ────────────────────────────────────────────────────────────────────
export interface ResolvedLayer {
  slug: string;
  assetId: string;
  fileUrl: string;
  layerOrder: number;
}

// ─── Order ────────────────────────────────────────────────────────────────────
export interface Order {
  id: string;
  order_number: string;
  full_name: string;
  facebook_name?: string | null;
  student_id?: string | null;
  contact_number?: string | null;
  quantity: number;
  notes?: string | null;
  status: OrderStatus;
  character_config: CharacterConfig;
  preview_image_url?: string | null;
  date_ordered: string;
  updated_at: string;
  /** 'custom' = built in the creator, 'shop' = a ready-made Pin Shop design */
  order_type?: OrderType;
  shop_item_id?: string | null;
}

export type OrderType = 'custom' | 'shop';

// ─── Pin Shop ────────────────────────────────────────────────────────────────
export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  storage_path: string | null;
  price: number | null;
  tint: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  /** Pin Shop category; null = uncategorised. */
  category_id?: string | null;
}

export interface OrderFormData {
  full_name: string;
  student_id: string;
  quantity: number;
  notes: string;
}

// ─── Asset Upload ─────────────────────────────────────────────────────────────
export interface AssetUploadPayload {
  file: File;
  category_id: string;
  name: string;
  gender: 'male' | 'female' | 'unisex';
  tags?: string[];
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export interface DashboardStats {
  total_orders: number;
  pending_orders: number;
  in_production_orders: number;
  completed_orders: number;
  total_assets: number;
}
