import React from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'admin' | 'soft'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantClasses: Record<string, string> = {
  primary:   'bg-[#E3263F] hover:bg-[#C41C33] text-white shadow-[0_4px_20px_rgba(227,38,63,0.4)] hover:shadow-[0_6px_28px_rgba(227,38,63,0.55)]',
  secondary: 'bg-[#CDEBD8] hover:bg-[#B5E2C6] text-[#3E6B57] shadow-[0_2px_12px_rgba(20,144,79,0.2)]',
  ghost:     'border-2 border-[#E3263F] text-[#E3263F] hover:bg-[#FFD9DE] bg-transparent',
  danger:    'bg-red-400 hover:bg-red-500 text-white shadow-[0_4px_20px_rgba(248,113,113,0.35)]',
  admin:     'bg-[#14904F] hover:bg-[#0F7A42] text-white shadow-[0_4px_20px_rgba(20,144,79,0.4)]',
  soft:      'bg-[#FBFDF9] hover:bg-[#FFD9DE] text-[#0F3B2C] border border-[#FFD9DE]',
}

const sizeClasses: Record<string, string> = {
  sm: 'text-sm px-4 py-2 rounded-2xl gap-1.5',
  md: 'text-base px-6 py-3 rounded-3xl gap-2',
  lg: 'text-lg px-8 py-4 rounded-full gap-2.5',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, className = '', disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        className={`
          inline-flex items-center justify-center font-fredoka font-semibold
          transition-all duration-200 cursor-pointer select-none
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...(props as any)}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading…
          </span>
        ) : (
          <>
            {leftIcon && <span>{leftIcon}</span>}
            {children}
            {rightIcon && <span>{rightIcon}</span>}
          </>
        )}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'
