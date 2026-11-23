import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CharacterConfig, TextOverlay } from '@/types'
import { LAYER_ORDER } from '@/utils/layerOrder'

interface CharacterStore {
  config: CharacterConfig
  activeCategory: string
  setActiveCategory: (slug: string) => void
  setLayer: (categorySlug: string, assetId: string | null) => void
  setTextOverlay: (overlay: TextOverlay | null) => void
  resetCharacter: () => void
  getSelectedForCategory: (slug: string) => string | null
  /** False on a fresh or just-reset design, until the starter parts are filled in. */
  defaultsApplied: boolean
  applyDefaults: (defaults: Record<string, string>) => void
}

const DEFAULT_CONFIG: CharacterConfig = {
  background: null,
  pendants: null,
  'pendant-bg': null,
  base: null,
  eyes: null,
  eyebrows: null,
  lips: null,
  clothes: null,
  'christmas-outfit': null,
  hair: null,
  glasses: null,
  college: null,
  accessories: null,
  textOverlay: null,
}

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      config: { ...DEFAULT_CONFIG },
      activeCategory: 'base',
      defaultsApplied: false,

      // Fill only empty slots, so nothing the customer picked is overwritten.
      applyDefaults: (defaults) => {
        set((state) => {
          const config = { ...state.config }
          for (const [slug, id] of Object.entries(defaults)) {
            const key = slug as keyof typeof config
            if (!config[key]) (config as Record<string, unknown>)[slug] = id
          }
          return { config, defaultsApplied: true }
        })
      },

      setActiveCategory: (slug) => set({ activeCategory: slug }),

      setLayer: (categorySlug, assetId) => {
        set((state) => ({
          config: {
            ...state.config,
            [categorySlug]: assetId,
          },
        }))
      },

      setTextOverlay: (overlay) => {
        set((state) => ({
          config: {
            ...state.config,
            textOverlay: overlay,
          },
        }))
      },

      resetCharacter: () => {
        set({ config: { ...DEFAULT_CONFIG }, defaultsApplied: false })
      },

      getSelectedForCategory: (slug): string | null => {
        const config = get().config
        const val = config[slug as keyof CharacterConfig]
        // val can be string | TextOverlay | null | undefined
        // Asset categories always hold string IDs, so narrow the type
        if (typeof val !== 'string') return null
        return val
      },
    }),
    {
      name: 'pins-character-config',
      version: 1,
    }
  )
)

/**
 * Derive ordered layers for Konva rendering from config.
 * Returns array sorted by layer_order ascending.
 */
export function deriveRenderedLayers(
  config: CharacterConfig,
  assetMap: Map<string, { file_url: string; category_slug: string }>
) {
  const layers: { slug: string; assetId: string; fileUrl: string; layerOrder: number }[] = []

  for (const [slug, assetId] of Object.entries(config)) {
    if (slug === 'textOverlay') continue
    if (!assetId) continue
    const asset = assetMap.get(assetId)
    if (!asset) continue
    layers.push({
      slug,
      assetId,
      fileUrl: asset.file_url,
      layerOrder: LAYER_ORDER[slug] ?? 99,
    })
  }

  return layers.sort((a, b) => a.layerOrder - b.layerOrder)
}
