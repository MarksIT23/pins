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
import { ShoppingBag, User, Phone, Hash, MessageSquare, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

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
    if (!config.base) {
      toast.error('Please select a base character first! 🧸')
      return
    }

    try {
      // Export canvas as PNG with watermark
      let previewBlob: Blob
      if (stageRef.current) {
        previewBlob = await exportCanvasToPng(stageRef.current)
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
        navigate(`/order-success?order=${order.order_number}`)
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
    <Modal isOpen={isOpen} onClose={handleClose} title="✨ Place Your Order" size="lg">
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
                    className="w-28 h-28 rounded-2xl border-4 border-[#FFD6E8] shadow-[0_4px_20px_rgba(255,133,161,0.25)] object-contain bg-white"
                  />
                  <span className="absolute -top-2 -right-2 text-lg">🎀</span>
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
                label="Facebook Name"
                placeholder="e.g. Maria S."
                leftIcon={<span className="text-xs font-bold">fb</span>}
                {...register('facebook_name')}
              />

              <Input
                label="Facebook Profile Link"
                placeholder="https://facebook.com/..."
                leftIcon={<ExternalLink size={16} />}
                {...register('facebook_link')}
              />

              <Input
                label="Contact Number *"
                placeholder="e.g. 09XX XXX XXXX"
                leftIcon={<Phone size={16} />}
                error={errors.contact_number?.message}
                {...register('contact_number', {
                  required: 'Contact number is required',
                  pattern: { value: /^[\d\s\-+()]{7,15}$/, message: 'Invalid contact number' },
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
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h3 className="font-fredoka text-2xl font-bold text-[#3D2B4F] mb-2">Order Placed!</h3>
            <p className="text-[#7A5C8A] font-nunito text-sm">Redirecting you to your order details…</p>
            <div className="flex gap-1 mt-4">
              {['✨', '🎀', '⭐', '🌸', '✨'].map((s, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="text-xl"
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
