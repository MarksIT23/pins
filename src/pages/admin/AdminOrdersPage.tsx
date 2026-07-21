import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const { data: orders = [], isLoading } = useOrders(activeStatus)

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return orders
    const q = searchQuery.toLowerCase()
    return orders.filter((o) =>
      [o.order_number, o.full_name, o.facebook_name, o.contact_number, o.student_id]
        .some((field) => field?.toLowerCase().includes(q))
    )
  }, [orders, searchQuery])

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-fredoka text-3xl font-bold text-[#3D2B4F]">Orders 📦</h1>
        <p className="text-[#B8A0C8] font-nunito text-sm mt-1">
          {filtered.length} order{filtered.length !== 1 ? 's' : ''} found
          {searchQuery && orders.length !== filtered.length && ` (filtered from ${orders.length})`}
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
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

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8A0C8]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order number, name, contact, or student ID..."
          className="w-full bg-white border border-[#F0E6FF] rounded-2xl pl-10 pr-4 py-2.5 text-sm font-nunito text-[#3D2B4F] placeholder:text-[#C8B0D8] outline-none focus:border-[#B07FFF] transition-colors"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl shimmer" />
          ))}
        </div>
      ) : (
        <OrderTable orders={filtered} />
      )}
    </div>
  )
}
