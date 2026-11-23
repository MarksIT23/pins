import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Order, OrderStatus, OrderFormData, CharacterConfig } from '@/types'
import { uploadPreviewImage } from '@/lib/storage'
import { generateOrderNumber } from '@/utils/formatters'
import toast from 'react-hot-toast'

/** Fetch all orders (admin) */
export function useOrders(statusFilter?: OrderStatus | 'all') {
  return useQuery<Order[]>({
    queryKey: ['orders', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*')
        .order('date_ordered', { ascending: false })

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
  })
}

/** Fetch a single order */
export function useOrder(id: string | null) {
  return useQuery<Order | null>({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

/** What the public order lookup returns (no personal details beyond a masked name). */
export interface OrderLookup {
  order_number: string
  status: OrderStatus
  quantity: number
  date_ordered: string
  updated_at: string | null
  preview_image_url: string | null
  display_name: string
  /** Present once the Pin Shop migration is applied */
  order_type?: 'custom' | 'shop'
  shop_item_name?: string | null
}

/** Thrown when the lookup function hasn't been added to Supabase yet. */
export class LookupNotSetUpError extends Error {}

/**
 * Look up one order by its order number (public; uses the get_order_status function).
 * Resolves to null when no order has that number.
 */
export function useOrderLookup(orderNumber: string | null) {
  return useQuery<OrderLookup | null>({
    queryKey: ['order-lookup', orderNumber],
    queryFn: async () => {
      if (!orderNumber) return null
      if (!isSupabaseConfigured) throw new LookupNotSetUpError('Supabase keys are missing from .env.local.')
      const { data, error } = await supabase.rpc('get_order_status', { p_order_number: orderNumber })
      if (error) {
        // PGRST202 = function not found (migration not applied yet)
        if (error.code === 'PGRST202') throw new LookupNotSetUpError('The get_order_status function is not in Supabase yet.')
        throw error
      }
      return (data as OrderLookup | null) ?? null
    },
    enabled: !!orderNumber,
    retry: false,
  })
}

/** Submit a new order */
export function useSubmitOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      formData,
      characterConfig,
      previewBlob,
      shopItemId,
    }: {
      formData: OrderFormData
      characterConfig: CharacterConfig
      /** Custom orders: PNG of the canvas. Not needed for Pin Shop orders. */
      previewBlob?: Blob
      /** Set for Pin Shop orders; the database uses that design's image as the preview. */
      shopItemId?: string
    }) => {
      const orderId = crypto.randomUUID()
      const orderNumber = generateOrderNumber()

      // Local dev without Supabase keys: simulate the order so the confirmation flow can be tested.
      if (import.meta.env.DEV && !isSupabaseConfigured) {
        await new Promise((r) => setTimeout(r, 900))
        console.info('[dev] Simulated order (no Supabase keys):', { orderNumber, formData, characterConfig, previewBytes: previewBlob?.size ?? 0, shopItemId })
        return { id: orderId, order_number: orderNumber } as Order
      }

      // 1. Upload preview image (custom orders only)
      const previewUrl = !shopItemId && previewBlob ? await uploadPreviewImage(previewBlob, orderId) : null

      // 2. Insert order via RPC (bypasses PostgREST RLS issues with anon key)
      const { data, error } = await supabase.rpc('submit_order', {
        p_id: orderId,
        p_order_number: orderNumber,
        p_full_name: formData.full_name,
        p_student_id: formData.student_id || null,
        p_quantity: formData.quantity,
        p_notes: formData.notes || null,
        p_character_config: characterConfig,
        p_preview_image_url: previewUrl,
        // Only sent for shop orders, so custom orders also work before the Pin Shop migration is run.
        ...(shopItemId ? { p_order_type: 'shop', p_shop_item_id: shopItemId } : {}),
      })

      if (error) throw error
      return data as Order
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (err: Error) => {
      toast.error(`Failed to submit order: ${err.message}`)
    },
  })
}

/** Update order status (admin) */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order status updated')
    },
    onError: (err: Error) => {
      toast.error(`Failed to update status: ${err.message}`)
    },
  })
}

/** Get dashboard stats */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('status')

      if (error) throw error

      const orders = data ?? []
      return {
        total_orders: orders.length,
        pending_orders: orders.filter((o) => o.status === 'pending').length,
        in_production_orders: orders.filter((o) => o.status === 'in_production').length,
        completed_orders: orders.filter((o) => o.status === 'completed').length,
      }
    },
  })
}
