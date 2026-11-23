import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// Pages
import { HomePage } from '@/pages/HomePage'
import { CreatorPage } from '@/pages/CreatorPage'
import { OrderSuccessPage } from '@/pages/OrderSuccessPage'
import { TrackOrderPage } from '@/pages/TrackOrderPage'
import { ShopPage } from '@/pages/ShopPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// Admin (hidden — URL-accessible only, no public links)
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage'
import { AdminAssetsPage } from '@/pages/admin/AdminAssetsPage'
import { AdminShopPage } from '@/pages/admin/AdminShopPage'
import { RequireAuth } from '@/components/admin/AdminLayout'
import { IntroSplash } from '@/components/layout/IntroSplash'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

/** Restores SPA routing after GitHub Pages 404 redirect. */
function RedirectHandler() {
  const navigate = useNavigate()
  useEffect(() => {
    const redirect = sessionStorage.getItem('redirect')
    if (redirect) {
      sessionStorage.removeItem('redirect')
      try {
        const url = new URL(redirect)
        navigate(url.pathname.replace('/pins', '') + url.search + url.hash, { replace: true })
      } catch { /* ignore */ }
    }
  }, [navigate])
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/pins">
        <RedirectHandler />
        <IntroSplash />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatorPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/shop" element={<ShopPage />} />

          {/* Admin (URL-accessible only) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/assets" element={<AdminAssetsPage />} />
            <Route path="/admin/shop" element={<AdminShopPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: "'Figtree', sans-serif",
            fontSize: '14px',
            borderRadius: '14px',
            background: '#fff',
            color: '#0F3B2C',
            border: '1px solid #DDEFE3',
            boxShadow: '0 8px 32px rgba(20,144,79,0.15)',
          },
          success: {
            iconTheme: { primary: '#16A05A', secondary: '#D3F2DD' },
          },
          error: {
            iconTheme: { primary: '#E3263F', secondary: '#FFD9DE' },
          },
        }}
      />
    </QueryClientProvider>
  )
}
