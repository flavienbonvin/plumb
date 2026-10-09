import { useDeferredValue, useMemo } from 'react'
import { applyGrade } from '../lib/looks'

const MAX = 2000

/**
 * A colour-graded copy of the preview image, so dragging only has to redraw pixels, not re-grade them.
 * Returns the original image when no look is active.
 */
export function useGradedSource(image: ImageBitmap, look: string, intensity: number): ImageBitmap | HTMLCanvasElement {
  const strength = useDeferredValue(intensity)
  return useMemo(() => {
    if (look === 'none') return image
    const k = Math.min(1, MAX / Math.max(image.width, image.height))
    const c = document.createElement('canvas')
    c.width = Math.round(image.width * k)
    c.height = Math.round(image.height * k)
    const ctx = c.getContext('2d', { willReadFrequently: true, colorSpace: 'display-p3' }) ?? c.getContext('2d', { willReadFrequently: true })!
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image, 0, 0, c.width, c.height)
    applyGrade(ctx, { x: 0, y: 0, w: c.width, h: c.height }, { look, intensity: strength })
    return c
  }, [image, look, strength])
}
