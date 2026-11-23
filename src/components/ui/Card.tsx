import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
}

export function Card({ children, className = '', hover = false, onClick, padding = 'md' }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -3, boxShadow: '0 12px 40px rgba(20, 144, 79, 0.2)' } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`
        bg-white rounded-3xl border border-[#DDEFE3]
        shadow-[0_2px_16px_rgba(20,144,79,0.12)]
        ${hover ? 'cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
}

export function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Card padding="md" hover className="flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[#0F3B2C] ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-nunito text-[#3E6B57]">{label}</p>
        <p className="text-3xl font-baloo font-bold text-[#0F3B2C]">{value}</p>
      </div>
    </Card>
  )
}
