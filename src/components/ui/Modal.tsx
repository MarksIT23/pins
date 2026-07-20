import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />

          {/* Modal panel */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`
                bg-[#FFF8F0] rounded-4xl shadow-[0_24px_80px_rgba(61,43,79,0.2)]
                border border-[#FFD6E8] w-full ${sizeClasses[size]}
                max-h-[90dvh] overflow-y-auto
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#FFD6E8]">
                  <h2 className="font-fredoka text-xl font-semibold text-[#3D2B4F]">{title}</h2>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-[#FFD6E8] hover:bg-[#FF85A1] text-[#3D2B4F] hover:text-white transition-all flex items-center justify-center"
                    aria-label="Close modal"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="p-6">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', isLoading
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-[#7A5C8A] font-nunito mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-2xl bg-[#F0E6FF] text-[#7A5C8A] font-fredoka hover:bg-[#E8D9FF] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="px-5 py-2 rounded-2xl bg-red-400 hover:bg-red-500 text-white font-fredoka transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Deleting…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
