import { motion } from 'framer-motion'
import { AssetCategory } from '@/types'
import { CATEGORY_UI } from '@/utils/layerOrder'
import { useCharacterStore } from '@/store/characterStore'

interface CategoryPanelProps {
  categories: AssetCategory[]
}

export function CategoryPanel({ categories }: CategoryPanelProps) {
  const { activeCategory, setActiveCategory } = useCharacterStore()

  return (
    <div className="w-full">
      <p className="font-fredoka text-sm font-semibold text-[#B8A0C8] mb-2 px-1">Customize</p>
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => {
          const ui = CATEGORY_UI[cat.slug] ?? { icon: '🎀', label: cat.name }
          const isActive = activeCategory === cat.slug

          return (
            <motion.button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              whileTap={{ scale: 0.93 }}
              className={`
                relative flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-fredoka
                font-semibold transition-all duration-200 select-none cursor-pointer
                ${isActive
                  ? 'bg-gradient-to-r from-[#FF85A1] to-[#B07FFF] text-white shadow-[0_4px_14px_rgba(255,133,161,0.4)]'
                  : 'bg-white text-[#7A5C8A] border border-[#F0E6FF] hover:border-[#C8B0FF] hover:bg-[#F8F0FF]'
                }
              `}
            >
              <span>{ui.icon}</span>
              <span className="hidden sm:inline">{ui.label}</span>

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
