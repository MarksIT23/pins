import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF8F0]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center px-4"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
          className="text-7xl mb-4 block"
        >
          🌸
        </motion.span>
        <h1 className="font-fredoka text-4xl font-bold text-[#3D2B4F] mb-2">404</h1>
        <p className="text-[#7A5C8A] font-nunito mb-6">Oops! This page doesn't exist.</p>
        <Link
          to="/"
          className="px-6 py-3 bg-[#FF85A1] text-white rounded-full font-fredoka font-semibold hover:bg-[#ff6b90] transition-colors shadow-[0_4px_20px_rgba(255,133,161,0.4)]"
        >
          Go Home 🏠
        </Link>
      </motion.div>
    </div>
  )
}
