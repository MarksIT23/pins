import { motion } from 'framer-motion'
import { useDashboardStats } from '@/hooks/useOrders'
import { StatCard } from '@/components/ui/Card'
import { Link } from 'react-router-dom'

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-fredoka text-3xl font-bold text-[#3D2B4F]">Dashboard 🎀</h1>
        <p className="text-[#B8A0C8] font-nunito text-sm mt-1">Overview of your pin orders and assets</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-3xl shimmer" />
          ))
        ) : (
          <>
            <StatCard label="Total Orders"    value={stats?.total_orders ?? 0}       icon="📦" color="bg-[#FFD6E8]" />
            <StatCard label="Pending"         value={stats?.pending_orders ?? 0}     icon="⏳" color="bg-[#FFF3CD]" />
            <StatCard label="In Production"   value={stats?.in_production_orders ?? 0} icon="🎨" color="bg-[#E8D9FF]" />
            <StatCard label="Completed"       value={stats?.completed_orders ?? 0}   icon="✅" color="bg-[#D8F3DC]" />
          </>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { to: '/admin/orders', icon: '📋', title: 'Manage Orders', desc: 'View and update order statuses', color: 'from-[#FFD6E8] to-[#E8D9FF]' },
          { to: '/admin/assets', icon: '🖼️', title: 'Manage Assets', desc: 'Upload, edit, and delete character assets', color: 'from-[#D8EEFF] to-[#D8F3DC]' },
        ].map(({ to, icon, title, desc, color }) => (
          <Link key={to} to={to}>
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`bg-gradient-to-br ${color} rounded-3xl p-6 border border-white/80 shadow-[0_4px_20px_rgba(176,127,255,0.12)] cursor-pointer`}
            >
              <div className="text-4xl mb-3">{icon}</div>
              <h3 className="font-fredoka text-lg font-bold text-[#3D2B4F]">{title}</h3>
              <p className="text-sm text-[#7A5C8A] font-nunito mt-1">{desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}
