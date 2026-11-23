import { useMemo, useState, type ReactNode } from 'react'
import { Plus, Pencil, Eye, EyeOff, Trash2, ArrowUp, ArrowDown, Store, CircleAlert } from 'lucide-react'
import { ShopItemForm } from '@/components/admin/ShopItemForm'
import { ShopCategoryManager } from '@/components/admin/ShopCategoryManager'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useShopItems, useUpdateShopItem, useDeleteShopItem, useMoveShopItem, useShopCategories, ShopNotSetUpError } from '@/hooks/useShop'
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
  const { data: categories = [] } = useShopCategories()
  /** 'all', 'none' (uncategorised) or a category id */
  const [filter, setFilter] = useState<string>('all')

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories])
  const categoryCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const it of items) if (it.category_id) m.set(it.category_id, (m.get(it.category_id) ?? 0) + 1)
    return m
  }, [items])
  // A category deleted elsewhere leaves its designs uncategorised.
  const isUncategorised = (it: ShopItem) => !it.category_id || !catName.has(it.category_id)
  const uncategorisedCount = items.filter(isUncategorised).length
  const activeFilter = filter === 'all' || filter === 'none' || catName.has(filter) ? filter : 'all'
  const shown = activeFilter === 'all' ? items
    : activeFilter === 'none' ? items.filter(isUncategorised)
    : items.filter((it) => it.category_id === activeFilter)

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
      <AdminPageHeader
        title="Pin Shop"
        description="Ready-made designs customers order as-is. Hidden designs don't appear in the shop."
        actions={!notSetUp && (
          <button
            onClick={() => setFormTarget('new')}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E3263F] hover:bg-[#C41C33] text-white font-fredoka font-bold px-5 py-3 shadow-[0_4px_0_#B5142B] active:translate-y-[2px] active:shadow-[0_2px_0_#B5142B] transition"
          >
            <Plus size={18} /> Add design
          </button>
        )}
      />

      {!notSetUp && !isLoading && !error && <ShopCategoryManager counts={categoryCounts} />}

      {!notSetUp && items.length > 0 && categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1" role="group" aria-label="Show designs in">
          <FilterChip active={activeFilter === 'all'} onClick={() => setFilter('all')}>All ({items.length})</FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.id} active={activeFilter === c.id} onClick={() => setFilter(c.id)}>
              {c.name} ({categoryCounts.get(c.id) ?? 0})
            </FilterChip>
          ))}
          {uncategorisedCount > 0 && (
            <FilterChip active={activeFilter === 'none'} onClick={() => setFilter('none')}>Uncategorised ({uncategorisedCount})</FilterChip>
          )}
        </div>
      )}

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
      ) : shown.length === 0 ? (
        <Notice icon={<Store size={26} />} title="No designs in this category">
          Edit a design and choose this category to add it here.
        </Notice>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((item, i) => {
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
                  {categories.length > 0 && (
                    <p className="mt-1 text-xs font-nunito font-semibold text-[#3E6B57]">
                      {item.category_id && catName.get(item.category_id) ? catName.get(item.category_id) : 'Uncategorised'}
                    </p>
                  )}
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
                    <IconButton label="Move up" disabled={i === 0 || move.isPending} onClick={() => move.mutate({ a: item, b: shown[i - 1] })}><ArrowUp size={16} /></IconButton>
                    <IconButton label="Move down" disabled={i === shown.length - 1 || move.isPending} onClick={() => move.mutate({ a: item, b: shown[i + 1] })}><ArrowDown size={16} /></IconButton>
                    <span className="flex-1" />
                    <IconButton label="Delete" tone="danger" onClick={() => setConfirmDelete(item.id)}><Trash2 size={16} /></IconButton>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <ShopItemForm target={formTarget} onClose={() => setFormTarget(null)} defaultCategoryId={activeFilter !== 'all' && activeFilter !== 'none' ? activeFilter : null} />
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-fredoka font-semibold border transition-colors ${
        active ? 'bg-[#0F3B2C] border-[#0F3B2C] text-white' : 'bg-white border-[#DDEFE3] text-[#3E6B57] hover:border-[#9FD6B4]'
      }`}
    >
      {children}
    </button>
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
