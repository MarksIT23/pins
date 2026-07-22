import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Home, Sparkles } from 'lucide-react'
import { SparkleBackground } from '@/components/layout/SparkleBackground'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { useCharacterStore } from '@/store/characterStore'

export function OrderSuccessPage() {
  const [params] = useSearchParams()
  const orderNumber = params.get('order')
  const { resetCharacter } = useCharacterStore()

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] relative">
      <SparkleBackground />
      <Header />

      <main className="flex-1 relative z-10 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">

          {/* Animated success icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex justify-center mb-6"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D8F3DC] to-[#52B788] flex items-center justify-center shadow-[0_8px_32px_rgba(82,183,136,0.4)]">
              <CheckCircle size={48} className="text-white" />
            </div>
          </motion.div>

          {/* Floating emojis */}
          <div className="flex justify-center gap-3 mb-6">
            {['🎉', '🎀', '✨', '🌸', '🎊'].map((e, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="text-2xl"
              >
                {e}
              </motion.span>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="font-fredoka text-4xl font-bold text-[#3D2B4F] mb-3">
              Order Submitted! 🎀
            </h1>

            {orderNumber && (
              <div className="bg-white rounded-2xl border border-[#FFD6E8] px-5 py-3 mb-4 inline-block">
                <p className="text-xs text-[#B8A0C8] font-nunito mb-1">Your Order Number</p>
                <p className="font-fredoka text-xl font-bold text-[#FF85A1]">{orderNumber}</p>
              </div>
            )}

            <p className="text-[#7A5C8A] font-nunito leading-relaxed mb-8">
              Thank you for your order! 💜 We've received your pin design and will be in touch.
            </p>

            <div className="bg-[#F8F0FF] rounded-2xl p-4 mb-8 text-left border border-[#E8D9FF]">
              <h3 className="font-fredoka font-semibold text-[#3D2B4F] mb-2 text-sm">What's Next?</h3>
              <ul className="space-y-2">
                <li className="text-sm text-[#7A5C8A] font-nunito flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">1️⃣</span>
                  <span>Kindly visit the <strong>WU-P SSC Office</strong> located at the <strong>1st Floor of ComSci Building</strong> to review and pay for your order.</span>
                </li>
                <li className="text-sm text-[#7A5C8A] font-nunito flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">2️⃣</span>
                  <span>After your order has been reviewed, confirmed, and paid, it will go into production.</span>
                </li>
                <li className="text-sm text-[#7A5C8A] font-nunito flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">3️⃣</span>
                  <span>Pick up at the <strong>WU-P SSC Office</strong> once an announcement has been posted.</span>
                </li>
              </ul>

              <div className="mt-4 pt-3 border-t border-[#E8D9FF]">
                <p className="text-xs text-[#B8A0C8] font-nunito mb-2">Follow us for updates:</p>
                <div className="flex gap-3">
                  <a
                    href="https://web.facebook.com/WUPSSCOfficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2] text-white text-xs font-fredoka font-semibold hover:opacity-90 transition-opacity"
                  >
                    <span>f</span>
                    <span>Facebook</span>
                  </a>
                  <a
                    href="https://www.instagram.com/wupssc.official/?hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white text-xs font-fredoka font-semibold hover:opacity-90 transition-opacity"
                  >
                    <span>📸</span>
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/">
                <Button variant="secondary" leftIcon={<Home size={16} />}>
                  Back to Home
                </Button>
              </Link>
              <Link to="/create" onClick={resetCharacter}>
                <Button variant="primary" leftIcon={<Sparkles size={16} />}>
                  Create Another
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
