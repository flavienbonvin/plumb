export interface Adjust {
  /** 1 = image just covers the viewport. */
  zoom: number
  /** Pan offset as a fraction of viewport width / height. */
  px: number
  py: number
}

export interface Swatch {
  id: string
  label: string
  color: string
}

export const FRAME_COLORS: Swatch[] = [
  { id: 'black', label: 'Black', color: '#1b1b1c' },
  { id: 'white', label: 'White', color: '#f2f0eb' },
  { id: 'oak', label: 'Oak', color: '#b88d5d' },
  { id: 'walnut', label: 'Walnut', color: '#5b3f2e' },
  { id: 'brass', label: 'Brass', color: '#b39a62' },
]
export const MAT_COLORS: Swatch[] = [
  { id: 'paper', label: 'Paper', color: '#f1ede4' },
  { id: 'white', label: 'White', color: '#fbfaf7' },
  { id: 'grey', label: 'Grey', color: '#d6d3cc' },
  { id: 'black', label: 'Black', color: '#1d1d1e' },
]

export interface FrameSettings {
  enabled: boolean
  frameColor: string
  matColor: string
  /** Frame moulding thickness, % of the short edge. */
  frameWidth: number
  /** Paper mat thickness, % of the short edge. */
  matWidth: number
}

import { applyGrade, overlayFinish, DEFAULT_FINISH, hasFinish, type Finish } from './looks'
export { DEFAULT_FINISH, hasFinish }
export type { Finish }

export interface DeviceSettings {
  adjust: Adjust
  frame: FrameSettings
  /** 0..1 soft darkening behind the clock, baked into the export. */
  scrim: number
  finish: Finish
}


export const DEFAULT_FRAME: FrameSettings = {
  enabled: false,
  frameColor: 'black',
  matColor: 'paper',
  frameWidth: 1.6,
  matWidth: 7,
}

export const DEFAULT_ADJUST: Adjust = { zoom: 1, px: 0, py: 0 }

export const MAX_ZOOM = 4

export type Source = ImageBitmap | HTMLImageElement | HTMLCanvasElement

export function srcSize(img: Source) {
  if (img instanceof HTMLImageElement) return { w: img.naturalWidth, h: img.naturalHeight }
  return { w: img.width, h: img.height }
}

import { clockZone, type DeviceKind } from './devices'

export interface Rect { x: number; y: number; w: number; h: number }

export function clampAdjust(a: Adjust, imgW: number, imgH: number, vw: number, vh: number): Adjust {
  const zoom = Math.min(MAX_ZOOM, Math.max(1, a.zoom))
  const base = Math.max(vw / imgW, vh / imgH)
  const maxX = Math.max(0, (imgW * base * zoom - vw) / 2 / vw)
  const maxY = Math.max(0, (imgH * base * zoom - vh) / 2 / vh)
  return {
    zoom,
    px: Math.min(maxX, Math.max(-maxX, a.px)),
    py: Math.min(maxY, Math.max(-maxY, a.py)),
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function mix(hex: string, to: string, t: number) {
  const a = hexToRgb(hex)
  const b = hexToRgb(to)
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`
}

function drawCover(ctx: CanvasRenderingContext2D, img: Source, a: Adjust, r: Rect) {
  const { w: iw, h: ih } = srcSize(img)
  const c = clampAdjust(a, iw, ih, r.w, r.h)
  const s = Math.max(r.w / iw, r.h / ih) * c.zoom
  const dw = iw * s
  const dh = ih * s
  const dx = r.x + (r.w - dw) / 2 + c.px * r.w
  const dy = r.y + (r.h - dh) / 2 + c.py * r.h
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, dx, dy, dw, dh)
}

/**
 * Geometry of the picture viewport for a canvas of w×h.
 * In plain mode the viewport is the whole canvas; in frame mode the moulding runs
 * along the screen edge, then the paper mat, then the picture window.
 */
export function layout(_img: Source, w: number, h: number, f: FrameSettings) {
  const full = { x: 0, y: 0, w, h }
  if (!f.enabled) return { view: full, mat: null as Rect | null, outer: null as Rect | null, frameT: 0, matT: 0 }
  const short = Math.min(w, h)
  const frameT = (f.frameWidth / 100) * short
  const matT = (f.matWidth / 100) * short
  const inset = frameT + matT
  // optical centre: slightly more paper at the bottom, as in a gallery
  const bottomExtra = matT * 0.22
  const view = {
    x: inset,
    y: inset,
    w: Math.max(8, w - 2 * inset),
    h: Math.max(8, h - 2 * inset - bottomExtra),
  }
  const mat = { x: frameT, y: frameT, w: w - 2 * frameT, h: h - 2 * frameT }
  return { view, mat, outer: full, frameT, matT }
}

function find(list: Swatch[], id: string) {
  return (list.find((s) => s.id === id) ?? list[0]).color
}

/** Draws the wallpaper at the canvas' own resolution. Used for preview and export alike. */
export function drawWallpaper(ctx: CanvasRenderingContext2D, img: Source, w: number, h: number, s: DeviceSettings, kind: DeviceKind) {
  const f = s.frame
  const L = layout(img, w, h, f)
  ctx.save()
  ctx.clearRect(0, 0, w, h)
  drawPicture(ctx, img, w, h, s, L)
  if (hasFinish(s.finish)) {
    applyGrade(ctx, L.view, s.finish)
    overlayFinish(ctx, L.view, s.finish, Math.min(w, h))
  }
  drawScrim(ctx, w, h, s.scrim, kind)
  ctx.restore()
}

function drawScrim(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, kind: DeviceKind) {
  if (amount <= 0) return
  const z = clockZone(kind, w, h)
  const end = Math.min(1, z.y1 + 0.22) * h
  const g = ctx.createLinearGradient(0, 0, 0, end)
  const a = amount * 0.75
  const hold = (z.y1 * h) / end // fully shaded until the clock ends, then ease out
  for (let i = 0; i <= 10; i++) {
    const t = i / 10
    const k = t <= hold * 0.6 ? 1 : 1 - (() => { const u = Math.min(1, (t - hold * 0.6) / (1 - hold * 0.6)); return u * u * (3 - 2 * u) })()
    g.addColorStop(t, `rgba(0,0,0,${(a * k).toFixed(4)})`)
  }
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, end)
}

function drawPicture(ctx: CanvasRenderingContext2D, img: Source, w: number, h: number, s: DeviceSettings, L: ReturnType<typeof layout>) {
  const f = s.frame

  if (!f.enabled) {
    drawCover(ctx, img, s.adjust, L.view)
    return
  }

  const short = Math.min(w, h)
  const { view, frameT } = L
  const mat = L.mat!
  const frameHex = find(FRAME_COLORS, f.frameColor)
  const matHex = find(MAT_COLORS, f.matColor)

  // moulding along the screen edge: light top-left, dark bottom-right
  const lg = ctx.createLinearGradient(0, 0, w, h)
  lg.addColorStop(0, mix(frameHex, '#ffffff', 0.18))
  lg.addColorStop(0.5, frameHex)
  lg.addColorStop(1, mix(frameHex, '#000000', 0.22))
  ctx.fillStyle = lg
  ctx.fillRect(0, 0, w, h)

  // paper mat with a faint inner shadow where it meets the moulding
  ctx.fillStyle = matHex
  ctx.fillRect(mat.x, mat.y, mat.w, mat.h)
  const lip = Math.max(2, short * 0.005)
  const sg = ctx.createLinearGradient(0, mat.y, 0, mat.y + lip)
  sg.addColorStop(0, 'rgba(0,0,0,0.16)')
  sg.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = sg
  ctx.fillRect(mat.x, mat.y, mat.w, lip)
  void frameT

  // bevel cut of the mat window: bright chamfer on the paper edge
  const bev = Math.max(1.5, short * 0.0028)
  ctx.fillStyle = mix(matHex, matHex === '#1d1d1e' ? '#555555' : '#ffffff', 0.7)
  ctx.fillRect(view.x - bev, view.y - bev, view.w + 2 * bev, view.h + 2 * bev)

  // the picture
  ctx.save()
  ctx.beginPath()
  ctx.rect(view.x, view.y, view.w, view.h)
  ctx.clip()
  drawCover(ctx, img, s.adjust, view)
  // recessed look: shadow cast by the mat onto the picture
  const d = Math.max(3, short * 0.012)
  const top = ctx.createLinearGradient(0, view.y, 0, view.y + d)
  top.addColorStop(0, 'rgba(0,0,0,0.28)')
  top.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = top
  ctx.fillRect(view.x, view.y, view.w, d)
  const left = ctx.createLinearGradient(view.x, 0, view.x + d, 0)
  left.addColorStop(0, 'rgba(0,0,0,0.16)')
  left.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = left
  ctx.fillRect(view.x, view.y, d, view.h)
  ctx.restore()
}

/** Display P3 canvas context (wider gamut, matches Apple screens); falls back to sRGB. */
export function get2dP3(c: HTMLCanvasElement): CanvasRenderingContext2D {
  try {
    const ctx = c.getContext('2d', { colorSpace: 'display-p3' })
    if (ctx) return ctx
  } catch {
    /* unsupported colour space */
  }
  return c.getContext('2d')!
}
