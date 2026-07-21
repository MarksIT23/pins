import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { Asset } from '@/types'
import { useCharacterStore } from '@/store/characterStore'
import { useAssetsByCategory } from '@/hooks/useAssets'

interface AssetGridProps {
  categoryId: string | undefined
  categorySlug: string
}

const CONTAINER_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
} as const

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
} as const

const FORCE_DEFAULT = ['base', 'clothes', 'background']

export function AssetGrid({ categoryId, categorySlug }: AssetGridProps) {
  const { config, setLayer, getSelectedForCategory } = useCharacterStore()
  const selected = getSelectedForCategory(categorySlug)
  const { data: assets, isLoading, error } = useAssetsByCategory(categoryId)

  // Auto-select first asset for categories that don't allow "none"
  useEffect(() => {
    if (assets && assets.length > 0 && FORCE_DEFAULT.includes(categorySlug) && !selected) {
      setLayer(categorySlug, assets[0].id)
    }
  }, [assets, categorySlug, selected, setLayer])

  function handleSelect(assetId: string) {
    if (selected === assetId) {
      // Only allow deselect if the category allows "none"
      if (!FORCE_DEFAULT.includes(categorySlug)) {
        setLayer(categorySlug, null)
      }
    } else {
      setLayer(categorySlug, assetId)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl shimmer" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <span className="text-3xl mb-2">😿</span>
        <p className="text-sm text-[#B8A0C8] font-nunito">Failed to load assets</p>
      </div>
    )
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <span className="text-3xl mb-2">📂</span>
        <p className="font-fredoka text-sm text-[#B8A0C8]">No assets uploaded yet</p>
        
      </div>
    )
  }

  return (
    <motion.div
      key={categorySlug}
      variants={CONTAINER_VARIANTS}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5"
    >
      {/* None / Remove option — hidden for categories that require a default */}
      {!FORCE_DEFAULT.includes(categorySlug) && (
        <motion.button
          variants={ITEM_VARIANTS}
          onClick={() => setLayer(categorySlug, null)}
          className={`
            aspect-square rounded-xl flex flex-col items-center justify-center gap-1
            border-2 transition-all cursor-pointer text-xs font-nunito
            ${!selected
              ? 'border-[#FF85A1] bg-[#FFD6E8] text-[#FF85A1]'
              : 'border-dashed border-[#E8D9FF] bg-white text-[#C8B0D8] hover:border-[#C8B0FF]'
            }
          `}
        >
          <X size={16} />
          <span className="text-[10px]">None</span>
        </motion.button>
      )}

      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          isSelected={selected === asset.id}
          onSelect={handleSelect}
        />
      ))}
    </motion.div>
  )
}

// ─── Individual Asset Card ────────────────────────────────────────────────────
function AssetCard({
  asset,
  isSelected,
  onSelect,
}: {
  asset: Asset
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <motion.button
      variants={ITEM_VARIANTS}
      whileTap={{ scale: 0.92 }}
      onClick={() => onSelect(asset.id)}
      title={asset.name}
      className={`
        aspect-square rounded-xl overflow-hidden relative cursor-pointer
        border-2 transition-all duration-200
        ${isSelected
          ? 'border-[#FF85A1] shadow-[0_0_0_3px_rgba(255,133,161,0.25),0_4px_16px_rgba(255,133,161,0.3)]'
          : 'border-transparent hover:border-[#E8D9FF] hover:shadow-[0_4px_16px_rgba(176,127,255,0.15)]'
        }
      `}
    >
      {/* Checkerboard for transparency */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-conic-gradient(#f5f5f5 0% 25%, white 0% 50%)',
          backgroundSize: '16px 16px',
        }}
      />

      {imgError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F8F0FF]">
          <span className="text-2xl">🖼️</span>
        </div>
      ) : (
        <img
          src={asset.thumbnail_url || asset.file_url}
          alt={asset.name}
          className="absolute inset-0 w-full h-full object-contain p-1"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      )}

      {/* Selected overlay */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#FF85A1] rounded-full flex items-center justify-center shadow-sm"
          >
            <Check size={11} className="text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name tooltip on hover */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent px-1.5 pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-[9px] text-white font-nunito truncate">{asset.name}</p>
      </div>
    </motion.button>
  )
}
