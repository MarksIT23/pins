import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ImagePlus, Check } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useCreateShopItem, useUpdateShopItem, validateShopImage, type ShopItemInput } from '@/hooks/useShop'
import type { ShopItem } from '@/types'

const TINTS = ['#FFF1CC', '#DDF1FC', '#FFD9DE', '#D3F2DD', '#EDE4FF', '#FFFFFF']

interface ShopItemFormProps {
  /** null = closed, 'new' = add a design, ShopItem = edit that design */
  target: ShopItem | 'new' | null
  onClose: () => void
}

/** Add or edit a Pin Shop design (image, name, description, price, card colour). */
export function ShopItemForm({ target, onClose }: ShopItemFormProps) {
  const editing = target && target !== 'new' ? target : null
  const create = useCreateShopItem()
  const update = useUpdateShopItem()
  const busy = create.isPending || update.isPending

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [values, setValues] = useState<ShopItemInput>({ name: '', description: '', price: null, tint: TINTS[0] })
  const [priceText, setPriceText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  // Reset whenever the form opens for a different design.
  useEffect(() => {
    if (!target) return
    setFile(null)
    setError(null)
    if (editing) {
      setValues({ name: editing.name, description: editing.description ?? '', price: editing.price, tint: editing.tint })
      setPriceText(editing.price != null ? String(editing.price) : '')
      setPreview(editing.image_url)
    } else {
      setValues({ name: '', description: '', price: null, tint: TINTS[0] })
      setPriceText('')
      setPreview(null)
    }
  }, [target]) // eslint-disable-line react-hooks/exhaustive-deps

  // Free the object URL made for a picked file.
  useEffect(() => () => { if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview) }, [preview])

  function pick(f: File | undefined) {
    if (!f) return
    const invalid = validateShopImage(f)
    if (invalid) { setError(invalid); return }
    setError(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!values.name.trim()) { setError('Give the design a name.'); return }
    if (!editing && !file) { setError('Add an image of the pin.'); return }
    const price = priceText.trim() === '' ? null : Number(priceText)
    if (price !== null && (Number.isNaN(price) || price < 0)) { setError('Price must be a number, or leave it empty.'); return }
    const payload = { ...values, price }
    try {
      if (editing) await update.mutateAsync({ item: editing, values: payload, file })
      else await create.mutateAsync({ file: file!, values: payload })
      onClose()
    } catch {
      // toast already shown by the hook
    }
  }

  return (
    <Modal isOpen={!!target} onClose={busy ? () => {} : onClose} title={editing ? 'Edit design' : 'Add a design'} size="md">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {/* image */}
        <div>
          <p className="block text-sm font-semibold text-[#0F3B2C] font-nunito mb-1.5">Pin image {editing ? '' : '*'}</p>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]) }}
            className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-[#BFDCCB] flex flex-col items-center justify-center gap-2 overflow-hidden hover:border-[#14904F] transition-colors"
            style={{ background: values.tint }}
          >
            {preview ? (
              <img src={preview} alt="Pin preview" className="h-full w-full object-contain" />
            ) : (
              <>
                <ImagePlus size={28} className="text-[#14904F]" />
                <span className="text-sm font-nunito text-[#3E6B57]">Tap to choose, or drop an image here</span>
                <span className="text-xs font-nunito text-[#8A9F96]">PNG, JPG or WebP, up to 5 MB</span>
              </>
            )}
          </button>
          <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
          {editing && <p className="mt-1 text-xs text-[#8A9F96] font-nunito">Choose a new image only if you want to replace it. Past orders keep the old one.</p>}
        </div>

        <label className="block">
          <span className="block text-sm font-semibold text-[#0F3B2C] font-nunito mb-1.5">Name *</span>
          <input
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            placeholder="e.g. Santa Hat Chibi"
            maxLength={60}
            className="w-full rounded-2xl border-2 border-[#DDEFE3] px-4 py-2.5 font-nunito text-[#0F3B2C] outline-none focus:border-[#14904F]"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-semibold text-[#0F3B2C] font-nunito mb-1.5">Description</span>
          <textarea
            value={values.description}
            onChange={(e) => setValues({ ...values, description: e.target.value })}
            placeholder="One short line about the design"
            maxLength={160}
            rows={2}
            className="w-full rounded-2xl border-2 border-[#DDEFE3] px-4 py-2.5 font-nunito text-[#0F3B2C] outline-none focus:border-[#14904F] resize-none"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold text-[#0F3B2C] font-nunito mb-1.5">Price (₱)</span>
            <input
              value={priceText}
              onChange={(e) => setPriceText(e.target.value)}
              inputMode="decimal"
              placeholder="Optional"
              className="w-full rounded-2xl border-2 border-[#DDEFE3] px-4 py-2.5 font-nunito text-[#0F3B2C] outline-none focus:border-[#14904F]"
            />
          </label>
          <div>
            <span className="block text-sm font-semibold text-[#0F3B2C] font-nunito mb-1.5">Card colour</span>
            <div className="flex flex-wrap gap-2">
              {TINTS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValues({ ...values, tint: t })}
                  aria-label={`Card colour ${t}`}
                  aria-pressed={values.tint === t}
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                  style={{ background: t, borderColor: values.tint === t ? '#14904F' : '#DDEFE3' }}
                >
                  {values.tint === t && <Check size={14} className="text-[#14904F]" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-[#C41C33] font-nunito" role="alert">{error}</p>}

        <div className="flex gap-3 mt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1" isLoading={busy}>
            {editing ? 'Save changes' : 'Add to shop'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
