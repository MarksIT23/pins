import { motion, useReducedMotion } from 'framer-motion'

const COLORS = ['#E3263F', '#FFC23A', '#14904F', '#FFE8A3', '#FBFDF9']

/** One-shot burst of ribbon-coloured confetti, used to confirm an order. */
export function Confetti({ count = 28 }: { count?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2
        const dist = 90 + ((i * 37) % 70)
        const x = Math.cos(angle) * dist
        const y = Math.sin(angle) * dist * 0.7
        const w = 5 + (i % 3) * 2
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 block rounded-[2px]"
            style={{ width: w, height: w * 1.8, background: COLORS[i % COLORS.length] }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
            animate={{ x, y: [y, y + 140], opacity: [1, 1, 0], rotate: (i % 2 ? 1 : -1) * 320, scale: 1 }}
            transition={{ duration: 1.8, ease: [0.2, 0.7, 0.4, 1], delay: 0.15 }}
          />
        )
      })}
    </div>
  )
}
