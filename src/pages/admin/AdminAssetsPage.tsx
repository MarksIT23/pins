import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { AssetUploader } from '@/components/admin/AssetUploader'
import { AssetManager } from '@/components/admin/AssetManager'
import { useAllAssets, useAllCategories } from '@/hooks/useAssets'
import { Upload, Grid } from 'lucide-react'

const TABS = [
  { id: 'upload', label: 'Upload Assets', icon: <Upload size={16} /> },
  { id: 'manage', label: 'Manage Assets', icon: <Grid size={16} /> },
]

export function AdminAssetsPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { data: assets = [], isLoading: assetsLoading } = useAllAssets()
  const { data: categories = [] } = useAllCategories()

  const filteredAssets = useMemo(() => {
    let result = assets
    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((a) => {
        const cat = categories.find((c) => c.id === a.category_id)
        return cat?.slug === categoryFilter
      })
    }
    // Search filter
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      result = result.filter((a) => {
        const cat = categories.find((c) => c.id === a.category_id)
        const catName = cat?.name ?? ''
        const tags = a.tags?.join(' ') ?? ''
        return [a.name, catName, tags].some((field) => field.toLowerCase().includes(q))
      })
    }
    return result
  }, [assets, categoryFilter, searchQuery, categories])

  return (
    <div className="max-w-7xl mx-auto">
      <AdminPageHeader
        title="Assets"
        description={
          <>
            The parts customers build their pin from. {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''}
            {searchQuery && filteredAssets.length !== assets.length && ` (of ${assets.length})`} across {categories.length} categories.
          </>
        }
      />

      {/* Tab switcher */}
      <div className="flex gap-2 p-1 bg-white rounded-2xl border border-[#DDEFE3] w-fit mb-6">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-fredoka font-semibold transition-all
              ${activeTab === id
                ? 'bg-[#14904F] text-white shadow-[0_4px_14px_rgba(20,144,79,0.3)]'
                : 'text-[#3E6B57] hover:bg-[#EEF8F1]'
              }
            `}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-3xl border border-[#DDEFE3] p-5 sm:p-6 shadow-[0_2px_16px_rgba(20,144,79,0.08)]">
          <AssetUploader />
        </div>
      )}

      {/* Manage Tab */}
      {activeTab === 'manage' && (
        <div className="bg-white rounded-3xl border border-[#DDEFE3] p-5 sm:p-6 shadow-[0_2px_16px_rgba(20,144,79,0.08)]">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-4">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`
                px-4 py-2 rounded-2xl text-sm font-fredoka font-semibold transition-all
                ${categoryFilter === 'all'
                  ? 'bg-[#14904F] text-white'
                  : 'bg-[#DDEFE3] text-[#3E6B57] hover:bg-[#CDEBD8]'
                }
              `}
            >
              All ({assets.length})
            </button>
            {categories.map((cat) => {
              const count = assets.filter((a) => a.category_id === cat.id).length
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.slug)}
                  className={`
                    px-4 py-2 rounded-2xl text-sm font-fredoka font-semibold transition-all
                    ${categoryFilter === cat.slug
                      ? 'bg-[#14904F] text-white'
                      : 'bg-[#DDEFE3] text-[#3E6B57] hover:bg-[#CDEBD8]'
                    }
                  `}
                >
                  {cat.name} ({count})
                </button>
              )
            })}
          </div>

          {/* Search bar */}
          <div className="relative mb-5">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A9F96]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, category, or tags..."
              className="w-full bg-[#EEF8F1] border border-[#DDEFE3] rounded-2xl pl-10 pr-4 py-2.5 text-sm font-nunito text-[#0F3B2C] placeholder:text-[#A9BAB2] outline-none focus:border-[#14904F] focus:bg-white transition-colors"
            />
          </div>

          {assetsLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl shimmer" />
              ))}
            </div>
          ) : (
            <AssetManager
              assets={filteredAssets}
              categories={categories}
              selectedCategory={categoryFilter}
            />
          )}
        </div>
      )}
    </div>
  )
}
