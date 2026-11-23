import { useEffect, useState } from 'react'

/**
 * Pin parts are drawn on the full pin canvas, so a small part (eyes, lips…) is a
 * speck in a square thumbnail. TrimmedImage finds the visible (non-transparent)
 * area of the PNG once, then zooms the thumbnail to it with a little padding.
 */

interface Crop {
  /** Image natural size */
  w: number
  h: number
  /** Square crop in natural pixels */
  x: number
  y: number
  side: number
}

const cache = new Map<string, Promise<Crop | null>>()
const ANALYSE_SIZE = 160   // analyse a downscaled copy; plenty for a bounding box
const PADDING = 0.18       // breathing room around the part
const MAX_ZOOM = 6         // don't blow tiny parts up into mush

function analyse(src: string, padding = PADDING): Promise<Crop | null> {
  const key = `${padding}|${src}`
  const hit = cache.get(key)
  if (hit) return hit
  const job = new Promise<Crop | null>((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const w = img.naturalWidth
        const h = img.naturalHeight
        const k = Math.min(1, ANALYSE_SIZE / Math.max(w, h))
        const cw = Math.max(1, Math.round(w * k))
        const ch = Math.max(1, Math.round(h * k))
        const canvas = document.createElement('canvas')
        canvas.width = cw
        canvas.height = ch
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return resolve(null)
        ctx.drawImage(img, 0, 0, cw, ch)
        const { data } = ctx.getImageData(0, 0, cw, ch)

        let minX = cw, minY = ch, maxX = -1, maxY = -1
        for (let y = 0; y < ch; y++) {
          for (let x = 0; x < cw; x++) {
            if (data[(y * cw + x) * 4 + 3] > 12) {
              if (x < minX) minX = x
              if (x > maxX) maxX = x
              if (y < minY) minY = y
              if (y > maxY) maxY = y
            }
          }
        }
        if (maxX < 0) return resolve(null) // fully transparent

        // back to natural pixels
        const bx = minX / k, by = minY / k
        const bw = (maxX - minX + 1) / k, bh = (maxY - minY + 1) / k
        const minSide = Math.max(w, h) / MAX_ZOOM
        const side = Math.max(Math.max(bw, bh) * (1 + padding * 2), minSide)
        const cx = bx + bw / 2
        const cy = by + bh / 2
        resolve({ w, h, x: cx - side / 2, y: cy - side / 2, side })
      } catch {
        resolve(null) // e.g. image served without CORS headers: fall back to the plain view
      }
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
  cache.set(key, job)
  return job
}

export function TrimmedImage({
  src,
  alt,
  className = '',
  onError,
  padding = PADDING,
  imgClassName = '',
}: {
  src: string
  alt: string
  /** Space around the visible area, as a fraction of its size (default 0.18) */
  padding?: number
  /** Extra classes for the <img> (e.g. a drop shadow) */
  imgClassName?: string
  /** Applied to the square wrapper */
  className?: string
  onError?: () => void
}) {
  const [crop, setCrop] = useState<Crop | null | undefined>(undefined)

  useEffect(() => {
    let alive = true
    setCrop(undefined)
    analyse(src, padding).then((c) => { if (alive) setCrop(c) })
    return () => { alive = false }
  }, [src, padding])

  // Until analysed (or if analysis isn't possible) show the whole image.
  if (!crop) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <img src={src} alt={alt} crossOrigin="anonymous" onError={onError} loading="lazy"
          className={`absolute inset-0 w-full h-full object-contain p-1 transition-opacity ${crop === undefined ? 'opacity-60' : ''} ${imgClassName}`} />
      </div>
    )
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        onError={onError}
        loading="lazy"
        className={`absolute max-w-none ${imgClassName}`}
        style={{
          width: `${(crop.w / crop.side) * 100}%`,
          height: `${(crop.h / crop.side) * 100}%`,
          left: `${(-crop.x / crop.side) * 100}%`,
          top: `${(-crop.y / crop.side) * 100}%`,
        }}
      />
    </div>
  )
}
