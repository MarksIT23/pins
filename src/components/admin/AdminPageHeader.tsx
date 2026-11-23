import type { ReactNode } from 'react'

/**
 * Title block used on every admin page: Fraunces title over a red-and-gold
 * ribbon rule, a short description, and optional actions on the right.
 */
export function AdminPageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col sm:flex-row sm:items-end gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="font-fredoka text-[32px] sm:text-[38px] leading-none font-extrabold text-[#0F3B2C] tracking-[-0.02em]">{title}</h1>
        <div className="mt-3 flex h-[5px] w-24 overflow-hidden rounded-full" aria-hidden="true">
          <span className="flex-1 bg-[#E3263F]" />
          <span className="w-3 bg-[#FFC23A]" />
          <span className="flex-1 bg-[#E3263F]" />
          <span className="w-3 bg-[#FFC23A]" />
          <span className="flex-1 bg-[#14904F]" />
        </div>
        {description && <p className="mt-3 text-[15px] text-[#3E6B57] font-nunito max-w-[60ch]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

/** A white gift tag on a string, for headline numbers on the dashboard. */
export function HangingTag({
  label,
  value,
  note,
  color,
  string = 28,
  delay = 0,
}: {
  label: string
  value: ReactNode
  note?: string
  color: string
  /** String length in px, so a row of tags hangs at different heights. */
  string?: number
  delay?: number
}) {
  return (
    <div className="flex flex-col items-center admin-tag-drop" style={{ animationDelay: `${delay}s` }}>
      <div className="w-[2px] bg-[#C98A0B]" style={{ height: string }} aria-hidden="true" />
      <div className="admin-tag-sway origin-top w-full" style={{ animationDelay: `${-delay * 3}s` }}>
        <div className="relative w-full bg-white rounded-[18px] pt-7 pb-4 px-4 text-center shadow-[0_10px_24px_rgba(15,59,44,.12)] border border-[#E4EFE8]">
          <span className="absolute left-1/2 -translate-x-1/2 top-2.5 w-3.5 h-3.5 rounded-full border-[3px] border-[#C98A0B] bg-[#F3F8F4]" aria-hidden="true" />
          <span className="absolute inset-x-0 top-0 h-1.5 rounded-t-[18px]" style={{ background: color }} aria-hidden="true" />
          <p className="font-fredoka font-extrabold text-[40px] leading-none text-[#0F3B2C] tabular-nums">{value}</p>
          <p className="mt-1.5 font-fredoka font-bold text-[15px] text-[#0F3B2C]">{label}</p>
          {note && <p className="text-xs font-nunito text-[#3E6B57] mt-0.5">{note}</p>}
        </div>
      </div>
    </div>
  )
}
