import { useState } from 'react'
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
  const { data: assets = [], isLoading: assetsLoading } = useAllAssets()
  const { data: categories = [] } = useAllCategories()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-fredoka text-3xl font-bold text-[#3D2B4F]">Assets 🖼️</h1>
        <p className="text-[#B8A0C8] font-nunito text-sm mt-1">
          {assets.length} total asset{assets.length !== 1 ? 's' : ''} • {categories.length} categories
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 p-1 bg-white rounded-2xl border border-[#F0E6FF] w-fit mb-6">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-fredoka font-semibold transition-all
              ${activeTab === id
                ? 'bg-gradient-to-r from-[#B07FFF] to-[#FF85A1] text-white shadow-[0_4px_14px_rgba(176,127,255,0.3)]'
                : 'text-[#7A5C8A] hover:bg-[#F8F0FF]'
              }
            `}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-3xl border border-[#F0E6FF] p-5 sm:p-6 shadow-[0_2px_16px_rgba(176,127,255,0.08)]">
          <AssetUploader />
        </div>
      )}

      {/* Manage Tab */}
      {activeTab === 'manage' && (
        <div className="bg-white rounded-3xl border border-[#F0E6FF] p-5 sm:p-6 shadow-[0_2px_16px_rgba(176,127,255,0.08)]">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-5">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`
                px-4 py-2 rounded-2xl text-sm font-fredoka font-semibold transition-all
                ${categoryFilter === 'all'
                  ? 'bg-[#B07FFF] text-white'
                  : 'bg-[#F0E6FF] text-[#7A5C8A] hover:bg-[#E8D9FF]'
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
                      ? 'bg-[#B07FFF] text-white'
                      : 'bg-[#F0E6FF] text-[#7A5C8A] hover:bg-[#E8D9FF]'
                    }
                  `}
                >
                  {cat.icon ?? '🎀'} {cat.name} ({count})
                </button>
              )
            })}
          </div>

          {assetsLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl shimmer" />
              ))}
            </div>
          ) : (
            <AssetManager
              assets={assets}
              categories={categories}
              selectedCategory={categoryFilter}
            />
          )}
        </div>
      )}
    </div>
  )
}
