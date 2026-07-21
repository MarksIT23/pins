import { Link } from 'react-router-dom'
import { Heart, Sparkles } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-[#FFD6E8]/50 bg-white/60 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎀</span>
          <div>
            <p className="font-fredoka font-semibold text-[#3D2B4F]">PINS by WSSC</p>
            <p className="text-xs text-[#B8A0C8] font-nunito">Wesleyan Supreme Student Council</p>
          </div>
        </div>

        <div className="flex items-center gap-4 font-nunito text-[#7A5C8A]">
          <Link to="/" className="hover:text-[#FF85A1] transition-colors">Home</Link>
          <Link to="/create" className="hover:text-[#FF85A1] transition-colors">Create</Link>
        </div>

        <p className="flex items-center gap-1 text-[#B8A0C8] font-nunito text-xs">
          Made with <Heart size={12} className="text-[#FF85A1] fill-[#FF85A1]" /> & <Sparkles size={12} className="text-[#B07FFF]" />
        </p>
      </div>
    </footer>
  )
}
