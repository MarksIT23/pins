import Konva from 'konva'

const WATERMARK_TEXT = 'Wesleyan Supreme Student Council'
const CANVAS_SIZE = 500

/**
 * Exports the Konva stage as a high-resolution PNG blob.
 * Adds a subtle watermark before export and removes it after.
 */
export async function exportCanvasToPng(
  stage: Konva.Stage
): Promise<Blob> {
  // Add watermark layer temporarily
  const watermarkLayer = new Konva.Layer()

  // Background strip for watermark
  const strip = new Konva.Rect({
    x: 0,
    y: CANVAS_SIZE - 28,
    width: CANVAS_SIZE,
    height: 28,
    fill: 'rgba(255, 255, 255, 0.65)',
  })

  const text = new Konva.Text({
    x: 0,
    y: CANVAS_SIZE - 22,
    width: CANVAS_SIZE,
    text: WATERMARK_TEXT,
    fontSize: 11,
    fontFamily: 'Fredoka, Nunito, sans-serif',
    fill: 'rgba(61, 43, 79, 0.75)',
    align: 'center',
    letterSpacing: 0.5,
  })

  watermarkLayer.add(strip)
  watermarkLayer.add(text)
  stage.add(watermarkLayer)
  watermarkLayer.moveToTop()

  // Export at 2x resolution (1000×1000)
  const dataUrl = stage.toDataURL({
    pixelRatio: 2,
    mimeType: 'image/png',
  })

  // Remove watermark layer
  watermarkLayer.destroy()

  // Convert dataURL → Blob
  const response = await fetch(dataUrl)
  return response.blob()
}

/**
 * Also returns a dataURL for the preview thumbnail (1x, smaller)
 */
export function exportCanvasToDataUrl(stage: Konva.Stage): string {
  return stage.toDataURL({ pixelRatio: 1 })
}
