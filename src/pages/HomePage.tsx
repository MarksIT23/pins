import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Palette, Shirt, Gift } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SparkleBackground } from '@/components/layout/SparkleBackground'
import { FestiveTree } from '@/components/home/FestiveTree'
import { GetPinsMenu } from '@/components/layout/GetPinsMenu'

const STEPS = [
  { icon: Palette, title: 'Choose a base', desc: 'Start from a male or female chibi body.' },
  { icon: Shirt, title: 'Dress it up', desc: 'Add hair, clothes, glasses and accessories. Add a name if you like.' },
  { icon: Gift, title: 'Place your order', desc: 'Send your design, pay at the SSC office, and pick up your pin.' },
]

export function HomePage() {
  // Show a sticky CTA on mobile once the hero button scrolls out of view.
  const heroCtaRef = useRef<HTMLDivElement>(null)
  const [showSticky, setShowSticky] = useState(false)
  // Replay the hero entrance once the opening animation closes.
  const [heroKey, setHeroKey] = useState(0)
  useEffect(() => {
    const replay = () => setHeroKey((k) => k + 1)
    window.addEventListener('pins:intro-done', replay)
    return () => window.removeEventListener('pins:intro-done', replay)
  }, [])
  useEffect(() => {
    const el = heroCtaRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [heroKey])

  return (
    <div className="relative min-h-screen flex flex-col pb-24 md:pb-0">
      <SparkleBackground density={0.3} color="150, 190, 170" />
      <Header />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 overflow-hidden bg-[#E3263F] text-white">
        <CandyStripes />
        <HeroSnow />

        <div key={heroKey} className="relative max-w-6xl mx-auto px-5 pt-9 sm:pt-12 md:grid md:grid-cols-[1fr_1.05fr] md:gap-8 md:items-end md:px-8 md:pt-16">
          <div className="text-center md:text-left md:pb-28">
            <motion.span
              initial={{ opacity: 0, y: -8, rotate: -10 }}
              animate={{ opacity: 1, y: 0, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
              className="gift-tag font-fredoka font-bold text-sm"
            >
              By the WSSC
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="mt-5 font-fredoka font-extrabold leading-[0.95] tracking-[-0.03em] text-[clamp(2.6rem,11.5vw,5rem)] [text-shadow:0_3px_0_rgba(140,10,30,.35)]"
            >
              WU-P Christmas Chibi Pins
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="mt-4 mx-auto md:mx-0 max-w-[34ch] text-[#FFE4E8] font-nunito text-[17px] leading-relaxed"
            >
              Design your own chibi character pin for Christmas, or pick a ready-made one from the Pin Shop.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.4 }}
              className="mt-7 flex flex-col items-center md:items-start gap-3"
            >
              <div ref={heroCtaRef} className="w-full sm:w-auto">
                <GetPinsMenu variant="hero" />
              </div>
              <p className="text-sm text-[#FFD9DE] font-nunito">Free to design, no account needed</p>
            </motion.div>
          </div>

          <div className="relative mx-auto mt-6 md:mt-0 w-full max-w-[400px] md:max-w-[460px]">
            <FestiveTree />
          </div>
        </div>

        {/* snowy ground the presents sit on */}
        <svg className="relative block w-full h-10 sm:h-14 -mt-6 sm:-mt-9 text-[#FBFDF9]" viewBox="0 0 400 56" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 56V26C60 8 120 4 200 14s140 20 200 0v42z" fill="currentColor" />
        </svg>
      </section>

      {/* ─── How it works ─────────────────────────────────────────────────── */}
      <section className="relative z-10 px-5 sm:px-8 pt-10 pb-14 sm:py-20 max-w-5xl mx-auto w-full">
        <h2 className="font-fredoka text-[28px] sm:text-4xl font-extrabold text-[#0F3B2C] mb-2 tracking-[-0.02em]">
          How it works
        </h2>
        <p className="font-nunito text-[#3E6B57] mb-8 sm:mb-12 max-w-lg">
          Three steps from a blank base to a pin you can gift, wear, or clip on your bag.
        </p>

        <ol className="relative flex flex-col gap-7 sm:grid sm:grid-cols-3 sm:gap-6">
          {/* ribbon: vertical on mobile, horizontal on larger screens */}
          <div className="sm:hidden absolute left-[25px] top-6 bottom-6 border-l-2 border-dashed border-[#FFC23A]" aria-hidden="true" />
          <div className="hidden sm:block absolute top-[26px] left-[8%] right-[8%] border-t-2 border-dashed border-[#FFC23A]" aria-hidden="true" />
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.12 }}
                className="relative flex gap-4 sm:block"
              >
                <div className={`relative z-10 shrink-0 w-[52px] h-[52px] rounded-full flex items-center justify-center text-white sm:mb-5 ${['bg-[#E3263F]', 'bg-[#14904F]', 'bg-[#2E9BD6]'][i]}`}>
                  <Icon size={22} strokeWidth={2.2} />
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#FFC23A] text-[#0F3B2C] text-xs font-fredoka font-extrabold flex items-center justify-center ring-2 ring-[#FBFDF9]">
                    {i + 1}
                  </span>
                </div>
                <div className="pt-1 sm:pt-0">
                  <h3 className="font-fredoka text-xl font-bold text-[#0F3B2C] mb-1">{step.title}</h3>
                  <p className="text-[15px] leading-relaxed text-[#3E6B57] font-nunito max-w-[32ch]">{step.desc}</p>
                </div>
              </motion.li>
            )
          })}
        </ol>

        <div className="mt-12 sm:mt-14 relative overflow-hidden rounded-3xl bg-[#14904F] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full border-[10px] border-[#FFC23A]/40" aria-hidden="true" />
          <div className="relative flex-1">
            <p className="font-fredoka text-xl font-bold">Ordering a pin as a gift?</p>
            <p className="font-nunito text-[#D3F2DD] text-[15px] mt-1">Design it in their likeness and add their name. Pick-up is at the Wesleyan campus SSC office.</p>
          </div>
          <Link
            to="/create"
            className="relative inline-flex items-center justify-center gap-2 rounded-full bg-[#FFC23A] text-[#0F3B2C] font-fredoka font-bold px-6 py-3.5 active:scale-[.97] transition-transform"
          >
            Design a gift pin <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />

      {/* ─── Sticky mobile CTA ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="md:hidden fixed inset-x-0 bottom-0 z-40 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] bg-white/90 backdrop-blur-md border-t border-[#DDEFE3]"
          >
            <GetPinsMenu variant="sticky" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Faint diagonal candy-cane stripes across the red hero. */
function CandyStripes() {
  return (
    <div
      className="absolute inset-0 opacity-[0.09] pointer-events-none"
      style={{ backgroundImage: 'repeating-linear-gradient(135deg, #fff 0 22px, transparent 22px 60px)' }}
      aria-hidden="true"
    />
  )
}

/** White snow drifting inside the hero only. */
function HeroSnow() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {Array.from({ length: 30 }).map((_, i) => {
        const size = 3 + ((i * 7) % 4)
        return (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${(i * 37) % 100}%`,
              top: '-10px',
              width: size,
              height: size,
              opacity: 0.45 + ((i * 3) % 5) / 10,
              animation: `heroSnow ${9 + ((i * 13) % 9)}s linear ${-((i * 5) % 17)}s infinite`,
            }}
          />
        )
      })}
      <style>{`@keyframes heroSnow { to { transform: translate3d(24px, 900px, 0); } }`}</style>
    </div>
  )
}
