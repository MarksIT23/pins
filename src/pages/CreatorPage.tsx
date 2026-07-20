import { useRef, useState, useEffect, useMemo } from 'react'
import { RotateCcw, ShoppingBag } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { SparkleBackground } from '@/components/layout/SparkleBackground'
import { CharacterCanvas } from '@/components/creator/CharacterCanvas'
import { CategoryPanel } from '@/components/creator/CategoryPanel'
import { AssetGrid } from '@/components/creator/AssetGrid'
import { OrderModal } from '@/components/creator/OrderModal'
import { LayerPreview } from '@/components/creator/LayerPreview'
import { Button } from '@/components/ui/Button'
import { useCategories, useAllAssets } from '@/hooks/useAssets'
import { useCharacterStore } from '@/store/characterStore'
import { exportCanvasToDataUrl } from '@/lib/konva-export'
import { filterActiveCategories } from '@/utils/layerOrder'
import { Asset } from '@/types'

export function CreatorPage() {
  const stageRef = useRef<any>(null)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [previewDataUrl, setPreviewDataUrl] = useState<string>()

  const { data: categories = [], isLoading: catsLoading } = useCategories()
  const { data: allAssets = [] } = useAllAssets()
  const { config, activeCategory, resetCharacter } = useCharacterStore()

  // Filter to our 6 active categories only
  const activeCategories = useMemo(() => filterActiveCategories(categories), [categories])

  const assetMap = useMemo(() => {
    const m = new Map<string, Asset>()
    for (const asset of allAssets) m.set(asset.id, asset)
    return m
  }, [allAssets])

  const activeCat = activeCategories.find((c) => c.slug === activeCategory)

  // Generate preview on config change
  useEffect(() => {
    if (!stageRef.current) return
    const timeout = setTimeout(() => {
      try {
        const url = exportCanvasToDataUrl(stageRef.current)
        setPreviewDataUrl(url)
      } catch { /* ignore */ }
    }, 100)
    return () => clearTimeout(timeout)
  }, [JSON.stringify(config)])

  function handlePlaceOrder() {
    if (stageRef.current) {
      const url = exportCanvasToDataUrl(stageRef.current)
      setPreviewDataUrl(url)
    }
    setOrderModalOpen(true)
  }

  const hasAnySelection = Object.values(config).some((v) => v != null)

  return (
    <div className="h-screen flex flex-col bg-[#FFF8F0] relative overflow-hidden">
      <SparkleBackground />
      <Header />

      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-3 sm:px-5 py-3 sm:py-4 min-h-0 flex flex-col overflow-y-auto">
        <div className="flex gap-4 lg:gap-6 min-h-0 flex-col lg:flex-row lg:flex-1">

          {/* ─── LEFT: Canvas + Layer Stack + Actions ─────────────────── */}
          <div className="flex flex-col items-center gap-3 w-full max-w-[300px] mx-auto lg:mx-0 flex-shrink-0">
            {/* Canvas — auto-sizes to container width */}
            <CharacterCanvas
              assetMap={assetMap}
              stageRef={stageRef}
            />

            {/* Layer stack — 7 fixed slots */}
            <div className="w-full max-w-[300px] bg-white/80 backdrop-blur-sm rounded-2xl border border-[#F0E6FF] p-2.5 shadow-[0_2px_12px_rgba(176,127,255,0.08)]">
              <LayerPreview assetMap={assetMap} />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 w-full max-w-[300px]">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={resetCharacter}
                leftIcon={<RotateCcw size={14} />}
                disabled={!hasAnySelection}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={handlePlaceOrder}
                leftIcon={<ShoppingBag size={16} />}
              >
                Place Order
              </Button>
            </div>
          </div>

          {/* ─── RIGHT: Categories + Asset Grid ──────────────────────── */}
          <div className="lg:flex-1 flex flex-col min-w-0 min-h-0">
            {/* Page title */}
            <h1 className="font-fredoka text-xl sm:text-2xl font-bold text-[#3D2B4F] mb-2 flex-shrink-0">
              ✨ Character Creator
            </h1>

            {/* Category pills — no scroll */}
            <div className="flex-shrink-0 mb-3">
              {catsLoading ? (
                <div className="flex gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-8 w-20 rounded-2xl shimmer" />
                  ))}
                </div>
              ) : (
                <CategoryPanel categories={activeCategories} />
              )}
            </div>

            {/* Active category label */}
            {activeCat && (
              <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                <span className="text-lg">{(activeCat as any).icon ?? '🎀'}</span>
                <h2 className="font-fredoka text-base font-semibold text-[#3D2B4F]">
                  {activeCat.name}
                </h2>
              </div>
            )}

            {/* Asset grid — fills remaining height on desktop, scrolls if needed */}
            <div className="lg:flex-1 overflow-y-auto min-h-0 pr-1">
              {activeCat ? (
                <AssetGrid
                  categoryId={activeCat.id}
                  categorySlug={activeCat.slug}
                />
              ) : (
                <div className="py-8 text-center">
                  <p className="text-[#B8A0C8] font-nunito text-sm">Select a category above!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* No Footer — saves vertical space */}

      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        stageRef={stageRef}
        previewDataUrl={previewDataUrl}
      />
    </div>
  )
}