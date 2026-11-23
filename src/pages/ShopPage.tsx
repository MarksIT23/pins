import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Paintbrush, ArrowRight, Sparkles } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SparkleBackground } from '@/components/layout/SparkleBackground'
import { ShopOrderModal } from '@/components/shop/ShopOrderModal'
import { toShopPin, formatPeso, type ShopPin } from '@/data/shopPins'
import { useShopItems, useShopCategories, ShopNotSetUpError } from '@/hooks/useShop'

/** Pin Shop: ready-made designs ordered as-is (the custom builder lives at /create). */
export function ShopPage() {
  const [selected, setSelected] = useState<ShopPin | null>(null)
  const { data: items, isLoading, error } = useShopItems()
  const pins = useMemo(() => (items ?? []).map(toShopPin), [items])
  const { data: categories = [] } = useShopCategories()
  /** 'all' or the key of one group */
  const [filter, setFilter] = useState('all')

  // Designs grouped by category in the admin's order. Empty categories are left
  // out; designs with no category go last, under "More pins".
  const groups = useMemo(() => {
    const known = new Set(categories.map((c) => c.id))
    const out = categories
      .map((c) => ({ key: c.id, name: c.name, pins: pins.filter((p) => p.categoryId === c.id) }))
      .filter((g) => g.pins.length > 0)
    const rest = pins.filter((p) => !p.categoryId || !known.has(p.categoryId))
    if (rest.length > 0) out.push({ key: 'more', name: out.length > 0 ? 'More pins' : '', pins: rest })
    return out
  }, [categories, pins])
  const grouped = groups.length > 1 || (groups.length === 1 && groups[0].key !== 'more')
  const activeKey = groups.some((g) => g.key === filter) ? filter : 'all'
  const shownGroups = activeKey === 'all' ? groups : groups.filter((g) => g.key === activeKey)
  useEffect(() => {
    if (error instanceof ShopNotSetUpError) console.warn('[Pin Shop]', error.message, 'Run supabase/migrations/20261123000000_pin_shop.sql.')
  }, [error])

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFDF9] relative">
      <SparkleBackground />
      <Header />

      <main className="flex-1 relative z-10">
        {/* ─── Green band ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#14904F] text-white pb-14">
          <div
            className="absolute inset-0 opacity-[0.1] pointer-events-none"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg, #FFC23A 0 14px, transparent 14px 60px)' }}
            aria-hidden="true"
          />
          <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-9">
            <motion.span
              initial={{ opacity: 0, y: -8, rotate: -10 }}
              animate={{ opacity: 1, y: 0, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14 }}
              className="gift-tag font-fredoka font-bold text-sm"
              style={{ color: '#14904F' }}
            >
              Ready-made designs
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-4 font-fredoka font-extrabold text-[clamp(2.2rem,9vw,3.5rem)] leading-[1] [text-shadow:0_3px_0_rgba(0,60,30,.35)]"
            >
              Pin Shop
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-3 max-w-[36ch] text-[#D3F2DD] font-nunito text-[17px] leading-relaxed"
            >
              Pick a finished Christmas pin, order it, and pick it up at the SSC office. No designing needed.
            </motion.p>
          </div>
          <svg className="absolute bottom-[-1px] left-0 w-full h-10 text-[#FBFDF9]" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 40V20C60 4 120 2 200 12s140 18 200 0v28z" fill="currentColor" />
          </svg>
        </section>

        {/* ─── Catalogue ──────────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-2 pb-14">
          {isLoading ? (
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-4 sm:gap-x-5" aria-label="Loading designs">
              {Array.from({ length: 4 }).map((_, i) => <li key={i} className="mx-auto w-full max-w-[180px] aspect-square rounded-full shimmer" />)}
            </ul>
          ) : pins.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#DDEFE3] p-8 text-center">
              <span className="mx-auto mb-3 w-14 h-14 rounded-full bg-[#FFF1CC] text-[#9A6400] flex items-center justify-center"><Sparkles size={26} /></span>
              <p className="font-fredoka font-bold text-xl text-[#0F3B2C]">{error && !(error instanceof ShopNotSetUpError) ? "Couldn't load the shop" : 'New designs are on the way'}</p>
              <p className="mt-1.5 text-[15px] text-[#3E6B57] font-nunito">
                {error && !(error instanceof ShopNotSetUpError) ? 'Check your internet connection and try again.' : 'Check back soon, or design your own pin in the meantime.'}
              </p>
            </div>
          ) : (
            <>
              {grouped && (
                <div className="sticky top-[66px] sm:top-[74px] z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-2.5 mb-2 bg-[#FBFDF9]/95 backdrop-blur-sm">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="Show pins in">
                    <CategoryChip active={activeKey === 'all'} onClick={() => setFilter('all')}>All pins</CategoryChip>
                    {groups.map((g) => (
                      <CategoryChip key={g.key} active={activeKey === g.key} onClick={() => setFilter(g.key)}>{g.name}</CategoryChip>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-9">
                {shownGroups.map((g) => (
                  <section key={g.key} aria-labelledby={g.name ? `shop-group-${g.key}` : undefined}>
                    {grouped && (
                      <div className="flex items-baseline gap-3 mb-3">
                        <h2 id={`shop-group-${g.key}`} className="font-fredoka font-bold text-xl sm:text-2xl text-[#0F3B2C]">{g.name}</h2>
                        <span className="text-sm font-nunito text-[#3E6B57]">{g.pins.length} design{g.pins.length === 1 ? '' : 's'}</span>
                        <span className="flex-1 h-[3px] rounded-full bg-[repeating-linear-gradient(90deg,#E3263F_0_10px,#FFFFFF_10px_14px,#14904F_14px_24px,#FFFFFF_24px_28px)] opacity-60 self-center" aria-hidden="true" />
                      </div>
                    )}
                    <ul key={activeKey} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-4 sm:gap-x-5">
                      {g.pins.map((pin, i) => <PinCard key={pin.id} pin={pin} index={i} onSelect={setSelected} />)}
                    </ul>
                  </section>
                ))}
              </div>
            </>
          )}

          {/* custom option */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 rounded-3xl bg-[#E3263F] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5"
          >
            <div className="flex-1">
              <p className="font-fredoka text-xl font-bold">Want one that looks like you?</p>
              <p className="font-nunito text-[#FFE4E8] text-[15px] mt-1">Build your own chibi pin with your hair, outfit and accessories.</p>
            </div>
            <Link
              to="/create"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#E3263F] font-fredoka font-bold px-6 py-3.5 active:scale-[.97] transition-transform"
            >
              <Paintbrush size={18} /> Design a custom pin <ArrowRight size={16} />
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
      <ShopOrderModal pin={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function CategoryChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-fredoka font-bold border-2 transition-colors ${
        active
          ? 'bg-[#E3263F] border-[#E3263F] text-white shadow-[0_3px_10px_rgba(227,38,63,0.3)]'
          : 'bg-white border-[#DDEFE3] text-[#3E6B57] hover:border-[#9FD6B4]'
      }`}
    >
      {children}
    </button>
  )
}

function PinCard({ pin, index: i, onSelect }: { pin: ShopPin; index: number; onSelect: (p: ShopPin) => void }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: -30, rotate: i % 2 ? 4 : -4 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 13, delay: 0.1 + Math.min(i, 8) * 0.08 }}
    >
      <motion.button
        type="button"
        onClick={() => onSelect(pin)}
        whileTap={{ scale: 0.97 }}
        className="group w-full flex flex-col items-center text-center rounded-3xl p-2 sm:p-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFC23A]"
        aria-label={`Order ${pin.name}`}
      >
        <div
          className="relative w-full max-w-[180px] aspect-square rounded-full overflow-hidden border-4 border-white shadow-[0_6px_18px_rgba(15,59,44,.14)] ring-1 ring-[#DDEFE3] transition-transform duration-300 group-hover:-translate-y-1"
          style={{ background: pin.tint }}
        >
          <img
            src={pin.image}
            alt=""
            loading="lazy"
            className="absolute inset-[8%] w-[84%] h-[84%] object-contain drop-shadow-[0_4px_6px_rgba(15,59,44,.18)] transition-transform duration-300 group-hover:rotate-[-4deg]"
          />
          <span className="absolute bottom-[6%] right-[6%] w-8 h-8 rounded-full bg-[#E3263F] text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-110" aria-hidden="true">
            <ShoppingBag size={14} />
          </span>
        </div>
        <p className="mt-2 font-fredoka font-bold text-[14px] sm:text-[15px] text-[#0F3B2C] leading-tight line-clamp-2">{pin.name}</p>
        <p className="text-xs text-[#3E6B57] font-nunito">{pin.price != null ? formatPeso(pin.price) : 'Ready to order'}</p>
      </motion.button>
    </motion.li>
  )
}
