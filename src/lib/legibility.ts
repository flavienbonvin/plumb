import type { Zone } from './devices'

export type Legibility = 'good' | 'fair' | 'poor'

const lin = (v: number) => {
  const c = v / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

let scratch: HTMLCanvasElement | null = null

/**
 * How readable white lock screen text is over the given zone of a rendered wallpaper.
 * Looks at the share of pixels where white text would drop under a 3:1 contrast ratio.
 */
export function measureLegibility(src: HTMLCanvasElement, z: Zone): Legibility {
  const sx = z.x0 * src.width
  const sy = z.y0 * src.height
  const sw = Math.max(1, (z.x1 - z.x0) * src.width)
  const sh = Math.max(1, (z.y1 - z.y0) * src.height)
  scratch ??= document.createElement('canvas')
  scratch.width = 48
  scratch.height = 24
  const ctx = scratch.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(src, sx, sy, sw, sh, 0, 0, 48, 24)
  const d = ctx.getImageData(0, 0, 48, 24).data
  let bright = 0
  const n = d.length / 4
  for (let i = 0; i < d.length; i += 4) {
    const L = 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2])
    if (1.05 / (L + 0.05) < 3) bright++
  }
  const p = bright / n
  return p > 0.45 ? 'poor' : p > 0.15 ? 'fair' : 'good'
}
