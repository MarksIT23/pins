import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
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
import { Asset, TextOverlay } from '@/types'

const TEXT_FONTS = [
  { value: 'Fredoka', label: 'Fredoka', icon: '🔤' },
  { value: 'Nunito', label: 'Nunito', icon: '📝' },
  { value: 'Pacifico', label: 'Pacifico', icon: '✒️' },
]

const TEXT_SIZES = [
  { value: 0, label: 'Tiny', icon: 'A' },
  { value: 1, label: 'Small', icon: 'A' },
  { value: 2, label: 'Medium', icon: 'A' },
  { value: 3, label: 'Large', icon: 'A' },
]

export function CreatorPage() {
  const stageRef = useRef<any>(null)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [previewDataUrl, setPreviewDataUrl] = useState<string>()
  const [textInput, setTextInput] = useState('')
  const [textFont, setTextFont] = useState('Fredoka')
  const [textSize, setTextSize] = useState(1)

  const { data: categories = [], isLoading: catsLoading } = useCategories()
  const { data: allAssets = [] } = useAllAssets()
  const { config, activeCategory, setActiveCategory, setLayer, setTextOverlay, resetCharacter } = useCharacterStore()

  // Filter to our 6 active categories only
  const activeCategories = useMemo(() => filterActiveCategories(categories), [categories])

  const assetMap = useMemo(() => {
    const m = new Map<string, Asset>()
    for (const asset of allAssets) m.set(asset.id, asset)
    return m
  }, [allAssets])

  const activeCat = activeCategories.find((c) => c.slug === activeCategory)

  // Validate persisted activeCategory against loaded categories
  // Fixes stale persisted state after categories are deactivated
  // Skip validation when 'text' is selected (no DB category, pseudo-category)
  useEffect(() => {
    if (activeCategory === 'text') return
    if (activeCategories.length > 0 && !activeCat) {
      setActiveCategory(activeCategories[0].slug)
    }
  }, [activeCategories, activeCat, activeCategory, setActiveCategory])

  // Set default base, clothes, and background from the first available asset
  // so the preview shows something immediately, even before clicking those tabs
  useEffect(() => {
    if (allAssets.length === 0) return
    if (!config.base) {
      const first = allAssets.find((a) => a.category?.slug === 'base')
      if (first) setLayer('base', first.id)
    }
    if (!config.clothes) {
      const first = allAssets.find((a) => a.category?.slug === 'clothes')
      if (first) setLayer('clothes', first.id)
    }
    if (!config.background) {
      const first = allAssets.find((a) => a.category?.slug === 'background')
      if (first) setLayer('background', first.id)
    }
  }, [allAssets, config.base, config.clothes, config.background, setLayer])

  // Sync text input to store (debounced)
  useEffect(() => {
    const trimmed = textInput.trim().slice(0, 10)
    if (trimmed) {
      setTextOverlay({ text: trimmed, font: textFont, size: textSize })
    } else {
      setTextOverlay(null)
    }
  }, [textInput, textFont, textSize, setTextOverlay])

  // Restore persisted text overlay into local state
  useEffect(() => {
    if (config.textOverlay) {
      setTextInput(config.textOverlay.text)
      setTextFont(config.textOverlay.font)
      setTextSize(config.textOverlay.size)
    }
  }, [])

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

  function handleReset() {
    resetCharacter()
    setTextInput('')
    setTextFont('Fredoka')
    setTextSize(1)
  }

  function handlePlaceOrder() {
    if (stageRef.current) {
      const url = exportCanvasToDataUrl(stageRef.current)
      setPreviewDataUrl(url)
    }
    setOrderModalOpen(true)
  }

  const hasAnySelection = Object.values(config).some((v) => v != null)

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] relative">
      <SparkleBackground />
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto w-full px-3 sm:px-5 py-3 sm:py-4">
        <div className="flex gap-4 lg:gap-6 flex-col lg:flex-row">

          {/* ─── CATEGORIES + ASSET GRID — first on mobile, right on desktop ── */}
          <div className="lg:order-2 lg:flex-1 min-w-0">
            {/* Page title */}
            <h1 className="font-fredoka text-xl sm:text-2xl font-bold text-[#3D2B4F] mb-2">
              ✨ Character Creator
            </h1>

            {/* Category pills */}
            <div className="mb-3">
              {catsLoading ? (
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-8 w-16 sm:w-20 rounded-2xl shimmer" />
                  ))}
                </div>
              ) : (
                <CategoryPanel categories={activeCategories} />
              )}
            </div>

            {/* Active category label */}
            {activeCat && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{(activeCat as any).icon ?? '🎀'}</span>
                <h2 className="font-fredoka text-base font-semibold text-[#3D2B4F]">
                  {activeCat.name}
                </h2>
              </div>
            )}

            {/* Asset grid — scrolls on desktop, natural flow on mobile */}
            <div className="lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto lg:pr-1">
              {activeCategory === 'text' ? (
                <div className="bg-white rounded-2xl border border-[#F0E6FF] p-4 space-y-4">
                  {/* Text input */}
                  <div>
                    <label className="font-fredoka text-sm font-semibold text-[#3D2B4F] mb-1.5 block">
                      Curved Text
                    </label>
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value.slice(0, 10))}
                      placeholder="Max 10 characters"
                      maxLength={10}
                      className="w-full bg-[#F8F0FF] border border-[#F0E6FF] rounded-2xl px-4 py-2.5 text-sm font-nunito text-[#3D2B4F] placeholder:text-[#C8B0D8] outline-none focus:border-[#B07FFF] focus:bg-white transition-colors"
                    />
                    <p className="text-[10px] text-[#B8A0C8] font-nunito mt-1 text-right">
                      {textInput.length}/10
                    </p>
                  </div>

                  {/* Font selector */}
                  <div>
                    <label className="font-fredoka text-sm font-semibold text-[#3D2B4F] mb-1.5 block">
                      Font Style
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {TEXT_FONTS.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => setTextFont(f.value)}
                          className={`
                            flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-fredoka font-semibold
                            transition-all cursor-pointer
                            ${textFont === f.value
                              ? 'bg-gradient-to-r from-[#FF85A1] to-[#B07FFF] text-white shadow-[0_4px_14px_rgba(255,133,161,0.4)]'
                              : 'bg-white text-[#7A5C8A] border border-[#F0E6FF] hover:border-[#C8B0FF]'
                            }
                          `}
                        >
                          <span>{f.icon}</span>
                          <span style={{ fontFamily: f.value }}>{f.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font size */}
                  <div>
                    <label className="font-fredoka text-sm font-semibold text-[#3D2B4F] mb-1.5 block">
                      Font Size
                    </label>
                    <div className="flex gap-2">
                      {TEXT_SIZES.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => setTextSize(s.value)}
                          className={`
                            flex items-center justify-center gap-1 px-4 py-2 rounded-2xl text-sm font-fredoka font-semibold
                            transition-all cursor-pointer
                            ${textSize === s.value
                              ? 'bg-gradient-to-r from-[#FF85A1] to-[#B07FFF] text-white shadow-[0_4px_14px_rgba(255,133,161,0.4)]'
                              : 'bg-white text-[#7A5C8A] border border-[#F0E6FF] hover:border-[#C8B0FF]'
                            }
                          `}
                        >
                          <span className={s.value === 0 ? 'text-xs' : s.value === 1 ? 'text-sm' : s.value === 2 ? 'text-base' : 'text-lg'} style={{ fontFamily: textFont }}>A</span>
                          <span className="text-[11px] font-nunito">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : activeCat ? (
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

          {/* ─── CANVAS + LAYERS + ACTIONS — second on mobile, left on desktop ── */}
          <div className="lg:order-1 flex flex-col items-center gap-3 w-full max-w-[300px] mx-auto lg:mx-0 lg:flex-shrink-0">
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
                onClick={handleReset}
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