import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ImageLightboxProps {
  src: string | null
  alt: string
  /** Soft colour behind the image (the pin's card colour). */
  tint?: string
  caption?: string
  onClose: () => void
}

/** Full-screen view of one image. Tap anywhere, press Escape or use the X to close. */
export function ImageLightbox({ src, alt, tint = '#FFFFFF', caption, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!src) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [src, onClose])

  return createPortal(
    <AnimatePresence>
      {src && (
        <motion.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Stop the click reaching the order popup underneath (portals bubble through React).
          onClick={(e) => { e.stopPropagation(); onClose() }}
          className="fixed inset-0 flex flex-col items-center justify-center p-5 bg-[#0F3B2C]/85 backdrop-blur-sm cursor-zoom-out"
          style={{ zIndex: 70 }}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose() }}
            aria-label="Close"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/95 text-[#0F3B2C] flex items-center justify-center shadow-lg hover:bg-white"
          >
            <X size={22} />
          </button>

          <motion.div
            initial={{ scale: 0.85, rotate: -4 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            className="w-[min(88vw,72vh,560px)] aspect-square rounded-[2rem] border-[6px] border-white shadow-[0_20px_60px_rgba(0,0,0,.35)] overflow-hidden flex items-center justify-center"
            style={{ background: tint }}
          >
            <img src={src} alt={alt} className="w-full h-full object-contain p-[4%]" />
          </motion.div>

          {caption && (
            <p className="mt-5 font-fredoka font-bold text-xl text-white text-center">{caption}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
