import { clampAdjust, drawWallpaper, get2dP3, layout, srcSize, type DeviceSettings, type Source } from './draw'
import type { DeviceModel } from './devices'

export type Format = 'png' | 'jpeg'

export async function renderBlob(img: Source, model: DeviceModel, s: DeviceSettings, format: Format): Promise<Blob> {
  const c = document.createElement('canvas')
  c.width = model.w
  c.height = model.h
  const ctx = get2dP3(c)
  drawWallpaper(ctx, img, model.w, model.h, s)
  const blob = await new Promise<Blob | null>((res) => c.toBlob(res, `image/${format}`, format === 'jpeg' ? 0.95 : undefined))
  if (!blob) throw new Error('Export failed. The image may be too large for this browser.')
  return blob
}

export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function filename(base: string, kind: 'mac' | 'iphone', format: Format) {
  return `${base}-${kind}.${format === 'jpeg' ? 'jpg' : 'png'}`
}

/** How many output pixels each source pixel is stretched to (>1 means upscaling). */
export function upscaleFactor(img: Source, model: DeviceModel, s: DeviceSettings): number {
  const { w: iw, h: ih } = srcSize(img)
  const L = layout(img, model.w, model.h, s.frame)
  const a = clampAdjust(s.adjust, iw, ih, L.view.w, L.view.h)
  return Math.max(L.view.w / iw, L.view.h / ih) * a.zoom
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
export { sleep }
