import { useState, type FormEvent, type ReactNode } from 'react'
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Check, X, CircleAlert } from 'lucide-react'
import {
  useShopCategories, useCreateShopCategory, useRenameShopCategory, useMoveShopCategory, useDeleteShopCategory,
  ShopCategoriesNotSetUpError,
} from '@/hooks/useShop'
import type { ShopCategory } from '@/types'

interface Props {
  /** Number of designs in each category, by category id. */
  counts: Map<string, number>
}

/** Admin > Pin Shop: add, rename, reorder and delete shop categories. */
export function ShopCategoryManager({ counts }: Props) {
  const { data: categories = [], isLoading, error } = useShopCategories()
  const create = useCreateShopCategory()
  const rename = useRenameShopCategory()
  const move = useMoveShopCategory()
  const remove = useDeleteShopCategory()

  const [newName, setNewName] = useState('')
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const taken = (name: string, exceptId?: string) =>
    categories.some((c) => c.id !== exceptId && c.name.trim().toLowerCase() === name.trim().toLowerCase())

  function onAdd(e: FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name || taken(name)) return
    create.mutate(name, { onSuccess: () => setNewName('') })
  }

  function onRename(e: FormEvent, cat: ShopCategory) {
    e.preventDefault()
    if (!editing) return
    const name = editing.name.trim()
    if (!name || name === cat.name || taken(name, cat.id)) { setEditing(null); return }
    rename.mutate({ id: cat.id, name }, { onSuccess: () => setEditing(null) })
  }

  if (error instanceof ShopCategoriesNotSetUpError) {
    return (
      <section className="bg-white rounded-2xl border border-[#F5D38A] p-4 mb-6 flex gap-3">
        <CircleAlert size={20} className="text-[#9A6400] shrink-0 mt-0.5" />
        <p className="text-sm font-nunito text-[#3E6B57]">
          To sort designs into categories, run{' '}
          <code className="font-mono text-xs bg-[#FFF7E0] px-1.5 py-0.5 rounded">supabase/migrations/20261123030000_shop_categories.sql</code>{' '}
          in the Supabase SQL Editor, then reload this page.
        </p>
      </section>
    )
  }

  const duplicate = newName.trim() !== '' && taken(newName)

  return (
    <section className="bg-white rounded-2xl border border-[#DDEFE3] p-4 sm:p-5 mb-6" aria-labelledby="shop-cats-title">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6 mb-4">
        <div className="flex-1">
          <h2 id="shop-cats-title" className="font-fredoka font-bold text-lg text-[#0F3B2C]">Categories</h2>
          <p className="text-sm font-nunito text-[#3E6B57]">The shop shows designs grouped in this order. Empty categories stay hidden from customers.</p>
        </div>
        <form onSubmit={onAdd} className="flex gap-2 sm:w-80">
          <label className="sr-only" htmlFor="new-shop-cat">New category name</label>
          <input
            id="new-shop-cat"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Couple pins"
            maxLength={40}
            className="flex-1 min-w-0 rounded-xl border-2 border-[#DDEFE3] px-3 py-2 font-nunito text-sm text-[#0F3B2C] outline-none focus:border-[#14904F]"
          />
          <button
            type="submit"
            disabled={!newName.trim() || duplicate || create.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#14904F] hover:bg-[#0F7A42] text-white font-fredoka font-bold text-sm px-4 py-2 disabled:opacity-50 transition-colors"
          >
            <Plus size={16} /> Add
          </button>
        </form>
      </div>
      {duplicate && <p className="-mt-2 mb-3 text-xs font-nunito text-[#C41C33]">There's already a category with that name.</p>}

      {isLoading ? (
        <div className="h-12 rounded-xl shimmer" />
      ) : categories.length === 0 ? (
        <p className="text-sm font-nunito text-[#8A9F96] border-2 border-dashed border-[#DDEFE3] rounded-xl px-4 py-3">
          No categories yet. Until you add one, the shop shows every design in a single list.
        </p>
      ) : (
        <ol className="divide-y divide-[#EEF8F1] border border-[#DDEFE3] rounded-xl">
          {categories.map((cat, i) => {
            const n = counts.get(cat.id) ?? 0
            return (
              <li key={cat.id} className="flex items-center gap-2 px-3 py-2 min-h-[52px]">
                {editing?.id === cat.id ? (
                  <form onSubmit={(e) => onRename(e, cat)} className="flex-1 flex items-center gap-1.5">
                    <label className="sr-only" htmlFor={`rename-${cat.id}`}>Category name</label>
                    <input
                      id={`rename-${cat.id}`}
                      autoFocus
                      value={editing.name}
                      onChange={(e) => setEditing({ id: cat.id, name: e.target.value })}
                      onKeyDown={(e) => { if (e.key === 'Escape') setEditing(null) }}
                      maxLength={40}
                      className="flex-1 min-w-0 rounded-lg border-2 border-[#14904F] px-2.5 py-1.5 font-nunito text-sm text-[#0F3B2C] outline-none"
                    />
                    <Tool label="Save name" type="submit" disabled={rename.isPending}><Check size={16} /></Tool>
                    <Tool label="Cancel" onClick={() => setEditing(null)}><X size={16} /></Tool>
                  </form>
                ) : confirmDelete === cat.id ? (
                  <>
                    <p className="flex-1 text-sm font-nunito text-[#9E1F33]">
                      Delete "{cat.name}"?{n > 0 && ` Its ${n} design${n === 1 ? '' : 's'} stay in the shop, uncategorised.`}
                    </p>
                    <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 rounded-lg text-sm font-fredoka font-semibold text-[#3E6B57] hover:bg-[#EEF8F1]">Keep</button>
                    <button
                      onClick={() => remove.mutate(cat.id, { onSettled: () => setConfirmDelete(null) })}
                      disabled={remove.isPending}
                      className="px-3 py-1.5 rounded-lg text-sm font-fredoka font-bold bg-[#E3263F] text-white disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <p className="flex-1 min-w-0 font-fredoka font-semibold text-[#0F3B2C] truncate">{cat.name}</p>
                    <span className="shrink-0 text-xs font-nunito text-[#3E6B57] bg-[#EEF8F1] rounded-full px-2 py-0.5">
                      {n} design{n === 1 ? '' : 's'}
                    </span>
                    <Tool label="Rename" onClick={() => setEditing({ id: cat.id, name: cat.name })}><Pencil size={15} /></Tool>
                    <Tool label="Move up" disabled={i === 0 || move.isPending} onClick={() => move.mutate({ a: cat, b: categories[i - 1] })}><ArrowUp size={15} /></Tool>
                    <Tool label="Move down" disabled={i === categories.length - 1 || move.isPending} onClick={() => move.mutate({ a: cat, b: categories[i + 1] })}><ArrowDown size={15} /></Tool>
                    <Tool label="Delete" tone="danger" onClick={() => setConfirmDelete(cat.id)}><Trash2 size={15} /></Tool>
                  </>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

function Tool({ label, onClick, disabled, tone, type = 'button', children }: {
  label: string; onClick?: () => void; disabled?: boolean; tone?: 'danger'; type?: 'button' | 'submit'; children: ReactNode
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        tone === 'danger' ? 'text-[#C41C33] hover:bg-[#FFF5F6]' : 'text-[#3E6B57] hover:bg-[#EEF8F1]'
      }`}
    >
      {children}
    </button>
  )
}
