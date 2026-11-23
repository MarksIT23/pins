export type PinVariant = 'santa' | 'elf' | 'reindeer' | 'earmuffs'

interface ChibiPinProps {
  variant: PinVariant
  /** Face background behind the character. */
  bg?: string
  hair?: string
  sweater?: string
  /** Unique id prefix so several pins can share one SVG without clipPath clashes. */
  id: string
}

/**
 * A small button-pin with an original chibi face, drawn at radius 40 around (0,0).
 * Scale it with a parent <g transform>. The cap and loop sit above, at y ≈ -50.
 */
export function ChibiPin({ variant, bg = '#DDF1FC', hair = '#4A2E22', sweater = '#E3263F', id }: ChibiPinProps) {
  return (
    <g>
      <defs>
        <clipPath id={`${id}-clip`}><circle r="34" /></clipPath>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE8A3" />
          <stop offset="55%" stopColor="#FFC23A" />
          <stop offset="100%" stopColor="#E89B12" />
        </linearGradient>
      </defs>

      {/* cap + loop */}
      <circle cx="0" cy="-51" r="3.6" fill="none" stroke="#FFC23A" strokeWidth="2.2" />
      <rect x="-7" y="-48" width="14" height="9" rx="2" fill={`url(#${id}-rim)`} />

      {/* rim + face */}
      <circle r="40" fill={`url(#${id}-rim)`} />
      <circle r="34" fill={bg} />

      <g clipPath={`url(#${id}-clip)`}>
        <ellipse cx="0" cy="38" rx="27" ry="17" fill={sweater} />
        <path d="M-14 30h28" stroke="#fff" strokeWidth="2.4" strokeDasharray="3 3.5" strokeLinecap="round" />
        <circle cx="0" cy="5" r="19" fill="#FBD9C2" />
        <path d="M-19.5 4C-20-15 20-15 19.5 4c-6-6-12-7.5-19.5-5.5C-7-3.5-13-2-19.5 4z" fill={hair} />
        <circle cx="-7" cy="8" r="2.6" fill="#0F3B2C" />
        <circle cx="7" cy="8" r="2.6" fill="#0F3B2C" />
        <circle cx="-6.2" cy="7" r=".9" fill="#fff" />
        <circle cx="7.8" cy="7" r=".9" fill="#fff" />
        <ellipse cx="-11.5" cy="13.5" rx="3.6" ry="2.1" fill="#FF8FA3" opacity=".75" />
        <ellipse cx="11.5" cy="13.5" rx="3.6" ry="2.1" fill="#FF8FA3" opacity=".75" />
        {variant === 'reindeer' ? (
          <>
            <circle cx="0" cy="12" r="3.2" fill="#E3263F" />
            <path d="M-3 17q3 2.5 6 0" stroke="#0F3B2C" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <path d="M-3.5 14q3.5 3.5 7 0" stroke="#0F3B2C" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        )}

        {variant === 'santa' && (
          <>
            <path d="M-21-5Q-9-35 17-29l7 14Q3-17-21-5z" fill="#E3263F" />
            <path d="M-22-4Q0-16 22-7" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" fill="none" />
          </>
        )}
        {variant === 'elf' && (
          <>
            <path d="M-19-5L5-36 19-6z" fill="#16A05A" />
            <path d="M-21-4Q0-13 21-5" stroke="#E3263F" strokeWidth="5" strokeLinecap="round" fill="none" />
          </>
        )}
        {variant === 'earmuffs' && (
          <path d="M-19 3Q-18-26 0-26T19 3" stroke="#E3263F" strokeWidth="3.5" fill="none" />
        )}
      </g>

      {/* hat details that poke past the rim */}
      {variant === 'santa' && <circle cx="24" cy="-16" r="5.5" fill="#fff" />}
      {variant === 'elf' && <circle cx="5" cy="-37" r="4" fill="#FFC23A" />}
      {variant === 'reindeer' && (
        <g stroke="#8A5A3B" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M-9-11L-16-30M-13-22l-8-3M-15-28l4-7" />
          <path d="M9-11L16-30M13-22l8-3M15-28l-4-7" />
        </g>
      )}
      {variant === 'earmuffs' && (
        <>
          <circle cx="-20" cy="5" r="7.5" fill="#FF8FA3" />
          <circle cx="20" cy="5" r="7.5" fill="#FF8FA3" />
          <circle cx="-20" cy="5" r="3.5" fill="#fff" opacity=".7" />
          <circle cx="20" cy="5" r="3.5" fill="#fff" opacity=".7" />
        </>
      )}
    </g>
  )
}
