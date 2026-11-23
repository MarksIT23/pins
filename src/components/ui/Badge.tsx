import React from 'react'
import { OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'pink' | 'purple' | 'blue' | 'mint' | 'peach' | 'neutral'
  className?: string
}

const badgeVariants: Record<string, string> = {
  pink:    'bg-[#FFD9DE] text-[#C41C33] border-[#FFB8C2]',
  purple:  'bg-[#CDEBD8] text-[#3E6B57] border-[#9FD6B4]',
  blue:    'bg-[#DDF1FC] text-[#2F6478] border-[#B9D2DC]',
  mint:    'bg-[#D3F2DD] text-[#2d8a4e] border-[#A8E0B5]',
  peach:   'bg-[#FFF1CC] text-[#9A6400] border-[#FFD872]',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
}

export function Badge({ children, variant = 'purple', className = '' }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-xs font-nunito font-semibold
      border ${badgeVariants[variant]} ${className}
    `}>
      {children}
    </span>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-xs font-nunito font-semibold border
      ${ORDER_STATUS_COLORS[status]} ${className}
    `}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="font-nunito font-semibold text-sm text-[#0F3B2C]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9F96]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full bg-white border-2 rounded-2xl px-4 py-3 font-nunito text-[#0F3B2C]
              placeholder:text-[#A9BAB2] outline-none transition-all
              ${leftIcon ? 'pl-10' : ''}
              ${error
                ? 'border-red-300 focus:border-red-400'
                : 'border-[#DDEFE3] focus:border-[#14904F]'
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 font-nunito">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="font-nunito font-semibold text-sm text-[#0F3B2C]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={3}
          className={`
            w-full bg-white border-2 rounded-2xl px-4 py-3 font-nunito text-[#0F3B2C]
            placeholder:text-[#A9BAB2] outline-none transition-all resize-none
            ${error
              ? 'border-red-300 focus:border-red-400'
              : 'border-[#DDEFE3] focus:border-[#14904F]'
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-500 font-nunito">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
