import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Star } from 'lucide-react'
import { SparkleBackground } from '@/components/layout/SparkleBackground'
import { Button } from '@/components/ui/Button'

const STEPS = [
  { num: '01', title: 'Choose a Base', desc: 'Pick a male or female chibi body.' },
  { num: '02', title: 'Customize', desc: 'Add hair, clothes, glasses, accessories & more.' },
  { num: '03', title: 'Order', desc: 'Fill in your details and submit your pin request.' },
]

export function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <SparkleBackground />

      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-16 pb-12 sm:pt-24 sm:pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#FFD6E8] rounded-full px-4 py-2 mb-6 shadow-[0_2px_12px_rgba(255,133,161,0.15)]"
        >
          <Star size={14} className="text-[#FFAB76] fill-[#FFAB76]" />
          <span className="text-xs font-fredoka font-semibold text-[#7A5C8A]">
            Wesleyan Supreme Student Council
          </span>
          <Star size={14} className="text-[#FFAB76] fill-[#FFAB76]" />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-fredoka text-5xl sm:text-7xl font-bold text-[#3D2B4F] leading-tight mb-4"
        >
          Design Your
          <br />
          <span className="bg-gradient-to-r from-[#FF85A1] via-[#B07FFF] to-[#5BBCFF] bg-clip-text text-transparent">
            Chibi Pin!
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg text-[#7A5C8A] font-nunito text-lg leading-relaxed mb-8"
        >
          Create your very own custom character pin! Mix and match adorable parts,
          preview your design live, and place your order — all in one place. 🎀
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 items-center"
        >
          <Link to="/create">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight size={20} />}>
              Start Creating
            </Button>
          </Link>
          <p className="text-sm text-[#B8A0C8] font-nunito">Free to design • No account needed</p>
        </motion.div>

        {/* Floating emoji row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4 mt-12 text-3xl sm:text-4xl"
        >
          {['🧸', '🎀', '✨', '🌸', '💜', '⭐', '🌈'].map((emoji, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.15 }}
              className="cursor-default select-none"
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>
      </section>

      {/* ─── How it Works ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 pb-20 max-w-4xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-fredoka text-3xl sm:text-4xl font-bold text-center text-[#3D2B4F] mb-10"
        >
          How It Works 🌟
        </motion.h2>

        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex-1 flex flex-col items-center text-center"
            >
              {/* Number bubble */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF85A1] to-[#B07FFF] flex items-center justify-center text-white font-fredoka font-bold text-xl shadow-[0_4px_16px_rgba(255,133,161,0.4)] mb-4">
                {step.num}
              </div>
              <h3 className="font-fredoka text-lg font-semibold text-[#3D2B4F] mb-2">{step.title}</h3>
              <p className="text-sm text-[#7A5C8A] font-nunito">{step.desc}</p>

              {/* Arrow connector */}
              {i < STEPS.length - 1 && (
                <div className="hidden sm:block absolute translate-x-full top-7 text-[#FFD6E8]">
                  <ArrowRight size={24} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mt-12"
        >
          <Link to="/create">
            <Button variant="primary" size="lg" leftIcon={<Sparkles size={20} />}>
              Create My Pin Now!
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
