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
              <div className="bg-white rounded-2xl border-2 border-[#FF85A1] px-6 py-4 mb-4 inline-block shadow-[0_4px_24px_rgba(255,133,161,0.3)]">
                <p className="text-xs text-[#B8A0C8] font-nunito mb-1">Your Order Number</p>
                <p className="font-fredoka text-3xl font-bold text-[#FF85A1] tracking-wider">{orderNumber}</p>
                <p className="text-xs text-[#FF85A1] font-fredoka font-semibold mt-2">📌 Please save this order number for reviewing</p>
              </div>
            )}

            <div className="bg-[#F8F0FF] rounded-2xl p-4 mb-4 text-left border border-[#E8D9FF]">
              <h3 className="font-fredoka font-semibold text-[#3D2B4F] mb-2 text-sm">What's Next?</h3>
              <ul className="space-y-3">
                <li className="text-sm text-[#7A5C8A] font-nunito flex items-start gap-3">
                  <span className="flex-shrink-0 text-lg mt-0.5">🏢</span>
                  <span>Kindly visit the <strong>WU-P SSC Office</strong> located at the <strong>1st Floor of ComSci Building</strong> to review and pay for your order.</span>
                </li>
                <li className="text-sm text-[#7A5C8A] font-nunito flex items-start gap-3">
                  <span className="flex-shrink-0 text-lg mt-0.5">⚙️</span>
                  <span>After your order has been reviewed, confirmed, and paid, it will go into production.</span>
                </li>
                <li className="text-sm text-[#7A5C8A] font-nunito flex items-start gap-3">
                  <span className="flex-shrink-0 text-lg mt-0.5">📦</span>
                  <span>Pick up at the <strong>WU-P SSC Office</strong> once an announcement has been posted.</span>
                </li>
              </ul>

              <div className="mt-5 pt-4 border-t border-[#E8D9FF] text-center">
                <p className="text-sm text-[#7A5C8A] font-fredoka font-semibold mb-3">Follow us for updates!</p>
                <div className="flex gap-4 justify-center">
                  <a
                    href="https://web.facebook.com/WUPSSCOfficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1877F2] text-white text-sm font-fredoka font-semibold hover:shadow-[0_4px_16px_rgba(24,119,242,0.4)] hover:-translate-y-0.5 transition-all"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    <span>Facebook</span>
                  </a>
                  <a
                    href="https://www.instagram.com/wupssc.official/?hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white text-sm font-fredoka font-semibold hover:shadow-[0_4px_16px_rgba(221,42,123,0.4)] hover:-translate-y-0.5 transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="currentColor"/></svg>
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </div>

            <p className="text-[#7A5C8A] font-nunito leading-relaxed mb-6">
              Thank you for your order! 💜 We've received your pin design and will be in touch.
            </p>

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
