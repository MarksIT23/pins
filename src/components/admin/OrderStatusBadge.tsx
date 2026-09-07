import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types'

interface OrderStatusBadgeProps {
  status: OrderStatus
  /** If provided, shows as a dropdown with all statuses */
  onUpdate?: (status: OrderStatus) => void
  isUpdating?: boolean
  /** Size variant */
  size?: 'sm' | 'md'
}

const ALL_STATUSES: OrderStatus[] = [
  'pending', 'accepted', 'in_production', 'ready_for_pickup', 'completed', 'cancelled',
]

/**
 * Renders an order status badge.
 * When `onUpdate` is provided, it becomes a clickable dropdown
 * for changing the status inline.
 */
export function OrderStatusBadge({
  status,
  onUpdate,
  isUpdating = false,
  size = 'sm',
}: OrderStatusBadgeProps) {
  const [open, setOpen] = useState(false)

  const sizeClasses = size === 'sm'
    ? 'text-xs px-3 py-1'
    : 'text-sm px-4 py-1.5'

  // Static badge (no dropdown)
  if (!onUpdate) {
    return (
      <span className={`
        inline-flex items-center font-nunito font-semibold border rounded-full
        ${ORDER_STATUS_COLORS[status]} ${sizeClasses}
      `}>
        {ORDER_STATUS_LABELS[status]}
      </span>
    )
  }

  // Interactive badge with dropdown
  return (
    <div className="relative inline-flex">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isUpdating}
        className={`
          inline-flex items-center gap-1 font-nunito font-semibold border rounded-full
          transition-all cursor-pointer
          ${ORDER_STATUS_COLORS[status]} ${sizeClasses}
          hover:opacity-80 active:scale-95
        `}
      >
        {ORDER_STATUS_LABELS[status]}
        <ChevronDown size={size === 'sm' ? 12 : 14} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-[0_8px_32px_rgba(61,43,79,0.15)] border border-[#F0E6FF] z-10 overflow-hidden"
          >
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onUpdate(s)
                  setOpen(false)
                }}
                disabled={status === s || isUpdating}
                className={`
                  w-full text-left px-4 py-2.5 text-xs font-nunito font-semibold
                  flex items-center gap-2 transition-colors
                  ${status === s
                    ? 'bg-[#F8F0FF] text-[#B8A0C8] cursor-default'
                    : 'hover:bg-[#F8F0FF] text-[#3D2B4F] cursor-pointer'
                  }
                `}
              >
                <span className={`w-2 h-2 rounded-full ${ORDER_STATUS_COLORS[s].split(' ')[0]}`} />
                {ORDER_STATUS_LABELS[s]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
