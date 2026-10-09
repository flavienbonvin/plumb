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

/** The frames offered in the app. Width and mat width stay at their defaults. */
export const FRAME_PRESETS: { id: string; label: string; swatch: string; frameColor: string; matColor: string }[] = [
  { id: 'black', label: 'Black', swatch: '#1b1b1c', frameColor: 'black', matColor: 'paper' },
  { id: 'oak', label: 'Oak', swatch: '#b88d5d', frameColor: 'oak', matColor: 'paper' },
  { id: 'white', label: 'White', swatch: '#f2f0eb', frameColor: 'white', matColor: 'grey' },
]

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

/** Mac menu bar height, as a share of the screen width. The top of the frame is at least this tall. */
const MENU_BAR = 0.0185
/** iPhone frames are thicker than Mac ones, so they stay visible next to the rounded corners. */
const IPHONE_FRAME_SCALE = 2.1
/** iPhone screen corner radius, as a share of the screen width. */
const SCREEN_RADIUS = 0.13

/**
 * Geometry of the picture viewport for a canvas of w×h.
 * Without a frame the viewport is the whole canvas. With one, the moulding runs along the screen edge,
 * then the paper mat, then the picture window. On a Mac the top moulding covers the menu bar. On an
 * iPhone the moulding, mat and window follow the rounded corners of the screen.
 */
export function layout(_img: Source, w: number, h: number, f: FrameSettings, kind: DeviceKind) {
  const full = { x: 0, y: 0, w, h }
  if (!f.enabled) return { view: full, mat: null as Rect | null, matR: 0, viewR: 0 }
  const short = Math.min(w, h)
  const phone = kind === 'iphone'
  const side = ((f.frameWidth * (phone ? IPHONE_FRAME_SCALE : 1)) / 100) * short
  const top = kind === 'mac' ? Math.max(side, w * MENU_BAR) : side
  const matT = (f.matWidth / 100) * short
  // optical centre: slightly more paper at the bottom, as in a gallery
  const bottomExtra = matT * 0.22
  const view = {
    x: side + matT,
    y: top + matT,
    w: Math.max(8, w - 2 * (side + matT)),
    h: Math.max(8, h - (top + matT) - (side + matT) - bottomExtra),
  }
  const mat = { x: side, y: top, w: w - 2 * side, h: h - top - side }
  const radius = phone ? SCREEN_RADIUS * w : 0
  const matR = Math.max(0, radius - side)
  const viewR = phone ? Math.max(short * 0.012, radius - side - matT) : 0
  return { view, mat, matR, viewR }
}

function find(list: Swatch[], id: string) {
  return (list.find((s) => s.id === id) ?? list[0]).color
}

/** Draws the wallpaper at the canvas' own resolution. Used for preview and export alike. */
export function drawWallpaper(ctx: CanvasRenderingContext2D, img: Source, w: number, h: number, s: DeviceSettings, kind: DeviceKind) {
  const f = s.frame
  const L = layout(img, w, h, f, kind)
  ctx.save()
  ctx.clearRect(0, 0, w, h)
  // The picture, the look and the grain cover a plain rectangle. The frame is painted afterwards with a
  // hole for the picture, so rounded corners never pick up the look.
  ctx.save()
  ctx.beginPath()
  ctx.rect(L.view.x, L.view.y, L.view.w, L.view.h)
  ctx.clip()
  drawCover(ctx, img, s.adjust, L.view)
  ctx.restore()
  if (hasFinish(s.finish)) {
    applyGrade(ctx, L.view, s.finish)
    overlayFinish(ctx, L.view, s.finish, Math.min(w, h))
  }
  if (f.enabled) drawFrame(ctx, w, h, s, L)
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

function rrPath(ctx: CanvasRenderingContext2D, r: Rect, radius: number) {
  const k = Math.max(0, Math.min(radius, r.w / 2, r.h / 2))
  ctx.moveTo(r.x + k, r.y)
  ctx.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, k)
  ctx.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, k)
  ctx.arcTo(r.x, r.y + r.h, r.x, r.y, k)
  ctx.arcTo(r.x, r.y, r.x + r.w, r.y, k)
  ctx.closePath()
}

function rr(ctx: CanvasRenderingContext2D, r: Rect, radius: number) {
  ctx.beginPath()
  rrPath(ctx, r, radius)
}

/** The moulding, the paper mat and the bevel, with a (possibly rounded) hole where the picture shows. */
function drawFrame(ctx: CanvasRenderingContext2D, w: number, h: number, s: DeviceSettings, L: ReturnType<typeof layout>) {
  const f = s.frame
  const short = Math.min(w, h)
  const { view, matR, viewR } = L
  const mat = L.mat!
  const frameHex = find(FRAME_COLORS, f.frameColor)
  const matHex = find(MAT_COLORS, f.matColor)

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, w, h)
  rrPath(ctx, view, viewR)
  ctx.clip('evenodd')

  // moulding along the screen edge: light top-left, dark bottom-right
  const lg = ctx.createLinearGradient(0, 0, w, h)
  lg.addColorStop(0, mix(frameHex, '#ffffff', 0.18))
  lg.addColorStop(0.5, frameHex)
  lg.addColorStop(1, mix(frameHex, '#000000', 0.22))
  ctx.fillStyle = lg
  ctx.fillRect(0, 0, w, h)

  // paper mat with a faint inner shadow where it meets the moulding
  rr(ctx, mat, matR)
  ctx.fillStyle = matHex
  ctx.fill()
  ctx.save()
  ctx.clip()
  const lip = Math.max(2, short * 0.005)
  const sg = ctx.createLinearGradient(0, mat.y, 0, mat.y + lip)
  sg.addColorStop(0, 'rgba(0,0,0,0.16)')
  sg.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = sg
  ctx.fillRect(mat.x, mat.y, mat.w, lip)
  ctx.restore()

  // bevel cut of the mat window: bright chamfer on the paper edge
  const bev = Math.max(1.5, short * 0.0028)
  rr(ctx, { x: view.x - bev, y: view.y - bev, w: view.w + 2 * bev, h: view.h + 2 * bev }, viewR + bev)
  ctx.fillStyle = mix(matHex, matHex === '#1d1d1e' ? '#555555' : '#ffffff', 0.7)
  ctx.fill()
  ctx.restore()

  // recessed look: shadow cast by the mat onto the picture
  ctx.save()
  rr(ctx, view, viewR)
  ctx.clip()
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
