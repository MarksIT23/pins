import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
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

/** Submit a new order */
export function useSubmitOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      formData,
      characterConfig,
      previewBlob,
    }: {
      formData: OrderFormData
      characterConfig: CharacterConfig
      previewBlob: Blob
    }) => {
      const orderId = crypto.randomUUID()
      const orderNumber = generateOrderNumber()

      // 1. Upload preview image
      const previewUrl = await uploadPreviewImage(previewBlob, orderId)

      // 2. Insert order record
      const { data, error } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          order_number: orderNumber,
          full_name: formData.full_name,
          facebook_name: formData.facebook_name || null,
          student_id: formData.student_id || null,
          contact_number: formData.contact_number,
          quantity: formData.quantity,
          notes: formData.notes || null,
          status: 'pending',
          character_config: characterConfig,
          preview_image_url: previewUrl,
        })
        .select()
        .single()

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
      toast.success('Order status updated! ✨')
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
