import { OrnamentMark } from '@/components/layout/Header'
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
    <div className="min-h-screen bg-[#FBFDF9] flex items-center justify-center px-4 relative">
      <SparkleBackground />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="bg-white rounded-4xl border border-[#FFD9DE] shadow-[0_16px_64px_rgba(227,38,63,0.2)] p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-3 animate-swing origin-top"><OrnamentMark size={64} /></div>
            <h1 className="font-fredoka text-2xl font-bold text-[#0F3B2C]">Admin Login</h1>
            <p className="text-sm text-[#8A9F96] font-nunito mt-1">PINS admin for WSSC</p>
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
