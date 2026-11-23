import { FolderOpen } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Eye, EyeOff, Pencil, Star } from 'lucide-react'
import { TrimmedImage } from '@/components/ui/TrimmedImage'
import { Asset, AssetCategory } from '@/types'
import { useDeleteAsset, useToggleAssetActive, useUpdateAsset, useSetDefaultAsset } from '@/hooks/useAdmin'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'

interface AssetManagerProps {
  assets: Asset[]
  categories: AssetCategory[]
  selectedCategory: string | 'all'
}

export function AssetManager({ assets, categories, selectedCategory }: AssetManagerProps) {
  const { mutate: deleteAsset, isPending: isDeleting } = useDeleteAsset()
  const { mutate: toggleActive } = useToggleAssetActive()
  const { mutate: updateAsset, isPending: isUpdating } = useUpdateAsset()
  const { mutate: setDefault, isPending: isSettingDefault } = useSetDefaultAsset()
  const [confirmDelete, setConfirmDelete] = useState<Asset | null>(null)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [editName, setEditName] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')

  const filtered = selectedCategory === 'all'
    ? assets
    : assets.filter((a) => {
        const cat = categories.find((c) => c.id === a.category_id)
        return cat?.slug === selectedCategory
      })

  function openEdit(asset: Asset) {
    setEditingAsset(asset)
    setEditName(asset.name)
    setEditCategoryId(asset.category_id)
  }

  function saveEdit() {
    if (!editingAsset || !editName.trim()) return
    updateAsset({
      id: editingAsset.id,
      name: editName.trim(),
      category_id: editCategoryId,
      clearDefault: editCategoryId !== editingAsset.category_id,
    }, {
      onSuccess: () => setEditingAsset(null),
    })
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <FolderOpen size={44} strokeWidth={1.6} className="mb-3 text-[#8A9F96]" />
        <p className="font-fredoka text-[#8A9F96] text-lg">No assets in this category</p>
        <p className="text-xs text-[#BFDCCB] font-nunito mt-1">Upload new assets using the uploader above</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((asset, i) => {
            const cat = categories.find((c) => c.id === asset.category_id)
            return (
              <motion.div
                key={asset.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.02 }}
                className={`
                  bg-white rounded-2xl border overflow-hidden group
                  ${asset.is_active ? 'border-[#DDEFE3]' : 'border-[#FFD9DE] opacity-60'}
                  shadow-[0_2px_8px_rgba(20,144,79,0.08)] hover:shadow-[0_4px_16px_rgba(20,144,79,0.15)] transition-all
                `}
              >
                {/* Image */}
                <div className="relative aspect-square bg-[#EEF8F1]">
                  {/* Checkerboard for transparency */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: 'repeating-conic-gradient(#EAF0EC 0% 25%, white 0% 50%)',
                      backgroundSize: '12px 12px',
                    }}
                  />
                  <TrimmedImage src={asset.file_url} alt={asset.name} />

                  {/* Default star: always visible, tap to toggle */}
                  <button
                    onClick={() => setDefault({ asset, makeDefault: !asset.is_default })}
                    disabled={isSettingDefault}
                    title={asset.is_default ? 'Default part (tap to remove)' : 'Set as default part for this category'}
                    aria-label={asset.is_default ? `Remove ${asset.name} as default` : `Set ${asset.name} as default`}
                    aria-pressed={!!asset.is_default}
                    className={`absolute top-1.5 left-1.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      asset.is_default ? 'bg-[#FFC23A] text-[#0F3B2C]' : 'bg-white/90 text-[#A9BAB2] hover:text-[#C98A0B]'
                    }`}
                  >
                    <Star size={15} fill={asset.is_default ? 'currentColor' : 'none'} />
                  </button>

                  {/* Hover action overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(asset)}
                      className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-[#3E6B57] hover:text-[#14904F] transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => toggleActive({ id: asset.id, is_active: !asset.is_active })}
                      className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-[#3E6B57] hover:text-[#14904F] transition-colors"
                      title={asset.is_active ? 'Hide' : 'Show'}
                    >
                      {asset.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(asset)}
                      className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="font-nunito text-xs font-semibold text-[#0F3B2C] truncate">{asset.name}</p>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {cat && (
                      <Badge variant="purple" className="text-[9px] px-1.5 py-0">
                        {cat.name}
                      </Badge>
                    )}
                    {asset.is_default && (
                      <span className="text-[9px] font-nunito font-bold rounded-full bg-[#FFF1CC] text-[#9A6400] px-1.5 py-0">Default</span>
                    )}
                    {asset.gender !== 'unisex' && (
                      <Badge variant={asset.gender === 'female' ? 'pink' : 'blue'} className="text-[9px] px-1.5 py-0">
                        {asset.gender}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Edit modal */}
      <Modal
        isOpen={!!editingAsset}
        onClose={() => setEditingAsset(null)}
        title={`Edit: ${editingAsset?.name ?? ''}`}
        size="sm"
      >
        <div className="space-y-4">
          {/* Asset name */}
          <div>
            <label className="font-nunito font-semibold text-sm text-[#0F3B2C] block mb-1.5">
              Asset Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Asset name"
              className="w-full bg-white border-2 border-[#DDEFE3] rounded-2xl px-3 py-2.5 font-nunito text-[#0F3B2C] text-sm outline-none focus:border-[#14904F] transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="font-nunito font-semibold text-sm text-[#0F3B2C] block mb-1.5">
              Category
            </label>
            <select
              value={editCategoryId}
              onChange={(e) => setEditCategoryId(e.target.value)}
              className="w-full bg-white border-2 border-[#DDEFE3] rounded-2xl px-3 py-2.5 font-nunito text-[#0F3B2C] text-sm outline-none focus:border-[#14904F] transition-colors"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setEditingAsset(null)}
              className="px-5 py-2 rounded-2xl bg-[#DDEFE3] text-[#3E6B57] font-fredoka hover:bg-[#CDEBD8] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={isUpdating || !editName.trim()}
              className="px-5 py-2 rounded-2xl bg-[#14904F] text-white font-fredoka hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isUpdating ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            deleteAsset({ id: confirmDelete.id, storagePath: confirmDelete.storage_path })
            setConfirmDelete(null)
          }
        }}
        title="Delete Asset"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This will remove it from storage and cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </>
  )
}
