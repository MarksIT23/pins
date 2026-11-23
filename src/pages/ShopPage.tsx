import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Paintbrush, ArrowRight, Sparkles } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SparkleBackground } from '@/components/layout/SparkleBackground'
import { ShopOrderModal } from '@/components/shop/ShopOrderModal'
import { toShopPin, formatPeso, type ShopPin } from '@/data/shopPins'
import { useShopItems, ShopNotSetUpError } from '@/hooks/useShop'

/** Pin Shop: ready-made designs ordered as-is (the custom builder lives at /create). */
export function ShopPage() {
  const [selected, setSelected] = useState<ShopPin | null>(null)
  const { data: items, isLoading, error } = useShopItems()
  const pins = useMemo(() => (items ?? []).map(toShopPin), [items])
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
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5" aria-label="Loading designs">
              {Array.from({ length: 4 }).map((_, i) => <li key={i} className="aspect-[4/5] rounded-3xl shimmer" />)}
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
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            {pins.map((pin, i) => (
              <motion.li
                key={pin.id}
                initial={{ opacity: 0, y: -30, rotate: i % 2 ? 4 : -4 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 13, delay: 0.1 + i * 0.08 }}
              >
                <motion.button
                  type="button"
                  onClick={() => setSelected(pin)}
                  whileTap={{ scale: 0.97 }}
                  className="group w-full text-left bg-white rounded-3xl border border-[#DDEFE3] overflow-hidden focus-visible:ring-4 focus-visible:ring-[#FFC23A]"
                  aria-label={`Order ${pin.name}`}
                >
                  <div className="relative aspect-square flex items-center justify-center overflow-hidden" style={{ background: pin.tint }}>
                    <img
                      src={pin.image}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-contain scale-[1.45] -translate-y-[3%] drop-shadow-[0_6px_8px_rgba(15,59,44,.2)] transition-transform duration-300 group-hover:-translate-y-[6%] group-hover:rotate-[-3deg]"
                    />
                  </div>
                  <div className="p-3 sm:p-4 flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-fredoka font-bold text-[15px] sm:text-base text-[#0F3B2C] leading-tight line-clamp-2">{pin.name}</p>
                      <p className="text-xs text-[#3E6B57] font-nunito">{pin.price != null ? formatPeso(pin.price) : 'Ready to order'}</p>
                    </div>
                    <span className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E3263F] text-white flex items-center justify-center transition-transform group-hover:scale-110" aria-hidden="true">
                      <ShoppingBag size={16} />
                    </span>
                  </div>
                </motion.button>
              </motion.li>
            ))}
          </ul>
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
