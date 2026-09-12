import { useEffect, useMemo, useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { OrderTable } from '@/components/admin/OrderTable'
import { useOrders } from '@/hooks/useOrders'
import { OrderStatus, ORDER_STATUS_LABELS } from '@/types'

const PAGE_SIZE = 20

const STATUS_TABS: Array<{ value: OrderStatus | 'all'; label: string; icon: string }> = [
  { value: 'all',              label: 'All',             icon: '📋' },
  { value: 'pending',          label: 'Pending',         icon: '⏳' },
  { value: 'accepted',         label: 'Accepted',        icon: '✅' },
  { value: 'in_production',    label: 'In Production',   icon: '🎨' },
  { value: 'ready_for_pickup', label: 'Ready',           icon: '📦' },
  { value: 'completed',        label: 'Completed',       icon: '🎉' },
  { value: 'cancelled',        label: 'Cancelled',       icon: '❌' },
]

function getPageItems(current: number, total: number): (number | '…')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const wanted = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const items: (number | '…')[] = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) items.push('…')
    items.push(p)
    prev = p
  }
  return items
}

export function AdminOrdersPage() {
  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const { data: orders = [], isLoading } = useOrders(activeStatus)

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return orders
    const q = searchQuery.toLowerCase()
    return orders.filter((o) =>
      [o.order_number, o.full_name, o.student_id]
        .some((field) => field?.toLowerCase().includes(q))
    )
  }, [orders, searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeStatus, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageOrders = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length)
  const totalQuantity = filtered.reduce((sum, o) => sum + o.quantity, 0)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-fredoka text-3xl font-bold text-[#3D2B4F]">Orders 📦</h1>
        <p className="text-[#B8A0C8] font-nunito text-sm mt-1">
          {filtered.length} order{filtered.length !== 1 ? 's' : ''} found
          {searchQuery && orders.length !== filtered.length && ` (filtered from ${orders.length})`}
          <span className="mx-1.5">·</span>
          {totalQuantity.toLocaleString()} total qty
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {STATUS_TABS.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => {
              setActiveStatus(value)
              setCurrentPage(1)
            }}
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
          placeholder="Search by order number, name, or student ID..."
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
        <OrderTable orders={pageOrders} />
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 mt-6">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-fredoka font-semibold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 bg-white text-[#7A5C8A] border border-[#F0E6FF] hover:border-[#C8B0FF]"
            >
              <ChevronLeft size={14} /> Prev
            </button>

            {getPageItems(safePage, totalPages).map((item, i) =>
              item === '…' ? (
                <span key={`e-${i}`} className="px-2 text-sm text-[#C8B0D8] font-nunito">…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`
                    w-9 h-9 rounded-xl text-sm font-fredoka font-semibold transition-all cursor-pointer
                    ${item === safePage
                      ? 'bg-gradient-to-r from-[#FF85A1] to-[#B07FFF] text-white shadow-[0_4px_16px_rgba(176,127,255,0.4)]'
                      : 'bg-white text-[#7A5C8A] border border-[#F0E6FF] hover:border-[#C8B0FF]'
                    }
                  `}
                >
                  {item}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-fredoka font-semibold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 bg-white text-[#7A5C8A] border border-[#F0E6FF] hover:border-[#C8B0FF]"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>

          <p className="text-xs font-nunito text-[#B8A0C8]">
            Showing {rangeStart}–{rangeEnd} of {filtered.length} order{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
