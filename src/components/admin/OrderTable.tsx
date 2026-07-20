import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Eye } from 'lucide-react'
import { Order, OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types'
import { StatusBadge } from '@/components/ui/Badge'
import { useUpdateOrderStatus } from '@/hooks/useOrders'
import { formatDateShort } from '@/utils/formatters'
import { Modal } from '@/components/ui/Modal'

const ALL_STATUSES: OrderStatus[] = [
  'pending', 'accepted', 'in_production', 'ready_for_pickup', 'completed', 'cancelled',
]

interface OrderTableProps {
  orders: Order[]
}

export function OrderTable({ orders }: OrderTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [viewOrder, setViewOrder] = useState<Order | null>(null)
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus()

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <span className="text-5xl mb-3">📭</span>
        <p className="font-fredoka text-[#B8A0C8] text-lg">No orders yet</p>
        <p className="text-sm text-[#D0C0E0] font-nunito mt-1">Orders will appear here once customers submit them</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-3xl border border-[#F0E6FF] bg-white shadow-[0_2px_16px_rgba(176,127,255,0.08)]">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[#F0E6FF]">
              {['Order ID', 'Customer', 'Preview', 'Qty', 'Date', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-4 text-left text-xs font-fredoka font-semibold text-[#B8A0C8] uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => (
              <>
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-[#F8F0FF] hover:bg-[#FDF8FF] transition-colors"
                >
                  {/* Order ID */}
                  <td className="px-4 py-3">
                    <span className="font-fredoka text-sm font-semibold text-[#B07FFF]">
                      {order.order_number}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-nunito font-semibold text-sm text-[#3D2B4F]">{order.full_name}</p>
                      {order.facebook_name && (
                        <p className="text-xs text-[#B8A0C8]">{order.facebook_name}</p>
                      )}
                      <p className="text-xs text-[#B8A0C8]">{order.contact_number}</p>
                    </div>
                  </td>

                  {/* Preview image */}
                  <td className="px-4 py-3">
                    {order.preview_image_url ? (
                      <img
                        src={order.preview_image_url}
                        alt="Character preview"
                        className="w-12 h-12 rounded-xl object-contain bg-white border border-[#FFD6E8] cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => setViewOrder(order)}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#F0E6FF] flex items-center justify-center text-xl">
                        🧸
                      </div>
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="px-4 py-3">
                    <span className="font-fredoka font-bold text-[#3D2B4F] text-lg">
                      {order.quantity}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-nunito text-[#7A5C8A]">
                      {formatDateShort(order.date_ordered)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {/* View details */}
                      <button
                        onClick={() => setViewOrder(order)}
                        className="p-1.5 rounded-xl bg-[#F0E6FF] hover:bg-[#E8D9FF] text-[#B07FFF] transition-colors"
                        title="View details"
                      >
                        <Eye size={14} />
                      </button>

                      {/* Status dropdown */}
                      <StatusDropdown
                        order={order}
                        onUpdate={(status) => updateStatus({ orderId: order.id, status })}
                        isUpdating={isPending}
                      />
                    </div>
                  </td>
                </motion.tr>
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order detail modal */}
      <Modal
        isOpen={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title={`Order ${viewOrder?.order_number}`}
        size="xl"
      >
        {viewOrder && <OrderDetailView order={viewOrder} onClose={() => setViewOrder(null)} />}
      </Modal>
    </>
  )
}

// ─── Status Dropdown ──────────────────────────────────────────────────────────
function StatusDropdown({
  order,
  onUpdate,
  isUpdating,
}: {
  order: Order
  onUpdate: (status: OrderStatus) => void
  isUpdating: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isUpdating}
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F8F0FF] hover:bg-[#F0E6FF] text-[#7A5C8A] text-xs font-fredoka font-semibold transition-colors"
      >
        Update <ChevronDown size={12} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-[0_8px_32px_rgba(61,43,79,0.15)] border border-[#F0E6FF] z-10 overflow-hidden"
          >
            {ALL_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => { onUpdate(status); setOpen(false) }}
                disabled={order.status === status}
                className={`
                  w-full text-left px-4 py-2.5 text-xs font-nunito font-semibold
                  flex items-center gap-2 transition-colors
                  ${order.status === status
                    ? 'bg-[#F8F0FF] text-[#B8A0C8] cursor-default'
                    : 'hover:bg-[#F8F0FF] text-[#3D2B4F]'
                  }
                `}
              >
                <span className={`w-2 h-2 rounded-full ${ORDER_STATUS_COLORS[status].split(' ')[0].replace('bg-', 'bg-')}`} />
                {ORDER_STATUS_LABELS[status]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Order Detail View ────────────────────────────────────────────────────────
function OrderDetailView({ order, onClose }: { order: Order; onClose: () => void }) {
  const { mutate: updateStatus } = useUpdateOrderStatus()

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Preview */}
        {order.preview_image_url && (
          <div className="flex-shrink-0 flex justify-center">
            <img
              src={order.preview_image_url}
              alt="Character preview"
              className="w-40 h-40 rounded-2xl object-contain bg-white border-2 border-[#FFD6E8]"
            />
          </div>
        )}

        {/* Info grid */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {[
            { label: 'Full Name', value: order.full_name },
            { label: 'Contact', value: order.contact_number },
            { label: 'Facebook', value: order.facebook_name || '—' },
            { label: 'Quantity', value: order.quantity },
            { label: 'Date Ordered', value: formatDateShort(order.date_ordered) },
            { label: 'Status', value: <StatusBadge status={order.status} /> },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-[#B8A0C8] font-nunito mb-0.5">{label}</p>
              <div className="font-nunito font-semibold text-sm text-[#3D2B4F]">{value as any}</div>
            </div>
          ))}
        </div>
      </div>

      {order.notes && (
        <div className="bg-[#F8F0FF] rounded-2xl p-3 border border-[#F0E6FF]">
          <p className="text-xs text-[#B8A0C8] font-nunito mb-1">Notes</p>
          <p className="text-sm text-[#3D2B4F] font-nunito">{order.notes}</p>
        </div>
      )}

      {/* Status update */}
      <div>
        <p className="text-xs text-[#B8A0C8] font-nunito mb-2">Update Status</p>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus({ orderId: order.id, status: s })}
              className={`
                px-3 py-1.5 rounded-full text-xs font-fredoka font-semibold border transition-all
                ${order.status === s
                  ? ORDER_STATUS_COLORS[s] + ' scale-105'
                  : 'bg-white text-[#7A5C8A] border-[#F0E6FF] hover:border-[#C8B0FF]'
                }
              `}
            >
              {ORDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
