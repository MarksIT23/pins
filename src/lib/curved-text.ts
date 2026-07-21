/**
 * Renders curved text along a gentle upward arc at the bottom of a pin canvas.
 * Returns a data URL that can be used as a Konva Image source.
 */
export function renderCurvedText(
  text: string,
  font: string,
  canvasWidth: number,
  canvasHeight: number
): string {
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // Font size scales with canvas
  const fontSize = Math.round(canvasWidth * 0.055)
  ctx.font = `bold ${fontSize}px "${font}", sans-serif`
  ctx.fillStyle = '#3D2B4F'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const chars = text.split('')
  if (chars.length === 0) return canvas.toDataURL()

  if (chars.length === 1) {
    ctx.fillText(text, canvasWidth / 2, canvasHeight * 0.82)
    return canvas.toDataURL()
  }

  // Gentle upward arc at the bottom of the pin
  // Characters spread from 15% to 85% of width, following a U-shape
  const leftX = canvasWidth * 0.15
  const rightX = canvasWidth * 0.85
  const baseY = canvasHeight * 0.80
  const curveHeight = canvasHeight * 0.04 // how much the arc bows upward in the middle

  chars.forEach((char, i) => {
    const t = chars.length > 1 ? i / (chars.length - 1) : 0.5
    const x = leftX + t * (rightX - leftX)
    const y = baseY - Math.sin(t * Math.PI) * curveHeight
    const rotation = -Math.cos(t * Math.PI) * 0.2 // slight rotation to follow curve

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })

  return canvas.toDataURL()
}
