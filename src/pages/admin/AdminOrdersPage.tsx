import { useEffect, useMemo, useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { OrderTable } from '@/components/admin/OrderTable'
import { useOrders } from '@/hooks/useOrders'
import { OrderStatus, OrderType, ORDER_STATUS_LABELS } from '@/types'

const PAGE_SIZE = 20

const STATUS_TABS: Array<{ value: OrderStatus | 'all'; label: string; icon: string }> = [
  { value: 'all',              label: 'All',             icon: '' },
  { value: 'pending',          label: 'Pending',         icon: '' },
  { value: 'accepted',         label: 'Accepted',        icon: '' },
  { value: 'in_production',    label: 'In Production',   icon: '' },
  { value: 'ready_for_pickup', label: 'Ready',           icon: '' },
  { value: 'completed',        label: 'Completed',       icon: '' },
  { value: 'cancelled',        label: 'Cancelled',       icon: '' },
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
  const [typeFilter, setTypeFilter] = useState<OrderType | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const { data: orders = [], isLoading } = useOrders(activeStatus)

  const filtered = useMemo(() => {
    const byType = typeFilter === 'all' ? orders : orders.filter((o) => (o.order_type ?? 'custom') === typeFilter)
    if (!searchQuery.trim()) return byType
    const q = searchQuery.toLowerCase()
    return byType.filter((o) =>
      [o.order_number, o.full_name, o.student_id]
        .some((field) => field?.toLowerCase().includes(q))
    )
  }, [orders, searchQuery, typeFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeStatus, searchQuery, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageOrders = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length)
  const totalQuantity = filtered.reduce((sum, o) => sum + o.quantity, 0)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-fredoka text-3xl font-bold text-[#0F3B2C]">Orders</h1>
        <p className="text-[#8A9F96] font-nunito text-sm mt-1">
          {filtered.length} order{filtered.length !== 1 ? 's' : ''} found
          {(searchQuery || typeFilter !== 'all') && orders.length !== filtered.length && ` (filtered from ${orders.length})`}
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
                ? 'bg-[#14904F] text-white shadow-[0_4px_16px_rgba(20,144,79,0.4)]'
                : 'bg-white text-[#3E6B57] border border-[#DDEFE3] hover:border-[#9FD6B4]'
              }
            `}
          >
            {icon && <span>{icon}</span>}
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Order type filter */}
      <div className="inline-flex mb-4 rounded-2xl bg-white border border-[#DDEFE3] p-1" role="group" aria-label="Order type">
        {([['all', 'All orders'], ['custom', 'Custom'], ['shop', 'Pin Shop']] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTypeFilter(value)}
            aria-pressed={typeFilter === value}
            className={`px-4 py-1.5 rounded-xl text-sm font-fredoka font-semibold transition-colors ${
              typeFilter === value ? 'bg-[#FFC23A] text-[#0F3B2C]' : 'text-[#3E6B57] hover:bg-[#EEF8F1]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A9F96]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order number, name, or student ID..."
          className="w-full bg-white border border-[#DDEFE3] rounded-2xl pl-10 pr-4 py-2.5 text-sm font-nunito text-[#0F3B2C] placeholder:text-[#A9BAB2] outline-none focus:border-[#14904F] transition-colors"
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
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-fredoka font-semibold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 bg-white text-[#3E6B57] border border-[#DDEFE3] hover:border-[#9FD6B4]"
            >
              <ChevronLeft size={14} /> Prev
            </button>

            {getPageItems(safePage, totalPages).map((item, i) =>
              item === '…' ? (
                <span key={`e-${i}`} className="px-2 text-sm text-[#A9BAB2] font-nunito">…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`
                    w-9 h-9 rounded-xl text-sm font-fredoka font-semibold transition-all cursor-pointer
                    ${item === safePage
                      ? 'bg-[#E3263F] text-white shadow-[0_4px_16px_rgba(20,144,79,0.4)]'
                      : 'bg-white text-[#3E6B57] border border-[#DDEFE3] hover:border-[#9FD6B4]'
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
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-fredoka font-semibold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 bg-white text-[#3E6B57] border border-[#DDEFE3] hover:border-[#9FD6B4]"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>

          <p className="text-xs font-nunito text-[#8A9F96]">
            Showing {rangeStart}–{rangeEnd} of {filtered.length} order{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
