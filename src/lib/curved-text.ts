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
  const fontSize = Math.round(canvasWidth * 0.044)
  ctx.font = `bold ${fontSize}px "${font}", sans-serif`
  ctx.fillStyle = '#3D2B4F'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const chars = text.split('')
  if (chars.length === 0) return canvas.toDataURL()

  if (chars.length === 1) {
    ctx.fillText(text, canvasWidth / 2, canvasHeight * 0.70)
    return canvas.toDataURL()
  }

  // Strong downward arc hugging the circular bottom of the pin.
  // Pin circle center is at 50%/50% with radius ~32% of canvas.
  // Edges ride up where the circle is wider; center dips following the curve.
  const centerX = canvasWidth / 2
  const arcCenterY = canvasHeight * 0.68       // higher so edges are safely inside the circle
  const arcCurve = canvasHeight * 0.075         // pronounced downward arc

  chars.forEach((char, i) => {
    const t = chars.length > 1 ? i / (chars.length - 1) : 0.5
    // Horizontal spread kept moderate so center characters stay within circle
    const x = centerX + (t - 0.5) * canvasWidth * 0.40
    // Deep downward arc: middle dips low, edges climb up following circle
    const y = arcCenterY + Math.sin(t * Math.PI) * arcCurve
    // Rotation follows the steep downward curve
    const rotation = Math.sin((0.5 - t) * Math.PI) * 0.20

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })

  return canvas.toDataURL()
}
