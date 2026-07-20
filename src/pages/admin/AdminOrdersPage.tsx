import { useState } from 'react'
import { OrderTable } from '@/components/admin/OrderTable'
import { useOrders } from '@/hooks/useOrders'
import { OrderStatus, ORDER_STATUS_LABELS } from '@/types'

const STATUS_TABS: Array<{ value: OrderStatus | 'all'; label: string; icon: string }> = [
  { value: 'all',              label: 'All',             icon: '📋' },
  { value: 'pending',          label: 'Pending',         icon: '⏳' },
  { value: 'accepted',         label: 'Accepted',        icon: '✅' },
  { value: 'in_production',    label: 'In Production',   icon: '🎨' },
  { value: 'ready_for_pickup', label: 'Ready',           icon: '📦' },
  { value: 'completed',        label: 'Completed',       icon: '🎉' },
  { value: 'cancelled',        label: 'Cancelled',       icon: '❌' },
]

export function AdminOrdersPage() {
  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'all'>('all')
  const { data: orders = [], isLoading } = useOrders(activeStatus)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-fredoka text-3xl font-bold text-[#3D2B4F]">Orders 📦</h1>
        <p className="text-[#B8A0C8] font-nunito text-sm mt-1">
          {orders.length} order{orders.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_TABS.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => setActiveStatus(value)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-fredoka font-semibold
              transition-all cursor-pointer
              ${activeStatus === value
                ? 'bg-gradient-to-r from-[#B07FFF] to-[#FF85A1] text-white shadow-[0_4px_16px_rgba(176,127,255,0.4)]'
                : 'bg-white text-[#7A5C8A] border border-[#F0E6FF] hover:border-[#C8B0FF]'
              }
            `}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl shimmer" />
          ))}
        </div>
      ) : (
        <OrderTable orders={orders} />
      )}
    </div>
  )
}
