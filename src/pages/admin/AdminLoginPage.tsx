import { OrnamentMark } from '@/components/layout/Header'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAdminSignIn } from '@/hooks/useAdmin'
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
    <div className="min-h-screen bg-[#0F3B2C] flex items-start sm:items-center pt-6 sm:pt-0 justify-center px-4 relative overflow-hidden">
      <SparkleBackground density={0.5} color="255, 255, 255" />
      <div className="string-lights" style={{ top: 0, bottom: "auto" }} aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => <span key={i} />)}
      </div>

      <motion.div
        initial={{ y: -500 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 11 }}
        className="relative z-10 w-full max-w-sm flex flex-col items-center"
      >
        {/* string the tag hangs from */}
        <div className="w-[2px] h-16 sm:h-24 bg-[#FFC23A]" aria-hidden="true" />

        <div className="relative w-full bg-white rounded-[28px] px-7 pt-12 pb-7 shadow-[0_24px_60px_rgba(0,0,0,.35)]">
          <span className="absolute left-1/2 -translate-x-1/2 top-4 w-5 h-5 rounded-full border-4 border-[#FFC23A] bg-[#0F3B2C]" aria-hidden="true" />
          <div className="absolute inset-3 rounded-[20px] border-2 border-dashed border-[#DDEFE3] pointer-events-none" aria-hidden="true" />

          <div className="relative flex flex-col items-center mb-7 text-center">
            <OrnamentMark size={52} />
            <h1 className="mt-3 font-fredoka text-[28px] leading-tight font-extrabold text-[#0F3B2C]">PINS Workshop</h1>
            <p className="text-sm text-[#3E6B57] font-nunito mt-1">Sign in to manage orders and designs.</p>
          </div>

          <form onSubmit={handleLogin} className="relative space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@wssc.edu"
              autoComplete="username"
              required
              id="admin-email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              id="admin-password"
            />

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#E3263F] text-white font-fredoka font-bold text-base py-3.5 shadow-[0_5px_0_#B5142B] active:translate-y-[3px] active:shadow-[0_2px_0_#B5142B] transition-transform disabled:opacity-70"
            >
              {isPending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
