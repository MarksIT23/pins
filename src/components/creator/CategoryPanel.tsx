import { motion } from 'framer-motion'
import { AssetCategory } from '@/types'
import { CATEGORY_UI, BUTTON_ORDER } from '@/utils/layerOrder'
import { useCharacterStore } from '@/store/characterStore'

const PSEUDO_CATEGORIES = [
  { slug: 'text', label: 'Text' },
]

interface CategoryPanelProps {
  categories: AssetCategory[]
}

export function CategoryPanel({ categories }: CategoryPanelProps) {
  const { activeCategory, setActiveCategory } = useCharacterStore()

  // Merge DB categories with pseudo-categories, sorted by button order
  const allButtons = [...categories, ...PSEUDO_CATEGORIES.map((p) => ({ ...p, id: p.slug }))]
  const order = new Map(BUTTON_ORDER.map((s, i) => [s, i]))
  allButtons.sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99))

  return (
    <div className="w-full">
      <p className="font-fredoka text-sm font-semibold text-[#B8A0C8] mb-2 px-1">Customize</p>
      <div className="flex gap-2 flex-wrap">
        {allButtons.map((cat) => {
          const key = cat.slug
          const label = CATEGORY_UI?.[cat.slug]?.label ?? (cat as any).name ?? cat.slug
          const isActive = activeCategory === cat.slug

          return (
            <motion.button
              key={key}
              onClick={() => setActiveCategory(cat.slug)}
              whileTap={{ scale: 0.93 }}
              className={`
                relative flex items-center px-3 py-2 rounded-2xl text-sm font-fredoka
                font-semibold transition-all duration-200 select-none cursor-pointer
                ${isActive
                  ? 'bg-gradient-to-r from-[#FF85A1] to-[#B07FFF] text-white shadow-[0_4px_14px_rgba(255,133,161,0.4)]'
                  : 'bg-white text-[#7A5C8A] border border-[#F0E6FF] hover:border-[#C8B0FF] hover:bg-[#F8F0FF]'
                }
              `}
            >
              <span>{label}</span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.span
                  layoutId="cat-active"
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FFAB76] rounded-full border-2 border-white"
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
