import { OrnamentMark } from './Header'

export function Footer() {
  return (
    <footer className="relative z-10 bg-[#0F3B2C] text-[#DDEFE3] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-3">
          <OrnamentMark size={30} />
          <div>
            <p className="font-fredoka font-bold text-white">PINS by WSSC</p>
            <p className="text-xs text-[#A9BAB2] font-nunito">Wesleyan Supreme Student Council</p>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-0.5 text-xs font-nunito text-[#A9BAB2]">
          <p>Website made by <span className="font-semibold text-white">Mark</span></p>
          <p>Assets drawn by <span className="font-semibold text-white">Stephanie</span></p>
        </div>
      </div>
    </footer>
  )
}
