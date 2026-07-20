import React from 'react'
import { OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'pink' | 'purple' | 'blue' | 'mint' | 'peach' | 'neutral'
  className?: string
}

const badgeVariants: Record<string, string> = {
  pink:    'bg-[#FFD6E8] text-[#d63f6e] border-[#FFB3CC]',
  purple:  'bg-[#E8D9FF] text-[#7A5C8A] border-[#C8B0FF]',
  blue:    'bg-[#D8EEFF] text-[#2d7ab8] border-[#A8D0FF]',
  mint:    'bg-[#D8F3DC] text-[#2d8a4e] border-[#A8E0B5]',
  peach:   'bg-[#FFE8D2] text-[#a0541c] border-[#FFCCA0]',
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
          <label htmlFor={inputId} className="font-nunito font-semibold text-sm text-[#3D2B4F]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B8A0C8]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full bg-white border-2 rounded-2xl px-4 py-3 font-nunito text-[#3D2B4F]
              placeholder:text-[#C8B0D8] outline-none transition-all
              ${leftIcon ? 'pl-10' : ''}
              ${error
                ? 'border-red-300 focus:border-red-400'
                : 'border-[#F0E6FF] focus:border-[#B07FFF]'
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
          <label htmlFor={textareaId} className="font-nunito font-semibold text-sm text-[#3D2B4F]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={3}
          className={`
            w-full bg-white border-2 rounded-2xl px-4 py-3 font-nunito text-[#3D2B4F]
            placeholder:text-[#C8B0D8] outline-none transition-all resize-none
            ${error
              ? 'border-red-300 focus:border-red-400'
              : 'border-[#F0E6FF] focus:border-[#B07FFF]'
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
