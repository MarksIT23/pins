import pin1 from '@/assets/pins-balls/new1.png'
import pin2 from '@/assets/pins-balls/new2.png'
import pin3 from '@/assets/pins-balls/new3.png'
import pin4 from '@/assets/pins-balls/new4.png'
import pin5 from '@/assets/pins-balls/new5.png'
import pin6 from '@/assets/pins-balls/new6.png'

// Pin artwork is 375×375 with the round pin (≈229px across) centred at (187.5, 198).
const ART = { size: 375, cx: 187.5, cy: 198, d: 229 }

/** Quadratic bezier point. */
function qp(t: number, a: number[], b: number[], c: number[]) {
  const u = 1 - t
  return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]]
}

const GARLANDS: number[][][] = [
  [[118, 128], [182, 152], [244, 118]],
  [[86, 222], [180, 258], [278, 212]],
  [[52, 318], [176, 362], [312, 306]],
]
const BULB_COLORS = ['#FFC23A', '#2E9BD6', '#FF8FA3', '#FFFFFF']

const PINS: { src: string; x: number; y: number; r: number; delay: number }[] = [
  { src: pin1, x: 180, y: 112, r: 24, delay: 0.55 },
  { src: pin2, x: 110, y: 206, r: 26, delay: 0.7 },
  { src: pin3, x: 252, y: 200, r: 26, delay: 0.85 },
  { src: pin4, x: 74,  y: 306, r: 28, delay: 1.0 },
  { src: pin5, x: 180, y: 300, r: 31, delay: 1.15 },
  { src: pin6, x: 288, y: 306, r: 28, delay: 1.3 },
]

/** Scalloped tier: apex, base y, half-width. */
function tier(cx: number, top: number, base: number, half: number, bumps: number) {
  const left = cx - half
  const step = (half * 2) / bumps
  let d = `M${cx} ${top} L${left} ${base}`
  for (let i = 0; i < bumps; i++) {
    const x1 = left + step * i
    d += ` Q${x1 + step / 2} ${base + 14} ${x1 + step} ${base}`
  }
  return d + ' Z'
}

/**
 * The hero centrepiece: a decorated tree whose ornaments are chibi pins.
 * The pins pop on one after another, then keep swaying; lights blink; the star glows.
 */
export function FestiveTree() {
  return (
    <svg viewBox="0 0 360 440" className="w-full h-auto overflow-visible" role="img" aria-label="A Christmas tree decorated with chibi character pins">
      {/* trunk */}
      <rect x="162" y="360" width="36" height="42" rx="4" fill="#8A5A3B" />

      {/* tiers, back to front */}
      <path d={tier(180, 34, 150, 92, 4)} fill="#0F7A42" />
      <path d={tier(180, 92, 250, 128, 5)} fill="#14904F" />
      <path d={tier(180, 168, 360, 166, 6)} fill="#16A05A" />
      {/* highlights on the left of each tier */}
      <path d="M180 40L102 146l22 2z" fill="#2BC06C" opacity=".55" />
      <path d="M180 100L66 244l26 2z" fill="#2BC06C" opacity=".5" />
      <path d="M180 176L28 352l30 3z" fill="#2BC06C" opacity=".45" />

      {/* garlands + blinking bulbs */}
      {GARLANDS.map(([a, b, c], gi) => (
        <g key={gi}>
          <path d={`M${a[0]} ${a[1]} Q${b[0]} ${b[1]} ${c[0]} ${c[1]}`} stroke="#0B5C32" strokeWidth="1.6" fill="none" opacity=".7" />
          {Array.from({ length: 7 + gi * 2 }).map((_, i, arr) => {
            const [x, y] = qp((i + 0.5) / arr.length, a, b, c)
            return (
              <circle
                key={i}
                cx={x}
                cy={y + 3}
                r="4.2"
                fill={BULB_COLORS[(i + gi) % BULB_COLORS.length]}
                style={{ animation: `bulb 2.4s ease-in-out ${((i * 0.37 + gi * 0.5) % 2.4).toFixed(2)}s infinite` }}
              />
            )
          })}
        </g>
      ))}

      {/* pin ornaments: the real pin designs, hung like baubles */}
      {PINS.map((p, i) => {
        const k = (p.r * 2) / ART.d
        return (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <g className="tree-pin-pop" style={{ animationDelay: `${p.delay}s` }}>
              <g className="tree-pin-sway" style={{ animationDelay: `${-i * 0.7}s`, animationDuration: `${3.6 + (i % 3) * 0.6}s` }}>
                {/* string, loop and cap */}
                <line x1="0" y1={-p.r - 20} x2="0" y2={-p.r - 8} stroke="#FFC23A" strokeWidth="1.4" />
                <circle cx="0" cy={-p.r - 9} r="2.6" fill="none" stroke="#FFC23A" strokeWidth="1.6" />
                <rect x="-5" y={-p.r - 6.5} width="10" height="6" rx="1.5" fill="#FFC23A" stroke="#E89B12" strokeWidth=".8" />
                <image
                  href={p.src}
                  x={-ART.cx * k}
                  y={-ART.cy * k}
                  width={ART.size * k}
                  height={ART.size * k}
                  style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.25))' }}
                />
              </g>
            </g>
          </g>
        )
      })}

      {/* star */}
      <g transform="translate(180 30)">
        <circle r="26" fill="#FFC23A" opacity=".25" className="tree-star-glow" />
        <path
          className="tree-star"
          d="M0-22l6.5 13.2 14.5 2.1-10.5 10.2 2.5 14.5L0 11.2l-13 6.8 2.5-14.5L-21-6.7l14.5-2.1z"
          fill="#FFC23A"
          stroke="#FFE8A3"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>

      {/* presents */}
      <g>
        <rect x="88" y="372" width="62" height="46" rx="5" fill="#2E9BD6" />
        <rect x="114" y="372" width="10" height="46" fill="#FFC23A" />
        <path d="M119 372c-10-14-24-8-16 0zM119 372c10-14 24-8 16 0z" fill="#FFC23A" />
        <rect x="206" y="380" width="76" height="38" rx="5" fill="#FFF" />
        <rect x="238" y="380" width="12" height="38" fill="#E3263F" />
        <rect x="206" y="394" width="76" height="10" fill="#E3263F" />
        <path d="M244 380c-11-15-26-9-17 0zM244 380c11-15 26-9 17 0z" fill="#E3263F" />
        <rect x="150" y="392" width="44" height="26" rx="4" fill="#FF8FA3" />
        <rect x="167" y="392" width="8" height="26" fill="#fff" />
      </g>
    </svg>
  )
}
