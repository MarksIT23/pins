import { useEffect, useRef, useState, useCallback } from 'react'
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva'
import { useCharacterStore, deriveRenderedLayers } from '@/store/characterStore'
import { renderCurvedText } from '@/lib/curved-text'
import { Asset, TextOverlay } from '@/types'

/** Max canvas size — scales down to fit container on smaller screens. */
const MAX_CANVAS_SIZE = 500

interface CharacterCanvasProps {
  assetMap: Map<string, Asset>
  stageRef: React.RefObject<any>
}

// ─── Image Cache ──────────────────────────────────────────────────────────────
const imageCache = new Map<string, HTMLImageElement>()

function loadImage(url: string): Promise<HTMLImageElement> {
  if (imageCache.has(url)) {
    return Promise.resolve(imageCache.get(url)!)
  }
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageCache.set(url, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = url
  })
}

export function CharacterCanvas({ assetMap, stageRef }: CharacterCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState(300)
  const config = useCharacterStore((s) => s.config)
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  // Measure container width so canvas fills available space
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width
      setCanvasSize(Math.min(w, MAX_CANVAS_SIZE))
    })
    observer.observe(el)
    setCanvasSize(Math.min(el.clientWidth, MAX_CANVAS_SIZE))
    return () => observer.disconnect()
  }, [])

  // Build asset map for layer derivation: assetId → { file_url, category_slug }
  const assetInfoMap = useCallback(() => {
    const m = new Map<string, { file_url: string; category_slug: string }>()
    for (const [id, asset] of assetMap.entries()) {
      m.set(id, {
        file_url: asset.file_url,
        category_slug: asset.category?.slug ?? '',
      })
    }
    return m
  }, [assetMap])

  const layers = deriveRenderedLayers(config, assetInfoMap())
  const hasContent = layers.length > 0 || !!config.textOverlay

  // Render curved text overlay to an image
  const textOverlay: TextOverlay | null = config.textOverlay ?? null
  const [textImageUrl, setTextImageUrl] = useState<string | null>(null)
  const [textImg, setTextImg] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!textOverlay) {
      setTextImageUrl(null)
      setTextImg(null)
      return
    }
    const url = renderCurvedText(textOverlay.text, textOverlay.font, canvasSize, canvasSize)
    setTextImageUrl(url)
    const img = new window.Image()
    img.onload = () => setTextImg(img)
    img.src = url
  }, [textOverlay, canvasSize])

  // Load images whenever layers change
  useEffect(() => {
    if (layers.length === 0) return
    setIsLoading(true)

    const toLoad = layers.filter((l) => !loadedImages.has(l.fileUrl))
    if (toLoad.length === 0) {
      setIsLoading(false)
      return
    }

    Promise.allSettled(toLoad.map((l) => loadImage(l.fileUrl))).then((results) => {
      const newMap = new Map(loadedImages)
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          newMap.set(toLoad[i].fileUrl, result.value)
        }
      })
      setLoadedImages(newMap)
      setIsLoading(false)
    })
  }, [layers.map((l) => l.fileUrl).join(',')])

  return (
    <div
      ref={containerRef}
      className="character-canvas-wrapper relative w-full"
      style={{ maxWidth: MAX_CANVAS_SIZE, aspectRatio: '1/1' }}
    >
      {/* White background */}
      <div
        className="absolute inset-0 rounded-[1.5rem] bg-white"
        style={{ boxShadow: '0 4px 24px rgba(255,133,161,0.18)' }}
      />

      <Stage
        ref={stageRef}
        width={canvasSize}
        height={canvasSize}
        style={{ borderRadius: '1.5rem', overflow: 'hidden' }}
      >
        <Layer>
          {/* White fill background — always underneath */}
          <Rect x={0} y={0} width={canvasSize} height={canvasSize} fill="white" />

          {/* Render all selected layers in layer order */}
          {layers.map((layer) => {
            const img = loadedImages.get(layer.fileUrl)
            if (!img) return null
            return (
              <KonvaImage
                key={layer.slug}
                image={img}
                x={0}
                y={0}
                width={canvasSize}
                height={canvasSize}
                listening={false}
              />
            )
          })}

          {/* Curved text overlay — rendered on top of all assets */}
          {textImg && (
            <KonvaImage
              image={textImg}
              x={0}
              y={0}
              width={canvasSize}
              height={canvasSize}
              listening={false}
            />
          )}
        </Layer>
      </Stage>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-[1.5rem]">
          <div className="w-8 h-8 border-3 border-[#FF85A1] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state (only when no assets AND no text overlay) */}
      {!hasContent && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <span className="text-5xl mb-3 animate-bounce-soft block">🧸</span>
          <p className="font-fredoka text-[#B8A0C8] text-sm">
            Start by selecting a base character!
          </p>
        </div>
      )}

      {/* Watermark shown on UI preview */}
      {hasContent && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-2 pointer-events-none">
          <span className="text-[9px] font-fredoka text-[#3D2B4F]/40 bg-white/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
            Wesleyan Supreme Student Council
          </span>
        </div>
      )}
    </div>
  )
}
