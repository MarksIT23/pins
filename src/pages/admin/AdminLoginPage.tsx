import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useAdminSignIn } from '@/hooks/useAdmin'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Badge'
import { SparkleBackground } from '@/components/layout/SparkleBackground'

export function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { mutateAsync: signIn, isPending } = useAdminSignIn()
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    try {
      await signIn({ email, password })
      navigate('/admin')
    } catch {
      // error handled in hook
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-4 relative">
      <SparkleBackground />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="bg-white rounded-4xl border border-[#FFD6E8] shadow-[0_16px_64px_rgba(255,133,161,0.2)] p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#FF85A1] to-[#B07FFF] flex items-center justify-center text-white text-3xl shadow-[0_8px_24px_rgba(176,127,255,0.4)] mb-3"
            >
              🎀
            </motion.div>
            <h1 className="font-fredoka text-2xl font-bold text-[#3D2B4F]">Admin Login</h1>
            <p className="text-sm text-[#B8A0C8] font-nunito mt-1">PINS • WSSC Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@wssc.edu"
              required
              id="admin-email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              id="admin-password"
            />

            <Button
              type="submit"
              variant="admin"
              size="md"
              className="w-full mt-2"
              isLoading={isPending}
              leftIcon={<Sparkles size={18} />}
            >
              Sign In
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
