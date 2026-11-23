import { OrnamentMark } from '@/components/layout/Header'
import { useState } from 'react'
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Store, LogOut, Menu, X, ExternalLink } from 'lucide-react'
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

/**
 * The "workshop desk": a pine-green sidebar with string lights down its edge and
 * gift-tag shaped nav items, over dotted ledger paper.
 */
function AdminLayout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { mutate: signOut } = useAdminSignOut()
  const current = NAV_ITEMS.find((n) => n.to === location.pathname)?.label ?? 'Admin'

  return (
    <div className="min-h-screen flex admin-paper">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-[#0F3B2C]/40 backdrop-blur-[2px] lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 w-64 bg-[#0F3B2C] text-[#CDEBD8]
          transition-transform duration-300 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="admin-lights" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => <span key={i} />)}
        </div>

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 flex items-center gap-3">
          <span className="animate-swing origin-top"><OrnamentMark size={40} /></span>
          <div className="min-w-0">
            <p className="font-fredoka font-extrabold text-white text-xl leading-none">PINS Workshop</p>
            <p className="text-xs text-[#9FD6B4] font-nunito mt-1">WSSC admin</p>
          </div>
          <button className="ml-auto lg:hidden p-1.5 rounded-lg text-[#9FD6B4] hover:bg-white/10" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        {/* Nav: gift tags */}
        <nav className="flex-1 px-4 pt-2 space-y-1.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  admin-nav-tag flex items-center gap-3 pr-4 py-3 font-fredoka font-bold text-[15px] transition-colors
                  ${isActive ? 'bg-[#FFC23A] text-[#0F3B2C]' : 'text-[#CDEBD8] hover:bg-white/10 hover:text-white'}
                `}
              >
                <Icon size={18} strokeWidth={2.2} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer actions */}
        <div className="px-4 pb-5 pt-4 space-y-1 border-t border-white/10">
          <a
            href={`${import.meta.env.BASE_URL}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-fredoka font-semibold text-sm text-[#CDEBD8] hover:bg-white/10 hover:text-white transition-colors"
          >
            <ExternalLink size={17} /> View the site
          </a>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl font-fredoka font-semibold text-sm text-[#FF8FA3] hover:bg-white/10 transition-colors"
          >
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      {/* ─── Main ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-10 bg-[#0F3B2C] text-white px-3 h-14 flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-white/10 transition-colors" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <OrnamentMark size={26} />
          <p className="font-fredoka font-bold text-lg">{current}</p>
          <div className="string-lights" aria-hidden="true">
            {Array.from({ length: 22 }).map((_, i) => <span key={i} />)}
          </div>
        </div>

        <main className="flex-1 px-4 sm:px-8 pt-8 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
