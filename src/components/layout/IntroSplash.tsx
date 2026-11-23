import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import pin1 from '@/assets/pins-balls/pin1.png'
import pin2 from '@/assets/pins-balls/pin2.png'
import pin3 from '@/assets/pins-balls/pin3.png'
import pin4 from '@/assets/pins-balls/pin4.png'
import pin5 from '@/assets/pins-balls/pin5.png'
import pin6 from '@/assets/pins-balls/pin6.png'

const PIN_IMAGES = [pin1, pin2, pin3, pin4, pin5, pin6]
// Pin artwork is 375×375 with the round pin (≈229px across) centred at (187.5, 198).
const PIN_SIZE = 140 // on-screen diameter of the pin
const PIN_K = PIN_SIZE / 229
const CUT_MS = 260 // how long each pin shows during the quick cuts

const SEEN_KEY = 'pins-intro-seen'

function alreadySeen() {
  try { return sessionStorage.getItem(SEEN_KEY) === '1' } catch { return false }
}
function markSeen() {
  try { sessionStorage.setItem(SEEN_KEY, '1') } catch { /* storage unavailable */ }
}

const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2
  return { x: Math.cos(a) * (110 + (i % 3) * 22), y: Math.sin(a) * (90 + (i % 2) * 26) - 40, c: ['#FFC23A', '#FFFFFF', '#FF8FA3', '#2BC06C'][i % 4], s: 10 + (i % 3) * 4 }
})

/**
 * Opening animation: a present drops in, wiggles, pops open and a chibi pin
 * jumps out with a burst of sparkles. Then the screen closes in a circle to reveal the site.
 * Plays once per browser session (or whenever the URL has ?intro); tap anywhere to skip.
 */
export function IntroSplash() {
  const reduce = useReducedMotion()
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin')
  // Add ?intro to the URL to replay it on demand.
  const force = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('intro')
  const [show, setShow] = useState(() => force || (!alreadySeen() && !isAdmin))
  const [opened, setOpened] = useState(false)
  const done = useRef(false)
  // Quick cuts: once the pin lands, flick through all six designs, then hold on the last.
  const [cutting, setCutting] = useState(false)
  const [cut, setCut] = useState(0)
  useEffect(() => {
    if (!cutting) return
    if (cut >= PIN_IMAGES.length - 1) {
      const hold = setTimeout(() => finish(), 900)
      return () => clearTimeout(hold)
    }
    const t = setTimeout(() => setCut((c) => c + 1), CUT_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cutting, cut])

  useEffect(() => {
    if (!show) return
    if (reduce && !force) { markSeen(); setShow(false); window.dispatchEvent(new Event('pins:intro-done')); return }
    document.body.style.overflow = 'hidden'
    // Steps chain on animation completion; this is only a safety net.
    const safety = setTimeout(() => finish(), 11000)
    return () => { clearTimeout(safety); document.body.style.overflow = '' }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, reduce])

  function finish() {
    if (done.current) return
    done.current = true
    markSeen()
    window.dispatchEvent(new Event('pins:intro-done'))
    document.body.style.overflow = ''
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          onClick={finish}
          style={{ zIndex: 100 }}
          className="fixed inset-0 flex flex-col items-center justify-center bg-[#E3263F] cursor-pointer select-none"
          initial={{ clipPath: 'circle(150% at 50% 50%)' }}
          animate={{ clipPath: 'circle(150% at 50% 50%)' }}
          exit={{ clipPath: 'circle(0% at 50% 46%)', transition: { duration: 0.9, ease: [0.7, 0, 0.3, 1] } }}
          aria-label="Opening animation. Tap to skip."
          role="presentation"
        >
          {/* candy stripes */}
          <div
            className="absolute inset-0 opacity-[0.09]"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg, #fff 0 22px, transparent 22px 60px)' }}
          />

          <div className="relative w-[220px] h-[260px]">
            {/* sparkles */}
            {opened && SPARKS.map((p, i) => (
              <motion.svg
                key={i}
                viewBox="0 0 24 24"
                width={p.s}
                height={p.s}
                className="absolute left-1/2 top-[45%]"
                initial={{ x: -p.s / 2, y: 0, scale: 0, opacity: 1 }}
                animate={{ x: p.x - p.s / 2, y: p.y, scale: [0, 1.3, 0.9], opacity: [1, 1, 0], rotate: 180 }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
              >
                <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill={p.c} />
              </motion.svg>
            ))}

            {/* the pin that jumps out, then quick-cuts through all six designs */}
            <AnimatePresence>
              {opened && (
                <motion.div
                  className="absolute left-1/2 top-[34%]"
                  style={{ width: PIN_SIZE, height: PIN_SIZE, marginLeft: -PIN_SIZE / 2 }}
                  initial={{ y: 60, scale: 0.2, rotate: -20 }}
                  animate={{ y: -70, scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 130, damping: 11 }}
                  onAnimationComplete={() => setCutting(true)}
                >
                  {/* cap + loop */}
                  <div className="absolute left-1/2 -top-[13px] -ml-[9px] w-[18px] h-[11px] rounded-[3px] bg-[#FFC23A] border border-[#E89B12]" />
                  <div className="absolute left-1/2 -top-[22px] -ml-[5px] w-[10px] h-[10px] rounded-full border-2 border-[#FFC23A]" />
                  {PIN_IMAGES.map((src, i) => (
                    <motion.img
                      key={src}
                      src={src}
                      alt=""
                      draggable={false}
                      className="absolute max-w-none"
                      style={{
                        width: 375 * PIN_K,
                        height: 375 * PIN_K,
                        left: PIN_SIZE / 2 - 187.5 * PIN_K,
                        top: PIN_SIZE / 2 - 198 * PIN_K,
                        filter: 'drop-shadow(0 4px 6px rgba(120,0,20,.35))',
                      }}
                      initial={false}
                      animate={i === cut ? { opacity: 1, scale: [1.14, 1] } : { opacity: 0, scale: 1 }}
                      transition={{ opacity: { duration: 0.05 }, scale: { duration: 0.22, ease: 'easeOut' } }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* gift box */}
            <motion.div
              className="absolute inset-x-0 bottom-0"
              onAnimationComplete={() => setOpened(true)}
              initial={{ y: -480 }}
              animate={opened ? { y: 0 } : { y: 0, rotate: [0, -7, 7, -6, 6, -4, 4, 0] }}
              transition={opened
                ? { duration: 0.2 }
                : { y: { type: 'spring', stiffness: 90, damping: 12, delay: 0.3 }, rotate: { delay: 1.3, duration: 1.1 } }}
            >
              <svg viewBox="0 0 220 170" className="w-full overflow-visible">
                {/* box */}
                <rect x="22" y="62" width="176" height="108" rx="10" fill="#14904F" />
                <rect x="22" y="62" width="176" height="18" fill="#0F7A42" />
                <rect x="98" y="62" width="24" height="108" fill="#FFC23A" />
                {/* lid */}
                <motion.g
                  initial={false}
                  animate={opened ? { y: -150, x: 70, rotate: 35, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
                  transition={{ duration: 1.0, ease: [0.2, 0.8, 0.3, 1] }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                >
                  <rect x="12" y="38" width="196" height="30" rx="8" fill="#16A05A" />
                  <rect x="98" y="38" width="24" height="30" fill="#FFC23A" />
                  <path d="M110 38c-18-30-52-24-34 0zM110 38c18-30 52-24 34 0z" fill="#FFC23A" stroke="#E89B12" strokeWidth="2" />
                  <circle cx="110" cy="36" r="7" fill="#E89B12" />
                </motion.g>
              </svg>
            </motion.div>
          </div>

          <motion.p
            className="relative mt-8 font-fredoka font-extrabold text-white text-[clamp(1.6rem,7vw,2.4rem)] tracking-[-0.02em] text-center px-6 [text-shadow:0_3px_0_rgba(140,10,30,.35)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: opened ? 1 : 0, y: opened ? 0 : 12 }}
            transition={{ duration: 0.6, delay: opened ? 0.45 : 0 }}
          >
            WU-P Christmas Chibi Pins
          </motion.p>
          <p className="absolute bottom-[max(20px,env(safe-area-inset-bottom))] text-xs font-nunito text-white/70">Tap to skip</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
