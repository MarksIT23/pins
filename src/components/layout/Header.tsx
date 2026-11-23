import type React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PackageSearch } from 'lucide-react'
import { GetPinsMenu } from './GetPinsMenu'

/** Small ornament mark used as the logo. */
export function OrnamentMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true">
      <rect x="14" y="2" width="8" height="6" rx="1.5" fill="#FFC23A" />
      <circle cx="18" cy="21" r="13" fill="#E3263F" />
      <path d="M6.5 18.5c3.6 2.2 7.4 3.2 11.5 3.2s7.9-1 11.5-3.2" stroke="#FBFDF9" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".85" />
      <path d="M8 25c3.2 1.6 6.5 2.4 10 2.4s6.8-.8 10-2.4" stroke="#FFC23A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse cx="12.5" cy="15" rx="3" ry="2" fill="#fff" opacity=".35" />
    </svg>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 border-b border-[#DDEFE3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="PINS home">
          <motion.span
            className="block origin-top"
            whileHover={{ rotate: [0, -10, 8, -4, 0] }}
            transition={{ duration: 0.7 }}
          >
            <OrnamentMark />
          </motion.span>
          <span className="flex flex-col">
            <span className="font-fredoka text-xl font-extrabold text-[#0F3B2C] leading-none">PINS</span>
            <span className="hidden sm:block text-[11px] font-nunito text-[#3E6B57] leading-tight">Christmas edition by WSSC</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/" label="Home" className="hidden sm:block" />
          <NavLink
            to="/track"
            tone="gold"
            label={<><PackageSearch size={16} strokeWidth={2.4} aria-hidden="true" /><span className="sm:hidden">Track</span><span className="hidden sm:inline">Track order</span></>}
          />
          <GetPinsMenu variant="header" />
        </nav>
      </div>

      <div className="string-lights" aria-hidden="true">
        {Array.from({ length: 28 }).map((_, i) => <span key={i} />)}
      </div>
    </header>
  )
}

function NavLink({ to, label, tone, className = '' }: { to: string; label: React.ReactNode; tone?: 'red' | 'green' | 'gold'; className?: string }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link to={to} className={className}>
      <motion.span
        whileTap={{ scale: 0.96 }}
        className={`
          inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full whitespace-nowrap text-sm font-fredoka font-semibold transition-colors
          ${tone === 'red'
            ? 'bg-[#E3263F] hover:bg-[#C41C33] text-white'
            : tone === 'green'
              ? 'bg-[#14904F] hover:bg-[#0F7A42] text-white'
            : tone === 'gold'
              ? `ring-2 ring-inset ring-[#FFC23A] text-[#0F3B2C] ${isActive ? 'bg-[#FFC23A]' : 'bg-[#FFF1CC] hover:bg-[#FFE8A3]'}`
            : isActive
              ? 'bg-[#DDEFE3] text-[#0F3B2C]'
              : 'text-[#3E6B57] hover:bg-[#EEF8F1]'
          }
        `}
      >
        {label}
      </motion.span>
    </Link>
  )
}
