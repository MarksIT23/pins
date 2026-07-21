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

  // Font size scales with canvas — slightly smaller to ensure fit
  const fontSize = Math.round(canvasWidth * 0.048)
  ctx.font = `bold ${fontSize}px "${font}", sans-serif`
  ctx.fillStyle = '#3D2B4F'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const chars = text.split('')
  if (chars.length === 0) return canvas.toDataURL()

  if (chars.length === 1) {
    ctx.fillText(text, canvasWidth / 2, canvasHeight * 0.74)
    return canvas.toDataURL()
  }

  // Arc at the lower portion of the pin visible circle.
  // The background image is a circle centered at 50%/50% with radius ~32% of canvas.
  // At 73% height the visible width is ~200px on a 500px canvas — enough for 10 chars.
  const centerX = canvasWidth / 2
  const arcCenterY = canvasHeight * 0.73       // vertical position of the text
  const arcCurve = canvasHeight * 0.025         // how much the text bows downward

  chars.forEach((char, i) => {
    const t = chars.length > 1 ? i / (chars.length - 1) : 0.5
    // Horizontal spread: from 25% to 75% of canvas, staying well inside the circle
    const x = centerX + (t - 0.5) * canvasWidth * 0.50
    // Y follows a sine curve: higher at edges, lower in middle (downward arc / frown)
    const y = arcCenterY + Math.sin(t * Math.PI) * arcCurve
    // Slight rotation so characters follow the downward arc
    const rotation = Math.sin((0.5 - t) * Math.PI) * 0.12

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })

  return canvas.toDataURL()
}
