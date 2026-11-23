import { CloudOff, PackageOpen, ImageOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { Asset } from '@/types'
import { useCharacterStore } from '@/store/characterStore'
import { useAssetsByCategory, pickDefault } from '@/hooks/useAssets'
import { TrimmedImage } from '@/components/ui/TrimmedImage'

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

// Categories that always need a part (no "None" option)
const FORCE_DEFAULT = ['base', 'clothes', 'background', 'eyes', 'eyebrows', 'lips']

export function AssetGrid({ categoryId, categorySlug }: AssetGridProps) {
  const { config, setLayer, getSelectedForCategory } = useCharacterStore()
  const selected = getSelectedForCategory(categorySlug)
  const { data: assets, isLoading, error } = useAssetsByCategory(categoryId)

  // Auto-select first asset for categories that don't allow "none"
  useEffect(() => {
    if (assets && assets.length > 0 && FORCE_DEFAULT.includes(categorySlug) && !selected) {
      setLayer(categorySlug, pickDefault(assets)!.id)
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
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl shimmer" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <CloudOff size={28} className="mb-2 text-[#8A9F96]" />
        <p className="text-sm text-[#8A9F96] font-nunito">Couldn't load these items. Check your connection and reload the page.</p>
      </div>
    )
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <PackageOpen size={28} className="mb-2 text-[#8A9F96]" />
        <p className="font-fredoka text-sm text-[#8A9F96]">Nothing in this category yet</p>
        
      </div>
    )
  }

  return (
    <motion.div
      key={categorySlug}
      variants={CONTAINER_VARIANTS}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-2"
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
              ? 'border-[#E3263F] bg-[#FFD9DE] text-[#E3263F]'
              : 'border-dashed border-[#CDEBD8] bg-white text-[#A9BAB2] hover:border-[#9FD6B4]'
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
        rounded-xl overflow-hidden relative cursor-pointer
        border-2 transition-all duration-200
        ${isSelected
          ? 'border-[#E3263F] shadow-[0_0_0_3px_rgba(227,38,63,0.25),0_4px_16px_rgba(227,38,63,0.3)]'
          : 'border-transparent hover:border-[#CDEBD8] hover:shadow-[0_4px_16px_rgba(20,144,79,0.15)]'
        }
      `}
    >
      {/* Image area */}
      <div className="aspect-square relative">
        {/* Checkerboard for transparency */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-conic-gradient(#f5f5f5 0% 25%, white 0% 50%)',
            backgroundSize: '16px 16px',
          }}
        />

        {imgError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#EEF8F1]">
            <ImageOff size={22} className="text-[#8A9F96]" />
          </div>
        ) : (
          <TrimmedImage
            src={asset.thumbnail_url || asset.file_url}
            alt={asset.name}
            onError={() => setImgError(true)}
          />
        )}

        {/* Selected overlay */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#E3263F] rounded-full flex items-center justify-center shadow-sm"
            >
              <Check size={11} className="text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Asset name — always visible */}
      <div className="bg-white border-t border-[#DDEFE3] px-1.5 py-1">
        <p className="text-[10px] font-nunito text-[#0F3B2C] truncate text-center leading-tight">
          {asset.name}
        </p>
      </div>
    </motion.button>
  )
}
