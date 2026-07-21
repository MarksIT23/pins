/**
 * Renders curved text along a downward arc at the bottom of a pin canvas.
 * Returns a data URL that can be used as a Konva Image source.
 *
 * @param sizeLevel 0=tiny, 1=small, 2=medium, 3=large
 */
export function renderCurvedText(
  text: string,
  font: string,
  sizeLevel: number,
  color: string,
  outline: boolean,
  canvasWidth: number,
  canvasHeight: number
): string {
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // Font size scales with canvas and size level
  const SIZE_MAP = [0.036, 0.044, 0.054, 0.065]
  const ratio = SIZE_MAP[Math.min(sizeLevel, SIZE_MAP.length - 1)] ?? 0.044
  const fontSize = Math.round(canvasWidth * ratio)
  ctx.font = `bold ${fontSize}px "${font}", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const hasOutline = outline && color !== '#FFFFFF'
  const outlineWidth = Math.max(2, Math.round(fontSize * 0.1))

  const chars = text.split('')
  if (chars.length === 0) return canvas.toDataURL()

  if (chars.length === 1) {
    if (hasOutline) {
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = outlineWidth
      ctx.lineJoin = 'round'
      ctx.strokeText(text, canvasWidth / 2, canvasHeight * 0.70)
    }
    ctx.fillStyle = color
    ctx.fillText(text, canvasWidth / 2, canvasHeight * 0.70)
    return canvas.toDataURL()
  }

  // Strong downward arc hugging the circular bottom of the pin.
  // Horizontal spread scales with character count so short text isn't too spaced out.
  const centerX = canvasWidth / 2
  const arcCenterY = canvasHeight * 0.70
  const arcCurve = canvasHeight * 0.075
  const maxSpread = Math.min(chars.length * 0.05, 0.40)

  if (hasOutline) {
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = outlineWidth
    ctx.lineJoin = 'round'
  }
  ctx.fillStyle = color

  chars.forEach((char, i) => {
    const t = chars.length > 1 ? i / (chars.length - 1) : 0.5
    const x = centerX + (t - 0.5) * canvasWidth * maxSpread
    const y = arcCenterY + Math.sin(t * Math.PI) * arcCurve
    const rotation = Math.sin((0.5 - t) * Math.PI) * 0.20

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    if (hasOutline) ctx.strokeText(char, 0, 0)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })

  return canvas.toDataURL()
}
