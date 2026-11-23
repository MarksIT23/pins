import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardList, Image as ImageIcon, Store, ArrowRight } from 'lucide-react'
import { useDashboardStats } from '@/hooks/useOrders'
import { AdminPageHeader, HangingTag } from '@/components/admin/AdminPageHeader'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types'
import { formatDateShort } from '@/utils/formatters'

function daysUntilChristmas(now = new Date()) {
  const year = now.getMonth() === 11 && now.getDate() > 25 ? now.getFullYear() + 1 : now.getFullYear()
  const xmas = new Date(year, 11, 25)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((xmas.getTime() - today.getTime()) / 86_400_000)
}

const SHORTCUTS = [
  { to: '/admin/orders', icon: ClipboardList, title: 'Orders', desc: 'Update statuses, download previews', box: '#E3263F', ribbon: '#FFC23A' },
  { to: '/admin/assets', icon: ImageIcon, title: 'Assets', desc: 'Upload hair, outfits and other parts', box: '#14904F', ribbon: '#FFC23A' },
  { to: '/admin/shop', icon: Store, title: 'Pin Shop', desc: 'Manage ready-made designs', box: '#2E9BD6', ribbon: '#FFFFFF' },
]

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()
  const days = daysUntilChristmas()
  const today = new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-5xl mx-auto">
      <AdminPageHeader
        title="Workshop board"
        description={<>{today}. {days === 0 ? "It's Christmas Day!" : `${days} day${days === 1 ? '' : 's'} until Christmas.`}</>}
      />

      {/* ─── Status tags hanging from a ribbon ──────────────────────────── */}
      <section aria-label="Orders by status" className="mb-8">
        <div className="relative h-3 rounded-full bg-[#E3263F] shadow-[inset_0_-2px_0_rgba(0,0,0,.12)]" aria-hidden="true">
          <div className="absolute inset-y-0 left-0 right-0 flex justify-around items-center">
            {Array.from({ length: 4 }).map((_, i) => <span key={i} className="w-2 h-2 rounded-full bg-[#FFC23A]" />)}
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 -mt-1 px-1 sm:px-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="mt-8 h-36 rounded-[18px] shimmer" />)
          ) : (
            <>
              <HangingTag label="Waiting for payment" value={stats?.pending_orders ?? 0} color="#FFC23A" string={26} delay={0.05} />
              <HangingTag label="Being made" value={(stats?.accepted_orders ?? 0) + (stats?.in_production_orders ?? 0)} note="Accepted + in production" color="#2E9BD6" string={44} delay={0.15} />
              <HangingTag label="Ready for pick-up" value={stats?.ready_orders ?? 0} color="#14904F" string={30} delay={0.25} />
              <HangingTag label="Completed" value={stats?.completed_orders ?? 0} color="#E3263F" string={48} delay={0.35} />
            </>
          )}
        </div>
      </section>

      {/* ─── Ledger strip ──────────────────────────────────────────────── */}
      <dl className="mb-8 grid grid-cols-2 sm:grid-cols-4 rounded-2xl bg-white border border-[#E4EFE8] divide-x divide-y sm:divide-y-0 divide-dashed divide-[#CDEBD8] overflow-hidden">
        {[
          ['Orders in total', stats?.total_orders],
          ['Pins ordered', stats?.total_pins],
          ['New this week', stats?.this_week],
          ['From the Pin Shop', stats?.shop_orders],
        ].map(([label, value]) => (
          <div key={label as string} className="px-4 py-3.5">
            <dt className="text-xs font-nunito text-[#3E6B57]">{label}</dt>
            <dd className="font-fredoka font-extrabold text-2xl text-[#0F3B2C] tabular-nums">{isLoading ? '–' : (value ?? 0)}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* ─── Latest orders ───────────────────────────────────────────── */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-fredoka font-bold text-xl text-[#0F3B2C]">Latest orders</h2>
            <Link to="/admin/orders" className="text-sm font-fredoka font-bold text-[#E3263F] inline-flex items-center gap-1">
              All orders <ArrowRight size={15} />
            </Link>
          </div>
          <ul className="space-y-2">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <li key={i} className="h-16 rounded-2xl shimmer" />)
              : (stats?.recent ?? []).length === 0
                ? <li className="rounded-2xl bg-white border border-dashed border-[#CDEBD8] p-6 text-center text-sm font-nunito text-[#3E6B57]">No orders yet. They'll show up here as soon as someone orders.</li>
                : stats!.recent.map((o, i) => (
                  <motion.li
                    key={o.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="relative flex items-center gap-3 rounded-2xl bg-white border border-[#E4EFE8] pl-5 pr-3 py-3"
                  >
                    {/* ticket stub edge */}
                    <span className="absolute left-0 top-2 bottom-2 border-l-[3px] border-dotted border-[#CDEBD8]" aria-hidden="true" />
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-[#F3F8F4] overflow-hidden flex items-center justify-center">
                      {o.preview_image_url ? <img src={o.preview_image_url} alt="" className="w-full h-full object-contain" /> : <ClipboardList size={16} className="text-[#8A9F96]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-fredoka font-bold text-sm text-[#0F3B2C] truncate">{o.full_name}</p>
                      <p className="text-xs font-nunito text-[#3E6B57] truncate">
                        {o.order_number} · {o.quantity} pin{o.quantity === 1 ? '' : 's'}{o.order_type === 'shop' ? ' · Pin Shop' : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-nunito font-bold ${ORDER_STATUS_COLORS[o.status]}`}>{ORDER_STATUS_LABELS[o.status]}</span>
                      <p className="text-[11px] font-nunito text-[#8A9F96] mt-0.5">{formatDateShort(o.date_ordered)}</p>
                    </div>
                  </motion.li>
                ))}
          </ul>
        </section>

        {/* ─── Shortcuts as wrapped presents ───────────────────────────── */}
        <section>
          <h2 className="font-fredoka font-bold text-xl text-[#0F3B2C] mb-3">Go to</h2>
          <div className="space-y-3">
            {SHORTCUTS.map(({ to, icon: Icon, title, desc, box, ribbon }, i) => (
              <motion.div key={to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.08 }}>
                <Link
                  to={to}
                  className="relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 pr-14 text-white transition-transform hover:-translate-y-0.5"
                  style={{ background: box }}
                >
                  {/* ribbon cross */}
                  <span className="absolute top-0 bottom-0 right-8 w-3 opacity-90" style={{ background: ribbon }} aria-hidden="true" />
                  <span className="absolute left-0 right-0 top-1/2 -mt-1.5 h-3 opacity-25" style={{ background: ribbon }} aria-hidden="true" />
                  <span className="relative w-11 h-11 shrink-0 rounded-xl bg-white/20 flex items-center justify-center"><Icon size={20} /></span>
                  <span className="relative">
                    <span className="block font-fredoka font-extrabold text-lg leading-tight">{title}</span>
                    <span className="block text-sm font-nunito text-white/85">{desc}</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
