/**
 * Renders curved text along an arc at the bottom of a canvas.
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
  ctx.font = `${fontSize}px "${font}", sans-serif`
  ctx.fillStyle = '#3D2B4F'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const chars = text.split('')
  if (chars.length === 0) return canvas.toDataURL()
  if (chars.length === 1) {
    ctx.fillText(text, canvasWidth / 2, canvasHeight * 0.85)
    return canvas.toDataURL()
  }

  // Arc curve at the bottom of the pin
  const centerX = canvasWidth / 2
  const radius = canvasWidth * 0.32
  const arcAngle = Math.PI * 0.5
  const startAngle = Math.PI * 1.5 + (Math.PI - arcAngle) / 2

  const totalAngle = arcAngle
  const charSpacing = totalAngle / (chars.length - 1)

  chars.forEach((char, i) => {
    const angle = startAngle + i * charSpacing
    const x = centerX + radius * Math.cos(angle)
    const y = centerX + radius * Math.sin(angle)

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle + Math.PI / 2)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })

  return canvas.toDataURL()
}
