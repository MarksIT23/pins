import { OrderStatus } from '@/types'

/**
 * Format an ISO date string to a readable locale string
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format date as short (for tables)
 */
export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Generate a display-friendly order number
 * e.g. PINS-20240719-0042
 */
export function generateOrderNumber(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `PINS-${date}-${rand}`
}

/**
 * Get next order status in the pipeline
 */
export function getNextStatus(current: OrderStatus): OrderStatus | null {
  const pipeline: OrderStatus[] = [
    'pending',
    'accepted',
    'in_production',
    'ready_for_pickup',
    'completed',
  ]
  const idx = pipeline.indexOf(current)
  if (idx === -1 || idx === pipeline.length - 1) return null
  return pipeline[idx + 1]
}

/**
 * Truncate text to N chars
 */
export function truncate(text: string, n = 40): string {
  return text.length > n ? text.slice(0, n) + '…' : text
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
