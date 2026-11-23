import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Check, PackageSearch, CircleAlert, Gift, Ban, Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SparkleBackground } from '@/components/layout/SparkleBackground'
import { useOrderLookup, LookupNotSetUpError, type OrderLookup } from '@/hooks/useOrders'
import { formatDate } from '@/utils/formatters'
import type { OrderStatus } from '@/types'

const ORDER_NUMBER = /^PINS-\d{8}-\d{4}$/

/** Accepts "pins-20261120-1073", " PINS-20261120-1073 " or just "20261120-1073". */
function normalise(raw: string) {
  const v = raw.trim().toUpperCase().replace(/\s+/g, '')
  return /^\d{8}-\d{4}$/.test(v) ? `PINS-${v}` : v
}

const STEPS: { status: OrderStatus; label: string; hint: string }[] = [
  { status: 'pending', label: 'Order placed', hint: 'Pay at the WU-P SSC Office to confirm your order.' },
  { status: 'accepted', label: 'Payment confirmed', hint: 'Payment received. Your pin goes into production soon.' },
  { status: 'in_production', label: 'Being made', hint: 'Your pin is being made right now.' },
  { status: 'ready_for_pickup', label: 'Ready for pick-up', hint: 'Your pin is ready! Pick it up at the Wesleyan campus SSC Office.' },
  { status: 'completed', label: 'Picked up', hint: 'Picked up. Enjoy your pin!' },
]

export function TrackOrderPage() {
  const [params, setParams] = useSearchParams()
  const searched = params.get('order')
  const [input, setInput] = useState(searched ?? '')
  const [formatError, setFormatError] = useState<string | null>(null)
  const { data: order, isFetching, error } = useOrderLookup(searched)

  useEffect(() => { if (searched) setInput(searched) }, [searched])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const value = normalise(input)
    if (!ORDER_NUMBER.test(value)) {
      setFormatError('Order numbers look like PINS-20261120-1073. Check your confirmation screen.')
      return
    }
    setFormatError(null)
    setInput(value)
    setParams({ order: value })
  }

  let result: 'idle' | 'loading' | 'found' | 'missing' | 'notSetUp' | 'error' = 'idle'
  if (searched) {
    if (isFetching) result = 'loading'
    else if (error instanceof LookupNotSetUpError) result = 'notSetUp'
    else if (error) result = 'error'
    else result = order ? 'found' : 'missing'
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFDF9] relative">
      <SparkleBackground />
      <Header />

      <main className="flex-1 relative z-10">
        {/* ─── Search band ────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#E3263F] text-white pb-14">
          <div
            className="absolute inset-0 opacity-[0.09] pointer-events-none"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg, #fff 0 22px, transparent 22px 60px)' }}
            aria-hidden="true"
          />
          <div className="relative max-w-md mx-auto px-5 pt-9">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-fredoka font-extrabold text-[34px] leading-tight [text-shadow:0_3px_0_rgba(140,10,30,.35)]"
            >
              Track your order
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-2 text-[#FFE4E8] font-nunito"
            >
              Enter the order number from your confirmation screen.
            </motion.p>

            <motion.form
              onSubmit={onSubmit}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-6"
              role="search"
            >
              <label htmlFor="order-number" className="sr-only">Order number</label>
              <div className="flex items-center gap-2 bg-white rounded-full p-1.5 pl-5 shadow-[0_6px_0_#B5142B]">
                <input
                  id="order-number"
                  value={input}
                  onChange={(e) => { setInput(e.target.value); setFormatError(null) }}
                  placeholder="PINS-20261120-1073"
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  inputMode="text"
                  className="flex-1 min-w-0 bg-transparent text-[#0F3B2C] font-nunito font-semibold text-[16px] tracking-wide placeholder:text-[#A9BAB2] placeholder:font-normal outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#FFC23A] text-[#0F3B2C] font-fredoka font-bold px-4 py-3 active:scale-[.97] transition-transform"
                >
                  <Search size={18} strokeWidth={2.6} />
                  <span>Find</span>
                </button>
              </div>
              <AnimatePresence>
                {formatError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 text-sm font-nunito text-white flex items-start gap-1.5"
                    role="alert"
                  >
                    <CircleAlert size={16} className="mt-0.5 shrink-0" /> {formatError}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.form>
          </div>

          <svg className="absolute bottom-[-1px] left-0 w-full h-10 text-[#FBFDF9]" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 40V20C60 4 120 2 200 12s140 18 200 0v28z" fill="currentColor" />
          </svg>
        </section>

        {/* ─── Result ─────────────────────────────────────────────────────── */}
        <div className="max-w-md mx-auto px-5 pt-2 pb-16" aria-live="polite">
          <AnimatePresence mode="wait">
            {result === 'idle' && (
              <Message key="idle" icon={<PackageSearch size={28} />} title="Where's my pin?">
                Your order number starts with PINS- and was shown after you placed your order.
              </Message>
            )}
            {result === 'loading' && <LoadingCard key="loading" />}
            {result === 'missing' && (
              <Message key="missing" icon={<PackageSearch size={28} />} title="No order with that number" tone="warn">
                We couldn't find {searched}. Check it against your confirmation screen, or ask at the SSC office.
              </Message>
            )}
            {result === 'notSetUp' && (
              <Message key="notSetUp" icon={<CircleAlert size={28} />} title="Order tracking isn't switched on yet" tone="warn">
                {(error as Error).message} Run the order lookup migration in Supabase, then try again.
              </Message>
            )}
            {result === 'error' && (
              <Message key="error" icon={<CircleAlert size={28} />} title="Couldn't look up your order" tone="warn">
                Check your internet connection and try again.
              </Message>
            )}
            {result === 'found' && order && <OrderCard key={order.order_number} order={order} />}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function OrderCard({ order }: { order: OrderLookup }) {
  const cancelled = order.status === 'cancelled'
  const current = Math.max(0, STEPS.findIndex((s) => s.status === order.status))
  const hint = cancelled
    ? 'This order was cancelled. Visit the SSC office if you have questions.'
    : STEPS[current].hint

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="bg-white rounded-3xl border border-[#DDEFE3] shadow-[0_10px_30px_rgba(15,59,44,.08)] overflow-hidden"
    >
      {/* summary */}
      <div className="flex items-center gap-4 p-5">
        <div className="shrink-0 w-[76px] h-[76px] rounded-full bg-[#FFF1CC] ring-4 ring-[#FFC23A] overflow-hidden flex items-center justify-center">
          {order.preview_image_url ? (
            <img src={order.preview_image_url} alt="Pin design" className="w-full h-full object-contain" />
          ) : (
            <Gift size={28} className="text-[#E3263F]" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-fredoka font-extrabold text-[#E3263F] text-lg leading-tight whitespace-nowrap">{order.order_number}</p>
          {order.order_type === 'shop' && (
            <p className="text-sm font-nunito font-semibold text-[#9A6400]">Pin Shop{order.shop_item_name ? `: ${order.shop_item_name}` : ''}</p>
          )}
          <p className="text-sm text-[#3E6B57] font-nunito">Ordered by {order.display_name}</p>
          <p className="text-sm text-[#3E6B57] font-nunito">
            {order.quantity} {order.quantity === 1 ? 'pin' : 'pins'}
          </p>
        </div>
      </div>

      {/* what's next */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className={`mx-5 rounded-2xl px-4 py-3 font-nunito text-[15px] ${cancelled ? 'bg-[#FFD9DE] text-[#9E1F33]' : 'bg-[#EEF8F1] text-[#0F3B2C]'}`}
      >
        {hint}
      </motion.div>

      {/* progress */}
      {cancelled ? (
        <div className="flex items-center gap-3 p-5">
          <span className="w-9 h-9 rounded-full bg-[#E3263F] text-white flex items-center justify-center"><Ban size={18} /></span>
          <p className="font-fredoka font-bold text-[#0F3B2C]">Cancelled</p>
        </div>
      ) : (
        <ol className="relative p-5 pl-6">
          {/* track + animated fill */}
          <div className="absolute left-[40.5px] top-12 bottom-12 w-[3px] rounded-full bg-[#DDEFE3]" aria-hidden="true" />
          <motion.div
            className="absolute left-[40.5px] top-12 w-[3px] rounded-full bg-[#14904F] origin-top"
            style={{ height: `calc((100% - 96px) * ${current / (STEPS.length - 1)})` }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.3, 0.7, 0.3, 1] }}
            aria-hidden="true"
          />
          {STEPS.map((step, i) => {
            const done = i < current
            const now = i === current
            return (
              <motion.li
                key={step.status}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12 }}
                className="relative flex items-center gap-3 py-2.5"
                aria-current={now ? 'step' : undefined}
              >
                <motion.span
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-[3px] ${
                    done ? 'bg-[#14904F] border-[#14904F] text-white'
                    : now ? 'bg-[#E3263F] border-[#E3263F] text-white'
                    : 'bg-white border-[#DDEFE3] text-[#A9BAB2]'
                  }`}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.35 + i * 0.12 }}
                >
                  {done ? <Check size={16} strokeWidth={3} /> : <span className="text-xs font-fredoka font-bold">{i + 1}</span>}
                  {now && (
                    <span className="absolute inset-[-6px] rounded-full border-2 border-[#E3263F] animate-ping opacity-40" aria-hidden="true" />
                  )}
                </motion.span>
                <span className={`font-fredoka ${now ? 'font-extrabold text-[#0F3B2C]' : done ? 'font-bold text-[#0F3B2C]' : 'font-semibold text-[#8A9F96]'}`}>
                  {step.label}
                </span>
                {now && (
                  <span className="ml-auto text-[11px] font-nunito font-bold text-[#E3263F] bg-[#FFD9DE] rounded-full px-2.5 py-1">Now</span>
                )}
              </motion.li>
            )
          })}
        </ol>
      )}

      {/* dates */}
      <dl className="grid grid-cols-2 gap-px bg-[#DDEFE3] border-t border-[#DDEFE3] text-sm font-nunito">
        <div className="bg-white p-4">
          <dt className="text-[#8A9F96]">Ordered</dt>
          <dd className="text-[#0F3B2C] font-semibold">{formatDate(order.date_ordered)}</dd>
        </div>
        <div className="bg-white p-4">
          <dt className="text-[#8A9F96]">Last update</dt>
          <dd className="text-[#0F3B2C] font-semibold">{formatDate(order.updated_at ?? order.date_ordered)}</dd>
        </div>
      </dl>
    </motion.article>
  )
}

function Message({ icon, title, children, tone = 'info' }: { icon: ReactNode; title: string; children: ReactNode; tone?: 'info' | 'warn' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-3xl border border-[#DDEFE3] p-6 text-center"
    >
      <span className={`mx-auto mb-3 w-14 h-14 rounded-full flex items-center justify-center ${tone === 'warn' ? 'bg-[#FFF1CC] text-[#9A6400]' : 'bg-[#EEF8F1] text-[#14904F]'}`}>
        {icon}
      </span>
      <h2 className="font-fredoka font-bold text-xl text-[#0F3B2C]">{title}</h2>
      <p className="mt-1.5 text-[15px] text-[#3E6B57] font-nunito leading-relaxed">{children}</p>
      {tone === 'info' && (
        <Link to="/create" className="mt-5 inline-flex items-center gap-1.5 text-[#E3263F] font-fredoka font-bold">
          <Plus size={16} /> Haven't ordered yet? Design a pin
        </Link>
      )}
    </motion.div>
  )
}

function LoadingCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-3xl border border-[#DDEFE3] p-5"
      aria-label="Looking up your order"
    >
      <div className="flex items-center gap-4">
        <div className="w-[76px] h-[76px] rounded-full shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded shimmer" />
          <div className="h-4 w-1/2 rounded shimmer" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-9 rounded-xl shimmer" />)}
      </div>
    </motion.div>
  )
}
