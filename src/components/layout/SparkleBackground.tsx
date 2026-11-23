import { useEffect, useRef } from 'react'

interface SnowProps {
  /** Flakes per 10,000 px² of viewport. */
  density?: number
  /** Flake colour. Defaults to a cool frost tone that reads on the snow background. */
  color?: string
}

interface Flake {
  x: number
  y: number
  r: number
  vy: number
  drift: number
  phase: number
  alpha: number
}

/**
 * Gentle snowfall drawn on a fixed canvas behind the page.
 * Kept as `SparkleBackground` so existing imports keep working.
 * Respects prefers-reduced-motion by rendering a single still frame.
 */
export function SparkleBackground({ density = 0.6, color = '150, 190, 170' }: SnowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let flakes: Flake[] = []
    let raf = 0
    let w = 0
    let h = 0

    const make = (y?: number): Flake => ({
      x: Math.random() * w,
      y: y ?? Math.random() * h,
      r: 0.8 + Math.random() * 2.6,
      vy: 0.25 + Math.random() * 0.7,
      drift: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.35 + Math.random() * 0.5,
    })

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(((w * h) / 10000) * density)
      flakes = Array.from({ length: Math.min(count, 220) }, () => make())
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const f of flakes) {
        if (!reduce) {
          f.y += f.vy * (f.r / 2)
          f.x += Math.sin(t / 1600 + f.phase) * f.drift * 0.4
          if (f.y > h + 4) Object.assign(f, make(-4))
          if (f.x > w + 4) f.x = -4
          if (f.x < -4) f.x = w + 4
        }
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, ${f.alpha})`
        ctx.fill()
      }
      if (!reduce) raf = requestAnimationFrame(draw)
    }

    resize()
    draw(0)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [density, color])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  )
}
