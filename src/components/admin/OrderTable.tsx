import { Inbox, ImageOff } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Eye, Download } from 'lucide-react'
import toast from 'react-hot-toast'
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
        <Inbox size={44} strokeWidth={1.6} className="mb-3 text-[#8A9F96]" />
        <p className="font-fredoka text-[#8A9F96] text-lg">No orders yet</p>
        <p className="text-sm text-[#BFDCCB] font-nunito mt-1">Orders will appear here once customers submit them</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-3xl border border-[#DDEFE3] bg-white shadow-[0_2px_16px_rgba(20,144,79,0.08)]">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[#DDEFE3]">
              {['Order ID', 'Customer', 'Preview', 'Qty', 'Date', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-4 text-left text-xs font-fredoka font-semibold text-[#8A9F96] uppercase tracking-wide">
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
                  className="border-b border-[#EEF8F1] hover:bg-[#F6FCF8] transition-colors"
                >
                  {/* Order ID */}
                  <td className="px-4 py-3">
                    <span className="font-fredoka text-sm font-semibold text-[#14904F]">
                      {order.order_number}
                    </span>
                    <OrderTypeTag order={order} />
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-nunito font-semibold text-sm text-[#0F3B2C]">{order.full_name}</p>
                      {order.student_id && (
                        <p className="text-xs text-[#8A9F96]">{order.student_id}</p>
                      )}
                    </div>
                  </td>

                  {/* Preview image */}
                  <td className="px-4 py-3">
                    {order.preview_image_url ? (
                      <img
                        src={order.preview_image_url}
                        alt="Character preview"
                        className="w-12 h-12 rounded-xl object-contain bg-white border border-[#FFD9DE] cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => setViewOrder(order)}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#DDEFE3] flex items-center justify-center text-[#8A9F96]">
                        <ImageOff size={18} />
                      </div>
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="px-4 py-3">
                    <span className="font-fredoka font-bold text-[#0F3B2C] text-lg">
                      {order.quantity}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-nunito text-[#3E6B57]">
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
                        className="p-1.5 rounded-xl bg-[#DDEFE3] hover:bg-[#CDEBD8] text-[#14904F] transition-colors"
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
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EEF8F1] hover:bg-[#DDEFE3] text-[#3E6B57] text-xs font-fredoka font-semibold transition-colors"
      >
        Update <ChevronDown size={12} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-[0_8px_32px_rgba(15,59,44,0.15)] border border-[#DDEFE3] z-10 overflow-hidden"
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
                    ? 'bg-[#EEF8F1] text-[#8A9F96] cursor-default'
                    : 'hover:bg-[#EEF8F1] text-[#0F3B2C]'
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

  const downloadPng = (url: string, filename: string) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1000
      canvas.height = 1000
      const ctx = canvas.getContext('2d')!
      // White background (in case of transparency)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 1000, 1000)
      // Draw image centered, containing within 1000x1000
      const scale = Math.min(1000 / img.width, 1000 / img.height)
      const x = (1000 - img.width * scale) / 2
      const y = (1000 - img.height * scale) / 2
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
      // Trigger download
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = filename
      a.click()
    }
    img.onerror = () => toast.error('Failed to load preview image')
    img.src = url
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Preview */}
        {order.preview_image_url && (
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <img
              src={order.preview_image_url}
              alt="Character preview"
              className="w-40 h-40 rounded-2xl object-contain bg-white border-2 border-[#FFD9DE]"
            />
            <button
              onClick={() => downloadPng(order.preview_image_url!, `${order.order_number}.png`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14904F] hover:bg-[#0F7A42] text-white text-xs font-fredoka font-semibold transition-colors"
            >
              <Download size={12} /> 1000×1000 PNG
            </button>
          </div>
        )}

        {/* Info grid */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {[
            { label: 'Full Name', value: order.full_name },
            { label: 'Student ID', value: order.student_id || '—' },
            { label: 'Quantity', value: order.quantity },
            { label: 'Date Ordered', value: formatDateShort(order.date_ordered) },
            { label: 'Status', value: <StatusBadge status={order.status} /> },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-[#8A9F96] font-nunito mb-0.5">{label}</p>
              <div className="font-nunito font-semibold text-sm text-[#0F3B2C]">{value as any}</div>
            </div>
          ))}
        </div>
      </div>

      {order.notes && (
        <div className="bg-[#EEF8F1] rounded-2xl p-3 border border-[#DDEFE3]">
          <p className="text-xs text-[#8A9F96] font-nunito mb-1">Notes</p>
          <p className="text-sm text-[#0F3B2C] font-nunito">{order.notes}</p>
        </div>
      )}

      {/* Status update */}
      <div>
        <p className="text-xs text-[#8A9F96] font-nunito mb-2">Update Status</p>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus({ orderId: order.id, status: s })}
              className={`
                px-3 py-1.5 rounded-full text-xs font-fredoka font-semibold border transition-all
                ${order.status === s
                  ? ORDER_STATUS_COLORS[s] + ' scale-105'
                  : 'bg-white text-[#3E6B57] border-[#DDEFE3] hover:border-[#9FD6B4]'
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

/** Small tag telling custom builds and Pin Shop orders apart. */
function OrderTypeTag({ order }: { order: Order }) {
  const shop = order.order_type === 'shop'
  const name = order.character_config?.shopItem?.name
  return (
    <span
      className={`mt-1 flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-nunito font-bold ${
        shop ? 'bg-[#FFF1CC] text-[#9A6400]' : 'bg-[#EEF8F1] text-[#3E6B57]'
      }`}
      title={shop && name ? `Pin Shop: ${name}` : undefined}
    >
      {shop ? `Pin Shop${name ? ` · ${name}` : ''}` : 'Custom'}
    </span>
  )
}
