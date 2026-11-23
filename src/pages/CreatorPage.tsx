import { ImageOff } from 'lucide-react'
import { CATEGORY_UI, FALLBACK_ICON } from '@/utils/layerOrder'
import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { RotateCcw, ShoppingBag } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { motion, useReducedMotion } from 'framer-motion'
import { UnwrapTransition } from '@/components/creator/UnwrapTransition'
import { SparkleBackground } from '@/components/layout/SparkleBackground'
import { CharacterCanvas } from '@/components/creator/CharacterCanvas'
import { CategoryPanel } from '@/components/creator/CategoryPanel'
import { AssetGrid } from '@/components/creator/AssetGrid'
import { OrderModal } from '@/components/creator/OrderModal'
import { LayerPreview } from '@/components/creator/LayerPreview'
import { Button } from '@/components/ui/Button'
import { useCategories, useAllAssets, useStarterDefaults } from '@/hooks/useAssets'
import { useCharacterStore } from '@/store/characterStore'
import { exportCanvasToDataUrl } from '@/lib/konva-export'
import { filterActiveCategories, withSecondAccessory } from '@/utils/layerOrder'
import { Asset, TextOverlay } from '@/types'

const TEXT_FONTS = [
  { value: 'Fredoka', label: 'Fredoka' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Pacifico', label: 'Pacifico' },
  { value: 'Chewy', label: 'Chewy' },
  { value: 'Lobster', label: 'Lobster' },
  { value: 'Righteous', label: 'Righteous' },
  { value: 'Mountains of Christmas', label: 'Mountains of Christmas' },
]

const TEXT_COLORS = [
  { value: '#E3263F', label: 'Holly red' },
  { value: '#14904F', label: 'Spruce green' },
  { value: '#FFC23A', label: 'Gold' },
  { value: '#FFFFFF', label: 'Snow white' },
  { value: '#0F3B2C', label: 'Pine' },
  { value: '#2D2D2D', label: 'Black' },
  { value: '#2E9BD6', label: 'Ice blue' },
]

// Largest size retained — size picker removed
const TEXT_SIZE = 3

const OUTLINE_OPTIONS: { value: 'none' | 'white' | 'black'; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'white', label: 'White' },
  { value: 'black', label: 'Black' },
]

export function CreatorPage() {
  const stageRef = useRef<any>(null)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [previewDataUrl, setPreviewDataUrl] = useState<string>()
  const [textInput, setTextInput] = useState('')
  const [textFont, setTextFont] = useState('Fredoka')
  const [textSize, setTextSize] = useState(TEXT_SIZE)
  const [textColor, setTextColor] = useState('#0F3B2C')
  const [textOutline, setTextOutline] = useState<'none' | 'white' | 'black'>('none')

  const { data: categories = [], isLoading: catsLoading } = useCategories()
  const { data: allAssets = [] } = useAllAssets()
  const { config, activeCategory, setActiveCategory, setLayer, setTextOverlay, resetCharacter } = useCharacterStore()

  // Filter to our 6 active categories only
  const dbCategories = useMemo(() => filterActiveCategories(categories), [categories])
  // Adds the Accessory 2 slot, which reuses the accessory parts.
  const activeCategories = useMemo(() => withSecondAccessory(dbCategories), [dbCategories])

  // A fresh (or just-reset) design starts with a base, eyes, eyebrows, lips and clothes.
  const { defaultsApplied, applyDefaults } = useCharacterStore()
  const { data: starterDefaults } = useStarterDefaults(dbCategories)
  useEffect(() => {
    if (!defaultsApplied && starterDefaults) applyDefaults(starterDefaults)
  }, [defaultsApplied, starterDefaults, applyDefaults])

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
    if (activeCategory === 'text' || activeCategory === 'pendant-bg') return
    if (activeCategories.length > 0 && !activeCat) {
      setActiveCategory(activeCategories[0].slug)
    }
  }, [activeCategories, activeCat, activeCategory, setActiveCategory])

  // Safety net once the starred defaults are in: never leave the pin without a
  // base, background, or something to wear (clothes or a Christmas outfit).
  useEffect(() => {
    if (!defaultsApplied || allAssets.length === 0) return
    const firstIn = (slug: string) => allAssets.find((a) => a.category?.slug === slug)
    if (!config.base) { const a = firstIn('base'); if (a) setLayer('base', a.id) }
    if (!config.clothes && !config['christmas-outfit']) { const a = firstIn('clothes'); if (a) setLayer('clothes', a.id) }
    if (!config.background) { const a = firstIn('background'); if (a) setLayer('background', a.id) }
  }, [defaultsApplied, allAssets, config.base, config.clothes, config['christmas-outfit'], config.background, setLayer])

  // Sync text input to store (debounced)
  useEffect(() => {
    const trimmed = textInput.trim().slice(0, 12)
    if (trimmed) {
      setTextOverlay({ text: trimmed, font: textFont, size: textSize, color: textColor, outline: textOutline })
    } else {
      setTextOverlay(null)
    }
  }, [textInput, textFont, textSize, textColor, textOutline, setTextOverlay])

  // Restore persisted text overlay into local state
  useEffect(() => {
    if (config.textOverlay) {
      setTextInput(config.textOverlay.text)
      setTextFont(config.textOverlay.font)
      setTextSize(config.textOverlay.size)
      setTextColor(config.textOverlay.color)
      setTextOutline(config.textOverlay.outline)
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
    setTextSize(TEXT_SIZE)
    setTextColor('#0F3B2C')
    setTextOutline('none')
  }

  function handlePlaceOrder() {
    if (stageRef.current) {
      const url = exportCanvasToDataUrl(stageRef.current)
      setPreviewDataUrl(url)
    }
    setOrderModalOpen(true)
  }

  const hasAnySelection = Object.values(config).some((v) => v != null)
  const reduceMotion = useReducedMotion()
  // The editor rises into place as the wrapping paper tears open.
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFDF9] relative">
      <SparkleBackground />
      <Header />

      <UnwrapTransition onOpen={() => setRevealed(true)} />

      <motion.main
        className="relative z-10 max-w-7xl mx-auto w-full px-3 sm:px-5 py-3 sm:py-4"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
        animate={revealed ? { opacity: 1, y: 0, scale: 1 } : reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.2, 0.8, 0.3, 1] }}
      >
        <div className="flex gap-4 lg:gap-6 flex-col lg:flex-row">

          {/* ─── CATEGORIES + ASSET GRID — first on mobile, right on desktop ── */}
          <div className="lg:order-2 lg:flex-1 min-w-0">
            {/* Page title */}
            <h1 className="font-fredoka text-xl sm:text-2xl font-bold text-[#0F3B2C] mb-2">
              Design your pin
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
                {(() => { const I = CATEGORY_UI[activeCat.slug]?.icon ?? FALLBACK_ICON; return <I size={18} className="text-[#E3263F]" /> })()}
                <h2 className="font-fredoka text-base font-semibold text-[#0F3B2C]">
                  {CATEGORY_UI[activeCat.slug]?.label ?? activeCat.name}
                </h2>
              </div>
            )}

            {/* Asset grid — scrolls on desktop, natural flow on mobile */}
            <div className="lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto lg:pr-1">
              {activeCategory === 'text' ? (
                <div className="bg-white rounded-2xl border border-[#DDEFE3] p-4 space-y-4">
                  {/* Text input */}
                  <div>
                    <label className="font-fredoka text-sm font-semibold text-[#0F3B2C] mb-1.5 block">
                      Curved Text
                    </label>
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value.slice(0, 12))}
                      placeholder="Max 12 characters"
                      maxLength={12}
                      className="w-full bg-[#EEF8F1] border border-[#DDEFE3] rounded-2xl px-4 py-2.5 text-sm font-nunito text-[#0F3B2C] placeholder:text-[#A9BAB2] outline-none focus:border-[#14904F] focus:bg-white transition-colors"
                    />
                    <p className="text-[10px] text-[#8A9F96] font-nunito mt-1 text-right">
                      {textInput.length}/12
                    </p>
                  </div>

                  {/* Font selector */}
                  <div>
                    <label className="font-fredoka text-sm font-semibold text-[#0F3B2C] mb-1.5 block">
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
                              ? 'bg-[#E3263F] text-white shadow-[0_4px_14px_rgba(227,38,63,0.4)]'
                              : 'bg-white text-[#3E6B57] border border-[#DDEFE3] hover:border-[#9FD6B4]'
                            }
                          `}
                        >
                          <span style={{ fontFamily: f.value }}>{f.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text color */}
                  <div>
                    <label className="font-fredoka text-sm font-semibold text-[#0F3B2C] mb-1.5 block">
                      Text Color
                    </label>
                    <div className="flex gap-2 flex-wrap items-center">
                      {TEXT_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setTextColor(c.value)}
                          className={`
                            w-8 h-8 rounded-full transition-all cursor-pointer
                            ${textColor === c.value
                              ? 'ring-2 ring-[#E3263F] ring-offset-2 scale-110'
                              : 'ring-1 ring-[#C9E8D4] hover:ring-[#9FD6B4]'
                            }
                          `}
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        >
                        </button>
                      ))}
                      <label className="flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-fredoka font-semibold bg-white text-[#3E6B57] border border-[#DDEFE3] hover:border-[#9FD6B4] cursor-pointer transition-all">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-6 h-6 rounded-full cursor-pointer border-0 p-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
                          title="Choose custom color"
                        />
                        <span>Choose custom color</span>
                      </label>
                    </div>
                  </div>

                  {/* Outline selector */}
                  <div>
                    <label className="font-fredoka text-sm font-semibold text-[#0F3B2C] mb-1.5 block">
                      Outline
                    </label>
                    <div className="flex gap-2">
                      {OUTLINE_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => setTextOutline(o.value)}
                          className={`
                            flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-fredoka font-semibold
                            transition-all cursor-pointer
                            ${textOutline === o.value
                              ? 'bg-[#E3263F] text-white shadow-[0_4px_14px_rgba(227,38,63,0.4)]'
                              : 'bg-white text-[#3E6B57] border border-[#DDEFE3] hover:border-[#9FD6B4]'
                            }
                          `}
                        >
                          {o.value === 'white' && <span className="w-3 h-3 rounded-full border border-[#C9E8D4] bg-white inline-block" />}
                          {o.value === 'black' && <span className="w-3 h-3 rounded-full bg-black inline-block" />}
                          {o.value === 'none' && <span className="w-3 h-3 rounded-full border border-[#A9BAB2] inline-block" />}
                          <span>{o.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : activeCategory === 'pendant-bg' ? (
                activeCat ? (
                  <AssetGrid
                    categoryId={activeCat.id}
                    categorySlug={activeCat.slug}
                  />
                ) : (
                  <div className="bg-white rounded-2xl border border-[#DDEFE3] p-6 text-center">
                    <ImageOff size={28} className="mx-auto mb-2 text-[#8A9F96]" />
                    <p className="font-fredoka text-sm font-semibold text-[#0F3B2C]">
                      Pendant BG
                    </p>
                    <p className="text-[#8A9F96] font-nunito text-xs mt-1">
                      Add a "Pendant BG" category in Supabase to start assigning assets.
                    </p>
                  </div>
                )
              ) : activeCat ? (
                <AssetGrid
                  categoryId={activeCat.id}
                  categorySlug={activeCat.slug}
                />
              ) : (
                <div className="py-8 text-center">
                  <p className="text-[#8A9F96] font-nunito text-sm">Choose a category above to start.</p>
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
            <div className="w-full max-w-[300px] bg-white/80 backdrop-blur-sm rounded-2xl border border-[#DDEFE3] p-2.5 shadow-[0_2px_12px_rgba(20,144,79,0.08)]">
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
      </motion.main>

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