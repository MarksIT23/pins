import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Badge'
import { useSubmitOrder } from '@/hooks/useOrders'
import { useCharacterStore } from '@/store/characterStore'
import { exportCanvasToPng } from '@/lib/konva-export'
import { OrderFormData } from '@/types'
import { ShoppingBag, User, Hash, MessageSquare, ExternalLink, Check } from 'lucide-react'
import { Confetti } from '@/components/ui/Confetti'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ALLOW_ORDER_WITHOUT_BASE } from '@/lib/devFlags'

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  stageRef: React.RefObject<any>
  previewDataUrl?: string
}

export function OrderModal({ isOpen, onClose, stageRef, previewDataUrl }: OrderModalProps) {
  const { config, resetCharacter } = useCharacterStore()
  const { mutateAsync: submitOrder, isPending } = useSubmitOrder()
  const navigate = useNavigate()
  const [step, setStep] = useState<'form' | 'success'>('form')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderFormData>({
    defaultValues: { quantity: 1 },
  })

  async function onSubmit(formData: OrderFormData) {
    // Check if character has at least a base selected
    if (!config.base && !ALLOW_ORDER_WITHOUT_BASE) {
      toast.error('Choose a base character before ordering.')
      return
    }

    try {
      // Export canvas as PNG with watermark
      let previewBlob: Blob
      let exported: Blob | null = null
      if (stageRef.current) {
        try { exported = await exportCanvasToPng(stageRef.current) } catch { exported = null }
      }
      if (exported) {
        previewBlob = exported
      } else {
        // Fallback: empty white PNG
        const canvas = document.createElement('canvas')
        canvas.width = 500; canvas.height = 500
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, 500, 500)
        previewBlob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'))
      }

      const order = await submitOrder({ formData, characterConfig: config, previewBlob })
      setStep('success')
      
      // Navigate to success page after animation
      setTimeout(() => {
        onClose()
        reset()
        setStep('form')
        navigate(`/order-success?order=${order.order_number}`, { state: { preview: config.base ? previewDataUrl : undefined } })
      }, 1800)

    } catch (err: any) {
      toast.error(err?.message ?? 'Something went wrong. Please try again.')
    }
  }

  function handleClose() {
    if (isPending) return
    onClose()
    reset()
    setStep('form')
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Place your order" size="lg">
      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Character preview thumb */}
            {previewDataUrl && (
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <img
                    src={previewDataUrl}
                    alt="Your character preview"
                    className="w-28 h-28 rounded-2xl border-4 border-[#FFD9DE] shadow-[0_4px_20px_rgba(227,38,63,0.25)] object-contain bg-white"
                  />
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Full Name *"
                placeholder="e.g. Maria Santos"
                leftIcon={<User size={16} />}
                error={errors.full_name?.message}
                {...register('full_name', { required: 'Full name is required' })}
              />

              <Input
                label="Student ID"
                placeholder="e.g. 23-1037-310"
                leftIcon={<span className="text-xs font-bold">ID</span>}
                {...register('student_id', {
                  pattern: { value: /^\d{2}-\d{4}-\d{3}$/, message: 'Format: YY-NNNN-NNN' },
                })}
              />

              <Input
                label="Quantity *"
                type="number"
                min={1}
                max={100}
                leftIcon={<Hash size={16} />}
                error={errors.quantity?.message}
                {...register('quantity', {
                  required: 'Quantity is required',
                  min: { value: 1, message: 'Minimum 1' },
                  max: { value: 100, message: 'Maximum 100' },
                  valueAsNumber: true,
                })}
              />

              <Textarea
                label="Notes / Special Instructions"
                placeholder="Any special requests or notes for your order…"
                {...register('notes')}
              />

              <div className="flex gap-3 mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  isLoading={isPending}
                  leftIcon={<ShoppingBag size={18} />}
                >
                  Place Order
                </Button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-6"
          >
            <div className="relative mb-5">
              <Confetti />
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.05 }}
                className="w-20 h-20 rounded-full bg-[#14904F] ring-4 ring-[#FFC23A] ring-offset-4 ring-offset-[#FBFDF9] flex items-center justify-center"
              >
                <Check size={38} strokeWidth={3} className="text-white" />
              </motion.div>
            </div>
            <h3 className="font-fredoka text-2xl font-bold text-[#0F3B2C] mb-2">Order placed</h3>
            <p className="text-[#3E6B57] font-nunito text-sm">Taking you to your order details…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
