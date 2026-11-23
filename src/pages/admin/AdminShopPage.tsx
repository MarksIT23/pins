import { useMemo, useState, type ReactNode } from 'react'
import { Plus, Pencil, Eye, EyeOff, Trash2, ArrowUp, ArrowDown, Store, CircleAlert } from 'lucide-react'
import { ShopItemForm } from '@/components/admin/ShopItemForm'
import { useShopItems, useUpdateShopItem, useDeleteShopItem, useMoveShopItem, ShopNotSetUpError } from '@/hooks/useShop'
import { useOrders } from '@/hooks/useOrders'
import type { ShopItem } from '@/types'

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })

/** Admin > Pin Shop: upload and manage ready-made designs. */
export function AdminShopPage() {
  const { data: items = [], isLoading, error } = useShopItems({ includeHidden: true })
  const { data: orders = [] } = useOrders('all')
  const update = useUpdateShopItem()
  const remove = useDeleteShopItem()
  const move = useMoveShopItem()
  const [formTarget, setFormTarget] = useState<ShopItem | 'new' | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Orders and pins ordered, per design
  const stats = useMemo(() => {
    const m = new Map<string, { orders: number; pins: number }>()
    for (const o of orders) {
      if (o.order_type !== 'shop' || !o.shop_item_id) continue
      const s = m.get(o.shop_item_id) ?? { orders: 0, pins: 0 }
      s.orders += 1
      s.pins += o.quantity
      m.set(o.shop_item_id, s)
    }
    return m
  }, [orders])

  const notSetUp = error instanceof ShopNotSetUpError

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h1 className="font-fredoka text-3xl font-bold text-[#0F3B2C]">Pin Shop</h1>
          <p className="text-[#8A9F96] font-nunito text-sm mt-1">
            Ready-made designs customers order as-is. Hidden designs don't appear in the shop.
          </p>
        </div>
        {!notSetUp && (
          <button
            onClick={() => setFormTarget('new')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E3263F] hover:bg-[#C41C33] text-white font-fredoka font-bold px-5 py-3 transition-colors"
          >
            <Plus size={18} /> Add design
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-72 rounded-2xl shimmer" />)}
        </div>
      ) : notSetUp ? (
        <Notice icon={<CircleAlert size={26} />} title="The Pin Shop table isn't in Supabase yet">
          Run <code className="font-mono text-xs bg-[#EEF8F1] px-1.5 py-0.5 rounded">supabase/migrations/20261123000000_pin_shop.sql</code> in the Supabase SQL Editor, then reload this page.
        </Notice>
      ) : error ? (
        <Notice icon={<CircleAlert size={26} />} title="Couldn't load the Pin Shop">{(error as Error).message}</Notice>
      ) : items.length === 0 ? (
        <Notice icon={<Store size={26} />} title="No designs yet">
          Add your first ready-made pin. It shows up in the shop straight away.
        </Notice>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => {
            const s = stats.get(item.id)
            return (
              <li key={item.id} className={`bg-white rounded-2xl border border-[#DDEFE3] overflow-hidden flex flex-col ${item.is_active ? '' : 'opacity-70'}`}>
                <div className="relative aspect-[4/3] flex items-center justify-center" style={{ background: item.tint }}>
                  <img src={item.image_url} alt={item.name} className="h-full w-full object-contain" loading="lazy" />
                  {!item.is_active && (
                    <span className="absolute top-3 left-3 rounded-full bg-[#0F3B2C] text-white text-xs font-nunito font-bold px-2.5 py-1">Hidden</span>
                  )}
                  <span className="absolute top-3 right-3 rounded-full bg-white/90 text-[#0F3B2C] text-xs font-nunito font-semibold px-2.5 py-1">
                    {s ? `${s.orders} order${s.orders === 1 ? '' : 's'} · ${s.pins} pin${s.pins === 1 ? '' : 's'}` : 'No orders yet'}
                  </span>
                </div>

                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-fredoka font-bold text-[#0F3B2C] leading-tight">{item.name}</p>
                    <p className="shrink-0 font-nunito font-semibold text-sm text-[#14904F]">{item.price != null ? peso.format(item.price) : 'No price'}</p>
                  </div>
                  {item.description && <p className="mt-1 text-sm text-[#3E6B57] font-nunito line-clamp-2">{item.description}</p>}
                </div>

                {confirmDelete === item.id ? (
                  <div className="border-t border-[#DDEFE3] p-3 flex items-center gap-2 bg-[#FFF5F6]">
                    <p className="flex-1 text-sm font-nunito text-[#9E1F33]">Delete this design? Past orders are kept.</p>
                    <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 rounded-xl text-sm font-fredoka font-semibold text-[#3E6B57] hover:bg-white">Keep</button>
                    <button
                      onClick={() => remove.mutate(item, { onSettled: () => setConfirmDelete(null) })}
                      disabled={remove.isPending}
                      className="px-3 py-1.5 rounded-xl text-sm font-fredoka font-bold bg-[#E3263F] text-white disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-[#DDEFE3] p-2 flex items-center gap-1">
                    <IconButton label="Edit" onClick={() => setFormTarget(item)}><Pencil size={16} /></IconButton>
                    <IconButton
                      label={item.is_active ? 'Hide from shop' : 'Show in shop'}
                      onClick={() => update.mutate({ item, isActive: !item.is_active })}
                    >
                      {item.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                    <IconButton label="Move up" disabled={i === 0 || move.isPending} onClick={() => move.mutate({ a: item, b: items[i - 1] })}><ArrowUp size={16} /></IconButton>
                    <IconButton label="Move down" disabled={i === items.length - 1 || move.isPending} onClick={() => move.mutate({ a: item, b: items[i + 1] })}><ArrowDown size={16} /></IconButton>
                    <span className="flex-1" />
                    <IconButton label="Delete" tone="danger" onClick={() => setConfirmDelete(item.id)}><Trash2 size={16} /></IconButton>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <ShopItemForm target={formTarget} onClose={() => setFormTarget(null)} />
    </div>
  )
}

function IconButton({ label, onClick, disabled, tone, children }: { label: string; onClick: () => void; disabled?: boolean; tone?: 'danger'; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        tone === 'danger' ? 'text-[#C41C33] hover:bg-[#FFF5F6]' : 'text-[#3E6B57] hover:bg-[#EEF8F1]'
      }`}
    >
      {children}
    </button>
  )
}

function Notice({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#DDEFE3] p-8 text-center">
      <span className="mx-auto mb-3 w-14 h-14 rounded-full bg-[#EEF8F1] text-[#14904F] flex items-center justify-center">{icon}</span>
      <p className="font-fredoka font-bold text-lg text-[#0F3B2C]">{title}</p>
      <p className="mt-1 text-sm text-[#3E6B57] font-nunito max-w-md mx-auto">{children}</p>
    </div>
  )
}
