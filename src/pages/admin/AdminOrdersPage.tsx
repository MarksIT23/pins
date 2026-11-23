import { useEffect, useMemo, useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { OrderTable } from '@/components/admin/OrderTable'
import { useOrders } from '@/hooks/useOrders'
import { OrderStatus, OrderType } from '@/types'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

const PAGE_SIZE = 20

// The production line, in order. Cancelled sits apart at the end.
const PIPELINE: Array<{ value: OrderStatus; label: string; dot: string }> = [
  { value: 'pending',          label: 'Pending',       dot: '#FFC23A' },
  { value: 'accepted',         label: 'Accepted',      dot: '#2E9BD6' },
  { value: 'in_production',    label: 'In production', dot: '#9A6400' },
  { value: 'ready_for_pickup', label: 'Ready',         dot: '#14904F' },
  { value: 'completed',        label: 'Completed',     dot: '#0F3B2C' },
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
  const [typeFilter, setTypeFilter] = useState<OrderType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const { data: allOrders = [], isLoading } = useOrders('all')

  // Counts per status follow the Custom / Pin Shop filter
  const typed = useMemo(
    () => (typeFilter === 'all' ? allOrders : allOrders.filter((o) => (o.order_type ?? 'custom') === typeFilter)),
    [allOrders, typeFilter],
  )
  const counts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const o of typed) m[o.status] = (m[o.status] ?? 0) + 1
    return m
  }, [typed])
  const orders = useMemo(
    () => (activeStatus === 'all' ? typed : typed.filter((o) => o.status === activeStatus)),
    [typed, activeStatus],
  )

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
  }, [activeStatus, searchQuery, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageOrders = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length)
  const totalQuantity = filtered.reduce((sum, o) => sum + o.quantity, 0)

  return (
    <div className="max-w-7xl mx-auto">
      <AdminPageHeader
        title="Orders"
        description={
          <>
            {filtered.length} order{filtered.length !== 1 ? 's' : ''} shown
            {(searchQuery || typeFilter !== 'all' || activeStatus !== 'all') && allOrders.length !== filtered.length && ` of ${allOrders.length}`}
            , {totalQuantity.toLocaleString()} pin{totalQuantity === 1 ? '' : 's'} in total.
          </>
        }
      />

      {/* Production line: pick a stage to filter */}
      <div className="-mx-4 sm:mx-0 mb-5 overflow-x-auto px-4 sm:px-0 pb-1" role="group" aria-label="Filter by status">
        <div className="flex items-stretch gap-2 min-w-max">
          <StageButton active={activeStatus === 'all'} onClick={() => setActiveStatus('all')} label="All" count={typed.length} dot="#E3263F" />
          <span className="w-px bg-[#CDEBD8] mx-1" aria-hidden="true" />
          {PIPELINE.map((st, i) => (
            <div key={st.value} className="flex items-center">
              <StageButton active={activeStatus === st.value} onClick={() => setActiveStatus(st.value)} label={st.label} count={counts[st.value] ?? 0} dot={st.dot} />
              {i < PIPELINE.length - 1 && <ChevronRight size={16} className="mx-0.5 text-[#9FD6B4] shrink-0" aria-hidden="true" />}
            </div>
          ))}
          <span className="w-px bg-[#CDEBD8] mx-1" aria-hidden="true" />
          <StageButton active={activeStatus === 'cancelled'} onClick={() => setActiveStatus('cancelled')} label="Cancelled" count={counts.cancelled ?? 0} dot="#C41C33" muted />
        </div>
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

function StageButton({ active, onClick, label, count, dot, muted }: { active: boolean; onClick: () => void; label: string; count: number; dot: string; muted?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-start rounded-2xl px-3.5 py-2 text-left transition-colors border ${
        active
          ? 'bg-[#0F3B2C] border-[#0F3B2C] text-white'
          : `bg-white border-[#E4EFE8] hover:border-[#9FD6B4] ${muted ? 'text-[#8A9F96]' : 'text-[#0F3B2C]'}`
      }`}
    >
      <span className="font-fredoka font-extrabold text-xl leading-none tabular-nums">{count}</span>
      <span className="mt-1 flex items-center gap-1.5 text-xs font-nunito font-semibold whitespace-nowrap">
        <span className="w-2 h-2 rounded-full" style={{ background: dot }} aria-hidden="true" />
        {label}
      </span>
    </button>
  )
}
