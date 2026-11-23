import { OrnamentMark } from '@/components/layout/Header'
import { useState } from 'react'
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Package, ShoppingBag, Store, LogOut, Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAdminSignOut } from '@/hooks/useAdmin'

// ─── RequireAuth ──────────────────────────────────────────────────────────────
import { useEffect, useState as useS } from 'react'
import { Session } from '@supabase/supabase-js'

export function RequireAuth() {
  const [session, setSession] = useS<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFDF9]">
        <div className="w-10 h-10 border-4 border-[#E3263F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <Navigate to="/admin/login" replace />
  return <AdminLayout />
}

// ─── Admin Layout ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/admin',        icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/orders', icon: ShoppingBag,     label: 'Orders' },
  { to: '/admin/assets', icon: Package,         label: 'Assets' },
  { to: '/admin/shop',   icon: Store,           label: 'Pin Shop' },
]

function AdminLayout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { mutate: signOut } = useAdminSignOut()

  return (
    <div className="min-h-screen flex bg-[#EEF8F1]">
      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 w-64 bg-white border-r border-[#DDEFE3]
          shadow-[4px_0_24px_rgba(20,144,79,0.1)] transition-transform duration-300
          flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-5 border-b border-[#DDEFE3]">
          <div className="flex items-center gap-2">
            <OrnamentMark size={34} />
            <div>
              <p className="font-fredoka font-bold text-[#0F3B2C] text-base leading-none">PINS Admin</p>
              <p className="text-[10px] text-[#8A9F96] font-nunito">WSSC Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl font-fredoka font-semibold
                  transition-all text-sm
                  ${isActive
                    ? 'bg-[#14904F] text-white shadow-[0_4px_16px_rgba(20,144,79,0.4)]'
                    : 'text-[#3E6B57] hover:bg-[#DDEFE3]'
                  }
                `}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-[#DDEFE3]">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-fredoka text-sm text-red-400 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#DDEFE3] px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-[#DDEFE3] transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} className="text-[#3E6B57]" />
          </button>
          <h2 className="font-fredoka font-semibold text-[#0F3B2C] text-lg">
            {NAV_ITEMS.find((n) => n.to === location.pathname)?.label ?? 'Admin'}
          </h2>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
