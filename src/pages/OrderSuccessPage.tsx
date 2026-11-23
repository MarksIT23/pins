import { useEffect, useState } from 'react'
import { useSearchParams, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Home, Plus, Wallet, Paintbrush, PackageCheck, Gift, PackageSearch } from 'lucide-react'
import { SparkleBackground } from '@/components/layout/SparkleBackground'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Confetti } from '@/components/ui/Confetti'
import { useCharacterStore } from '@/store/characterStore'

const NEXT_STEPS = [
  { icon: Wallet, title: 'Pay at the SSC office', text: 'Bring your order number to the WU-P SSC Office. We review your order once payment is done.', color: 'bg-[#E3263F]' },
  { icon: Paintbrush, title: 'We make your pin', text: 'Your pin goes into production once payment is confirmed.', color: 'bg-[#14904F]' },
  { icon: PackageCheck, title: 'Pick it up', text: "Collect it at the Wesleyan campus SSC Office once we announce it's ready.", color: 'bg-[#2E9BD6]' },
]

// Timeline (seconds): tag drops in, stamp lands, then the details follow.
const T_STAMP = 1.0
const T_TEXT = 1.35

export function OrderSuccessPage() {
  const [params] = useSearchParams()
  const location = useLocation()
  const orderNumber = params.get('order')
  const preview = (location.state as { preview?: string } | null)?.preview
  const { resetCharacter } = useCharacterStore()

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFDF9] relative">
      <SparkleBackground />
      <Header />

      <main className="flex-1 relative z-10">
        {/* ─── Red band the gift tag hangs in ─────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#E3263F] pb-14">
          <div
            className="absolute inset-0 opacity-[0.09] pointer-events-none"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg, #fff 0 22px, transparent 22px 60px)' }}
            aria-hidden="true"
          />

          <div className="relative flex justify-center">
            {/* Tag drops in on its string… */}
            <motion.div
              className="origin-top"
              initial={{ y: -420 }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', stiffness: 75, damping: 9, mass: 1.1, delay: 0.15 }}
            >
              {/* …then keeps swaying gently */}
              <div className="flex flex-col items-center origin-top animate-swing">
                <div className="w-[2px] h-14 sm:h-20 bg-[#FFC23A]" />

                <div className="relative w-[290px] rounded-[22px] bg-white px-6 pt-8 pb-6 text-center shadow-[0_14px_30px_rgba(120,0,20,.35)]">
                  {/* punched hole where the string ties on */}
                  <div className="absolute left-1/2 -top-[7px] -ml-[9px] w-[18px] h-[18px] rounded-full bg-[#E3263F] ring-4 ring-[#FFC23A]" />
                  <div className="absolute inset-2.5 rounded-[16px] border-2 border-dashed border-[#FFD9DE] pointer-events-none" />

                  {/* the pin they ordered */}
                  <div className="relative mx-auto mb-4 w-28 h-28 rounded-full bg-[#FFF1CC] ring-4 ring-[#FFC23A] ring-offset-2 overflow-hidden flex items-center justify-center">
                    {preview ? (
                      <img src={preview} alt="Your pin design" className="w-full h-full object-contain" />
                    ) : (
                      <Gift size={40} className="text-[#E3263F]" />
                    )}
                  </div>

                  <p className="text-xs text-[#3E6B57] font-nunito">Your order number</p>
                  <p className="font-fredoka text-[21px] leading-tight font-extrabold text-[#E3263F] whitespace-nowrap">
                    {orderNumber ?? '—'}
                  </p>

                  {/* "placed" stamp thumps onto the corner */}
                  <motion.div
                    className="absolute -right-5 -top-5 w-[74px] h-[74px] rounded-full bg-[#14904F] text-white flex flex-col items-center justify-center ring-4 ring-white shadow-lg"
                    initial={{ scale: 2.4, opacity: 0, rotate: -40 }}
                    animate={{ scale: 1, opacity: 1, rotate: 12 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 16, delay: T_STAMP }}
                  >
                    <Check size={24} strokeWidth={3.2} />
                    <span className="font-fredoka font-bold text-[11px] leading-none mt-0.5">Placed</span>
                  </motion.div>

                  {/* burst timed with the stamp */}
                  <DelayedConfetti delay={T_STAMP * 1000} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* snowy edge */}
          <svg className="absolute bottom-[-1px] left-0 w-full h-10 text-[#FBFDF9]" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 40V20C60 4 120 2 200 12s140 18 200 0v28z" fill="currentColor" />
          </svg>
        </section>

        {/* ─── Message + next steps ───────────────────────────────────────── */}
        <div className="max-w-md mx-auto px-5 pt-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: T_TEXT }}
            className="text-center"
          >
            <h1 className="font-fredoka text-[34px] leading-tight font-extrabold text-[#0F3B2C] mb-2">
              Order placed!
            </h1>
            <p className="text-[#3E6B57] font-nunito leading-relaxed">
              Thanks, we've received your pin design. Keep your order number for payment and pick-up.
            </p>
          </motion.div>

          <ol className="mt-8 flex flex-col gap-3">
            {NEXT_STEPS.map(({ icon: Icon, title, text, color }, i) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: T_TEXT + 0.2 + i * 0.15 }}
                className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-[#DDEFE3]"
              >
                <motion.span
                  className={`shrink-0 w-10 h-10 rounded-full ${color} text-white flex items-center justify-center`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 14, delay: T_TEXT + 0.3 + i * 0.15 }}
                >
                  <Icon size={18} />
                </motion.span>
                <div>
                  <p className="font-fredoka font-bold text-[#0F3B2C]">{title}</p>
                  <p className="text-sm text-[#3E6B57] font-nunito leading-relaxed">{text}</p>
                </div>
              </motion.li>
            ))}
          </ol>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: T_TEXT + 0.8 }}
            className="mt-8 flex flex-col gap-3"
          >
            <Link
              to="/create"
              onClick={resetCharacter}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#E3263F] text-white font-fredoka font-bold py-3.5 shadow-[0_5px_0_#B5142B] active:translate-y-[3px] active:shadow-[0_2px_0_#B5142B] transition-transform"
            >
              <Plus size={18} /> Design another pin
            </Link>
            {orderNumber && (
              <Link
                to={`/track?order=${encodeURIComponent(orderNumber)}`}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#14904F] text-white font-fredoka font-bold py-3.5 active:scale-[.98] transition-transform"
              >
                <PackageSearch size={18} /> Track this order
              </Link>
            )}
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#0F3B2C] border-2 border-[#DDEFE3] font-fredoka font-bold py-3.5 active:scale-[.98] transition-transform"
            >
              <Home size={18} /> Back to home
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

/** Mounts the confetti burst after a delay so it lands with the stamp. */
function DelayedConfetti({ delay }: { delay: number }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return show ? <Confetti count={34} /> : null
}
