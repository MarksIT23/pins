import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const STRIPES = { backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,.12) 0 22px, transparent 22px 60px)' }

/**
 * Entering the design page: the screen is wrapped like a present. The bow pops loose,
 * then the paper tears open to the left and right to reveal the editor.
 * Plays every time the page opens; tap to skip. With reduced motion on, it shows a
 * calm version instead: the wrapped present simply fades away.
 */
export function UnwrapTransition({ onOpen }: { onOpen?: () => void }) {
  const reduce = useReducedMotion()
  const [stage, setStage] = useState<'wrapped' | 'untied' | 'open' | 'gone'>('wrapped')

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const run = () => {
      if (reduce) {
        // Calm version: show the wrapped present briefly, then fade it away.
        timers.push(setTimeout(() => { onOpen?.(); setStage('gone') }, 1300))
        return
      }
      timers.push(setTimeout(() => setStage('untied'), 900))
      timers.push(setTimeout(() => { setStage('open'); onOpen?.() }, 1450))
      timers.push(setTimeout(() => setStage('gone'), 2500))
    }
    // On a first visit the opening animation plays on top; unwrap once it has closed.
    let introPending = false
    try { introPending = sessionStorage.getItem('pins-intro-seen') !== '1' } catch { /* ignore */ }
    if (!introPending) { run(); return () => timers.forEach(clearTimeout) }
    const onIntroDone = () => run()
    window.addEventListener('pins:intro-done', onIntroDone, { once: true })
    timers.push(setTimeout(() => { window.removeEventListener('pins:intro-done', onIntroDone); run() }, 10000))
    return () => { window.removeEventListener('pins:intro-done', onIntroDone); timers.forEach(clearTimeout) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce])

  function skip() {
    setStage('gone')
    onOpen?.()
  }

  const opening = stage === 'open'
  const tear = { duration: 0.95, ease: [0.65, 0, 0.35, 1] as [number, number, number, number] }

  return (
    <AnimatePresence>
      {stage !== 'gone' && (
        <motion.div
          key="unwrap"
          className="fixed inset-0 overflow-hidden cursor-pointer"
          style={{ zIndex: 90 }}
          onClick={skip}
          exit={{ opacity: 0, transition: { duration: reduce ? 0.6 : 0.2 } }}
          role="presentation"
          aria-label="Opening the design page. Tap to skip."
        >
          {/* left half of the paper (overlaps the right half by 16px so the torn seam never shows a gap) */}
          <motion.div
            className="absolute inset-y-0 left-0 w-[calc(50%+16px)] bg-[#E3263F]"
            style={{ ...STRIPES, clipPath: 'polygon(0 0, calc(100% - 0px) 0%, calc(100% - 12px) 6%, calc(100% - 2px) 13%, calc(100% - 14px) 21%, calc(100% - 3px) 29%, calc(100% - 11px) 37%, calc(100% - 0px) 45%, calc(100% - 13px) 53%, calc(100% - 4px) 61%, calc(100% - 12px) 69%, calc(100% - 1px) 77%, calc(100% - 14px) 85%, calc(100% - 3px) 93%, calc(100% - 9px) 100%, 0 100%)' }}
            initial={{ x: 0, rotate: 0 }}
            animate={opening ? { x: '-105%', rotate: -6 } : { x: 0, rotate: 0 }}
            transition={tear}
          >
            <div className="absolute inset-y-0 right-[6px] w-5 bg-[#FFC23A]" />
            <div className="absolute inset-x-0 top-1/2 -mt-2.5 h-5 bg-[#FFC23A]" />
          </motion.div>

          {/* right half of the paper */}
          <motion.div
            className="absolute inset-y-0 right-0 w-[calc(50%+16px)] bg-[#E3263F]"
            style={{ ...STRIPES, clipPath: 'polygon(100% 0, 100% 100%, 9px 100%, 3px 93%, 14px 85%, 1px 77%, 12px 69%, 4px 61%, 13px 53%, 0px 45%, 11px 37%, 3px 29%, 14px 21%, 2px 13%, 12px 6%, 0px 0%)' }}
            initial={{ x: 0, rotate: 0 }}
            animate={opening ? { x: '105%', rotate: 6 } : { x: 0, rotate: 0 }}
            transition={tear}
          >
            <div className="absolute inset-y-0 left-[6px] w-5 bg-[#FFC23A]" />
            <div className="absolute inset-x-0 top-1/2 -mt-2.5 h-5 bg-[#FFC23A]" />
          </motion.div>

          {/* bow + label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <motion.svg
              viewBox="0 0 160 110"
              className="w-[150px]"
              initial={reduce ? false : { scale: 0, rotate: -30 }}
              animate={
                stage === 'wrapped'
                  ? { scale: 1, rotate: 0, y: 0, opacity: 1 }
                  : { scale: [1, 1.25, 0.6], rotate: [0, -12, 200], y: [0, -10, -260], opacity: [1, 1, 0] }
              }
              transition={stage === 'wrapped' ? { type: 'spring', stiffness: 220, damping: 12 } : { duration: 0.9, ease: 'easeIn' }}
            >
              <path d="M80 55C52 8 8 14 22 50c8 20 40 14 58 5z" fill="#FFC23A" stroke="#E89B12" strokeWidth="3" />
              <path d="M80 55c28-47 72-41 58-5-8 20-40 14-58 5z" fill="#FFC23A" stroke="#E89B12" strokeWidth="3" />
              <path d="M74 60l-24 46 14-4 8 10 10-48zM86 60l24 46-14-4-8 10-10-48z" fill="#FFC23A" stroke="#E89B12" strokeWidth="3" strokeLinejoin="round" />
              <circle cx="80" cy="56" r="13" fill="#E89B12" />
              <circle cx="76" cy="52" r="4" fill="#FFE8A3" />
            </motion.svg>

            <motion.p
              className="mt-4 font-fredoka font-extrabold text-white text-2xl [text-shadow:0_3px_0_rgba(140,10,30,.35)]"
              initial={{ opacity: 0, y: 10 }}
              animate={stage === 'wrapped' ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.35, delay: stage === 'wrapped' ? 0.2 : 0 }}
            >
              Let's design your pin
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
