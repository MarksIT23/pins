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
  accepted: 'bg-blue-100 text-blue-800 border-blue-200',
  in_production: 'bg-purple-100 text-purple-800 border-purple-200',
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
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Text Overlay ──────────────────────────────────────────────────────────────
export interface TextOverlay {
  text: string;     // max 10 chars
  font: string;     // font family name
  size: number;     // font multiplier: 0=small, 1=medium, 2=large
  color: string;    // hex color, e.g. "#3D2B4F"
  outline: boolean; // white stroke outline
}

// ─── Character Config ─────────────────────────────────────────────────────────
export interface CharacterConfig {
  background?: string | null;
  pendants?: string | null;
  base?: string | null;
  clothes?: string | null;
  hair?: string | null;
  glasses?: string | null;
  accessories?: string | null;
  textOverlay?: TextOverlay | null;
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
  contact_number: string;
  quantity: number;
  notes?: string | null;
  status: OrderStatus;
  character_config: CharacterConfig;
  preview_image_url?: string | null;
  date_ordered: string;
  updated_at: string;
}

export interface OrderFormData {
  full_name: string;
  facebook_name: string;
  student_id: string;
  contact_number: string;
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
