import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// Pages
import { HomePage } from '@/pages/HomePage'
import { CreatorPage } from '@/pages/CreatorPage'
import { OrderSuccessPage } from '@/pages/OrderSuccessPage'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage'
import { AdminAssetsPage } from '@/pages/admin/AdminAssetsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// Admin auth guard + layout
import { RequireAuth } from '@/components/admin/AdminLayout'

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
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatorPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />

          {/* Admin auth */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected admin routes */}
          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/assets" element={<AdminAssetsPage />} />
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
            fontFamily: "'Nunito', sans-serif",
            fontSize: '14px',
            borderRadius: '16px',
            background: '#fff',
            color: '#3D2B4F',
            border: '1px solid #F0E6FF',
            boxShadow: '0 8px 32px rgba(176,127,255,0.15)',
          },
          success: {
            iconTheme: { primary: '#52B788', secondary: '#D8F3DC' },
          },
          error: {
            iconTheme: { primary: '#FF85A1', secondary: '#FFD6E8' },
          },
        }}
      />
    </QueryClientProvider>
  )
}
