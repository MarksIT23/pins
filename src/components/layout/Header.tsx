import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-[#FFD6E8]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 20, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#FF85A1] to-[#B07FFF] flex items-center justify-center shadow-[0_4px_12px_rgba(255,133,161,0.4)]"
          >
            <Sparkles size={18} className="text-white" />
          </motion.div>
          <div>
            <span className="font-fredoka text-xl font-bold text-[#3D2B4F] leading-none">PINS</span>
            <p className="text-[10px] font-nunito text-[#B8A0C8] leading-none">by WSSC</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/" label="Home" />
          <NavLink to="/create" label="✨ Create" highlight />
        </nav>
      </div>
    </header>
  )
}

function NavLink({ to, label, highlight }: { to: string; label: string; highlight?: boolean }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link to={to}>
      <motion.span
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className={`
          inline-flex items-center px-4 py-2 rounded-full text-sm font-fredoka font-semibold transition-all
          ${highlight
            ? 'bg-gradient-to-r from-[#FF85A1] to-[#B07FFF] text-white shadow-[0_4px_16px_rgba(255,133,161,0.35)]'
            : isActive
              ? 'bg-[#FFD6E8] text-[#3D2B4F]'
              : 'text-[#7A5C8A] hover:bg-[#F8F0FF]'
          }
        `}
      >
        {label}
      </motion.span>
    </Link>
  )
}
