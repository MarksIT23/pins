import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ShoppingBag, Paintbrush } from 'lucide-react'

const OPTIONS = [
  { to: '/shop', icon: ShoppingBag, title: 'Pin Shop', desc: 'Order a ready-made design', iconBg: '#14904F' },
  { to: '/create', icon: Paintbrush, title: 'Create Your Own', desc: 'Design a chibi pin of you', iconBg: '#E3263F' },
]

type Variant = 'header' | 'hero' | 'sticky'

const TRIGGER: Record<Variant, string> = {
  header:
    'px-3.5 sm:px-4 py-2 text-sm font-semibold bg-[#E3263F] hover:bg-[#C41C33] text-white',
  hero:
    'w-full sm:w-auto px-8 py-4 text-lg font-extrabold bg-white text-[#E3263F] shadow-[0_6px_0_#B5142B] active:translate-y-[3px] active:shadow-[0_3px_0_#B5142B]',
  sticky:
    'w-full py-3.5 text-base font-bold bg-[#E3263F] text-white',
}

/**
 * One "Get Pins" button that opens a small menu with the two ways to get a pin.
 * Opens downward in the header and hero, upward from the sticky phone bar.
 */
export function GetPinsMenu({ variant = 'header', className = '' }: { variant?: Variant; className?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const up = variant === 'sticky'

  // Close on outside tap or Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div ref={ref} className={`relative ${variant === 'header' ? '' : 'w-full sm:w-auto'} ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full font-fredoka whitespace-nowrap transition-[transform,background-color] ${TRIGGER[variant]}`}
      >
        Get Pins
        <motion.span animate={{ rotate: open !== up ? 180 : 0 }} transition={{ duration: 0.2 }} className="inline-flex">
          <ChevronDown size={variant === 'hero' ? 20 : 16} strokeWidth={2.6} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            initial={{ opacity: 0, y: up ? 8 : -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: up ? 8 : -8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={`absolute z-50 w-[min(18rem,calc(100vw-2rem))] rounded-2xl bg-white p-2 shadow-[0_16px_40px_rgba(15,59,44,.22)] border border-[#DDEFE3]
              ${up ? 'bottom-full mb-3 left-0 right-0 w-auto' : 'top-full mt-2'}
              ${variant === 'header' ? 'right-0 origin-top-right' : variant === 'hero' ? 'left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 origin-top' : 'origin-bottom'}`}
          >
            {OPTIONS.map(({ to, icon: Icon, title, desc, iconBg }, i) => (
              <motion.div key={to} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 + i * 0.05 }}>
                <Link
                  to={to}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[#EEF8F1] focus-visible:bg-[#EEF8F1] transition-colors"
                >
                  <span className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white" style={{ background: iconBg }}>
                    <Icon size={18} />
                  </span>
                  <span className="text-left">
                    <span className="block font-fredoka font-bold text-[#0F3B2C] leading-tight">{title}</span>
                    <span className="block text-sm font-nunito text-[#3E6B57]">{desc}</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
