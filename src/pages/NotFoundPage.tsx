import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SparkleBackground } from '@/components/layout/SparkleBackground'
import { OrnamentMark } from '@/components/layout/Header'

export function NotFoundPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#FBFDF9]">
      <SparkleBackground />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center px-4"
      >
        <motion.div
          initial={{ y: -200 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 9 }}
          className="mb-5 origin-top"
        >
          <div className="animate-swing origin-top flex flex-col items-center">
            <div className="w-[2px] h-16 bg-[#FFC23A]" />
            <OrnamentMark size={88} />
          </div>
        </motion.div>
        <h1 className="font-fredoka text-5xl font-extrabold text-[#0F3B2C] mb-2">404</h1>
        <p className="text-[#3E6B57] font-nunito mb-7">This page isn't on the tree. Check the link, or head back home.</p>
        <Link
          to="/"
          className="px-6 py-3 bg-[#E3263F] text-white rounded-full font-fredoka font-semibold hover:bg-[#C41C33] transition-colors"
        >
          Go to home
        </Link>
      </motion.div>
    </div>
  )
}
