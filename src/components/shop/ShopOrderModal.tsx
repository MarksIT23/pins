import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, User, Hash, Check, Minus, Plus, ZoomIn } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Badge'
import { Confetti } from '@/components/ui/Confetti'
import { useSubmitOrder } from '@/hooks/useOrders'
import type { OrderFormData } from '@/types'
import { TrimmedImage } from '@/components/ui/TrimmedImage'
import { ImageLightbox } from '@/components/ui/ImageLightbox'
import { formatPeso, type ShopPin } from '@/data/shopPins'

interface ShopOrderModalProps {
  pin: ShopPin | null
  onClose: () => void
}

/** Order form for a ready-made Pin Shop design. Same order pipeline as custom pins. */
export function ShopOrderModal({ pin, onClose }: ShopOrderModalProps) {
  const { mutateAsync: submitOrder, isPending } = useSubmitOrder()
  const navigate = useNavigate()
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [zoomed, setZoomed] = useState(false)
  const closeZoom = useCallback(() => setZoomed(false), [])

  const { register, handleSubmit, reset, setValue, getValues, watch, formState: { errors } } = useForm<OrderFormData>({
    defaultValues: { quantity: 1, full_name: '', student_id: '', notes: '' },
  })
  const quantity = watch('quantity') || 1

  // Fresh form each time a design is opened.
  useEffect(() => {
    setZoomed(false)
    if (pin) { reset({ quantity: 1, full_name: '', student_id: '', notes: '' }); setStep('form') }
  }, [pin, reset])

  async function onSubmit(data: OrderFormData) {
    if (!pin) return
    try {
      const order = await submitOrder({
        formData: {
          ...data,
          // Prefix so admins can see which ready-made design was ordered.
          notes: [`[Pin Shop] ${pin.name}`, data.notes?.trim()].filter(Boolean).join(' · '),
        },
        characterConfig: { shopItem: { id: pin.id, name: pin.name } },
        shopItemId: pin.id,
      })
      setStep('success')
      setTimeout(() => {
        onClose()
        navigate(`/order-success?order=${order.order_number}`, { state: { preview: pin.image } })
      }, 1800)
    } catch {
      // useSubmitOrder already shows an error toast.
    }
  }

  function stepQty(delta: number) {
    const next = Math.min(100, Math.max(1, (Number(getValues('quantity')) || 1) + delta))
    setValue('quantity', next, { shouldValidate: true })
  }

  return (
    <Modal isOpen={!!pin} onClose={isPending ? () => {} : onClose} title={step === 'form' ? 'Order this pin' : undefined} size="lg">
      <AnimatePresence mode="wait">
        {pin && step === 'form' ? (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* the design */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative shrink-0">
                <motion.button
                  type="button"
                  onClick={() => setZoomed(true)}
                  aria-label={`View a larger image of ${pin.name}`}
                  className="relative block w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-[0_4px_12px_rgba(15,59,44,.14)] ring-1 ring-[#DDEFE3] cursor-zoom-in focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFC23A]"
                  style={{ background: pin.tint }}
                  initial={{ rotate: -8, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                >
                  <TrimmedImage src={pin.image} alt="" padding={-0.02} />
                </motion.button>
                <span className="pointer-events-none absolute bottom-0 right-0 translate-x-[10%] translate-y-[10%] w-8 h-8 rounded-full bg-white text-[#0F3B2C] border-2 border-[#DDEFE3] flex items-center justify-center shadow-sm" aria-hidden="true">
                  <ZoomIn size={15} />
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-fredoka font-extrabold text-lg text-[#0F3B2C] leading-tight">{pin.name}</p>
                {pin.description && <p className="text-sm text-[#3E6B57] font-nunito">{pin.description}</p>}
                {pin.price != null && <p className="mt-0.5 text-sm font-nunito font-bold text-[#14904F]">{formatPeso(pin.price)} each</p>}
              </div>
            </div>

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
                error={errors.student_id?.message}
                {...register('student_id', { pattern: { value: /^\d{2}-\d{4}-\d{3}$/, message: 'Format: YY-NNNN-NNN' } })}
              />

              {/* quantity stepper: easier than a number field on a phone */}
              <div>
                <label className="block text-sm font-semibold text-[#0F3B2C] font-nunito mb-1.5">Quantity *</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => stepQty(-1)} aria-label="One fewer" className="w-11 h-11 rounded-full border-2 border-[#DDEFE3] text-[#0F3B2C] flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40" disabled={quantity <= 1}>
                    <Minus size={18} />
                  </button>
                  <div className="relative">
                    <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9F96]" />
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={100}
                      className="w-24 h-11 rounded-full border-2 border-[#DDEFE3] pl-8 pr-3 text-center font-fredoka font-bold text-lg text-[#0F3B2C] outline-none focus:border-[#14904F]"
                      {...register('quantity', {
                        required: 'Quantity is required',
                        min: { value: 1, message: 'Minimum 1' },
                        max: { value: 100, message: 'Maximum 100' },
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <button type="button" onClick={() => stepQty(1)} aria-label="One more" className="w-11 h-11 rounded-full bg-[#14904F] text-white flex items-center justify-center active:scale-95 transition-transform">
                    <Plus size={18} />
                  </button>
                </div>
                {errors.quantity && <p className="mt-1 text-xs text-[#C41C33] font-nunito">{errors.quantity.message}</p>}
                {pin.price != null && Number(quantity) >= 1 && (
                  <p className="mt-2 text-sm font-nunito text-[#3E6B57]">
                    Total <span className="font-bold text-[#0F3B2C]">{formatPeso(pin.price * Number(quantity))}</span>, paid at the SSC office
                  </p>
                )}
              </div>

              <Textarea label="Notes" placeholder="Anything we should know?" {...register('notes')} />

              <div className="flex gap-3 mt-1">
                <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1" isLoading={isPending} leftIcon={<ShoppingBag size={18} />}>
                  Place order
                </Button>
              </div>
            </form>
          </motion.div>
        ) : pin ? (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-6">
            <div className="relative mb-5">
              <Confetti />
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 15 }}
                className="w-20 h-20 rounded-full bg-[#14904F] ring-4 ring-[#FFC23A] ring-offset-4 ring-offset-[#FBFDF9] flex items-center justify-center"
              >
                <Check size={38} strokeWidth={3} className="text-white" />
              </motion.div>
            </div>
            <h3 className="font-fredoka text-2xl font-bold text-[#0F3B2C] mb-2">Order placed</h3>
            <p className="text-[#3E6B57] font-nunito text-sm">Taking you to your order details…</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <ImageLightbox
        src={zoomed && pin ? pin.image : null}
        alt={pin?.name ?? ''}
        tint={pin?.tint}
        caption={pin?.name}
        onClose={closeZoom}
      />
    </Modal>
  )
}
