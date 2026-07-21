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
}

const DEFAULT_CONFIG: CharacterConfig = {
  background: null,
  pendants: null,
  base: null,
  clothes: null,
  hair: null,
  glasses: null,
  accessories: null,
  textOverlay: null,
}

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      config: { ...DEFAULT_CONFIG },
      activeCategory: 'base',

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
        set({ config: { ...DEFAULT_CONFIG } })
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
