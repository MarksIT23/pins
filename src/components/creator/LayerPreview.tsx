import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Layers, CheckCircle2, Circle } from 'lucide-react'
import { useCharacterStore, deriveRenderedLayers } from '@/store/characterStore'
import { CATEGORY_UI, LAYER_SLUGS } from '@/utils/layerOrder'
import type { Asset } from '@/types'

interface LayerPreviewProps {
  assetMap: Map<string, Asset>
}

export function LayerPreview({ assetMap }: LayerPreviewProps) {
  const config = useCharacterStore((s) => s.config)

  const assetInfoMap = useMemo(() => {
    const m = new Map<string, { file_url: string; category_slug: string }>()
    for (const [id, asset] of assetMap.entries()) {
      m.set(id, { file_url: asset.file_url, category_slug: asset.category?.slug ?? '' })
    }
    return m
  }, [assetMap])

  const selectedLayers = useMemo(() => deriveRenderedLayers(config, assetInfoMap), [config, assetInfoMap])
  const selectedMap = useMemo(() => new Map(selectedLayers.map((l) => [l.slug, l])), [selectedLayers])
  const selectedCount = selectedLayers.length

  return (
    <div className="w-full">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-2 sm:mb-2">
        <Layers size={13} className="text-[#B8A0C8]" />
        <p className="font-fredoka text-xs font-semibold text-[#B8A0C8] uppercase tracking-wide">
          Layer Stack
        </p>
        <span className="text-[10px] font-nunito text-[#B8A0C8] bg-[#F0E6FF] px-1.5 py-0.5 rounded-full">
          {selectedCount}/{LAYER_SLUGS.length}
        </span>
      </div>

      {/* ─── Mobile: compact grid ─────────────────────────────────── */}
      <div className="grid sm:hidden grid-cols-4 gap-1.5">
        {LAYER_SLUGS.map((slug, i) => {
          const ui = CATEGORY_UI[slug]
          const selected = selectedMap.get(slug)
          const isFilled = !!selected

          return (
            <motion.div
              key={slug}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex flex-col items-center rounded-xl px-1 py-1.5 transition-all ${
                isFilled
                  ? 'bg-white border border-[#E0D0F0] shadow-sm'
                  : 'bg-[#FCF8FF] border border-dashed border-[#E8E0F0]'
              }`}
            >
              <span className="text-sm leading-none">{ui?.icon ?? '🎀'}</span>
              <span className="text-[8px] font-fredoka font-bold text-[#3D2B4F] leading-tight truncate w-full text-center mt-0.5">
                {ui?.label ?? slug}
              </span>
              {isFilled ? (
                <CheckCircle2 size={8} className="text-[#52B788] mt-0.5" />
              ) : (
                <Circle size={8} className="text-[#D0C8E0] mt-0.5" />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* ─── Desktop: compact grid with icon + name ──────────────── */}
      <div className="hidden sm:grid grid-cols-2 gap-1.5">
        {LAYER_SLUGS.map((slug, i) => {
          const ui = CATEGORY_UI[slug]
          const selected = selectedMap.get(slug)
          const asset = selected ? assetMap.get(selected.assetId) : null
          const isFilled = !!selected

          return (
            <motion.div
              key={slug}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border transition-all ${
                isFilled
                  ? 'bg-white border-[#E0D0F0] shadow-sm'
                  : 'bg-[#FCF8FF] border-dashed border-[#E8E0F0]'
              }`}
            >
              <span className="text-xs flex-shrink-0">{ui?.icon ?? '🎀'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-fredoka font-semibold text-[#3D2B4F] truncate leading-tight">
                  {ui?.label ?? slug}
                </p>
                {asset && (
                  <p className="text-[8px] font-nunito text-[#B8A0C8] truncate leading-tight">
                    {asset.name}
                  </p>
                )}
              </div>
              {isFilled ? (
                <CheckCircle2 size={10} className="text-[#52B788] flex-shrink-0" />
              ) : (
                <Circle size={10} className="text-[#D0C8E0] flex-shrink-0" />
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
