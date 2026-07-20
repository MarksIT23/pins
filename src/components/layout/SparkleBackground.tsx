import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const SPARKLES = [
  { id: 1, x: '8%',  y: '12%', size: 18, delay: 0 },
  { id: 2, x: '18%', y: '45%', size: 12, delay: 0.4 },
  { id: 3, x: '5%',  y: '75%', size: 22, delay: 0.8 },
  { id: 4, x: '90%', y: '8%',  size: 16, delay: 0.2 },
  { id: 5, x: '85%', y: '35%', size: 20, delay: 0.6 },
  { id: 6, x: '92%', y: '68%', size: 14, delay: 1.0 },
  { id: 7, x: '78%', y: '90%', size: 10, delay: 0.3 },
  { id: 8, x: '35%', y: '5%',  size: 15, delay: 0.7 },
  { id: 9, x: '55%', y: '95%', size: 18, delay: 0.1 },
  { id: 10, x: '42%', y: '88%', size: 12, delay: 0.9 },
  { id: 11, x: '28%', y: '70%', size: 8,  delay: 0.5 },
  { id: 12, x: '70%', y: '20%', size: 20, delay: 1.2 },
  { id: 13, x: '62%', y: '55%', size: 11, delay: 0.35 },
  { id: 14, x: '15%', y: '25%', size: 16, delay: 0.75 },
  { id: 15, x: '48%', y: '15%', size: 9,  delay: 1.1 },
]

// SVG sparkle shapes
function SparkleShape({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L13.5 9L20 10.5L13.5 12L12 19L10.5 12L4 10.5L10.5 9L12 2Z"
        fill={color}
      />
    </svg>
  )
}

const COLORS = [
  '#FFD6E8', '#E8D9FF', '#D8EEFF', '#D8F3DC',
  '#FFAB76', '#FF85A1', '#B07FFF',
]

export function SparkleBackground() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {SPARKLES.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{ left: s.x, top: s.y }}
          animate={{
            opacity: [0.15, 0.85, 0.15],
            scale: [0.7, 1.2, 0.7],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3 + s.delay,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
        >
          <SparkleShape
            size={s.size}
            color={COLORS[s.id % COLORS.length]}
          />
        </motion.div>
      ))}

      {/* Soft gradient blobs */}
      <div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-25"
        style={{ background: 'radial-gradient(circle, #FFD6E8 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #E8D9FF 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse, #D8EEFF 0%, transparent 70%)' }}
      />
    </div>
  )
}
