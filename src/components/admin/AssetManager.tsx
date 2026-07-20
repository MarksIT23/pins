import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Eye, EyeOff } from 'lucide-react'
import { Asset, AssetCategory } from '@/types'
import { useDeleteAsset, useToggleAssetActive } from '@/hooks/useAdmin'
import { ConfirmDialog } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'

interface AssetManagerProps {
  assets: Asset[]
  categories: AssetCategory[]
  selectedCategory: string | 'all'
}

export function AssetManager({ assets, categories, selectedCategory }: AssetManagerProps) {
  const { mutate: deleteAsset, isPending: isDeleting } = useDeleteAsset()
  const { mutate: toggleActive } = useToggleAssetActive()
  const [confirmDelete, setConfirmDelete] = useState<Asset | null>(null)

  const filtered = selectedCategory === 'all'
    ? assets
    : assets.filter((a) => {
        const cat = categories.find((c) => c.id === a.category_id)
        return cat?.slug === selectedCategory
      })

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <span className="text-5xl mb-3">🗂️</span>
        <p className="font-fredoka text-[#B8A0C8] text-lg">No assets in this category</p>
        <p className="text-xs text-[#D0C0E0] font-nunito mt-1">Upload new assets using the uploader above</p>
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
                  ${asset.is_active ? 'border-[#F0E6FF]' : 'border-[#FFD6E8] opacity-60'}
                  shadow-[0_2px_8px_rgba(176,127,255,0.08)] hover:shadow-[0_4px_16px_rgba(176,127,255,0.15)] transition-all
                `}
              >
                {/* Image */}
                <div className="relative aspect-square bg-[#F8F0FF]">
                  {/* Checkerboard for transparency */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: 'repeating-conic-gradient(#f0e8f8 0% 25%, white 0% 50%)',
                      backgroundSize: '12px 12px',
                    }}
                  />
                  <img
                    src={asset.file_url}
                    alt={asset.name}
                    className="absolute inset-0 w-full h-full object-contain p-2"
                    loading="lazy"
                  />

                  {/* Hover action overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => toggleActive({ id: asset.id, is_active: !asset.is_active })}
                      className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-[#7A5C8A] hover:text-[#B07FFF] transition-colors"
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
                  <p className="font-nunito text-xs font-semibold text-[#3D2B4F] truncate">{asset.name}</p>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {cat && (
                      <Badge variant="purple" className="text-[9px] px-1.5 py-0">
                        {cat.name}
                      </Badge>
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
